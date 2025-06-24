<!-- Effect.vue -->
<script setup>
import { onMounted, onBeforeUnmount, reactive, nextTick } from 'vue'

/* 集中状态管理 */
const state = reactive({
  canvas: null,
  ctx: null,
  offscreenCanvas: null,
  offscreenCtx: null,
  dpr: typeof window !== 'undefined' ? Math.max(2, window.devicePixelRatio || 1) : 2, // 提高DPR最小值到2，确保高清显示
  particles: [],
  grid: {},
  gridSize: 70, // 减小网格大小以增加精细度
  particleCount: 50, // 进一步增加粒子数量
  maxDistance: 300, // 减小连接距离以增加密度
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
  isDarkMode: false, // 是否为暗色模式
  colorPalette: [], // 颜色调色板
  connectionColors: null, // 存储连接线的颜色
  activeConnections: null, // 存储活跃的连接
  connectionProbability: 0.15, // 大幅提高连接建立概率
})

/* 检测背景色模式 */
function detectBackgroundMode() {
  if (typeof window === 'undefined') return false
  
  // 检测html元素的背景色或主题类
  const html = document.documentElement
  const body = document.body
  
  // 检查是否有主题类
  if (html.classList.contains('dark') || body.classList.contains('dark') ||
      html.getAttribute('data-theme') === 'dark' || body.getAttribute('data-theme') === 'dark') {
    return true
  }
  
  // 检查CSS变量或计算样式
  const computedStyle = window.getComputedStyle(body)
  const backgroundColor = computedStyle.backgroundColor
  
  // 如果背景色是透明的，检查html元素
  if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
    const htmlStyle = window.getComputedStyle(html)
    const htmlBg = htmlStyle.backgroundColor
    if (htmlBg !== 'rgba(0, 0, 0, 0)' && htmlBg !== 'transparent') {
      return isColorDark(htmlBg)
    }
  }
  
  return backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent' 
    ? isColorDark(backgroundColor) : false
}

/* 判断颜色是否为暗色 */
function isColorDark(color) {
  if (typeof window === 'undefined') return false
  
  // 创建临时元素来解析颜色
  const tempElement = document.createElement('div')
  tempElement.style.color = color
  document.body.appendChild(tempElement)
  const computedColor = window.getComputedStyle(tempElement).color
  document.body.removeChild(tempElement)
  
  // 解析RGB值
  const rgb = computedColor.match(/\d+/g)
  if (rgb && rgb.length >= 3) {
    const r = parseInt(rgb[0])
    const g = parseInt(rgb[1])
    const b = parseInt(rgb[2])
    
    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
  }
  
  return false
}

