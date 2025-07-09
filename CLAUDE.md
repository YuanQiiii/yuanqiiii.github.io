# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is YuanQiiii's personal blog built with **Zola** (a Rust-based static site generator). The site is hosted on GitHub Pages at https://yuanqiiii.github.io and is used for recording learning experiences, sharing thoughts, and documenting life.

**Note**: The original VitePress-based site has been archived in the `archive/` directory.

## Common Development Commands

```bash
# Run development server
cd zola-site
../zola serve

# Build for production
cd zola-site
../zola build

# Run API server (optional, for dynamic features)
cd api
cargo run

# Clean build output
rm -rf zola-site/public
```

## Architecture Overview

### Project Structure

```
.
├── zola-site/        # Main static site generator
│   ├── content/      # Markdown articles
│   ├── templates/    # HTML templates
│   ├── static/       # Static assets
│   └── config.toml   # Zola configuration
├── api/              # Rust API server (Axum)
├── frontend/         # React components (planned)
├── archive/          # Legacy VitePress site
└── zola              # Zola binary

```

### Content Organization

Articles are stored in `zola-site/content/`:

```
content/
├── _index.md     # Homepage content
├── about.md      # About page
├── guide/        # Technical guides
├── idea/         # Personal thoughts
├── note/         # Study notes
└── project/      # Project showcases
```

### Key Features

- **Static Generation**: Zola builds the entire site as static HTML
- **Markdown Support**: All content is written in Markdown with TOML frontmatter
- **Dark Theme**: Forced dark mode for better reading experience
- **Fast Builds**: Site builds in <100ms
- **GitHub Pages**: Automatic deployment via GitHub Actions

### Deployment

The site is automatically deployed via GitHub Actions:
- Push to `main` branch triggers the workflow
- Zola builds the site
- Static files are deployed to GitHub Pages

## Development Guidelines

When adding new content:
1. Create markdown files in appropriate subdirectory under `zola-site/content/`
2. Use TOML frontmatter (between `+++` markers)
3. Images should go in adjacent `.assets` folders
4. Run `../zola serve` from zola-site directory to preview

When modifying the site:
1. Templates are in `zola-site/templates/`
2. Configuration is in `zola-site/config.toml`
3. Styles are embedded in `templates/base.html`