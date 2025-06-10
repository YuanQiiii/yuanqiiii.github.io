<template>
  <div class="code-block-wrapper">
    <div class="code-header">
      <span class="language-label">{{ language }}</span>
      <button 
        class="copy-button" 
        @click="copyCode"
        :class="{ 'copied': copied }"
        :title="copied ? '已复制!' : '复制代码'"
      >
        <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        <span class="copy-text">{{ copied ? '已复制' : '复制' }}</span>
      </button>
    </div>
    <div class="code-content" ref="codeElement">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'text'
  },
  code: {
    type: String,
    default: ''
  }
})

const copied = ref(false)
const codeElement = ref(null)

const copyCode = async () => {
  try {
    let textToCopy = props.code
    
    // 如果没有传入code prop，从DOM元素中获取文本
    if (!textToCopy && codeElement.value) {
      const preElement = codeElement.value.querySelector('pre')
      if (preElement) {
        textToCopy = preElement.textContent || preElement.innerText
      }
    }
    
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy)
      copied.value = true
      
      // 2秒后重置状态
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案：创建临时文本域
    const textArea = document.createElement('textarea')
    textArea.value = textToCopy
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

onMounted(() => {
  nextTick(() => {
    // 自动检测代码块
    if (codeElement.value) {
      const preElement = codeElement.value.querySelector('pre')
      if (preElement) {
        preElement.style.margin = '0'
        preElement.style.borderRadius = '0 0 8px 8px'
      }
    }
  })
})
</script>

<style scoped>
.code-block-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-code-block-bg);
  border: 1px solid var(--vp-c-divider);
  margin: 1rem 0;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
}

.language-label {
  color: var(--vp-c-text-2);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.copy-button:hover {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand);
}

.copy-button.copied {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.copy-text {
  font-weight: 500;
}

.code-content {
  position: relative;
}

.code-content :deep(pre) {
  margin: 0 !important;
  border-radius: 0 !important;
  border: none !important;
}

.code-content :deep(.line-numbers) {
  padding-left: 3rem;
}

.code-content :deep(.line-numbers::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2.5rem;
  background: var(--vp-c-bg-soft);
  border-right: 1px solid var(--vp-c-divider);
}

@media (max-width: 640px) {
  .copy-text {
    display: none;
  }
  
  .copy-button {
    padding: 0.25rem;
    min-width: 2rem;
    justify-content: center;
  }
}
</style>
