<template>
  <div class="rotate-container">
    <div class="rotating-wrapper">
      <svg 
        class="breathing-circle" 
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          class="circle" 
          cx="50" 
          cy="50" 
          r="40"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="10, 5"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
// 无需额外逻辑
</script>

<style scoped>
.rotate-container {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.rotating-wrapper {
  width: 100%;
  height: 100%;
  animation: rotate 10s linear infinite;
}

.breathing-circle {
  width: 100%;
  height: 100%;
  animation: breathe 8s ease-in-out infinite;
}

.circle {
  color: var(--vp-c-text-1);
  opacity: 0.6;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes breathe {
  0%, 100% { transform: scale(0.8); }
  50% { transform: scale(1.2); }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .circle {
    opacity: 0.4;
  }
}
</style>