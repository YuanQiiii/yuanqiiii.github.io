import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid({
    // 基本配置
    title: "YuanQiiii's Blog",
    description: "愿美好的事情即将发生",
    lang: 'zh-CN',

    // 构建配置
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
        },
        // 自定义容器标签
        container: {
            tipLabel: '💡 提示',
            warningLabel: '⚠️ 警告',
            dangerLabel: '🚨 危险',
            infoLabel: 'ℹ️ 信息',
            detailsLabel: '详细信息'
        },
        // 目录配置
        toc: {
            level: [1, 2, 3],
            includeLevel: [2, 3]
        },
        // 代码高亮主题
        theme: {
            light: 'github-light',
            dark: 'github-dark'
        },
        // 代码块配置
        config: (md) => {
            // 可以在这里添加更多 markdown-it 插件
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
        siteTitle: 'shihuaidexianyu',

        // 导航配置
        nav: [
            { text: 'Home', link: '/' },
            {
                text: '文章',
                items: [
                    { text: '文章列表', link: '/content/list' },
                    { text: '时间线', link: '/content/timeline' },
                    { text: '标签云', link: '/content/tags' }
                ]
            },
            {
                text: '分类',
                items: [
                    { text: '📝 技术笔记', link: '/note/' },
                    { text: '💡 随想思考', link: '/idea/' },
                    { text: '🚀 项目实践', link: '/project/' },
                    { text: '📖 学习指南', link: '/guide/' }
                ]
            },
            { text: 'About', link: '/content/about' },
            { text: 'Friend', link: '/content/friend' }
        ],

        // 社交链接
        socialLinks: [
            { icon: 'github', link: 'https://github.com/YuanQiiii' },
            {
                icon: {
                    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Email</title><path d="M24 5.457v13.086c0 .974-.791 1.764-1.765 1.764H1.765C.791 20.307 0 19.517 0 18.543V5.457c0-.974.791-1.764 1.765-1.764h20.47C23.209 3.693 24 4.483 24 5.457zM2.118 6.271L12 13.118l9.882-6.847H2.118zM1.412 18.543c0 .194.158.353.353.353h20.47c.194 0 .353-.158.353-.353V7.059L12 14.941 1.412 7.059v11.484z"/></svg>'
                },
                link: 'mailto:shihuaidexianyu@gmail.com',
                ariaLabel: '发送邮件'
            }
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
                },
                miniSearch: {
                    searchOptions: {
                        fuzzy: 0.2,
                        prefix: true,
                        boost: { title: 4, text: 2, titles: 1 }
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
            prev: false,
            next: false
        },

        // 页脚信息
        footer: {
            message: 'Released under the <a href="https://github.com/YuanQiiii/yuanqiiii.github.io/blob/main/LICENSE">MIT License</a>.',
            copyright: 'Copyright © 2024-present YuanQiiii'
        },

        // 本地化文本
        returnToTopLabel: '返回顶部'
    },

    // 站点地图配置
    sitemap: {
        hostname: 'https://yuanqiiii.github.io'
    }
})
