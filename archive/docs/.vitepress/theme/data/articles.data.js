import { createContentLoader } from 'vitepress'

export default createContentLoader('content/**/*.md', {
    includeSrc: false,
    render: false,
    excerpt: true,
    transform(rawData) {
        // 过滤掉一些不需要的页面
        const articles = rawData.filter(page => {
            const filename = page.url.split('/').pop()
            return !['index', 'list', 'about', 'friend'].includes(filename)
        })

        // 按URL排序，保持一致性
        return articles.sort((a, b) => {
            return a.url.localeCompare(b.url)
        }).map(article => ({
            url: article.url,
            title: article.frontmatter.title || article.url.split('/').pop(),
            category: article.frontmatter.category || getCategoryFromUrl(article.url),
            author: article.frontmatter.author || 'YuanQiiii',
            tags: article.frontmatter.tags || [],
            excerpt: article.excerpt || '',
            frontmatter: article.frontmatter
        }))
    }
})

function getCategoryFromUrl(url) {
    const parts = url.split('/')
    if (parts.length >= 3 && parts[1] === 'content') {
        return parts[2]
    }
    return '页面'
}
