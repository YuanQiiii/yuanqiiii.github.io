import { defineConfig } from 'vitepress'
import { resolve } from 'path'
import articlesData from './articlesData.js'

// Function to build sidebar for /note/ path
function getNoteSidebar() {
    const allPosts = articlesData || [];
    const notePosts = allPosts.filter(post => post.path.startsWith('/note/'));
    const groups = {}; // Example: { '想法': [], '笔记': [] }
    const directItems = [];

    for (const post of notePosts) {
        // post.path is like '/note/想法/filename' or '/note/filename'
        const pathParts = post.path.split('/').filter(p => p); // e.g., ['note', '想法', 'filename'] or ['note', 'filename']

        if (pathParts.length === 3 && pathParts[0] === 'note') { // Indicates a post in a sub-category like /note/想法/file
            const category = pathParts[1];
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push({
                text: post.title || post.path.split('/').pop(),
                link: post.path
            });
        } else if (pathParts.length === 2 && pathParts[0] === 'note') { // Indicates a direct post under /note, e.g., /note/file
            directItems.push({
                text: post.title || post.path.split('/').pop(),
                link: post.path
            });
        }
    }

    const sidebarGroupItems = [];
    for (const categoryName in groups) {
        sidebarGroupItems.push({
            text: categoryName,
            collapsed: false,
            items: groups[categoryName] // These items are already sorted by date from posts.data.js
        });
    }

    // Sort category groups by name for consistent order
    sidebarGroupItems.sort((a, b) => a.text.localeCompare(b.text));

    // Combine direct items (sorted by title) with grouped items
    // Direct items will appear first, then sorted category groups.
    directItems.sort((a, b) => a.text.localeCompare(b.text));

    return [...directItems, ...sidebarGroupItems];
}

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
    vite: {
        assetsInclude: ['**/*.jpg', '**/*.JPG', '**/*.jpeg', '**/*.JPEG', '**/*.gif', '**/*.GIF', '**/*.png', '**/*.PNG', '**/*.webp', '**/*.WEBP'],
        resolve: {
            alias: {
                '@': resolve(process.cwd(), 'core'),
                '@data': resolve(process.cwd(), 'core/.vitepress')
            }
        },
        optimizeDeps: {
            include: ['vue']
        },
        ssr: {
            noExternal: ['vue', '@vue/server-renderer']
        },
        // 构建优化
        build: {
            chunkSizeWarningLimit: 1000
        }
    },
    // Markdown 配置
    markdown: {
        lineNumbers: true,
        math: true,
        image: {
            lazyLoading: true
        },
        // 代码组功能
        codeTransformers: [
            // 使用内置的代码复制功能
        ]
    },

    // SEO 和 Meta 配置
    head: [
        // 基本 Meta
        ['meta', { charset: 'utf-8' }],
        ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
        ['meta', { name: 'author', content: 'YuanQiiii' }],
        ['meta', { name: 'keywords', content: '博客,技术,编程,前端,Vue,JavaScript' }],

        // PWA 配置
        ['meta', { name: 'theme-color', content: '#646cff' }],
        ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
        ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
        ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],

        // Open Graph
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'zh_CN' }],
        ['meta', { property: 'og:site_name', content: 'YuanQiiii 的博客' }],
        ['meta', { property: 'og:title', content: 'YuanQiiii 的博客' }],
        ['meta', { property: 'og:description', content: 'a place to place my soul' }],
        ['meta', { property: 'og:image', content: 'https://yuanqiiii.github.io/og-image.jpg' }],
        ['meta', { property: 'og:url', content: 'https://yuanqiiii.github.io' }],

        // Twitter Card
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: 'YuanQiiii 的博客' }],
        ['meta', { name: 'twitter:description', content: 'a place to place my soul' }],
        ['meta', { name: 'twitter:image', content: 'https://yuanqiiii.github.io/og-image.jpg' }],

        // 性能优化
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['link', { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' }]
    ],
    // 主题配置
    themeConfig: {
        // 站点标题和 logo
        logo: '/logo.png',
        siteTitle: 'YuanQiiii',

        // 本地搜索配置
        search: {
            provider: 'local',
            options: {
                locales: {
                    root: {
                        translations: {
                            button: {
                                buttonText: '搜索文档',
                                buttonAriaLabel: '搜索文档'
                            },
                            modal: {
                                noResultsText: '无法找到相关结果',
                                resetButtonTitle: '清除查询条件',
                                footer: {
                                    selectText: '选择',
                                    navigateText: '切换',
                                    closeText: '关闭'
                                }
                            }
                        }
                    }
                }
            }
        },

        // 导航配置
        nav: [
            { text: '首页', link: '/' },
            { text: '文章列表', link: '/note/list' },
            { text: '关于我', link: '/note/about' },
            { text: '友情链接', link: '/note/friend' }
        ],

        // 侧边栏配置
        sidebar: {
            '/note/': getNoteSidebar(),
            // 可以在这里为特定路径配置不同的侧边栏，或者禁用它
            // 例如，为友链页面禁用侧边栏:
            '/note/friend': false
        },

        // 社交链接
        socialLinks: [
            { icon: 'github', link: 'https://github.com/YuanQiiii' }
        ],

        // 页面配置
        outline: {
            level: [2, 3],
            label: '页面导航'
        },

        // 编辑链接
        editLink: {
            pattern: 'https://github.com/YuanQiiii/yuanqiiii.github.io/edit/main/core/:path',
            text: '在 GitHub 上编辑此页面'
        },

        // 页脚导航
        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        // 本地化文本
        lastUpdatedText: '最后更新于',
        returnToTopLabel: '返回顶部',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',

        // 页脚
        footer: {
            message: '基于 VitePress 构建',
            copyright: `Copyright © 2023-${new Date().getFullYear()} YuanQiiii`
        }
    },

    // 站点地图配置
    sitemap: {
        hostname: 'https://yuanqiiii.github.io'
    }
})
