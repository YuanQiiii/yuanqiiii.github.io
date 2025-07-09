<template>
  <div class="image-gallery">
    <div class="gallery-header" v-if="title">
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </div>
    
    <div class="gallery-grid" :class="gridClass">
      <div 
        v-for="(image, index) in images" 
        :key="index"
        class="gallery-item"
        @click="openLightbox(index)"
      >
        <img 
          :src="image.src" 
          :alt="image.alt || `图片 ${index + 1}`"
          class="gallery-image"
          loading="lazy"
        />
        <div class="image-overlay">
          <svg class="zoom-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
          </svg>
        </div>
        <div v-if="image.caption" class="image-caption">
          {{ image.caption }}
        </div>
      </div>
    </div>
    
    <ImageLightbox ref="lightbox" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ImageLightbox from './ImageLightbox.vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  columns: {
    type: [Number, String],
    default: 'auto'
  }
})

const lightbox = ref(null)

const gridClass = computed(() => {
  if (props.columns === 'auto') {
    return 'auto-grid'
  }
  return `grid-${props.columns}`
})

const openLightbox = (index) => {
  const imageList = props.images.map(img => ({
    src: img.src,
    alt: img.alt || img.caption || ''
  }))
  lightbox.value?.open(imageList, index)
}
</script>

<style scoped>
.image-gallery {
  margin: 2rem 0;
}

.gallery-header {
  text-align: center;
  margin-bottom: 2rem;
}

.gallery-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.5rem;
}

.gallery-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}

.gallery-grid {
  display: grid;
  gap: 1rem;
}

.auto-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-5 { grid-template-columns: repeat(5, 1fr); }

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--vp-c-bg-soft);
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.gallery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .image-overlay {
  opacity: 1;
}

.zoom-icon {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.image-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 2rem 1rem 1rem;
  font-size: 0.85rem;
  line-height: 1.4;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.gallery-item:hover .image-caption {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.75rem;
  }
  
  .gallery-image {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr !important;
  }
  
  .gallery-image {
    height: 200px;
  }
}

/* 加载动画 */
.gallery-image {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 2s infinite;
}

.gallery-image[src] {
  background: none;
  animation: none;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .gallery-image {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
    background-size: 200% 100%;
  }
}
</style>
