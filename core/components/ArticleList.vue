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
        <p v-if="post.frontmatter.category" class="article-meta">
          分类: {{ post.frontmatter.category }}
        </p>
        <p v-if="post.frontmatter.excerpt || post.excerpt" class="article-excerpt">
          {{ post.frontmatter.excerpt || summarize(post.excerpt) }}
        </p>
        <div v-if="post.frontmatter.tags && post.frontmatter.tags.length" class="article-tags">
          <span v-for="tag in post.frontmatter.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { data as posts } from '../.vitepress/posts.data.js';

const summarize = (htmlContent, maxLength = 100) => {
  if (!htmlContent) return '';
  const textContent = htmlContent.replace(/<[^>]+>/g, '');
  return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
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
  margin-bottom: 0.5em;
}

.article-excerpt {
  font-size: 1em;
  color: #333;
  line-height: 1.6;
  margin-bottom: 0.75em;
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
