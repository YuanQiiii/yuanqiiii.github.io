import { defineConfig } from 'vitepress'
import { headConfig } from './config/head.mjs'
import { themeConfig } from './config/theme.mjs'
import { viteConfig } from './config/vite.mjs'
import { getSidebarConfig } from './config/sidebar.mjs'

export default defineConfig({
    // 基本配置
    title: "YuanQiiii's Blog",
    description: "a place to place my soul",
    lang: 'zh-CN',

    // 构建配置
    lastUpdated: true,
    cleanUrls: true,
    ignoreDeadLinks: true,

    // 缓存配置
    cacheDir: './.vitepress/cache',

    // Vite 配置
    vite: viteConfig,

    // Markdown 配置
    markdown: {
        lineNumbers: true,
        math: true,
        image: {
            lazyLoading: true
        }
    },

    // SEO 和 Meta 配置
    head: headConfig,

    // 主题配置
    themeConfig: {
        ...themeConfig,
        // 侧边栏配置
        sidebar: getSidebarConfig(),
    },

    // 站点地图配置
    sitemap: {
        hostname: 'https://yuanqiiii.github.io'
    }
})
