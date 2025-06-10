<!-- Effect.vue -->
<script setup>
import { onMounted, onBeforeUnmounted, reactive } from 'vue'

/* 集中状态管理 */
const state = reactive({
  canvas: null,
  ctx: null,
  offscreenCanvas: null,
  offscreenCtx: null,
  dpr: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1, // SSR 安全
  particles: [],
  grid: {},
  gridSize: 100,
  particleCount: 50,
  maxDistance: 100,
  connectionProbability: 0.02,
  bounds: {
    width: 0,
    height: 0
  },
  isAnimating: false,
  animationId: null,
  showPanel: false,
  connectionColors: new Map(),
  frameSkip: 0,
  targetFPS: 60,
  lastFrameTime: 0,
  deltaTime: 0,
  useQuadTree: true,
  renderMode: 'auto',
  particlePool: null,
  connectionPool: null,
})


/* 粒子类 */
class Particle {
  constructor() {
    this.x = Math.random() * state.bounds.width
    this.y = Math.random() * state.bounds.height
    this.vx = (Math.random() * 2 - 1) * 2
    this.vy = (Math.random() * 2 - 1) * 2
    this.radius = (2 + Math.random() * 3) * state.dpr // 随机大小
    this.baseRadius = this.radius
    this.pulse = Math.random() * Math.PI * 2 // 脉冲相位
    this.pulseSpeed = 0.02 + Math.random() * 0.03
    this.opacity = 0.3 + Math.random() * 0.7
    this.color = this.generateParticleColor()
    this.trail = [] // 粒子轨迹
    this.energy = 0.5 + Math.random() * 0.5 // 能量值影响连接
  }

