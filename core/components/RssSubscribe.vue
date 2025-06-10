<template>
  <div class="rss-feed">
    <div class="rss-header">
      <h2>📡 订阅更新</h2>
      <p>通过RSS订阅获取最新文章推送</p>
    </div>
    
    <div class="rss-options">
      <a 
        :href="rssUrl" 
        class="rss-link"
        target="_blank"
        rel="noopener noreferrer"
        title="RSS订阅"
      >
        <svg class="rss-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248S0 22.546 0 20.752s1.456-3.248 3.252-3.248 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/>
        </svg>
        <span>RSS订阅</span>
      </a>
      
      <button 
        @click="copyRssUrl"
        class="copy-rss-btn"
        :class="{ 'copied': copied }"
        :title="copied ? 'RSS链接已复制' : '复制RSS链接'"
      >
        <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        <span>{{ copied ? '已复制' : '复制链接' }}</span>
      </button>
    </div>
    
    <div class="rss-instructions">
      <h3>如何使用RSS订阅？</h3>
      <ul>
        <li>📱 <strong>移动端</strong>：推荐使用 Feedly、Inoreader 等RSS阅读器</li>
        <li>💻 <strong>桌面端</strong>：推荐使用 Thunderbird、QuiteRSS 等客户端</li>
        <li>🌐 <strong>在线版</strong>：可以使用 Feedly、Inoreader 的网页版</li>
        <li>🔧 <strong>浏览器扩展</strong>：Chrome/Firefox 的RSS扩展插件</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const copied = ref(false)
const baseUrl = 'https://yuanqiiii.github.io'
const rssUrl = computed(() => `${baseUrl}/rss.xml`)

const copyRssUrl = async () => {
  try {
    await navigator.clipboard.writeText(rssUrl.value)
    copied.value = true
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = rssUrl.value
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (fallbackErr) {
      console.error('降级复制也失败:', fallbackErr)
    }
    
    document.body.removeChild(textArea)
  }
}
</script>

<style scoped>
.rss-feed {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
}

.rss-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.rss-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.5rem;
}

.rss-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}

.rss-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.rss-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.rss-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.4);
}

.rss-icon {
  flex-shrink: 0;
}

.copy-rss-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.copy-rss-btn:hover {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-text-1);
  transform: translateY(-2px);
}

.copy-rss-btn.copied {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.rss-instructions {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 1.5rem;
}

.rss-instructions h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
}

.rss-instructions ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.rss-instructions li {
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.rss-instructions li:last-child {
  margin-bottom: 0;
}

.rss-instructions strong {
  color: var(--vp-c-text-1);
}

@media (max-width: 640px) {
  .rss-options {
    flex-direction: column;
    align-items: center;
  }
  
  .rss-link,
  .copy-rss-btn {
    width: 100%;
    justify-content: center;
    max-width: 280px;
  }
  
  .rss-feed {
    padding: 1rem;
  }
}
</style>
