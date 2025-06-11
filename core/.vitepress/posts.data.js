import { createContentLoader } from 'vitepress'

// Skip pages by base filename (without extension)
const skipBaseNames = ['list', 'about', 'friend'];

export default createContentLoader('note/**/*.md', {
    // The glob pattern is relative to the VitePress source directory (srcDir),
    // which is 'core' in this project setup.
    transform(rawData) {
        return rawData
            .map((page) => {
                // Extract base filename (without extension) and skip certain files
                const segments = page.url.split('/').filter(Boolean);
                const last = segments[segments.length - 1];
                const baseName = last.replace(/\.(?:md|html)$/, '');
                if (skipBaseNames.includes(baseName)) {
                    return null; // Mark for removal
                }

                const date = page.frontmatter.date ? new Date(page.frontmatter.date) : new Date(0);

                // Determine category from the parent directory
                // page.url is like '/note/想法/随想01.html' or '/笔记/普通心理学.html'
                // We want to extract '想法' or '笔记'
                const pathParts = page.url.split('/').filter(part => part !== '');
                let category = 'General'; // Default category
                if (pathParts.length > 1) {
                    // Check if the second to last part is a category folder like '想法' or '笔记'
                    // This assumes structure like /category/filename.md or /note/category/filename.md
                    // Adjust logic if structure is different, e.g. if all posts are under 'note'
                    // For urls like '/note/想法/file.html', pathParts would be ['note', '想法', 'file.html']
                    // For urls like '/笔记/file.html', pathParts would be ['笔记', 'file.html']
                    // The category is the segment before the filename if it's not 'note' itself.
                    if (pathParts.length > 1 && pathParts[pathParts.length - 2] !== 'note') {
                        category = pathParts[pathParts.length - 2];
                    } else if (pathParts.length > 2 && pathParts[pathParts.length - 2] === 'note') {
                        category = pathParts[pathParts.length - 3]; // e.g. /note/category/file -> category
                    } else if (pathParts.length === 2 && pathParts[0] !== 'note') {
                        category = pathParts[0]; // e.g. /笔记/file -> 笔记
                    }
                }

                return {
                    ...page,
                    frontmatter: {
                        ...page.frontmatter,
                        date: date,
                        category: page.frontmatter.category || category // Prioritize frontmatter category
                    },
                    // Remove .md extension and ensure leading slash for URL
                    url: page.url.replace(/\\.md$/, '')
                };
            })
            .filter(page => page !== null) // Remove marked pages
            .sort((a, b) => {
                return b.frontmatter.date.getTime() - a.frontmatter.date.getTime();
            });
    }
})
