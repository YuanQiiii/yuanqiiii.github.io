import { createContentLoader } from 'vitepress'

// Files to exclude from the sidebar/post list, relative to the 'core' directory
const skipFiles = ['list.md', 'index.md', 'about.md', 'game.md', 'friend.md'];

export default createContentLoader('note/**/*.md', {
    transform(rawData) {
        return rawData
            .map((page) => {
                const fileName = page.url.substring(page.url.lastIndexOf('/') + 1);
                if (skipFiles.includes(fileName)) {
                    return null;
                }
                const date = page.frontmatter.date ? new Date(page.frontmatter.date) : new Date(0);
                const pathParts = page.url.split('/').filter(Boolean);
                let category = 'General';
                if (pathParts.length > 1) {
                    if (pathParts.length > 1 && pathParts[pathParts.length - 2] !== 'note') {
                        category = pathParts[pathParts.length - 2];
                    } else if (pathParts.length > 2 && pathParts[pathParts.length - 2] === 'note') {
                        category = pathParts[pathParts.length - 3];
                    } else if (pathParts.length === 2 && pathParts[0] !== 'note') {
                        category = pathParts[0];
                    }
                }
                return {
                    ...page,
                    frontmatter: {
                        ...page.frontmatter,
                        date,
                        category: page.frontmatter.category || category
                    },
                    url: page.url.replace(/\.md$/, '')
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime());
    }
})
