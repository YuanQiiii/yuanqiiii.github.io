<template>
  <div class="recent-posts">
    <h2>最新文章</h2>
    <div class="posts-grid">
      <div v-for="post in recentPosts" :key="post.path" class="post-card">
        <a :href="post.path" class="post-link">
          <h3>{{ post.title }}</h3>
          <p class="post-excerpt">{{ post.excerpt }}</p>
          <div class="post-meta">
            <span class="post-date">{{ formatDate(post.modified || post.lastUpdated) }}</span>
            <span class="post-category">{{ post.category }}</span>
            <span v-if="post.reading_time" class="reading-time">
              📖 {{ post.reading_time }}分钟
            </span>
          </div>
          <ArticleTags v-if="post.tags && post.tags.length > 0" :tags="post.tags" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ArticleTags from './ArticleTags.vue'

const recentPosts = ref([])

const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  try {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return '未知时间'
  }
}

const extractPosts = async () => {
  try {
    // 暂时返回空数组避免构建错误
    return []
  } catch (e) {
    // 降级方案：从侧边栏数据中提取
    console.warn('无法加载文章数据，使用降级方案')
    try {
      const { default: sidebarData } = await import('../.vitepress/sidebarItems.js')
      const posts = []
      
      const processItems = (items, category = '') => {
        items.forEach(item => {
          if (item.items) {
            processItems(item.items, item.text || category)
          } else if (item.link && item.link.endsWith('.md') && !item.link.includes('index')) {
            posts.push({
              title: item.text || '未命名文章',
              path: item.link,
              category: category || '其他',
              excerpt: '点击查看详细内容...',
              modified: new Date().toISOString(),
              tags: [],
              reading_time: 5
            })
          }
        })
      }
      
      processItems(sidebarData)
      return posts.slice(0, 6)
    } catch (e2) {
      console.error('无法加载任何数据源:', e2)
      return []
    }
  }
}

onMounted(async () => {
  recentPosts.value = await extractPosts()
})
</script>

<style scoped>
.recent-posts {
  margin: 2rem 0;
  padding: 0 1rem;
}

.recent-posts h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--vp-c-text-1);
  font-size: 2rem;
  font-weight: 600;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.post-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--vp-c-brand);
}

.post-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.post-card h3 {
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

.post-excerpt {
  color: var(--vp-c-text-2);
  margin: 0 0 1rem 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.reading-time {
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}

.post-category {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .post-card {
    padding: 1rem;
  }
}
</style>
