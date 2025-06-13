import { createContentLoader } from 'vitepress'
import articlesData from './articlesData'

// Skip pages by base filename (without extension)
const skipBaseNames = ['list', 'about', 'friend'];

export default createContentLoader('note/**/*.md', {
    // The glob pattern is relative to the VitePress source directory (srcDir),
    // which is 'core' in this project setup.
    transform(rawData) {
        // 将 articlesData 中的信息合并到 rawData 中
        const articlesMap = new Map();

        // 创建文章路径到文章数据的映射
        articlesData.forEach(article => {
            articlesMap.set(article.path, article);
        });

        return rawData
            .map((page) => {
                // Extract base filename (without extension) and skip certain files
                const segments = page.url.split('/').filter(Boolean);
                const last = segments[segments.length - 1];
                const baseName = last.replace(/\.(?:md|html)$/, '');
                if (skipBaseNames.includes(baseName)) {
                    return null; // Mark for removal
                }

                const date = page.frontmatter.date ? new Date(page.frontmatter.date) : new Date();

                // 查找对应的文章数据
                const articlePath = page.url.replace(/\.html$/, '');
                const articleData = articlesMap.get(articlePath);

                // 如果找到对应的文章数据，合并到 frontmatter 中
                let frontmatterWithArticleData = { ...page.frontmatter };
                if (articleData) {
                    frontmatterWithArticleData = {
                        ...frontmatterWithArticleData,
                        title: articleData.title || frontmatterWithArticleData.title,
                        category: articleData.category || frontmatterWithArticleData.category,
                        author: articleData.author || frontmatterWithArticleData.author,
                        excerpt: articleData.excerpt || frontmatterWithArticleData.excerpt,
                        tags: articleData.tags || frontmatterWithArticleData.tags || [],
                        reading_time: articleData.reading_time,
                        word_count: articleData.word_count,
                        date: new Date(articleData.modified) // 使用修改日期作为文章日期
                    };
                }

                // Determine category from the parent directory
                if (!frontmatterWithArticleData.category) {
                    const relativePath = page.url.replace(/^\/note\//, '');
                    const parts = relativePath.split('/');

                    if (parts.length > 1) {
                        // 直接使用文件夹名作为分类名
                        frontmatterWithArticleData.category = parts[0];
                    } else {
                        frontmatterWithArticleData.category = '杂项';
                    }
                }

                return {
                    ...page,
                    frontmatter: frontmatterWithArticleData,
                    // Remove .md extension and ensure leading slash for URL
                    url: page.url.replace(/\.md$/, '')
                };
            })
            .filter(page => page !== null) // Remove marked pages
            .sort((a, b) => {
                const dateA = a.frontmatter.date instanceof Date ? a.frontmatter.date : new Date(a.frontmatter.date);
                const dateB = b.frontmatter.date instanceof Date ? b.frontmatter.date : new Date(b.frontmatter.date);
                return dateB.getTime() - dateA.getTime();
            });
    }
})
