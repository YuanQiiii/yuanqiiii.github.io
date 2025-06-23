#!/usr/bin/env node

import chokidar from 'chokidar'
import { generateArticleList } from './generate-article-list.js'
import path from 'path'

const WATCH_PATHS = [
    'docs/content/**/*.md',
    '!docs/content/**/README.md',
    '!docs/content/**/index.md'
]

console.log('🔍 启动文章列表监听器...')
console.log('📁 监听路径:', WATCH_PATHS)

// 初始生成
generateArticleList()

// 创建文件监听器
const watcher = chokidar.watch(WATCH_PATHS, {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true
})

// 防抖函数
let timeout
function debounceGenerate() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        console.log('\n🔄 检测到文件变化，重新生成文章列表...')
        generateArticleList()
    }, 1000)
}

// 监听文件变化
watcher
    .on('add', path => {
        console.log(`✅ 新增文件: ${path}`)
        debounceGenerate()
    })
    .on('change', path => {
        console.log(`📝 修改文件: ${path}`)
        debounceGenerate()
    })
    .on('unlink', path => {
        console.log(`🗑️  删除文件: ${path}`)
        debounceGenerate()
    })

console.log('\n✨ 监听器已启动！修改 markdown 文件将自动更新文章列表。')
console.log('💡 按 Ctrl+C 停止监听')

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n👋 停止监听器...')
    watcher.close()
    process.exit(0)
})
