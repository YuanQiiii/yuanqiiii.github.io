// 基于文章数据生成侧边栏
import articlesData from './articlesData'

// 按分类整理文章
const getArticlesByCat = () => {
    const categories = {}

    // 遍历所有文章，按分类组织
    articlesData.forEach(article => {
        const category = article.category
        if (!categories[category]) {
            categories[category] = []
        }
        categories[category].push({
            text: article.title,
            link: article.path,
            // 添加更多信息到侧边栏
            items: article.tags && article.tags.length > 0 ? [{
                text: `阅读时间: ${article.reading_time}分钟`,
                link: article.path
            }] : undefined
        })
    })

    // 转换为侧边栏数组格式
    return Object.keys(categories).sort().map(category => {
        return {
            text: category,
            collapsed: false,
            items: categories[category].sort((a, b) => a.text.localeCompare(b.text, 'zh-CN'))
        }
    })
}

export default getArticlesByCat()
