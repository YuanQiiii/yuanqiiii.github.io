<template>
  <div class="category-page">
    <div class="category-header">
      <h1>{{ title }}</h1>
      <p class="category-description">{{ description }}</p>
      <div class="category-stats">
        共 {{ articles.length }} 篇文章
      </div>
    </div>
    
    <div class="articles-grid">
      <article 
        v-for="article in articles" 
        :key="article.url"
        class="article-card"
      >
        <div class="article-meta">
          <span class="article-category">{{ article.category }}</span>
          <span class="article-date">{{ formatDate(article.frontmatter.date) }}</span>
        </div>
        
        <h3 class="article-title">
          <a :href="article.url">{{ article.title }}</a>
        </h3>
        
        <p class="article-excerpt" v-if="article.frontmatter.description">
          {{ article.frontmatter.description }}
        </p>
        
        <div class="article-footer">
          <div class="article-tags" v-if="article.frontmatter.tags">
            <span 
              v-for="tag in article.frontmatter.tags" 
              :key="tag"
              class="tag"
            >
              #{{ tag }}
            </span>
          </div>
          
          <div class="article-info">
            <span>{{ article.readingTime }} 分钟阅读</span>
            <span>{{ article.wordCount }} 字</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '文章分类'
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  }
})

const articles = ref([])

onMounted(async () => {
  try {
    const response = await fetch('/articles.json')
    const data = await response.json()
    
    if (props.category) {
      articles.value = data.articles.filter(article => 
        article.category === props.category
      )
    } else {
      articles.value = data.articles
    }
    
    // 按日期排序（最新的在前）
    articles.value.sort((a, b) => {
      const dateA = new Date(a.frontmatter.date || '1970-01-01')
      const dateB = new Date(b.frontmatter.date || '1970-01-01')
      return dateB - dateA
    })
  } catch (error) {
    console.error('Failed to load articles:', error)
  }
})

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.category-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.category-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--vp-c-border);
}

.category-header h1 {
  color: var(--vp-c-text-1);
  margin-bottom: 1rem;
}

.category-description {
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.category-stats {
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}

.articles-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.article-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.article-category {
  background: var(--vp-c-brand);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 500;
}

.article-date {
  color: var(--vp-c-text-3);
}

.article-title {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.article-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.3s;
}

.article-title a:hover {
  color: var(--vp-c-brand);
}

.article-excerpt {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-border);
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: var(--vp-c-bg);
  color: var(--vp-c-brand);
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  border: 1px solid var(--vp-c-brand-light);
}

.article-info {
  display: flex;
  gap: 1rem;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .category-page {
    padding: 1rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .article-info {
    gap: 0.5rem;
  }
}
</style>
