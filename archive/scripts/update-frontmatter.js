import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

async function updateFrontmatter() {
  const projectRoot = process.cwd();
  const globPath = path.join(projectRoot, 'docs/content/**/*.md');
  const files = await glob(globPath, { absolute: true });

  const author = 'shihuaidexianyu';

  for (const file of files) {
    try {
      const fileContent = await fs.readFile(file, 'utf-8');
      const { data: frontmatter, content: body, language, delimiters } = matter(fileContent);

      const originalFrontmatter = JSON.stringify(frontmatter);

      // Add author
      frontmatter.author = author;

      // Add date if it doesn't exist
      if (!frontmatter.date) {
        const stats = await fs.stat(file);
        frontmatter.date = stats.mtime.toISOString().split('T')[0];
      }

      const updatedFrontmatter = JSON.stringify(frontmatter);

      // Only write file if frontmatter has changed
      if (originalFrontmatter !== updatedFrontmatter) {
          const newContent = matter.stringify(body, frontmatter, {
              delimiters: delimiters || '---'
          });
          await fs.writeFile(file, newContent, 'utf-8');
          console.log(`Updated: ${file}`);
      }

    } catch (error) {
        console.error(`Error processing ${file}:`, error);
    }
  }
}

updateFrontmatter()
  .then(() => console.log('All files processed.'))
  .catch(console.error);
