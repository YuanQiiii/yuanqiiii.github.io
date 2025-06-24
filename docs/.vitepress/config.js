import { defineConfig } from 'vitepress'

export default defineConfig({
    // 基本配置
    title: "YuanQiiii's Blog",
    description: "愿美好的事情即将发生",
    lang: 'zh-CN',

    // 构建配置
    lastUpdated: true,
    cleanUrls: true,
    ignoreDeadLinks: true,

    // 主题外观配置 - 强制深色模式
    appearance: 'force-dark',

    // Markdown 配置
    markdown: {
        lineNumbers: true,
        math: true,
        image: {
            lazyLoading: true
        }
    },

    // SEO 和 Meta 配置
    head: [
        ['meta', { name: 'author', content: 'YuanQiiii' }],
        ['meta', { name: 'keywords', content: '博客,技术,编程,学习,分享,思考' }],
        ['meta', { name: 'theme-color', content: '#646cff' }],
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'zh_CN' }],
        ['meta', { property: 'og:site_name', content: 'YuanQiiii 的博客' }],
        ['meta', { property: 'og:title', content: 'YuanQiiii 的博客' }],
        ['meta', { property: 'og:description', content: '记录学习，分享思考，记载生活' }],
        ['meta', { property: 'og:url', content: 'https://yuanqiiii.github.io' }]
    ],

    // 主题配置
    themeConfig: {
        // 站点标题
        siteTitle: 'YuanQiiii',

        // 导航配置
        nav: [
            { text: 'Home', link: '/' },
            { text: 'List', link: '/content/list' },
            { text: 'About', link: '/content/about' },
            { text: 'Friend', link: '/content/friend' }
        ],

        // 社交链接
        socialLinks: [
            { icon: 'github', link: 'https://github.com/YuanQiiii' }
        ],

        // 搜索配置
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

        // 页面导航
        outline: {
            level: [2, 3],
            label: '页面导航'
        },

        // 编辑链接
        editLink: {
            pattern: 'https://github.com/YuanQiiii/yuanqiiii.github.io/edit/main/docs/:path',
            text: '在 GitHub 上编辑此页面'
        },

        // 页脚导航
        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        // 本地化文本
        lastUpdatedText: '最后更新于',
        returnToTopLabel: '返回顶部'
    },

    // 站点地图配置
    sitemap: {
        hostname: 'https://yuanqiiii.github.io'
    }
})
