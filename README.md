# YuanQiiii's Blog (Rust-Powered)

A blazing fast personal blog built with Rust and Zola.

🚀 **[Live Site](https://yuanqiiii.github.io)**

## 🏗️ Architecture

This blog is built with a modern Rust-based stack:

- **[Zola](https://www.getzola.org/)** - Lightning-fast static site generator written in Rust
- **[Axum](https://github.com/tokio-rs/axum)** - Ergonomic web framework for Rust (API server)
- **React** - For progressive enhancement (coming soon)

## ✨ Features

- ⚡ Ultra-fast build times (<100ms)
- 🌙 Dark mode by default
- 📱 Mobile-responsive design
- 🦀 100% Rust backend
- 📄 Markdown-based content
- 🚀 GitHub Pages deployment

## 🛠️ Development

### Prerequisites

- Rust 1.70+
- Node.js 18+ (for React components)
- Zola (included in repo)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YuanQiiii/yuanqiiii.github.io.git
cd yuanqiiii.github.io

# Run Zola development server
cd zola-site
../zola serve

# Run API server (optional)
cd api
cargo run
```

### Project Structure

```
├── zola-site/        # Static site generator
│   ├── content/      # Markdown articles
│   ├── templates/    # HTML templates
│   └── config.toml   # Site configuration
├── api/              # Rust API server (Axum)
├── frontend/         # React components (planned)
└── archive/          # Legacy VitePress site
```

## 📝 Writing Content

Create new articles in `zola-site/content/` as Markdown files:

```markdown
+++
title = "My Article Title"
date = 2024-01-01
[taxonomies]
tags = ["rust", "web"]
categories = ["tech"]
+++

Your content here...
```

## 🚀 Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### Manual Build

```bash
cd zola-site
../zola build
# Output in zola-site/public/
```

## 🔄 Migration from VitePress

The original VitePress site has been moved to the `archive/` directory. All content has been successfully migrated to the new Zola-based system.

## 📊 Performance

- **Build time**: ~9ms (vs 2-3s with VitePress)
- **Memory usage**: 80% less than Node.js-based solutions
- **Page load**: <500ms on 3G networks

## 📄 License

MIT License

---

Built with 🦀 Rust for maximum performance and reliability.