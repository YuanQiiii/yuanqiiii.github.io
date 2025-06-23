// SEO 和 Meta 配置
export const headConfig = [
    // 基本 Meta
    ['meta', { charset: 'utf-8' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    ['meta', { name: 'author', content: 'YuanQiiii' }],
    ['meta', { name: 'keywords', content: '博客,技术,编程,前端,Vue,JavaScript' }],

    // PWA 配置
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],

    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: 'YuanQiiii 的博客' }],
    ['meta', { property: 'og:title', content: 'YuanQiiii 的博客' }],
    ['meta', { property: 'og:description', content: 'a place to place my soul' }],
    ['meta', { property: 'og:url', content: 'https://yuanqiiii.github.io' }]
]
