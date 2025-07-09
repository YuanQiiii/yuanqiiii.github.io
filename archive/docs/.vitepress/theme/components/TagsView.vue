<template>
  <div class="tags-container">
    <div class="tags-header">
      <h2>🏷️ 标签云</h2>
      <div class="tags-stats">
        <span>{{ tagsData.totalTags }} 个标签</span>
        <span>{{ tagsData.totalTaggedArticles }} 篇带标签文章</span>
      </div>
    </div>

    <div class="tag-cloud" v-if="tagsData.tags && tagsData.tags.length > 0">
      <button
        v-for="tag in tagsData.tags"
        :key="tag.name"
        :class="['tag-item', tag.size, { active: selectedTag === tag.name }]"
        @click="selectTag(tag.name)"
      >
        {{ tag.name }}
        <span class="tag-count">{{ tag.count }}</span>
      </button>
    </div>

    <div v-if="selectedTag && selectedTagData" class="tag-articles">
      <h3>{{ selectedTag }} 相关文章 ({{ selectedTagData.count }})</h3>
      <div class="articles-list">
        <div 
          v-for="article in selectedTagData.articles"
          :key="article.url"
          class="article-item"
        >
          <div class="article-meta">
            <span class="article-category">{{ article.category }}</span>
            <span class="article-date">{{ formatDate(article.date) }}</span>
          </div>
          <h4><a :href="article.url">{{ article.title }}</a></h4>
          <p v-if="article.description">{{ article.description }}</p>
        </div>
      </div>
      <button @click="clearSelection" class="clear-btn">清除选择</button>
    </div>

    <div v-else class="tags-empty">
      <p>暂时还没有标签，在文章的frontmatter中添加tags字段吧！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const tagsData = ref({
  totalTags: 0,
  totalTaggedArticles: 0,
  tags: []
})

const selectedTag = ref(null)

const selectedTagData = computed(() => {
  if (!selectedTag.value) return null
  return tagsData.value.tags.find(tag => tag.name === selectedTag.value)
})

function selectTag(tagName) {
  selectedTag.value = selectedTag.value === tagName ? null : tagName
}

function clearSelection() {
  selectedTag.value = null
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    const response = await fetch('/tags.json')
    const data = await response.json()
    tagsData.value = data
  } catch (error) {
    console.error('Failed to load tags data:', error)
  }
})
</script>

<style scoped>
.tags-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.tags-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid var(--vp-c-border);
}

.tags-header h2 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 2rem;
}

.tags-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  margin-bottom: 2rem;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 2px solid var(--vp-c-border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  text-decoration: none;
}

.tag-item:hover,
.tag-item.active {
  background: var(--vp-c-brand);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tag-item.small {
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
}

.tag-item.medium {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.tag-item.large {
  font-size: 1.2rem;
  padding: 0.7rem 1.3rem;
  font-weight: 600;
}

.tag-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-size: 0.7em;
  font-weight: bold;
}

.tag-articles {
  margin-top: 2rem;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
}

.tag-articles h3 {
  color: var(--vp-c-text-1);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-border);
}

.articles-list {
  display: grid;
  gap: 1.5rem;
}

.article-item {
  padding: 1.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
}

.article-category {
  background: var(--vp-c-brand-light);
  color: var(--vp-c-brand);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 500;
}

.article-date {
  color: var(--vp-c-text-3);
}

.article-item h4 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.article-item h4 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.3s;
}

.article-item h4 a:hover {
  color: var(--vp-c-brand);
}

.article-item p {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0.5rem 0 0 0;
}

.clear-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-text-3);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.clear-btn:hover {
  background: var(--vp-c-text-2);
}

.tags-empty {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

@media (max-width: 768px) {
  .tags-container {
    padding: 1rem 0.5rem;
  }
  
  .tags-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tag-cloud {
    padding: 1rem;
  }
  
  .tag-articles {
    padding: 1rem;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
}
</style>
