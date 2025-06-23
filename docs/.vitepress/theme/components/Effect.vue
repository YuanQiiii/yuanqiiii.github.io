<!-- Effect.vue -->
<script setup>
import { onMounted, onBeforeUnmount, reactive } from 'vue'

/* 集中状态管理 */
const state = reactive({
  canvas: null,
  ctx: null,
  offscreenCanvas: null,
  offscreenCtx: null,
  dpr: window.devicePixelRatio || 1,
  particles: [],
  grid: {},
  gridSize: 100, // 网格大小，可根据需要调整
  particleCount: 60, // 默认粒子数量
  maxDistance: 100, // 默认最大连接距离
  connectionProbability: 0.05, // 默认连接概率
  bounds: {
    width: 0,
    height: 0
  },
  isAnimating: false,
  animationId: null,
  frameSkip: 0, // 跳帧计数
  targetFPS: 60,
  lastFrameTime: 0,
  deltaTime: 0,
  useQuadTree: true, // 是否使用四叉树优化
  renderMode: 'auto', // 'high', 'medium', 'low', 'auto'
})


/* 粒子类 */
class Particle {
  constructor() {
    this.x = Math.random() * state.bounds.width
    this.y = Math.random() * state.bounds.height
    this.vx = (Math.random() * 2 - 1) * 2
    this.vy = (Math.random() * 2 - 1) * 2
    this.radius = (2 + Math.random() * 2) * state.dpr // 随机大小
    this.baseRadius = this.radius
    this.pulse = Math.random() * Math.PI * 2 // 脉冲相位
    this.pulseSpeed = 0.02 + Math.random() * 0.03
    this.opacity = 0.5 + Math.random() * 0.5
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
  }

  draw(ctx) {
    // 绘制简单空心小圆
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`
    ctx.lineWidth = 0.2 * state.dpr
    ctx.stroke()
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
  state.offscreenCtx.lineWidth = 0.3 * state.dpr

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

              if (distanceSquared < maxDistanceSquared && Math.random() < state.connectionProbability) {
                newConnections.push({
                  x1: particle.x,
                  y1: particle.y,
                  x2: other.x,
                  y2: other.y,
                  distance: Math.sqrt(distanceSquared)
                })
              }
            }
          })
        })
      }
    }
  }

  // 绘制连接线 - 单色线条
  state.offscreenCtx.strokeStyle = 'rgba(255, 255, 255, 1)' // 统一使用白色半透明线条
  state.offscreenCtx.lineWidth = 0.5 * state.dpr
  state.offscreenCtx.lineCap = 'round'
  state.offscreenCtx.lineJoin = 'round'
    newConnections.forEach(conn => {
    const alpha = Math.max(0.3, 0.8 * (1 - conn.distance / state.maxDistance))
    state.offscreenCtx.beginPath()
    state.offscreenCtx.globalAlpha = alpha
    state.offscreenCtx.moveTo(conn.x1, conn.y1)
    state.offscreenCtx.lineTo(conn.x2, conn.y2)
    state.offscreenCtx.stroke()
  })
  
  // 重置透明度
  state.offscreenCtx.globalAlpha = 1

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
}

/* 初始加载 */
onMounted(() => {
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
onBeforeUnmount(() => {
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
  <div class="effect-container"></div>
</template>
<style scoped>
.effect-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>