/* 初始化颜色调色板 */
function initializeColorPalette() {
  if (state.isDarkMode) {
    // 暗色模式：使用更多亮色调色板，提高亮度
    state.colorPalette = [
      'rgba(255, 182, 193, 0.9)',  // 亮粉色
      'rgba(173, 216, 230, 0.9)',  // 亮蓝色
      'rgba(144, 238, 144, 0.9)',  // 亮绿色
      'rgba(255, 218, 185, 0.9)',  // 桃色
      'rgba(221, 160, 221, 0.9)',  // 亮紫色
      'rgba(255, 255, 224, 0.9)',  // 亮黄色
      'rgba(255, 160, 122, 0.9)',  // 亮橙色
      'rgba(176, 224, 230, 0.9)',  // 粉蓝色
      'rgba(255, 192, 203, 0.9)',  // 粉红色
      'rgba(152, 251, 152, 0.9)',  // 淡绿色
      'rgba(255, 20, 147, 0.9)',   // 深粉色
      'rgba(135, 206, 250, 0.9)',  // 天蓝色
      'rgba(255, 215, 0, 0.9)',    // 金色
      'rgba(186, 85, 211, 0.9)',   // 中紫色
      'rgba(255, 99, 71, 0.9)',    // 番茄色
      'rgba(64, 224, 208, 0.9)',   // 青绿色
    ]
  } else {
    // 亮色模式：使用更多深色调色板，提高对比度
    state.colorPalette = [
      'rgba(220, 20, 60, 0.9)',    // 深红色
      'rgba(25, 25, 112, 0.9)',    // 深蓝色
      'rgba(34, 139, 34, 0.9)',    // 深绿色
      'rgba(255, 140, 0, 0.9)',    // 深橙色
      'rgba(128, 0, 128, 0.9)',    // 紫色
      'rgba(184, 134, 11, 0.9)',   // 深黄色
      'rgba(139, 69, 19, 0.9)',    // 棕色
      'rgba(72, 61, 139, 0.9)',    // 深紫色
      'rgba(178, 34, 34, 0.9)',    // 火砖色
      'rgba(46, 139, 87, 0.9)',    // 海绿色
      'rgba(205, 92, 92, 0.9)',    // 印度红
      'rgba(75, 0, 130, 0.9)',     // 靛蓝色
      'rgba(139, 0, 139, 0.9)',    // 深洋红
      'rgba(85, 107, 47, 0.9)',    // 暗橄榄绿
      'rgba(165, 42, 42, 0.9)',    // 棕色
      'rgba(0, 100, 0, 0.9)',      // 深绿色
    ]
  }
}

/* 获取粒子颜色 */
function getParticleColor() {
  if (state.isDarkMode) {
    return `rgba(255, 255, 255, 0.3)` // 降低透明度，从0.95降低到0.4
  } else {
    return `rgba(40, 40, 40, 0.3)` // 降低透明度，从0.95降低到0.4
  }
}

/* 获取连接线颜色 */
function getConnectionColor(connectionId) {
  // 确保connectionColors Map存在
  if (!state.connectionColors) {
    state.connectionColors = new Map()
  }
  
  if (!state.connectionColors.has(connectionId)) {
    const randomColor = state.colorPalette[Math.floor(Math.random() * state.colorPalette.length)]
    state.connectionColors.set(connectionId, randomColor)
  }
  return state.connectionColors.get(connectionId)
}

/* 更新主题模式 */
function updateThemeMode() {
  const newDarkMode = detectBackgroundMode()
  if (newDarkMode !== state.isDarkMode) {
    state.isDarkMode = newDarkMode
    initializeColorPalette()
    // 清除连接线颜色缓存，让它们重新生成
    state.connectionColors.clear()
    // 更新粒子颜色
    state.particles.forEach(particle => {
      particle.color = getParticleColor()
    })
  }
}


/* 粒子类 */
class Particle {
  constructor() {
    this.x = Math.random() * state.bounds.width
    this.y = Math.random() * state.bounds.height
    this.vx = (Math.random() * 2 - 1) * 2
    this.vy = (Math.random() * 2 - 1) * 2
    this.radius = (2 + Math.random() * 3) // 增大基础半径，从1-2.5增加到2-5
    this.baseRadius = this.radius
    this.pulse = Math.random() * Math.PI * 2 // 脉冲相位
    this.pulseSpeed = 0.02 + Math.random() * 0.03
    this.opacity = 0.3 + Math.random() * 0.3 // 提高基础透明度
    this.color = getParticleColor() // 粒子颜色
    this.id = Math.random().toString(36).substr(2, 9) // 给每个粒子一个唯一ID
  }

