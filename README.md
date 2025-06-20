# YuanQiiii 个人博客

## 1. 项目概述

这是一个基于 VitePress 构建的个人静态博客网站，集成了多种现代化功能与优化，包括本地全文搜索、响应式设计、暗黑模式、阅读进度指示、图片灯箱等，旨在打造高性能、易维护的个人博客平台。

## 2. 核心功能

### 2.1 搜索与导航
- **本地全文搜索**：完全基于 VitePress 实现的本地搜索功能
- **中文检索增强**：优化的中文分词和检索体验
- **智能侧边栏**：自动根据文章分类构建侧边栏导航（配置于 `config.mjs`）

### 2.2 用户体验
- **响应式设计**：全站组件适配各类移动设备
- **暗黑/亮色主题**：支持系统偏好与手动切换
- **阅读进度指示**：`ReadingProgress.vue` 组件显示当前阅读位置
- **图片灯箱**：`ImageLightbox.vue` 支持图片放大查看和键盘导航

### 2.3 内容展示与互动
- **文章信息卡片**：`ArticleInfo.vue` 显示作者、发布时间、阅读时长等
- **文章标签系统**：`ArticleTags.vue` 支持文章分类与标签过滤
- **文章列表**：`ArticleList.vue` 提供格式化的文章列表展示
- **代码块增强**：`CodeBlock.vue` 提供语法高亮和复制功能
- **图片画廊**：`ImageGallery.vue` 支持多图展示

### 2.4 技术架构与性能
- **预处理脚本**：`preprocess.py` 实现文档元数据提取、摘要生成、阅读时长估算、图片压缩等
- **SEO 优化**：自动生成 `sitemap.xml`、规范化 HTML 结构
- **性能优化**：图片懒加载、代码分割、Vite 优化配置

## 3. 项目目录结构

```
yuanqiiii.github.io/
├── README.md                      # 项目主要说明文档
├── package.json                   # Node.js 项目配置
├── docs/                          # 📁 项目文档目录
│   ├── STRUCTURE.md              # 详细项目结构说明
│   ├── DEVELOPMENT.md            # 开发指南
│   └── DEPLOYMENT.md             # 部署指南
├── scripts/                       # 📁 构建和工具脚本目录
│   ├── build.sh                  # 自动化构建脚本
│   ├── preprocess.py             # 文档预处理脚本
│   ├── generateArticlesData.js   # 文章数据生成脚本
│   └── skip_list.txt             # 预处理忽略文件列表
├── core/                          # 📁 VitePress 核心目录
│   ├── index.md                  # 网站首页
│   ├── .vitepress/               # VitePress 配置目录
│   │   ├── config.mjs            # VitePress 主配置文件
│   │   ├── theme/                # 自定义主题目录
│   │   │   ├── index.js          # 主题入口文件
│   │   │   ├── custom.css        # 自定义样式
│   │   │   └── components/       # Vue 组件目录
│   │   │       ├── ArticleInfo.vue      # 文章信息组件
│   │   │       ├── ArticleList.vue      # 文章列表组件
│   │   │       ├── ArticleTags.vue      # 文章标签组件
│   │   │       ├── CodeBlock.vue        # 代码块组件
│   │   │       ├── Effect.vue           # 特效组件
│   │   │       ├── ImageGallery.vue     # 图片画廊组件
│   │   │       ├── ImageLightbox.vue    # 图片灯箱组件
│   │   │       └── ReadingProgress.vue  # 阅读进度组件
│   ├── note/                     # 📁 文章内容目录
│   │   ├── about.md              # 关于页面
│   │   ├── friend.md             # 友情链接
│   │   ├── list.md               # 文章列表
│   │   ├── 想法/                 # 思考类文章
│   │   └── 笔记/                 # 学习笔记
│   └── public/                   # 📁 静态资源目录
│       └── sitemap.xml           # 站点地图
└── node_modules/                  # Node.js 依赖包目录
```

> 📖 **详细结构说明**: 查看 [`docs/STRUCTURE.md`](docs/STRUCTURE.md) 了解完整的项目结构和文件用途。

## 4. 使用指南

### 环境要求
- Node.js 16+
- Python 3.6+ (用于预处理脚本)
- 可选：Pillow 库 (用于图片压缩)

### 安装依赖
```bash
# 安装 Node.js 依赖
npm install

# 可选：安装 Python 依赖（如果需要运行预处理脚本）
pip install pillow
```

### 本地开发
```bash
# 运行预处理脚本（可选）
npm run preprocess

# 启动开发服务器
npm run docs:dev
```

### 生产构建
```bash
# 使用自动化构建脚本（推荐）
./scripts/build.sh

# 或手动构建
npm run build
```

## 5. 性能与体验优化

- **图片优化**：自动压缩大尺寸图片，减少页面加载时间
- **代码分割**：通过 Vite 的构建优化实现代码分割
- **懒加载**：图片和组件的懒加载减少首屏加载时间
- **用户体验**：平滑过渡动画、键盘导航支持
- **SEO 优化**：自动生成站点地图，优化元数据
