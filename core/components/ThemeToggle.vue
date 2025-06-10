<template>
  <button 
    class="theme-toggle"
    @click="toggleTheme"
    :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
  >
    <transition name="theme-icon" mode="out-in">
      <svg 
        v-if="isDark" 
        key="sun"
        class="theme-icon sun-icon" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
      </svg>
      <svg 
        v-else 
        key="moon"
        class="theme-icon moon-icon" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
      </svg>
    </transition>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  const html = document.documentElement
  const newTheme = isDark.value ? 'light' : 'dark'
  
  html.classList.remove('light', 'dark')
  html.classList.add(newTheme)
  
  isDark.value = !isDark.value
  
  // 保存用户偏好
  localStorage.setItem('vitepress-theme-appearance', newTheme)
  
  // 触发VitePress主题变更事件
  window.dispatchEvent(new CustomEvent('vitepress:theme-change', { 
    detail: { theme: newTheme } 
  }))
}

const initTheme = () => {
  // 从localStorage读取用户偏好
  const savedTheme = localStorage.getItem('vitepress-theme-appearance')
  
  // 如果没有保存的偏好，使用系统偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = savedTheme || (prefersDark ? 'dark' : 'light')
  
  isDark.value = theme === 'dark'
  
  const html = document.documentElement
  html.classList.remove('light', 'dark')
  html.classList.add(theme)
}

onMounted(() => {
  initTheme()
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e) => {
    if (!localStorage.getItem('vitepress-theme-appearance')) {
      isDark.value = e.matches
      const html = document.documentElement
      html.classList.remove('light', 'dark')
      html.classList.add(e.matches ? 'dark' : 'light')
    }
  }
  
  mediaQuery.addEventListener('change', handleChange)
  
  // 清理监听器
  return () => {
    mediaQuery.removeEventListener('change', handleChange)
  }
})
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.theme-toggle:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand);
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  transition: all 0.3s ease;
}

.sun-icon {
  color: #f59e0b;
}

.moon-icon {
  color: #6366f1;
}

/* 过渡动画 */
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.3s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-toggle {
    bottom: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .theme-icon {
    width: 18px;
    height: 18px;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .theme-toggle {
    background: var(--vp-c-bg-alt);
    border-color: var(--vp-c-divider-light);
  }
}

/* 确保在VitePress主题切换时保持正确的样式 */
:global(.dark) .theme-toggle {
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-divider-light);
}

:global(.light) .theme-toggle {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
</style>
