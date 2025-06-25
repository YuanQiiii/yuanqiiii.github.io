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
      <Effect />
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
})

// 监听路由变化
watch(() => route.path, () => {
  setupImageClickEvents()
})
</script>

<style scoped>
/* 移除了文章导航和相关文章的样式 */
</style>
