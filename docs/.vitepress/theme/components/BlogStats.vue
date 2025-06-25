<template>
  <div class="blog-stats">
    <div class="stats-container">
      <div class="stat-item">
        <div class="stat-number">{{ totalArticles }}</div>
        <div class="stat-label">篇文章</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ totalWords }}</div>
        <div class="stat-label">字数</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ totalCategories }}</div>
        <div class="stat-label">个分类</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ daysSinceStart }}</div>
        <div class="stat-label">天运行</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const totalArticles = ref(0)
const totalWords = ref(0)
const totalCategories = ref(0)
const daysSinceStart = ref(0)

onMounted(async () => {
  try {
    // 从生成的统计数据获取信息
    const response = await fetch('/stats.json')
    const data = await response.json()
    
    totalArticles.value = data.overview.totalArticles
    totalWords.value = data.overview.totalWords
    totalCategories.value = data.overview.totalCategories
    daysSinceStart.value = data.daysSinceStart
  } catch (error) {
    console.error('Failed to load blog stats:', error)
    // 降级到原来的方式
    try {
      const response = await fetch('/articles.json')
      const data = await response.json()
      
      totalArticles.value = data.articles.length
      totalWords.value = data.articles.reduce((sum, article) => sum + (article.wordCount || 0), 0)
      totalCategories.value = new Set(data.articles.map(article => article.category)).size
      
      const startDate = new Date('2024-01-01')
      const today = new Date()
      daysSinceStart.value = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
    } catch (fallbackError) {
      console.error('Failed to load fallback data:', fallbackError)
    }
  }
})
</script>

<style scoped>
.blog-stats {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--vp-c-brand);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
