import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const PROJECT_ROOT = path.dirname(__dirname);

// 文章目录
const NOTES_DIR = path.join(PROJECT_ROOT, 'core', 'note');
// 输出文件
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'core', '.vitepress', 'articlesData.js');

// 计算阅读时间（每分钟300个中文字或200个英文单词）
function estimateReadingTime(content) {
    const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (content.match(/\b[a-zA-Z]+\b/g) || []).length;
    const readingTime = (chineseChars / 300) + (englishWords / 200);
    return Math.max(1, Math.round(readingTime));
}

// 生成摘要
function generateExcerpt(content, maxLength = 150) {
    // 移除 frontmatter
    content = content.replace(/^---\n.*?\n---\n/s, '');
    // 移除 Markdown 标记
    content = content.replace(/[#*`_\[\]()]/g, '');
    // 移除图片链接
    content = content.replace(/!\[.*?\]\(.*?\)/g, '');
    // 合并空白字符
    content = content.replace(/\s+/g, ' ').trim();

    if (content.length <= maxLength) {
        return content;
    }

    // 尝试在句子结束处截断
    const truncated = content.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
        truncated.lastIndexOf('。'),
        truncated.lastIndexOf('！'),
        truncated.lastIndexOf('？'),
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?')
    );

    if (lastSentenceEnd > maxLength * 0.7) {
        return truncated.substring(0, lastSentenceEnd + 1);
    }

    return truncated + '...';
}

// 从文件路径确定分类
function getCategoryFromPath(filePath) {
    const relativePath = path.relative(NOTES_DIR, filePath);
    const parts = relativePath.split(path.sep);

    // 如果在子目录中，直接使用子目录名作为分类
    if (parts.length > 1) {
        return parts[0]; // 使用顶级目录名作为分类
    }

    // 如果在根目录，使用"杂项"作为分类
    return '杂项';
}

// 递归遍历目录获取 Markdown 文件
function getMdFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // 忽略以 . 开头的目录和 assets 目录
            if (!file.startsWith('.') && !file.endsWith('.assets')) {
                getMdFiles(filePath, fileList);
            }
        } else if (file.endsWith('.md') && !file.startsWith('about') && !file.startsWith('friend') && !file.startsWith('list')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// 主函数
async function generateArticlesData() {
    try {
        // 获取所有 Markdown 文件
        const mdFiles = getMdFiles(NOTES_DIR);

        // 处理每个文件
        const articlesData = mdFiles.map(filePath => {
            // 读取文件内容
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // 解析 frontmatter
            const { data: frontmatter, content } = matter(fileContent);

            // 获取文件状态
            const stats = fs.statSync(filePath);

            // 计算文章路径（相对于 NOTES_DIR，没有 .md 扩展名）
            const relativePath = path.relative(NOTES_DIR, filePath);
            const articlePath = '/note/' + relativePath.replace(/\.md$/, '').replace(/\\/g, '/');

            // 确定分类
            const category = frontmatter.category || getCategoryFromPath(filePath);

            // 生成摘要
            const excerpt = fileContent.startsWith('::: v-pre')
                ? fileContent.substring(0, 300)
                : '::: v-pre ' + generateExcerpt(content, 300);

            // 计算阅读时间和字数
            const readingTime = estimateReadingTime(content);
            const wordCount = (content.match(/[\u4e00-\u9fff]|\b[a-zA-Z]+\b/g) || []).length;

            // 构建文章数据
            return {
                title: frontmatter.title || path.basename(filePath, '.md'),
                path: articlePath,
                category: category,
                author: frontmatter.author || 'YuanQiiii',
                excerpt: excerpt,
                tags: frontmatter.tags || [],
                created: stats.birthtime.toISOString(),
                modified: stats.mtime.toISOString(),
                reading_time: readingTime,
                word_count: wordCount
            };
        });

        // 按修改时间排序（最新的在前面）
        articlesData.sort((a, b) => new Date(b.modified) - new Date(a.modified));

        // 生成输出内容
        const outputContent = `// 此文件由 preprocess 自动生成，请勿手动修改
export default ${JSON.stringify(articlesData, null, 2)};
`;

        // 写入文件
        fs.writeFileSync(OUTPUT_FILE, outputContent);
        console.log(`成功生成文章数据，共 ${articlesData.length} 篇文章`);

    } catch (error) {
        console.error('生成文章数据时出错:', error);
    }
}

// 执行主函数
generateArticlesData();
