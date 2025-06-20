<template>
  <teleport to="body">
    <div v-if="visible" class="lightbox-overlay" @click="close" @keydown.esc="close">
      <div class="lightbox-container" @click.stop>
        <button class="lightbox-close" @click="close" aria-label="关闭">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        
        <img 
          :src="currentImage" 
          :alt="currentAlt"
          class="lightbox-image"
          @load="onImageLoad"
        />
        
        <div v-if="currentAlt" class="lightbox-caption">
          {{ currentAlt }}
        </div>
        
        <!-- 导航按钮 -->
        <button 
          v-if="images.length > 1" 
          class="lightbox-nav lightbox-prev" 
          @click="previousImage"
          :disabled="currentIndex === 0"
          aria-label="上一张"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        
        <button 
          v-if="images.length > 1" 
          class="lightbox-nav lightbox-next" 
          @click="nextImage"
          :disabled="currentIndex === images.length - 1"
          aria-label="下一张"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
        
        <!-- 图片计数 -->
        <div v-if="images.length > 1" class="lightbox-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const images = ref([])
const currentIndex = ref(0)

const currentImage = computed(() => images.value[currentIndex.value]?.src || '')
const currentAlt = computed(() => images.value[currentIndex.value]?.alt || '')

const open = (imageList, index = 0) => {
  images.value = imageList
  currentIndex.value = index
  visible.value = true
  document.body.style.overflow = 'hidden'
}

const close = () => {
  visible.value = false
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (currentIndex.value < images.value.length - 1) {
    currentIndex.value++
  }
}

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const onImageLoad = () => {
  // 图片加载完成后的处理
}

const handleKeydown = (e) => {
  if (!visible.value) return
  
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

// 暴露方法给父组件使用
defineExpose({
  open,
  close
})
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  animation: lightboxFadeIn 0.3s ease;
}

.lightbox-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: lightboxZoomIn 0.3s ease;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.lightbox-caption {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 4px;
  max-width: 80%;
  text-align: center;
  font-size: 14px;
  backdrop-filter: blur(8px);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.lightbox-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lightbox-prev {
  left: -70px;
}

.lightbox-next {
  right: -70px;
}

.lightbox-counter {
  position: absolute;
  top: -50px;
  left: 0;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  backdrop-filter: blur(8px);
}

@keyframes lightboxFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes lightboxZoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .lightbox-close {
    top: 10px;
    right: 10px;
    position: fixed;
  }
  
  .lightbox-caption {
    bottom: 20px;
    position: fixed;
    left: 10px;
    right: 10px;
    transform: none;
    max-width: none;
  }
  
  .lightbox-counter {
    top: 10px;
    left: 10px;
    position: fixed;
  }
  
  .lightbox-nav {
    bottom: 80px;
    top: auto;
    transform: none;
  }
  
  .lightbox-prev {
    left: 20px;
  }
  
  .lightbox-next {
    right: 20px;
  }
}
</style>