  update() {
    this.x += this.vx
    this.y += this.vy

    // 边界反弹 - 考虑粒子半径，确保完全在屏幕内
    if (this.x - this.radius <= 0 || this.x + this.radius >= state.bounds.width) {
      this.vx *= -0.8 // 添加能量损失
      this.x = Math.max(this.radius, Math.min(this.x, state.bounds.width - this.radius))
    }
    if (this.y - this.radius <= 0 || this.y + this.radius >= state.bounds.height) {
      this.vy *= -0.8
      this.y = Math.max(this.radius, Math.min(this.y, state.bounds.height - this.radius))
    }    // 脉冲动画
    this.pulse += this.pulseSpeed
    this.radius = this.baseRadius + Math.sin(this.pulse) * 0.8 // 增大脉冲幅度，从0.3增加到0.8
  }  draw(ctx) {
    // 绘制更明显的空心小圆，增大线条宽度
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.strokeStyle = this.color
    ctx.lineWidth = 0.8 // 大幅增加线条宽度，从0.2增加到0.8
    ctx.stroke()
    
    // 添加内部光晕效果，增大范围
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2) // 从0.5增加到0.6
    ctx.fillStyle = this.color.replace(/[\d.]+\)$/g, '0.6)') // 提高内部光晕亮度
    ctx.fill()
    
    // 添加核心高亮效果，增大范围
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2) // 从0.3增加到0.4
    ctx.fillStyle = this.color.replace(/[\d.]+\)$/g, '0.4)') // 进一步提高核心亮度
    ctx.fill()
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
  // 使用粒子的唯一ID来生成连接ID
  return p1.id < p2.id ? `${p1.id}-${p2.id}` : `${p2.id}-${p1.id}`
}

/* 管理连接状态 */
function updateConnections() {
  // 确保activeConnections Map存在
  if (!state.activeConnections) {
    state.activeConnections = new Map()
  }
  
  const maxDistanceSquared = state.maxDistance ** 2
  const connectionsToRemove = []
  
  // 检查现有连接是否需要断开
  for (let [connectionId, connection] of state.activeConnections) {
    const p1 = connection.particle1
    const p2 = connection.particle2
    
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    const distanceSquared = dx * dx + dy * dy
    
    if (distanceSquared > maxDistanceSquared) {
      connectionsToRemove.push(connectionId)
    } else {
      // 更新连接信息
      connection.distance = Math.sqrt(distanceSquared)
      connection.x1 = p1.x
      connection.y1 = p1.y
      connection.x2 = p2.x
      connection.y2 = p2.y
    }
  }
  
  // 移除断开的连接
  connectionsToRemove.forEach(id => {
    state.activeConnections.delete(id)
  })
  
  // 使用网格优化来检查新连接（提高性能）
  updateGrid()
  
  // 遍历网格检查连接
  for (let col in state.grid) {
    for (let row in state.grid[col]) {
      const cellParticles = state.grid[col][row]
      if (cellParticles.length > 0) {
        const neighbors = getNeighbors(parseInt(col), parseInt(row))
        cellParticles.forEach(particle => {
          neighbors.forEach(other => {
            if (particle !== other && particle.id !== other.id) {
              const connectionId = getConnectionId(particle, other)
              
              // 如果连接不存在，检查是否需要建立
              if (!state.activeConnections.has(connectionId)) {
                const dx = particle.x - other.x
                const dy = particle.y - other.y
                const distanceSquared = dx * dx + dy * dy
                
                if (distanceSquared < maxDistanceSquared && Math.random() < state.connectionProbability) {
                  // 建立新连接
                  state.activeConnections.set(connectionId, {
                    particle1: particle,
                    particle2: other,
                    distance: Math.sqrt(distanceSquared),
                    x1: particle.x,
                    y1: particle.y,
                    x2: other.x,
                    y2: other.y,
                    createdAt: Date.now()
                  })
                }
              }
            }
          })
        })
      }
    }
  }
}


