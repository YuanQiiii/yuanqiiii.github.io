<template>
  <div class="article-list-container">
    <div v-if="loading" class="loading">正在加载文章列表...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!filteredPosts.length" class="no-articles">暂无文章</div>
    <div v-else>
      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索文章标题或内容..." 
            class="search-input"
          >
        </div>
        <div class="filter-controls">
          <select v-model="selectedCategory" class="filter-select">
            <option value="">所有分类</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <select v-model="sortBy" class="filter-select">
            <option value="date">按日期排序</option>
            <option value="title">按标题排序</option>
            <option value="readingTime">按阅读时间排序</option>
          </select>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats">
        共找到 {{ filteredPosts.length }} 篇文章
        <span v-if="searchQuery || selectedCategory">
          （共 {{ allPosts.length }} 篇）
        </span>
      </div>

      <!-- 文章列表 -->
      <div class="articles-grid">
        <article v-for="post in filteredPosts" :key="post.url" class="article-card">
          <a :href="post.url" class="article-link">
            <h2 class="article-title">{{ post.title }}</h2>
            <p class="article-description">{{ post.description }}</p>
            <div class="article-meta">
              <span class="meta-item">
                <span class="meta-icon">📅</span>
                {{ formatDate(post.date) }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">📖</span>
                {{ post.readingTime }} 分钟
              </span>
              <span class="meta-item">
                <span class="meta-icon">📝</span>
                {{ post.wordCount }} 字
              </span>
              <span class="meta-item category">
                <span class="meta-icon">📂</span>
                {{ post.category }}
              </span>
            </div>
            <div v-if="post.tags && post.tags.length" class="article-tags">
              <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
          </a>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const allPosts = ref([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('date')

// 计算属性：获取所有分类
const categories = computed(() => {
  const cats = new Set(allPosts.value.map(post => post.category))
  return Array.from(cats).sort()
})

// 计算属性：过滤和排序后的文章
const filteredPosts = computed(() => {
  let posts = allPosts.value

  // 按分类筛选
  if (selectedCategory.value) {
    posts = posts.filter(post => post.category === selectedCategory.value)
  }

  // 按搜索词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    posts = posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // 排序
  posts = [...posts].sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return a.title.localeCompare(b.title, 'zh-CN')
      case 'readingTime':
        return a.readingTime - b.readingTime
      case 'date':
      default:
        return new Date(b.date) - new Date(a.date)
    }
  })

  return posts
})

// 加载文章列表
onMounted(async () => {
  try {
    // 尝试加载生成的文章数据
    const response = await fetch('/articles.json')
    if (response.ok) {
      const data = await response.json()
      allPosts.value = data.articles || []
    } else {
      // 如果没有生成的数据，使用默认数据
      console.warn('未找到生成的文章列表，使用静态数据')
      allPosts.value = [
        {
          url: '/content/about',
          title: '关于我',
          date: '2024-01-01',
          category: '其他',
          description: '个人介绍页面',
          readingTime: 2,
          wordCount: 500,
          tags: []
        },
        {
          url: '/content/friend',
          title: '友情链接',
          date: '2024-01-01',
          category: '其他',
          description: '朋友们的网站链接',
          readingTime: 1,
          wordCount: 200,
          tags: []
        }
      ]
    }
  } catch (err) {
    error.value = '加载文章列表失败: ' + err.message
    console.error('加载文章列表出错:', err)
  } finally {
    loading.value = false
  }
})

// 格式化日期函数
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
</script>

<style scoped>
.article-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 筛选区域 */
.filter-section {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  font-size: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.filter-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  cursor: pointer;
}

/* 统计信息 */
.stats {
  color: var(--vp-c-text-2);
  font-size: 14px;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

/* 文章网格 */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }
}

/* 文章卡片 */
.article-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: fit-content;
}

.article-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.article-link {
  display: block;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.article-title {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-link:hover .article-title {
  color: var(--vp-c-brand-1);
}

.article-description {
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 15px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 元信息 */
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.meta-item.category {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.meta-icon {
  margin-right: 4px;
  opacity: 0.7;
}

/* 标签 */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-block;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid var(--vp-c-border);
  transition: all 0.2s;
}

.tag:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

/* 状态样式 */
.loading, .error, .no-articles {
  text-align: center;
  font-size: 1.1em;
  padding: 40px 20px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  margin: 20px 0;
}

.error {
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .article-list-container {
    padding: 15px;
  }
  
  .filter-section {
    padding: 15px;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .article-meta {
    font-size: 12px;
  }
  
  .meta-item {
    min-width: 0;
  }
}
</style>
