<template>
  <div class="article-tags" v-if="tags && tags.length > 0">
    <span class="tags-label">标签：</span>
    <div class="tags-list">
      <span 
        v-for="tag in tags" 
        :key="tag"
        class="tag"
        :class="getTagClass(tag)"
        @click="onTagClick(tag)"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tag-click'])

const cleanTags = computed(() => {
  return props.tags.filter(tag => tag && tag.trim())
})

const getTagClass = (tag) => {
  // 根据标签内容返回不同的样式类
  const tagColors = {
    '学习': 'tag-study',
    '笔记': 'tag-note',
    '随想': 'tag-thought',
    '技术': 'tag-tech',
    '生活': 'tag-life',
    '心理学': 'tag-psychology',
    '总结': 'tag-summary'
  }
  
  for (const [keyword, className] of Object.entries(tagColors)) {
    if (tag.includes(keyword)) {
      return className
    }
  }
  
  return 'tag-default'
}

const onTagClick = (tag) => {
  if (props.clickable) {
    emit('tag-click', tag)
  }
}
</script>

<style scoped>
.article-tags {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.tags-label {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
  flex-shrink: 0;
}

.tags-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: default;
}

.tag.clickable {
  cursor: pointer;
}

.tag.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 不同类型标签的颜色 */
.tag-study {
  background: #e3f2fd;
  color: #1976d2;
  border-color: #bbdefb;
}

.tag-note {
  background: #f3e5f5;
  color: #7b1fa2;
  border-color: #ce93d8;
}

.tag-thought {
  background: #fff3e0;
  color: #f57c00;
  border-color: #ffcc02;
}

.tag-tech {
  background: #e8f5e8;
  color: #2e7d32;
  border-color: #a5d6a7;
}

.tag-life {
  background: #fce4ec;
  color: #c2185b;
  border-color: #f8bbd9;
}

.tag-psychology {
  background: #e1f5fe;
  color: #0277bd;
  border-color: #81d4fa;
}

.tag-summary {
  background: #f1f8e9;
  color: #558b2f;
  border-color: #aed581;
}

.tag-default {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-color: var(--vp-c-divider);
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .tag-study {
    background: #1e3a8a;
    color: #93c5fd;
    border-color: #3b82f6;
  }

  .tag-note {
    background: #581c87;
    color: #d8b4fe;
    border-color: #a855f7;
  }

  .tag-thought {
    background: #92400e;
    color: #fed7aa;
    border-color: #f59e0b;
  }

  .tag-tech {
    background: #14532d;
    color: #bbf7d0;
    border-color: #22c55e;
  }

  .tag-life {
    background: #881337;
    color: #fda4af;
    border-color: #f43f5e;
  }

  .tag-psychology {
    background: #0c4a6e;
    color: #7dd3fc;
    border-color: #0ea5e9;
  }

  .tag-summary {
    background: #365314;
    color: #bef264;
    border-color: #84cc16;
  }
}

@media (max-width: 640px) {
  .article-tags {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tags-label {
    margin-bottom: 0.25rem;
  }
}
</style>
