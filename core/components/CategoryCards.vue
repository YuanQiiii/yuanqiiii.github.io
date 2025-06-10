<template>
  <div class="category-cards">
    <h2>内容导航</h2>
    <div class="cards-grid">
      <div v-for="category in categories" :key="category.name" class="category-card">
        <a :href="category.link" class="card-link">
          <div class="card-icon">{{ category.icon }}</div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.description }}</p>
          <div class="card-footer">
            <span class="post-count">{{ category.count }} 篇文章</span>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const categories = ref([
  {
    name: '学习笔记',
    description: '记录学习过程中的知识点和心得体会',
    icon: '📚',
    link: '/note/笔记/普通心理学.md',
    count: 1
  },
  {
    name: '随想感悟',
    description: '生活感悟、思考随笔和心情记录',
    icon: '💭',
    link: '/note/list.md',
    count: 3
  },
  {
    name: '关于我',
    description: '了解更多关于我的信息',
    icon: '👋',
    link: '/note/about.md',
    count: 1
  },
  {
    name: '友情链接',
    description: '我的朋友们和推荐网站',
    icon: '🔗',
    link: '/note/friend.md',
    count: 1
  }
])
</script>

<style scoped>
.category-cards {
  margin: 3rem 0;
  padding: 0 1rem;
}

.category-cards h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--vp-c-text-1);
  font-size: 2rem;
  font-weight: 600;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.category-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--vp-c-brand), var(--vp-c-brand-light));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: var(--vp-c-brand);
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: grayscale(0.3);
  transition: filter 0.3s ease;
}

.category-card:hover .card-icon {
  filter: grayscale(0);
}

.category-card h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.5rem;
  font-weight: 600;
}

.category-card p {
  color: var(--vp-c-text-2);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-footer {
  border-top: 1px solid var(--vp-c-divider-light);
  padding-top: 1rem;
}

.post-count {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .category-card {
    padding: 1.5rem 1rem;
  }
}
</style>