  update() {
    this.x += this.vx
    this.y += this.vy

    // 边界反弹
    if (this.x <= 0 || this.x >= state.bounds.width) {
      this.vx *= -0.8 // 添加能量损失
      this.x = Math.max(0, Math.min(this.x, state.bounds.width))
    }
    if (this.y <= 0 || this.y >= state.bounds.height) {
      this.vy *= -0.8
      this.y = Math.max(0, Math.min(this.y, state.bounds.height))
    }

    // 脉冲动画
    this.pulse += this.pulseSpeed
    this.radius = this.baseRadius + Math.sin(this.pulse) * 0.5

    // 更新轨迹
    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > 5) {
      this.trail.shift()
    }
  }

  draw(ctx) {
    // 绘制轨迹
    if (this.trail.length > 1) {
      ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.2)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(this.trail[0].x, this.trail[0].y)
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y)
      }
      ctx.stroke()
    }

    // 绘制粒子光晕
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3)
    gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`)
    gradient.addColorStop(0.7, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.3})`)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2)
    ctx.fill()

    // 绘制粒子核心
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`
    ctx.fill()
    
    // 添加边框
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`
    ctx.lineWidth = 0.5 * state.dpr
    ctx.stroke()
  }

  generateParticleColor() {
    const colors = [
      { r: 100, g: 150, b: 255 }, // 蓝色
      { r: 150, g: 100, b: 255 }, // 紫色
      { r: 100, g: 255, b: 150 }, // 绿色
      { r: 255, g: 150, b: 100 }, // 橙色
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

/* 初始化粒子 */
function initializeParticles() {
  state.particles = []
  for (let i = 0; i < state.particleCount; i++) {
    state.particles.push(new Particle())
  }
}

/* 初始化网格 */
function initializeGrid() {
  state.grid = {}
  const cols = Math.ceil(state.bounds.width / state.gridSize)
  const rows = Math.ceil(state.bounds.height / state.gridSize)
  for (let i = 0; i <= cols; i++) {
    state.grid[i] = {}
    for (let j = 0; j <= rows; j++) {
      state.grid[i][j] = []
    }
  }
}

/* 更新粒子数量 */
function updateParticles() {
  resetState()
}

/* 更新网格 */
function updateGrid() {
  initializeGrid()
  state.particles.forEach(particle => {
    const col = Math.floor(particle.x / state.gridSize)
    const row = Math.floor(particle.y / state.gridSize)
    state.grid[col][row].push(particle)
  })
}

/* 获取相邻网格中的粒子 */
function getNeighbors(col, row) {
  const neighbors = []
  for (let i = col - 1; i <= col + 1; i++) {
    for (let j = row - 1; j <= row + 1; j++) {
      if (state.grid[i] && state.grid[i][j]) {
        neighbors.push(...state.grid[i][j])
      }
    }
  }
  return neighbors
}

function getConnectionId(p1, p2) {
  // 确保相同的两个粒子生成相同的ID
  const id1 = state.particles.indexOf(p1)
  const id2 = state.particles.indexOf(p2)
  return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`
}


/* 绘制粒子和连接 */
// 修改 render 函数中的连接线绘制部分
function render() {
  // 清空离屏画布
  state.offscreenCtx.clearRect(0, 0, state.bounds.width, state.bounds.height)

  // 更新所有粒子
  state.particles.forEach(particle => {
    particle.update()
  })

  // 更新网格
  updateGrid()

  // 批量绘制连接线

  const newConnections = []
  const maxDistanceSquared = state.maxDistance ** 2
  state.offscreenCtx.lineWidth = 0.2 * state.dpr

  // 遍历网格检查连接
  for (let col in state.grid) {
    for (let row in state.grid[col]) {
      const cellParticles = state.grid[col][row]
      if (cellParticles.length > 0) {
        const neighbors = getNeighbors(parseInt(col), parseInt(row))
        cellParticles.forEach(particle => {
          neighbors.forEach(other => {
            if (particle !== other) {
              const dx = particle.x - other.x
              const dy = particle.y - other.y
              const distanceSquared = dx * dx + dy * dy

              if (distanceSquared < maxDistanceSquared) {
                const connectionId = getConnectionId(particle, other)

                // 使用缓存的颜色或生成新颜色
                if (!state.connectionColors.has(connectionId) && Math.random() < state.connectionProbability) {
                  state.connectionColors.set(connectionId, getRandomColor())
                }

                if (state.connectionColors.has(connectionId)) {
                  newConnections.push({
                    id: connectionId,
                    x1: particle.x,
                    y1: particle.y,
                    x2: other.x,
                    y2: other.y,
                    distance: Math.sqrt(distanceSquared)
                  })
                }
              }
            }
          })
        })
      }
    }
  }

  // 清理断开的连接
  for (const [id, _] of state.connectionColors) {
    if (!newConnections.some(conn => conn.id === id)) {
      state.connectionColors.delete(id)
    }
  }

  // 绘制连接线
  newConnections.forEach(conn => {
    const alpha = Math.max(0.1, 1 - conn.distance / state.maxDistance)
    state.offscreenCtx.beginPath()
    state.offscreenCtx.strokeStyle = state.connectionColors.get(conn.id)
    state.offscreenCtx.lineWidth = 0.2 * state.dpr  // 线条宽度
    state.offscreenCtx.lineCap = 'round'  // 设置线条端点为圆形
    state.offscreenCtx.lineJoin = 'round' // 设置线条连接处为圆形
    state.offscreenCtx.moveTo(conn.x1, conn.y1)
    state.offscreenCtx.lineTo(conn.x2, conn.y2)
    state.offscreenCtx.stroke()
  })

  // 批量绘制粒子
  state.particles.forEach(particle => {
    particle.draw(state.offscreenCtx)
  })

  // 一次性将离屏画布内容复制到主画布
  state.ctx.clearRect(0, 0, state.bounds.width, state.bounds.height)
  state.ctx.drawImage(state.offscreenCanvas, 0, 0)
}

/* 获取随机颜色 */
function getRandomColor() {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  const a = 0.8 + Math.random() * 0.2  // 透明度
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/* 动画循环 */
function animate(currentTime = 0) {
  if (!state.isAnimating) return
  
  // 计算deltaTime
  state.deltaTime = currentTime - state.lastFrameTime
  const targetInterval = 1000 / state.targetFPS
  
  // 如果设备性能不足，自动降低渲染频率
  if (state.deltaTime >= targetInterval || state.frameSkip > 2) {
    render()
    state.lastFrameTime = currentTime
    state.frameSkip = 0
  } else {
    state.frameSkip++
  }
  
  state.animationId = requestAnimationFrame(animate)
}

/* 设置画布 */
function setupCanvas() {
  if (!state.canvas) return
  state.ctx = state.canvas.getContext('2d')
  state.bounds.width = window.innerWidth
  state.bounds.height = window.innerHeight
  state.canvas.width = state.bounds.width * state.dpr
  state.canvas.height = state.bounds.height * state.dpr
  state.canvas.style.width = `${state.bounds.width}px`
  state.canvas.style.height = `${state.bounds.height}px`
  state.ctx.scale(state.dpr, state.dpr)

  // 设置离屏画布
  state.offscreenCanvas = document.createElement('canvas')
  state.offscreenCtx = state.offscreenCanvas.getContext('2d')
  state.offscreenCanvas.width = state.bounds.width
  state.offscreenCanvas.height = state.bounds.height

  state.ctx = state.canvas.getContext('2d', {
    antialias: true
  })
  state.offscreenCtx = state.offscreenCanvas.getContext('2d', {
    antialias: true
  })

  // 启用抗锯齿
  state.ctx.imageSmoothingEnabled = true
  state.ctx.imageSmoothingQuality = 'high'
  state.offscreenCtx.imageSmoothingEnabled = true
  state.offscreenCtx.imageSmoothingQuality = 'high'
}

// 添加四叉树类
class QuadTree {
  constructor(bounds, level = 0, maxLevel = 4, maxObjects = 10) {
    this.bounds = bounds
    this.level = level
    this.maxLevel = maxLevel
    this.maxObjects = maxObjects
    this.objects = []
    this.nodes = []
  }

  clear() {
    this.objects = []
    for (let node of this.nodes) {
      node.clear()
    }
    this.nodes = []
  }

  split() {
    const { x, y, width, height } = this.bounds
    const subWidth = width / 2
    const subHeight = height / 2

    this.nodes[0] = new QuadTree({ x: x + subWidth, y, width: subWidth, height: subHeight }, this.level + 1, this.maxLevel, this.maxObjects)
    this.nodes[1] = new QuadTree({ x, y, width: subWidth, height: subHeight }, this.level + 1, this.maxLevel, this.maxObjects)
    this.nodes[2] = new QuadTree({ x, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1, this.maxLevel, this.maxObjects)
    this.nodes[3] = new QuadTree({ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1, this.maxLevel, this.maxObjects)
  }

  insert(particle) {
    if (this.nodes.length > 0) {
      const index = this.getIndex(particle)
      if (index !== -1) {
        this.nodes[index].insert(particle)
        return
      }
    }

    this.objects.push(particle)

    if (this.objects.length > this.maxObjects && this.level < this.maxLevel) {
      if (this.nodes.length === 0) {
        this.split()
      }

      let i = 0
      while (i < this.objects.length) {
        const index = this.getIndex(this.objects[i])
        if (index !== -1) {
          this.nodes[index].insert(this.objects.splice(i, 1)[0])
        } else {
          i++
        }
      }
    }
  }

  retrieve(returnObjects, particle) {
    const index = this.getIndex(particle)
    if (index !== -1 && this.nodes.length > 0) {
      this.nodes[index].retrieve(returnObjects, particle)
    }
    returnObjects.push(...this.objects)
    return returnObjects
  }

  getIndex(particle) {
    const { x, y, width, height } = this.bounds
    const verticalMidpoint = x + width / 2
    const horizontalMidpoint = y + height / 2

    const topQuadrant = particle.y < horizontalMidpoint && particle.y + particle.radius < horizontalMidpoint
    const bottomQuadrant = particle.y > horizontalMidpoint

    if (particle.x < verticalMidpoint && particle.x + particle.radius < verticalMidpoint) {
      if (topQuadrant) return 1
      else if (bottomQuadrant) return 2
    } else if (particle.x > verticalMidpoint) {
      if (topQuadrant) return 0
      else if (bottomQuadrant) return 3
    }
    return -1
  }
}

// 添加对象池
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 50) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.pool = []
    this.active = []
    
    // 预分配对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  get() {
    const obj = this.pool.length > 0 ? this.pool.pop() : this.createFn()
    this.active.push(obj)
    return obj
  }

  release(obj) {
    const index = this.active.indexOf(obj)
    if (index > -1) {
      this.active.splice(index, 1)
      this.resetFn(obj)
      this.pool.push(obj)
    }
  }

  clear() {
    this.pool.push(...this.active)
    this.active = []
  }
}


 /* 事件处理 */
function handleResize() {
  setupCanvas()
  resetState()
}

function handleVisibilityChange() {
  if (document.hidden) {
    pauseAnimation()
  } else {
    startAnimation()
  }
}

/* 启动动画 */
function startAnimation() {
  if (!state.isAnimating) {
    state.isAnimating = true
    animate()
  }
}

/* 暂停动画 */
function pauseAnimation() {
  state.isAnimating = false
  if (state.animationId) {
    cancelAnimationFrame(state.animationId)
    state.animationId = null
  }
}

/* 重置状态 */
function resetState() {
  initializeParticles()
  initializeGrid()
  // 重置状态时清理连接缓存
  state.connectionColors.clear()
}

/* 初始加载 */
onMounted(() => {
  // 确保在客户端环境下才执行
  if (typeof window === 'undefined') return
  
  // 创建 canvas
  state.canvas = document.createElement('canvas')
  state.canvas.style.position = 'fixed'
  state.canvas.style.top = '0'
  state.canvas.style.left = '0'
  state.canvas.style.width = '100%'
  state.canvas.style.height = '100%'
  state.canvas.style.pointerEvents = 'none'
  state.canvas.style.zIndex = '0'
  document.body.appendChild(state.canvas)

  // 设置画布和粒子
  setupCanvas()
  resetState()
  
  // 启动动画
  startAnimation()

  // 事件绑定
  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

/* 组件销毁 */
onBeforeUnmounted(() => {
  if (typeof window === 'undefined') return
  
  // 事件解绑
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  // 停止动画
  pauseAnimation()

  // 移除 canvas
  if (state.canvas && state.canvas.parentNode) {
    state.canvas.parentNode.removeChild(state.canvas)
  }
})
</script>

<template>
  <div class="effect-container">
    <!-- 只在客户端渲染控制面板 -->
    <ClientOnly>
      <div class="control-panel" :class="{ 'expanded': state.showPanel }">
        <div class="control-header" @click="state.showPanel = !state.showPanel">
          <span class="control-title">⚙️</span>
        </div>

        <div class="control-content" v-if="state.showPanel">
          <div class="control-item">
            <label>Particle Count</label>
            <input type="range" v-model.number="state.particleCount" min="30" max="150" @input="updateParticles" />
            <span class="value">{{ state.particleCount }}</span>
          </div>

          <div class="control-item">
            <label>Max Distance</label>
            <input type="range" v-model.number="state.maxDistance" min="50" max="300" @input="updateConnections" />
            <span class="value">{{ state.maxDistance }}</span>
          </div>

          <div class="control-item">
            <label>Connection Probability</label>
            <input type="range" v-model.number="state.connectionProbability" step="0.01" min="0" max="1" @input="updateConnections" />
            <span class="value">{{ state.connectionProbability.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
.effect-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.control-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 36px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  z-index: 1000;
  color: #000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.control-panel:hover {
  background: rgba(255, 255, 255, 0.5);
}

.control-panel.expanded {
  width: 260px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.control-header {
  height: 36px;
  width: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.control-toggle {
  font-size: 18px;
  color: #333;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded .control-toggle {
  transform: rotate(180deg);
}

.control-content {
  padding: 16px;
  transform-origin: top;
  transform: scaleY(0);
  opacity: 0;
  transition:
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transform-origin: top;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded .control-content {
  transform: scaleY(1);
  opacity: 1;
}

.control-item {
  width: 100%;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  color: #000;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.expanded .control-item {
  opacity: 1;
  transform: translateY(0);
}

.expanded .control-item:nth-child(1) {
  transition-delay: 0.1s;
}

.expanded .control-item:nth-child(2) {
  transition-delay: 0.15s;
}

.expanded .control-item:nth-child(3) {
  transition-delay: 0.2s;
}

.control-item label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-weight: 500;
}

.control-item input[type="range"] {
  width: 100%;
  margin-bottom: 4px;
  accent-color: #007f1c;
}

.control-item .value {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.control-item:hover .value {
  color: #000;
}
</style>