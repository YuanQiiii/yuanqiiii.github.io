#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOCS_DIR = path.join(process.cwd(), 'docs')
const CONTENT_DIRS = ['content'] // 扫描整个 content 目录
const OUTPUT_FILE = path.join(DOCS_DIR, '.vitepress/theme/data/articles.json')

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
 * 获取文件的修改时间
 * @param {string} filePath - 文件路径
 * @returns {string} - ISO格式的日期字符串
 */
function getFileModifiedDate(filePath) {
    try {
        const stats = fs.statSync(filePath)
        return stats.mtime.toISOString().split('T')[0]
    } catch (error) {
        return new Date().toISOString().split('T')[0]
    }
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
        if (['README', 'index', 'list'].includes(fileName)) {
            return null
        }

        // 生成 URL（移除 .md 扩展名）
        const url = '/' + relativePath.replace(/\.md$/, '')

        // 计算阅读时间和字数
        const readingTime = calculateReadingTime(articleContent)
        const wordCount = calculateWordCount(articleContent)

        // 从内容中提取摘要（前150个字符）
        const excerpt = articleContent
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]*`/g, '')
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/#{1,6}\s+/g, '')
            .trim()
            .substring(0, 150) + (articleContent.length > 150 ? '...' : '')

        return {
            url,
            title: frontmatter.title || fileName,
            date: frontmatter.date || getFileModifiedDate(filePath),
            lastModified: getFileModifiedDate(filePath),
            category: frontmatter.category || getCategoryFromPath(relativePath),
            tags: frontmatter.tags || [],
            author: frontmatter.author || 'YuanQiiii',
            description: frontmatter.description || excerpt,
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
 * 生成文章列表
 */
function generateArticleList() {
    console.log('🚀 开始生成文章列表...')

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

    // 按日期降序排序
    articles.sort((a, b) => new Date(b.date) - new Date(a.date))

    // 确保输出目录存在
    const outputDir = path.dirname(OUTPUT_FILE)
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    // 写入文件
    const output = {
        generated: new Date().toISOString(),
        total: articles.length,
        articles
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8')

    console.log(`🎉 生成完成！共处理 ${articles.length} 篇文章`)
    console.log(`📄 输出文件: ${path.relative(process.cwd(), OUTPUT_FILE)}`)

    // 输出统计信息
    const categories = {}
    articles.forEach(article => {
        categories[article.category] = (categories[article.category] || 0) + 1
    })

    console.log('\n📊 分类统计:')
    Object.entries(categories).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} 篇`)
    })
}

// 运行生成器
if (import.meta.url === `file://${process.argv[1]}`) {
    generateArticleList()
}

export { generateArticleList }
