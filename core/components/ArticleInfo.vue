<template>
  <div class="article-info">
    <div class="info-row">
      <div class="info-item">
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span class="label">作者：</span>
        <span class="value">{{ author }}</span>
      </div>
      
      <div class="info-item" v-if="publishDate">
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
        <span class="label">发布：</span>
        <span class="value">{{ formatDate(publishDate) }}</span>
      </div>
    </div>
    
    <div class="info-row" v-if="updateDate">
      <div class="info-item">
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
        </svg>
        <span class="label">更新：</span>
        <span class="value">{{ formatDate(updateDate) }}</span>
      </div>
      
      <div class="info-item" v-if="readingTime">
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <span class="label">阅读：</span>
        <span class="value">约{{ readingTime }}分钟</span>
      </div>
    </div>
    
    <div class="info-row" v-if="wordCount">
      <div class="info-item">
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
        <span class="label">字数：</span>
        <span class="value">{{ formatNumber(wordCount) }}字</span>
      </div>
      
      <div class="info-item" v-if="category">
        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.1 0-2 .9-2 2v3h2V6h4V4zm6 0v2h4v3h2V6c0-1.1-.9-2-2-2h-4zM4 10H2v8c0 1.1.9 2 2 2h4v-2H4v-8zm16 8v-8h-2v8h-4v2h4c1.1 0 2-.9 2-2z"/>
        </svg>
        <span class="label">分类：</span>
        <span class="value category">{{ category }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  author: {
    type: String,
    default: 'YuanQiiii'
  },
  publishDate: {
    type: [String, Date],
    default: null
  },
  updateDate: {
    type: [String, Date],
    default: null
  },
  readingTime: {
    type: Number,
    default: null
  },
  wordCount: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    default: null
  }
})

const formatDate = (date) => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    return '日期格式错误'
  }
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString('zh-CN')
}
</script>

<style scoped>
.article-info {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  font-size: 0.9rem;
}

.info-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 0.75rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.icon {
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.label {
  color: var(--vp-c-text-2);
  font-weight: 500;
  flex-shrink: 0;
}

.value {
  color: var(--vp-c-text-1);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.value.category {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: visible;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .info-item {
    flex-direction: row;
    align-items: center;
  }
  
  .article-info {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .info-row {
    gap: 0.5rem;
  }
  
  .info-item {
    gap: 0.375rem;
  }
  
  .value.category {
    padding: 0.1rem 0.375rem;
    font-size: 0.75rem;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .article-info {
    background: var(--vp-c-bg-alt);
  }
}
</style>
