<template>
  <div class="timeline-card">
    <div class="timeline-date">{{ formatDate(date) }}</div>
    <div class="timeline-content">
      <h3 class="timeline-title">
        <a :href="link" v-if="link">{{ title }}</a>
        <span v-else>{{ title }}</span>
      </h3>
      <p class="timeline-description" v-if="description">{{ description }}</p>
      <div class="timeline-tags" v-if="tags && tags.length">
        <span v-for="tag in tags" :key="tag" class="timeline-tag">#{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  date: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  },
  tags: {
    type: Array,
    default: () => []
  }
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.timeline-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--vp-c-border);
  position: relative;
}

.timeline-card::before {
  content: '';
  position: absolute;
  left: 120px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--vp-c-brand);
}

.timeline-card::after {
  content: '';
  position: absolute;
  left: 114px;
  top: 1.8rem;
  width: 14px;
  height: 14px;
  background: var(--vp-c-brand);
  border-radius: 50%;
  border: 3px solid var(--vp-c-bg);
}

.timeline-date {
  flex-shrink: 0;
  width: 100px;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  font-weight: 500;
}

.timeline-content {
  flex: 1;
  margin-left: 2rem;
}

.timeline-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.timeline-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.3s;
}

.timeline-title a:hover {
  color: var(--vp-c-brand);
}

.timeline-description {
  color: var(--vp-c-text-2);
  margin: 0.5rem 0;
  line-height: 1.6;
}

.timeline-tags {
  margin-top: 0.8rem;
}

.timeline-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  margin-right: 0.5rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand);
  border-radius: 12px;
  font-size: 0.8rem;
  border: 1px solid var(--vp-c-brand-light);
}

@media (max-width: 768px) {
  .timeline-card {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .timeline-card::before,
  .timeline-card::after {
    display: none;
  }
  
  .timeline-content {
    margin-left: 0;
  }
  
  .timeline-date {
    width: auto;
    font-size: 0.8rem;
    color: var(--vp-c-brand);
  }
}
</style>
