// 主题配置
export const themeConfig = {
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
}
