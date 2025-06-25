#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOCS_DIR = path.join(process.cwd(), 'docs')
const CONTENT_DIRS = ['content'] // 扫描整个 content 目录
const OUTPUT_FILE = path.join(DOCS_DIR, 'public/articles.json')
const TIMELINE_OUTPUT = path.join(DOCS_DIR, 'public/timeline.json')
const TAGS_OUTPUT = path.join(DOCS_DIR, 'public/tags.json')
const STATS_OUTPUT = path.join(DOCS_DIR, 'public/stats.json')

/**
 * 计算文章阅读时间（基于中文字符数）
 * @param {string} content - 文章内容
 * @returns {number} - 预估阅读时间（分钟）
 */
function calculateReadingTime(content) {
    // 去除 markdown 语法标记
    const plainText = content
        .replace(/```[\s\S]*?```/g, '') // 代码块
        .replace(/`[^`]*`/g, '') // 行内代码
        .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
        .replace(/\[.*?\]\(.*?\)/g, '') // 链接
        .replace(/#{1,6}\s+/g, '') // 标题
        .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // 粗体和斜体
        .replace(/^\s*[-*+]\s+/gm, '') // 列表项
        .replace(/^\s*\d+\.\s+/gm, '') // 有序列表
        .replace(/^\s*>\s+/gm, '') // 引用

    // 统计中文字符数
    const chineseChars = (plainText.match(/[\u4e00-\u9fff]/g) || []).length
    // 统计英文单词数
    const englishWords = (plainText.match(/[a-zA-Z]+/g) || []).length

    // 中文阅读速度：约300字/分钟，英文阅读速度：约200词/分钟
    const readingTime = Math.ceil((chineseChars / 300) + (englishWords / 200))
    return Math.max(1, readingTime) // 至少1分钟
}

/**
 * 计算字数
 * @param {string} content - 文章内容
 * @returns {number} - 字数
 */
function calculateWordCount(content) {
    // 去除 markdown 语法后计算字数
    const plainText = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/#{1,6}\s+/g, '')
        .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/^\s*>\s+/gm, '')

    // 中文字符数 + 英文单词数
    const chineseChars = (plainText.match(/[\u4e00-\u9fff]/g) || []).length
    const englishWords = (plainText.match(/[a-zA-Z]+/g) || []).length

    return chineseChars + englishWords
}

/**
 * 处理单个 markdown 文件
 * @param {string} filePath - 文件路径
 * @param {string} relativePath - 相对路径
 * @returns {Object|null} - 文章信息对象
 */
function processMarkdownFile(filePath, relativePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const { data: frontmatter, content: articleContent } = matter(content)

        // 跳过某些特殊文件
        const fileName = path.basename(filePath, '.md')
        if (['README', 'index', 'list', 'about', 'friend'].includes(fileName)) {
            return null
        }

        // 生成 URL（移除 .md 扩展名）
        const url = '/' + relativePath.replace(/\.md$/, '')

        // 计算阅读时间和字数
        const readingTime = calculateReadingTime(articleContent)
        const wordCount = calculateWordCount(articleContent)

        return {
            url,
            title: frontmatter.title || fileName,
            category: frontmatter.category || getCategoryFromPath(relativePath),
            author: frontmatter.author || 'YuanQiiii',
            date: frontmatter.date || getFileCreationDate(filePath),
            tags: frontmatter.tags || [],
            description: frontmatter.description || extractDescription(articleContent),
            readingTime,
            wordCount,
            frontmatter
        }
    } catch (error) {
        console.warn(`处理文件 ${filePath} 时出错:`, error.message)
        return null
    }
}

/**
 * 从文件路径推断分类
 * @param {string} relativePath - 相对路径
 * @returns {string} - 分类名称
 */
function getCategoryFromPath(relativePath) {
    // 移除 content/ 前缀
    const pathWithoutContent = relativePath.replace(/^content\//, '')

    // 如果文件在 content 根目录下
    if (!pathWithoutContent.includes('/')) {
        return '页面'
    }

    // 提取第一级目录名作为分类
    const firstDir = pathWithoutContent.split('/')[0]
    return firstDir
}

/**
 * 递归扫描目录获取所有 markdown 文件
 * @param {string} dir - 目录路径
 * @param {string} baseDir - 基础目录（用于计算相对路径）
 * @returns {Array} - 文件路径数组
 */
function scanMarkdownFiles(dir, baseDir) {
    const files = []

    try {
        const items = fs.readdirSync(dir)

        for (const item of items) {
            const fullPath = path.join(dir, item)
            const stat = fs.statSync(fullPath)

            if (stat.isDirectory()) {
                // 跳过隐藏目录和 assets 目录
                if (!item.startsWith('.') && !item.endsWith('.assets')) {
                    files.push(...scanMarkdownFiles(fullPath, baseDir))
                }
            } else if (stat.isFile() && item.endsWith('.md')) {
                const relativePath = path.relative(baseDir, fullPath)
                files.push({ fullPath, relativePath })
            }
        }
    } catch (error) {
        console.warn(`扫描目录 ${dir} 时出错:`, error.message)
    }

    return files
}

/**
 * 获取文件创建时间作为默认日期
 * @param {string} filePath - 文件路径
 * @returns {string} - ISO日期字符串
 */
function getFileCreationDate(filePath) {
    try {
        const stat = fs.statSync(filePath)
        return stat.birthtime.toISOString().split('T')[0]
    } catch (error) {
        return new Date().toISOString().split('T')[0]
    }
}

/**
 * 从文章内容中提取描述
 * @param {string} content - 文章内容
 * @returns {string} - 文章描述
 */
function extractDescription(content) {
    // 移除 markdown 语法并提取前150个字符作为描述
    const plainText = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/#{1,6}\s+/g, '')
        .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .replace(/^\s*>\s+/gm, '')
        .replace(/\n+/g, ' ')
        .trim()

    return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '')
}

/**
 * 生成时间线数据
 * @param {Array} articles - 文章数组
 * @returns {Object} - 时间线数据
 */
function generateTimelineData(articles) {
    // 按日期排序（最新在前）
    const sortedArticles = articles
        .filter(article => article.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))

    // 按年份分组
    const timelineByYear = {}
    sortedArticles.forEach(article => {
        const year = new Date(article.date).getFullYear()
        if (!timelineByYear[year]) {
            timelineByYear[year] = []
        }
        timelineByYear[year].push({
            date: article.date,
            title: article.title,
            url: article.url,
            category: article.category,
            description: article.description,
            tags: article.tags
        })
    })

    return {
        generated: new Date().toISOString(),
        totalArticles: sortedArticles.length,
        years: Object.keys(timelineByYear).map(year => ({
            year: parseInt(year),
            articles: timelineByYear[year]
        })).sort((a, b) => b.year - a.year),
        timeline: sortedArticles
    }
}

/**
 * 生成标签数据
 * @param {Array} articles - 文章数组
 * @returns {Object} - 标签数据
 */
function generateTagsData(articles) {
    const tagStats = {}
    const tagArticles = {}

    articles.forEach(article => {
        if (article.tags && Array.isArray(article.tags)) {
            article.tags.forEach(tag => {
                if (!tagStats[tag]) {
                    tagStats[tag] = 0
                    tagArticles[tag] = []
                }
                tagStats[tag]++
                tagArticles[tag].push({
                    title: article.title,
                    url: article.url,
                    date: article.date,
                    category: article.category,
                    description: article.description
                })
            })
        }
    })

    // 按使用频率排序标签
    const sortedTags = Object.entries(tagStats)
        .sort(([, a], [, b]) => b - a)
        .map(([tag, count]) => ({
            name: tag,
            count,
            size: count > 10 ? 'large' : count > 5 ? 'medium' : 'small',
            articles: tagArticles[tag].sort((a, b) => new Date(b.date) - new Date(a.date))
        }))

    return {
        generated: new Date().toISOString(),
        totalTags: sortedTags.length,
        totalTaggedArticles: articles.filter(a => a.tags && a.tags.length > 0).length,
        tags: sortedTags
    }
}

/**
 * 生成统计数据
 * @param {Array} articles - 文章数组
 * @returns {Object} - 统计数据
 */
function generateStatsData(articles) {
    const categories = {}
    const monthlyStats = {}
    let totalWords = 0
    let totalReadingTime = 0

    articles.forEach(article => {
        // 分类统计
        categories[article.category] = (categories[article.category] || 0) + 1

        // 字数和阅读时间统计
        totalWords += article.wordCount || 0
        totalReadingTime += article.readingTime || 0

        // 月度统计
        if (article.date) {
            const dateStr = typeof article.date === 'string' ? article.date : article.date.toString()
            const monthKey = dateStr.substring(0, 7) // YYYY-MM
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { count: 0, words: 0 }
            }
            monthlyStats[monthKey].count++
            monthlyStats[monthKey].words += article.wordCount || 0
        }
    })

    // 最活跃的标签
    const allTags = articles.flatMap(article => article.tags || [])
    const tagFreq = {}
    allTags.forEach(tag => {
        tagFreq[tag] = (tagFreq[tag] || 0) + 1
    })
    const topTags = Object.entries(tagFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }))

    return {
        generated: new Date().toISOString(),
        overview: {
            totalArticles: articles.length,
            totalWords,
            totalReadingTime,
            totalCategories: Object.keys(categories).length,
            totalTags: Object.keys(tagFreq).length,
            averageWordsPerArticle: Math.round(totalWords / articles.length) || 0,
            averageReadingTime: Math.round(totalReadingTime / articles.length) || 0
        },
        categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
        monthlyStats: Object.entries(monthlyStats)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, stats]) => ({ month, ...stats })),
        topTags,
        daysSinceStart: Math.floor((new Date() - new Date('2024-01-01')) / (1000 * 60 * 60 * 24))
    }
}

/**
 * 生成文章列表和相关数据
 */
function generateArticleList() {
    console.log('🚀 开始生成文章数据...')

    const articles = []

    // 扫描所有内容目录
    for (const contentDir of CONTENT_DIRS) {
        const fullContentDir = path.join(DOCS_DIR, contentDir)

        if (!fs.existsSync(fullContentDir)) {
            console.warn(`⚠️  目录不存在: ${fullContentDir}`)
            continue
        }

        console.log(`📁 扫描目录: ${contentDir}`)
        const files = scanMarkdownFiles(fullContentDir, DOCS_DIR)

        for (const { fullPath, relativePath } of files) {
            const article = processMarkdownFile(fullPath, relativePath)
            if (article) {
                articles.push(article)
                console.log(`✅ 处理文件: ${relativePath}`)
            }
        }
    }

    // 按URL排序，保持一致性
    articles.sort((a, b) => {
        return a.url.localeCompare(b.url)
    })

    // 确保输出目录存在
    const outputDir = path.dirname(OUTPUT_FILE)
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    // 生成文章列表
    const articlesOutput = {
        generated: new Date().toISOString(),
        total: articles.length,
        articles
    }

    // 生成时间线数据
    const timelineData = generateTimelineData(articles)

    // 生成标签数据
    const tagsData = generateTagsData(articles)

    // 生成统计数据
    const statsData = generateStatsData(articles)

    // 写入所有文件
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(articlesOutput, null, 2), 'utf-8')
    fs.writeFileSync(TIMELINE_OUTPUT, JSON.stringify(timelineData, null, 2), 'utf-8')
    fs.writeFileSync(TAGS_OUTPUT, JSON.stringify(tagsData, null, 2), 'utf-8')
    fs.writeFileSync(STATS_OUTPUT, JSON.stringify(statsData, null, 2), 'utf-8')

    console.log(`🎉 生成完成！共处理 ${articles.length} 篇文章`)
    console.log(`📄 文章列表: ${path.relative(process.cwd(), OUTPUT_FILE)}`)
    console.log(`📅 时间线数据: ${path.relative(process.cwd(), TIMELINE_OUTPUT)}`)
    console.log(`🏷️  标签数据: ${path.relative(process.cwd(), TAGS_OUTPUT)}`)
    console.log(`📊 统计数据: ${path.relative(process.cwd(), STATS_OUTPUT)}`)

    // 输出统计信息
    console.log('\n📊 内容统计:')
    console.log(`   📝 文章总数: ${articles.length}`)
    console.log(`   📖 总字数: ${statsData.overview.totalWords.toLocaleString()}`)
    console.log(`   ⏱️  总阅读时间: ${statsData.overview.totalReadingTime} 分钟`)
    console.log(`   📂 分类数量: ${statsData.overview.totalCategories}`)
    console.log(`   🏷️  标签数量: ${statsData.overview.totalTags}`)

    console.log('\n📂 分类分布:')
    statsData.categories.forEach(({ name, count }) => {
        console.log(`   ${name}: ${count} 篇`)
    })

    if (statsData.topTags.length > 0) {
        console.log('\n� 热门标签:')
        statsData.topTags.slice(0, 5).forEach(({ tag, count }) => {
            console.log(`   ${tag}: ${count} 次`)
        })
    }
}

// 运行生成器
if (import.meta.url === `file://${process.argv[1]}`) {
    generateArticleList()
}

export { generateArticleList }
