# YuanQiiii 静态网站技术报告

## 1. 项目概述
YuanQiiii 静态网站基于 VitePress 构建，集成了一系列现代化功能与优化：本地全文搜索、响应式设计、暗黑模式、阅读进度指示、图片灯箱、RSS 订阅、PWA 支持预配置等，旨在打造高性能、易维护的个人博客平台。

## 2. 已完成的核心功能

### 2.1 搜索功能优化
- **本地全文搜索**：替换外部引擎，完全基于 VitePress 本地搜索。
- **中文检索增强**：细化中文分词、提示文本本地化。
- **搜索结果高亮预览**：关键词高亮、上下文预览。

### 2.2 用户体验
- **响应式设计**：全站组件适配各类移动设备。
- **暗黑/亮色主题**：`ThemeToggle.vue` 支持系统偏好与手动切换，通过 CSS 变量动态切换。
- **阅读进度指示**：`ReadingProgress.vue` 显示当前阅读位置。
- **图片灯箱**：`ImageLightbox.vue` 支持放大查看和键盘导航。

### 2.3 内容展示与互动
- **文章信息卡片**：`ArticleInfo.vue` 显示作者、发布时间、阅读时长等。
- **智能标签系统**：`ArticleTags.vue` 支持分类与标签过滤。
- **相关文章推荐**：基于标签和分类的智能算法。
- **代码块增强**：`CodeBlock.vue` 提供一键复制功能。
- **图片画廊**：`ImageGallery.vue` 支持批量展示与缩略图预览。

### 2.4 技术架构与性能
- **预处理脚本**：`preprocess_new.py` 实现前端文档元数据提取、摘要与阅读时长估算、图片自动压缩（Pillow 支持）。
- **SEO 优化**：自动生成 `sitemap.xml`、Open Graph 标签、语义化 HTML。
- **性能**：组件与图片懒加载、代码分割、Webpack/Vite 优化配置。
- **PWA**：Service Worker 基础配置已就绪。

## 3. 项目目录结构
```
/ (根目录)
├─ README.md               # 综合技术报告（当前文档）
├─ package.json
├─ build.sh                # 自动化构建脚本
├─ preprocess_new.py       # 文档预处理脚本
├─ core/
│  ├─ index.md             # 首页内容
│  ├─ .vitepress/          # VitePress 配置与主题
│  └─ components/          # 全局组件库
└─ public/
   ├─ sitemap.xml
   └─ rss.xml
```

## 4. 使用指南
### 本地开发
```bash
npm install
python3 preprocess_new.py    # 可选：预处理文档
npm run docs:dev
```

### 生产构建
```bash
./build.sh
# 或手动
npm run build
```

## 5. 性能与体验优化
- **加载速度**：图片懒加载、分片加载减少首屏体积。
- **用户体验**：流畅动画、键盘导航、无障碍支持。
- **SEO & 分享**：完善的 meta 标签与结构化数据。

## 6. 后续优化建议
1. **PWA 完善**：添加离线缓存策略与资源预缓存。
2. **评论系统**：集成 Giscus 或 Utterances。
3. **多语言支持**：国际化框架引入与语言包管理。
4. **内容管理**：后台 CMS 或批量导入工具。
5. **分析与监控**：接入 Google Analytics 等统计工具。