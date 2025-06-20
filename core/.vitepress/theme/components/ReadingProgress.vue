<template>
  <div class="reading-progress" :class="{ 'visible': visible }">
    <div class="progress-bar" :style="{ width: progress + '%' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(0)
const visible = ref(false)

const updateProgress = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  const scrollProgress = (scrollTop / scrollHeight) * 100
  
  progress.value = Math.min(Math.max(scrollProgress, 0), 100)
  visible.value = scrollTop > 100 // 滚动超过100px时显示
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress)
  updateProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.reading-progress.visible {
  opacity: 1;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand), var(--vp-c-brand-light));
  transition: width 0.1s ease;
  box-shadow: 0 0 8px var(--vp-c-brand);
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .reading-progress {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
