
<template>
    <div class="search-container">
        <div class="search-box">
            <div class="engine-indicator">
                <div class="engine-status">
                    <span class="status-dot" :class="{ active: engineStatus.google }"></span>
                    <span class="status-dot" :class="{ active: engineStatus.bing }"></span>
                </div>
            </div>

            <input type="text"
                   v-model="searchQuery"
                   @keyup.enter="handleSearch(searchQuery)"
                   :placeholder="placeholder"
                   class="search-input" />

            <button @click="handleSearch(searchQuery)"
                    class="search-button">
                <svg class="search-icon" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 
                             16 11.11 16 9.5 16 5.91 13.09 3 9.5 
                             3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 
                             0 3.09-.59 4.23-1.57l.27.28v.79l5 
                             4.99L20.49 19l-4.99-5zm-6 0C7.01 
                             14 5 11.99 5 9.5S7.01 5 9.5 5 14 
                             7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const searchQuery = ref('')
const placeholder = ref('搜索...')

const SEARCH_URLS = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q='
}

const engineStatus = ref({
    google: false,
    bing: true,
    currentEngine: 'bing'
})

// 检测搜索引擎可用性
const checkSearchEngine = async (engine) => {
    const url = `https://${engine}.com/favicon.ico`
    try {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 2000)
        )

        await Promise.race([
            fetch(url, {
                mode: 'no-cors',
                cache: 'no-cache'
            }),
            timeout
        ])
        return true
    } catch (error) {
        console.warn(`${engine} is not accessible:`, error)
        return false
    }
}

// 执行搜索
const handleSearch = (query) => {
    if (!query.trim()) return
    const engine = engineStatus.value.currentEngine
    const searchUrl = SEARCH_URLS[engine] + encodeURIComponent(query)
    window.open(searchUrl, '_blank')
}

// 更新引擎状态并选择可用引擎
const updateEngineStatus = async () => {
    const googleStatus = await checkSearchEngine('google')
    engineStatus.value.google = googleStatus
    engineStatus.value.currentEngine = googleStatus ? 'google' : 'bing'
}

onMounted(() => {
    updateEngineStatus()
})
</script>

<style scoped>
:root {
    --search-bg-light: rgba(255, 255, 255, 0.6);
    --search-bg-dark: rgba(29, 29, 29, 0.6);
    --search-border-light: rgba(255, 255, 255, 0.3);
    --search-border-dark: rgba(255, 255, 255, 0.1);
    --search-shadow: rgba(0, 0, 0, 0.15);
    --search-shadow-hover: rgba(0, 0, 0, 0.25);
    --status-active: #10b981;
    --status-inactive: #ef4444;
}

.search-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
    transition: all 0.3s ease;
}

.search-box {
    display: flex;
    align-items: center;
    background: var(--search-bg-light);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid var(--search-border-light);
    border-radius: 16px;
    padding: 0.75rem;
    box-shadow: 0 8px 32px var(--search-shadow);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 48px var(--search-shadow-hover);
    border-color: rgba(255, 255, 255, 0.4);
}

.search-input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    color: var(--vp-c-text-1);
    outline: none;
}

.search-button {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s ease;
}

.search-button:hover {
    opacity: 1;
    transform: scale(1.1);
}

.search-icon {
    width: 20px;
    height: 20px;
    fill: var(--vp-c-text-2);
}

.engine-indicator {
    display: flex;
    align-items: center;
    padding: 0.4rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    margin-right: 0.75rem;
}

.engine-status {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--status-inactive);
    transition: background-color 0.3s ease;
}

.status-dot.active {
    background-color: var(--status-active);
}

@media (prefers-color-scheme: dark) {
    .search-box {
        background: var(--search-bg-dark);
        border-color: var(--search-border-dark);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    }
    
    .search-box:hover {
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.45);
    }
    
    .search-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }
    
    .engine-indicator {
        background: rgba(255, 255, 255, 0.05);
    }
    
    .status-dot {
        opacity: 0.8;
    }
}

@media (max-width: 768px) {
    .search-container {
        padding: 0.5rem;
    }
    
    .search-box {
        padding: 0.5rem;
    }
    
    .search-input {
        font-size: 0.9rem;
        padding: 0.4rem 0.75rem;
    }
    
    .engine-indicator {
        padding: 0.25rem 0.6rem;
    }
}

@media (max-width: 480px) {
    .search-input {
        font-size: 0.875rem;
    }
    
    .engine-indicator {
        padding: 0.2rem 0.5rem;
    }
}
</style>