<template>
  <div class="article-list-container">
    <div v-if="!posts || !posts.length" class="no-articles">暂无文章</div>
    <div v-else>
      <div v-for="post in posts" :key="post.url" class="article-item">
        <a :href="post.url" class="article-link">
          <h2 class="article-title">
            {{ post.frontmatter.title || decodeURIComponent(post.url.split('/').pop()) }}
          </h2>
        </a>
        <div class="article-meta-container">
          <p v-if="post.frontmatter.category" class="article-meta">
            <span class="meta-label">分类:</span> {{ post.frontmatter.category }}
          </p>
          <p v-if="post.frontmatter.author" class="article-meta">
            <span class="meta-label">作者:</span> {{ post.frontmatter.author }}
          </p>
          <p v-if="post.frontmatter.date" class="article-meta">
            <span class="meta-label">发布于:</span> {{ formatDate(post.frontmatter.date) }}
          </p>
          <p v-if="post.frontmatter.reading_time" class="article-meta">
            <span class="meta-label">阅读时间:</span> {{ post.frontmatter.reading_time }} 分钟
          </p>
          <p v-if="post.frontmatter.word_count" class="article-meta">
            <span class="meta-label">字数:</span> {{ post.frontmatter.word_count }}
          </p>
        </div>
        <div v-if="post.frontmatter.tags && post.frontmatter.tags.length" class="article-tags">
          <span v-for="tag in post.frontmatter.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { data as posts } from '../.vitepress/posts.data.js';

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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.article-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.article-title {
  font-size: 1.5em;
  margin-top: 0;
  margin-bottom: 0.5em;
}

.article-link {
  text-decoration: none;
  color: var(--vp-c-brand-1);
}

.article-link:hover .article-title {
  text-decoration: underline;
}

.article-meta {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 0.25em;
  margin-right: 1em;
  display: inline-block;
}

.meta-label {
  font-weight: 500;
  color: #444;
}

.article-meta-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.75em;
  gap: 0.5em;
}

.article-tags .tag {
  display: inline-block;
  background-color: #f0f0f0;
  color: #555;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  margin-right: 5px;
  margin-bottom: 5px;
}

.loading, .error, .no-articles {
  text-align: center;
  font-size: 1.2em;
  padding: 20px;
  color: #555;
}
</style>
