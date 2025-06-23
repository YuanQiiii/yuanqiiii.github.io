<template>
  <Layout>
    <!-- 阅读进度条 -->
    <template #nav-bar-content-before>
      <ReadingProgress />
    </template>

    <!-- 主要内容区域 -->
    <template #doc-before>
      <div v-if="isArticlePage" class="article-header">
        <!-- ArticleInfo 和 ArticleTags 组件已被移除 -->
      </div>
    </template>

    <!-- 文章底部 -->
    <template #doc-after>
      <div v-if="isArticlePage" class="article-footer">
        <div class="article-navigation">
          <a v-if="prevArticle" :href="prevArticle.path" class="nav-link prev">
            <div class="nav-direction">← 上一篇</div>
            <div class="nav-title">{{ prevArticle.title }}</div>
          </a>
          <a v-if="nextArticle" :href="nextArticle.path" class="nav-link next">
            <div class="nav-direction">下一篇 →</div>
            <div class="nav-title">{{ nextArticle.title }}</div>
          </a>
        </div>
        
        <!-- 相关文章推荐 -->
        <div v-if="relatedArticles.length > 0" class="related-articles">
          <h3>相关文章</h3>
          <div class="related-grid">
            <a 
              v-for="article in relatedArticles" 
              :key="article.path"
              :href="article.path"
              class="related-item"
            >
              <h4>{{ article.title }}</h4>
              <p>{{ article.excerpt }}</p>
              <div class="related-meta">
                <span class="category">{{ article.category }}</span>
                <span class="reading-time">{{ article.reading_time }}分钟</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </template>

    <!-- 全局组件 -->
    <template #layout-bottom>
      <ImageLightbox ref="lightbox" />
    </template>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ReadingProgress from './components/ReadingProgress.vue'
import ImageLightbox from './components/ImageLightbox.vue'

const { Layout } = DefaultTheme
const route = useRoute()
const { page } = useData()

const lightbox = ref(null)
const articlesData = ref([])
const articleData = ref({})
const prevArticle = ref(null)
const nextArticle = ref(null)
const relatedArticles = ref([])

const isArticlePage = computed(() => {
  return route.path.endsWith('.md') && 
         route.path !== '/' && 
         !route.path.includes('/index')
})

// 加载文章数据
const loadArticlesData = async () => {
  try {
    // 暂时使用空数据避免构建错误
    const data = []
    articlesData.value = data
    
    if (isArticlePage.value) {
      const currentPath = route.path
      const currentIndex = data.findIndex(article => article.path === currentPath)
      
      if (currentIndex !== -1) {
        articleData.value = data[currentIndex]
        
        // 设置上一篇和下一篇
        if (currentIndex > 0) {
          prevArticle.value = data[currentIndex - 1]
        }
        if (currentIndex < data.length - 1) {
          nextArticle.value = data[currentIndex + 1]
        }
        
        // 查找相关文章
        relatedArticles.value = findRelatedArticles(data[currentIndex], data)
      }
    }
  } catch (e) {
    console.warn('无法加载文章数据:', e)
  }
}

// 查找相关文章
const findRelatedArticles = (currentArticle, allArticles) => {
  const related = allArticles
    .filter(article => article.path !== currentArticle.path)
    .map(article => {
      let score = 0
      
      // 同分类加分
      if (article.category === currentArticle.category) {
        score += 3
      }
      
      // 相同标签加分
      const commonTags = article.tags?.filter(tag => 
        currentArticle.tags?.includes(tag)
      ) || []
      score += commonTags.length * 2
      
      // 标题相似度
      const titleSimilarity = calculateSimilarity(
        article.title, 
        currentArticle.title
      )
      score += titleSimilarity
      
      return { ...article, score }
    })
    .filter(article => article.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  
  return related
}

// 计算字符串相似度（简单版本）
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

// Levenshtein距离算法
const levenshteinDistance = (str1, str2) => {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// 设置图片点击事件
const setupImageClickEvents = () => {
  nextTick(() => {
    const images = document.querySelectorAll('.vp-doc img')
    images.forEach((img, index) => {
      img.style.cursor = 'pointer'
      img.addEventListener('click', () => {
        const imageList = Array.from(images).map(imgEl => ({
          src: imgEl.src,
          alt: imgEl.alt || ''
        }))
        lightbox.value?.open(imageList, index)
      })
    })
  })
}

onMounted(() => {
  loadArticlesData()
  setupImageClickEvents()
})
</script>

<style scoped>
.article-header {
  margin-bottom: 2rem;
}

.article-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.article-navigation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.nav-link {
  display: block;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
}

.nav-link:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-link.next {
  text-align: right;
}

.nav-direction {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.25rem;
}

.nav-title {
  font-weight: 600;
  line-height: 1.4;
}

.related-articles {
  margin-top: 2rem;
}

.related-articles h3 {
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.related-item {
  display: block;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
}

.related-item:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
}

.related-item h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.related-item p {
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.category {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .article-navigation {
    grid-template-columns: 1fr;
  }
  
  .nav-link.next {
    text-align: left;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>