/* 绘制粒子和连接 */
// 修改 render 函数中的连接线绘制部分
function render() {
  // 清空离屏画布 - 使用缩放后的坐标系
  state.offscreenCtx.clearRect(0, 0, state.bounds.width, state.bounds.height)

  // 更新所有粒子
  state.particles.forEach(particle => {
    particle.update()
  })
  // 更新连接状态（建立新连接，断开超距离连接）
  updateConnections()
  // 绘制所有活跃的连接线
  if (state.activeConnections) {
    for (let [connectionId, connection] of state.activeConnections) {
    const alpha = Math.max(0.45, 0.98 * (1 - connection.distance / state.maxDistance)) // 提高最低亮度
    const color = getConnectionColor(connectionId)
    
    // 创建渐变效果
    const gradient = state.offscreenCtx.createLinearGradient(
      connection.x1, connection.y1, 
      connection.x2, connection.y2
    )
    const baseColor = color.replace(/[\d.]+\)$/g, `${alpha})`)
    const fadeColor = color.replace(/[\d.]+\)$/g, `${alpha * 0.6})`) // 提高渐变中点亮度
      gradient.addColorStop(0, baseColor)
    gradient.addColorStop(0.5, fadeColor)
    gradient.addColorStop(1, baseColor)
    
    state.offscreenCtx.beginPath()
    state.offscreenCtx.strokeStyle = gradient
    state.offscreenCtx.lineWidth = Math.max(0.5, 1.2 * (1 - connection.distance / state.maxDistance)) // 大幅增加线条粗细
    state.offscreenCtx.lineCap = 'round'
    state.offscreenCtx.lineJoin = 'round'
    state.offscreenCtx.moveTo(connection.x1, connection.y1)
    state.offscreenCtx.lineTo(connection.x2, connection.y2)
    state.offscreenCtx.stroke()
    }
  }

  // 批量绘制粒子
  state.particles.forEach(particle => {
    particle.draw(state.offscreenCtx)
  })

  // 添加页脚透明渐变效果
  applyFooterTransparency()
  // 一次性将离屏画布内容复制到主画布
  state.ctx.clearRect(0, 0, state.bounds.width, state.bounds.height)
  state.ctx.drawImage(state.offscreenCanvas, 0, 0, state.bounds.width, state.bounds.height, 0, 0, state.bounds.width, state.bounds.height)
}

/* 应用页脚透明效果 */
function applyFooterTransparency() {
  const footerHeight = 200 // 页脚渐变区域高度
  const startY = state.bounds.height - footerHeight
  
  // 创建从透明到完全透明的渐变
  const gradient = state.offscreenCtx.createLinearGradient(0, startY, 0, state.bounds.height)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)') // 顶部完全透明
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)') // 逐渐变不透明
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)') // 中等透明度
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)') // 底部高透明度
  
  // 使用混合模式创建遮罩效果
  state.offscreenCtx.globalCompositeOperation = 'destination-out'
  state.offscreenCtx.fillStyle = gradient
  state.offscreenCtx.fillRect(0, startY, state.bounds.width, footerHeight)
  
  // 恢复正常的绘制模式
  state.offscreenCtx.globalCompositeOperation = 'source-over'
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
  if (!state.canvas) {
    console.error('Canvas not available for setup')
    return
  }
  
  try {
    // 获取真实的窗口尺寸
    if (typeof window !== 'undefined') {
      // 使用 clientWidth 和 clientHeight 获取更准确的视口尺寸
      state.bounds.width = document.documentElement.clientWidth || window.innerWidth
      state.bounds.height = document.documentElement.clientHeight || window.innerHeight
    } else {
      state.bounds.width = 1200 // 默认宽度
      state.bounds.height = 800 // 默认高度
    }
    
    // 设置主画布 - 物理尺寸使用DPR缩放
    state.canvas.width = state.bounds.width * state.dpr
    state.canvas.height = state.bounds.height * state.dpr
    // CSS尺寸保持逻辑尺寸
    state.canvas.style.width = `${state.bounds.width}px`
    state.canvas.style.height = `${state.bounds.height}px`
    
    state.ctx = state.canvas.getContext('2d', {
      antialias: true
    })
    
    if (!state.ctx) {
      console.error('Failed to get 2D context from main canvas')
      return
    }
    
    // 缩放主画布上下文以匹配DPR
    state.ctx.scale(state.dpr, state.dpr)

    // 设置离屏画布 - 使用逻辑尺寸，不需要DPR缩放
    state.offscreenCanvas = document.createElement('canvas')
    state.offscreenCanvas.width = state.bounds.width
    state.offscreenCanvas.height = state.bounds.height

    state.offscreenCtx = state.offscreenCanvas.getContext('2d', {
      antialias: true
    })
    
    if (!state.offscreenCtx) {
      console.error('Failed to get 2D context from offscreen canvas')
      return
    }

    // 离屏画布不需要额外的缩放，保持1:1像素比例    // 启用抗锯齿
    state.ctx.imageSmoothingEnabled = true
    state.ctx.imageSmoothingQuality = 'high'
    state.offscreenCtx.imageSmoothingEnabled = true
    state.offscreenCtx.imageSmoothingQuality = 'high'
    
    console.log('Canvas setup complete', {
      canvasSize: { width: state.bounds.width, height: state.bounds.height },
      physicalSize: { width: state.canvas.width, height: state.canvas.height },
      dpr: state.dpr
    })
  } catch (error) {
    console.error('Error setting up canvas:', error)
  }
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
    console.log('Starting animation...')
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
  // 更新主题模式
  updateThemeMode()
  // 重置连接状态
  resetConnections()
  initializeParticles()
  initializeGrid()
}

