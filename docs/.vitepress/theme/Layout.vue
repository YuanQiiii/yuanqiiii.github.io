<template>
  <Layout>
    <!-- 阅读进度条 -->
    <template #nav-bar-content-before>
      <ReadingProgress />
    </template>

    <!-- 文章底部 -->
    <template #doc-after>
      <!-- 移除了文章导航和相关文章功能 -->
    </template>

    <!-- 全局组件 -->
    <template #layout-bottom>
      <ImageLightbox ref="lightbox" />
      <!-- <Effect /> -->
    </template>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './components/ReadingProgress.vue'
import ImageLightbox from './components/ImageLightbox.vue'
import Effect from './components/Effect.vue'

const { Layout } = DefaultTheme
const route = useRoute()

const lightbox = ref(null)

// 设置图片点击事件
const setupImageClickEvents = () => {
  nextTick(() => {
    const images = document.querySelectorAll('.vp-doc img')
    images.forEach((img, index) => {
      img.style.cursor = 'pointer'
      img.addEventListener('click', () => {
        const imageList = Array.from(images).map(imgEl => ({
          src: imgEl.src,
          alt: imgEl.alt || ''
        }))
        lightbox.value?.open(imageList, index)
      })
    })
  })
}

onMounted(() => {
  setupImageClickEvents()
  initMermaid()
})

// 监听路由变化
watch(() => route.path, () => {
  setupImageClickEvents()
  initMermaid()
})

// 初始化 Mermaid 图表
const initMermaid = () => {
  nextTick(() => {
    const mermaidDoms = document.querySelectorAll('.mermaid')
    if (mermaidDoms.length > 0) {
      mermaidDoms.forEach((dom, index) => {
        // 防止重复初始化
        if (dom.querySelector('.mermaid-zoom-container')) {
          return
        }

        const zoomContainer = document.createElement('div')
        zoomContainer.className = 'mermaid-zoom-container'
        zoomContainer.innerHTML = `
          <div class="zoom-controls">
            <button class="zoom-in" title="放大">+</button>
            <button class="zoom-out" title="缩小">-</button>
            <button class="zoom-reset" title="重置">Reset</button>
            <button class="zoom-fullscreen" title="全屏">Fullscreen</button>
            <button class="zoom-download" title="下载">Download</button>
          </div>
        `
        
        const svg = dom.querySelector('svg')
        if (!svg) return

        // 将 SVG 包装起来
        dom.appendChild(zoomContainer)
        const parent = svg.parentNode
        parent.insertBefore(zoomContainer, svg)
        zoomContainer.appendChild(svg)

        let scale = 1
        const zoomFactor = 0.1

        const updateTransform = () => {
          svg.style.transformOrigin = 'center center'
          svg.style.transform = `scale(${scale})`
        }

        zoomContainer.querySelector('.zoom-in').addEventListener('click', (e) => {
          e.stopPropagation()
          scale += zoomFactor
          updateTransform()
        })

        zoomContainer.querySelector('.zoom-out').addEventListener('click', (e) => {
          e.stopPropagation()
          scale = Math.max(0.1, scale - zoomFactor)
          updateTransform()
        })

        zoomContainer.querySelector('.zoom-reset').addEventListener('click', (e) => {
          e.stopPropagation()
          scale = 1
          updateTransform()
        })

        zoomContainer.querySelector('.zoom-fullscreen').addEventListener('click', (e) => {
          e.stopPropagation()
          if (zoomContainer.requestFullscreen) {
            zoomContainer.requestFullscreen()
          }
        })

        zoomContainer.querySelector('.zoom-download').addEventListener('click', (e) => {
          e.stopPropagation()
          const serializer = new XMLSerializer()
          const source = serializer.serializeToString(svg)
          const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `mermaid-chart-${index}.svg`
          a.click()
          URL.revokeObjectURL(url)
        })
      })
    }
  })
}
</script>
