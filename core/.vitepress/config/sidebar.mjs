import articlesData from '../articlesData.js'

/**
 * 构建侧边栏配置
 * @param {string} basePath - 基础路径
 * @returns {Array} 侧边栏配置数组
 */
export function buildSidebar(basePath = '/note/') {
    const allPosts = articlesData || []
    const posts = allPosts.filter(post => post.path.startsWith(basePath))
    const groups = {}
    const directItems = []

    for (const post of posts) {
        const pathParts = post.path.split('/').filter(p => p)
        
        // 处理子分类：/note/想法/filename
        if (pathParts.length === 3 && pathParts[0] === 'note') {
            const category = pathParts[1]
            if (!groups[category]) {
                groups[category] = []
            }
            groups[category].push({
                text: post.title || post.path.split('/').pop().replace('.md', ''),
                link: post.path
            })
        } 
        // 处理直接文章：/note/filename  
        else if (pathParts.length === 2 && pathParts[0] === 'note') {
            directItems.push({
                text: post.title || post.path.split('/').pop().replace('.md', ''),
                link: post.path
            })
        }
    }

    // 构建侧边栏组
    const sidebarGroups = Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([categoryName, items]) => ({
            text: getCategoryDisplayName(categoryName),
            collapsed: false,
            items: items.sort((a, b) => a.text.localeCompare(b.text))
        }))

    // 排序直接项目
    directItems.sort((a, b) => a.text.localeCompare(b.text))

    return [...directItems, ...sidebarGroups]
}

/**
 * 获取分类显示名称
 * @param {string} categoryName - 分类名称
 * @returns {string} 显示名称
 */
function getCategoryDisplayName(categoryName) {
    return categoryName
}

/**
 * 生成侧边栏配置
 * @returns {Object} 完整的侧边栏配置
 */
export function getSidebarConfig() {
    return {
        '/note/': buildSidebar('/note/'),
        // 特定页面禁用侧边栏
        '/note/friend': false,
        '/note/about': false
    }
}