/* 重置连接状态 */
function resetConnections() {
  // 确保Map对象存在
  if (!state.activeConnections) {
    state.activeConnections = new Map()
  } else {
    state.activeConnections.clear()
  }
  
  if (!state.connectionColors) {
    state.connectionColors = new Map()
  } else {
    state.connectionColors.clear()
  }
}

/* 初始加载 */
onMounted(() => {
  try {
    console.log('Effect component mounting...')
      // 等待DOM完全加载
    nextTick(() => {
      // 初始化Map对象
      state.activeConnections = new Map()
      state.connectionColors = new Map()
      
      // 初始化主题检测
      state.isDarkMode = detectBackgroundMode()
      initializeColorPalette()
      
      // 创建 canvas
      state.canvas = document.createElement('canvas')
      state.canvas.style.position = 'fixed'
      state.canvas.style.top = '0'
      state.canvas.style.left = '0'
      state.canvas.style.width = '100%'
      state.canvas.style.height = '100%'
      state.canvas.style.pointerEvents = 'none'
      state.canvas.style.zIndex = '-1'
      state.canvas.style.backgroundColor = 'transparent'
      
      // 确保canvas添加到body
      if (document.body) {
        document.body.appendChild(state.canvas)
      } else {
        console.error('Document body not available')
        return
      }

      // 设置画布和粒子
      setupCanvas()
      
      // 验证画布设置
      if (!state.ctx || !state.offscreenCtx) {
        console.error('Canvas context not available')
        return
      }
      
      resetState()

      // 启动动画      startAnimation()

      // 事件绑定
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
        document.addEventListener('visibilitychange', handleVisibilityChange)
      }
        // 监听主题变化
      if (typeof window !== 'undefined') {
        const observer = new MutationObserver(() => {
          updateThemeMode()
        })
        observer.observe(document.documentElement, { 
          attributes: true, 
          attributeFilter: ['class', 'data-theme'] 
        })
        observer.observe(document.body, { 
          attributes: true, 
          attributeFilter: ['class', 'data-theme'] 
        })
      }
      
      console.log('Effect component initialized successfully', {
        canvasSize: { width: state.bounds.width, height: state.bounds.height },
        particleCount: state.particles.length,
        isDarkMode: state.isDarkMode,
        isAnimating: state.isAnimating
      })
    })
  } catch (error) {
    console.error('Error initializing Effect component:', error)
  }
})

/* 组件销毁 */
onBeforeUnmount(() => {
  // 事件解绑
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

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
    <!-- 效果由Canvas绘制，此div仅作为组件占位 -->
  </div>
</template>
<style scoped>
.effect-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 1px; /* 确保组件至少有高度 */
}
</style>