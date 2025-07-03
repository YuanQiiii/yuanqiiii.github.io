<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './components/ReadingProgress.vue'
import ImageLightbox from './components/ImageLightbox.vue'
import Effect from './components/Effect.vue'

const { Layout } = DefaultTheme
const route = useRoute()
const lightbox = ref(null)

// --- Mermaid Zoom Logic ---
let observer = null

const setupMermaidZoom = () => {
  // Disconnect previous observer if it exists
  if (observer) {
    observer.disconnect()
  }

  // Function to add click listener to a mermaid diagram
  const makeMermaidClickable = (mermaidEl) => {
    mermaidEl.style.cursor = 'zoom-in'
    mermaidEl.addEventListener('click', () => {
      const svg = mermaidEl.querySelector('svg')
      if (!svg) return

      // Create overlay
      const overlay = document.createElement('div')
      overlay.className = 'mermaid-overlay'
      
      // Clone SVG to not affect the original
      const clonedSvg = svg.cloneNode(true)
      overlay.appendChild(clonedSvg)
      
      // Add overlay to body
      document.body.appendChild(overlay)
      
      // Click overlay to close
      overlay.addEventListener('click', () => {
        overlay.remove()
      })
    })
  }

  // Use MutationObserver to detect when mermaid diagrams are added to the DOM
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Check if the added node is a mermaid diagram
          if (node.classList.contains('mermaid')) {
            makeMermaidClickable(node)
          }
          // Check if the added node contains mermaid diagrams
          node.querySelectorAll('.mermaid').forEach(makeMermaidClickable)
        }
      })
    })
  })

  // Start observing the main content area
  nextTick(() => {
    const content = document.querySelector('.vp-doc')
    if (content) {
      observer.observe(content, {
        childList: true,
        subtree: true,
      })
      // Also process any diagrams already present
      content.querySelectorAll('.mermaid').forEach(makeMermaidClickable)
    }
  })
}

// --- Image Lightbox Logic ---
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

// --- Lifecycle Hooks ---
onMounted(() => {
  setupImageClickEvents()
  setupMermaidZoom()
})

watch(() => route.path, () => {
  setupImageClickEvents()
  setupMermaidZoom()
})
</script>

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

<style scoped>
/* 移除了文章导航和相关文章的样式 */
</style>

