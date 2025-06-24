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

        // 按日期排序
        return articles.sort((a, b) => {
            const dateA = new Date(a.frontmatter.date || '1970-01-01')
            const dateB = new Date(b.frontmatter.date || '1970-01-01')
            return dateB - dateA
        }).map(article => ({
            url: article.url,
            title: article.frontmatter.title || article.url.split('/').pop(),
            date: article.frontmatter.date || '1970-01-01',
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
