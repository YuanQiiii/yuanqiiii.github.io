<template>
  <div class="timeline-container">
    <div class="timeline-header">
      <h2>📅 文章时间线</h2>
      <div class="timeline-stats">
        <span>共 {{ timeline.totalArticles }} 篇文章</span>
        <span>{{ timeline.years?.length || 0 }} 年创作历程</span>
      </div>
    </div>

    <div class="timeline-content" v-if="timeline.years && timeline.years.length > 0">
      <div 
        v-for="yearData in timeline.years" 
        :key="yearData.year"
        class="year-section"
      >
        <div class="year-header">
          <h3>{{ yearData.year }}</h3>
          <span class="year-count">{{ yearData.articles.length }} 篇</span>
        </div>
        
        <div class="timeline-items">
          <BlogTimelineCard
            v-for="article in yearData.articles"
            :key="article.url"
            :date="article.date"
            :title="article.title"
            :description="article.description"
            :link="article.url"
            :tags="article.tags"
          />
        </div>
      </div>
    </div>

    <div v-else class="timeline-empty">
      <p>暂时还没有文章，快去写一篇吧！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const timeline = ref({
  totalArticles: 0,
  years: []
})

onMounted(async () => {
  try {
    const response = await fetch('/timeline.json')
    const data = await response.json()
    timeline.value = data
  } catch (error) {
    console.error('Failed to load timeline data:', error)
  }
})
</script>

<style scoped>
.timeline-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.timeline-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--vp-c-border);
}

.timeline-header h2 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 2rem;
}

.timeline-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.year-section {
  margin-bottom: 3rem;
}

.year-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border-left: 4px solid var(--vp-c-brand);
}

.year-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
}

.year-count {
  background: var(--vp-c-brand);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.timeline-items {
  position: relative;
  padding-left: 2rem;
}

.timeline-items::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--vp-c-brand), var(--vp-c-brand-light));
}

.timeline-empty {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

@media (max-width: 768px) {
  .timeline-container {
    padding: 1rem 0.5rem;
  }
  
  .timeline-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .year-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .timeline-items {
    padding-left: 1rem;
  }
}
</style>
