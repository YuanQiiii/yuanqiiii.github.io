# YuanQiiii's Blog

基于 VitePress 构建的个人博客，记录学习，分享思考，记载生活。

🌐 **在线访问**: [https://yuanqiiii.github.io](https://yuanqiiii.github.io)

## 快速开始

### 环境要求

- Node.js 16+
- npm 8+

### 本地开发

```bash
# 克隆项目
git clone https://github.com/YuanQiiii/yuanqiiii.github.io.git
cd yuanqiiii.github.io

# 安装依赖
npm install

# 启动开发服务器
npm run docs:dev

# 本地访问 http://localhost:5173
```

### 构建部署

```bash
# 构建生产版本
npm run docs:build

# 预览构建结果
npm run docs:preview
```

## 项目结构

```text
yuanqiiii.github.io/
├── docs/                    # VitePress 文档源码
│   ├── .vitepress/         # VitePress 配置
│   │   ├── config.js       # 主配置文件
│   │   └── theme/          # 自定义主题（如有）
│   ├── index.md            # 网站首页
│   ├── note/               # 文章内容
│   │   ├── about.md        # 关于页面
│   │   ├── friend.md       # 友情链接
│   │   ├── list.md         # 文章列表
│   │   ├── idea/           # 思考感悟类文章
│   │   └── note/           # 学习笔记类文章
│   └── public/             # 静态资源文件
├── README.md               # 项目说明（本文件）
├── DEPLOYMENT.md           # 部署指南
├── package.json            # 项目配置与依赖
└── .github/                # GitHub Actions 配置
```

## 网站特性

- 📝 **Markdown 写作**: 支持丰富的 Markdown 语法
- 🎨 **响应式设计**: 适配各种设备屏幕
- 🔍 **全文搜索**: 本地搜索功能
- 🌙 **深色模式**: 支持明暗主题切换
- 📱 **移动优化**: 移动端友好体验
- ⚡ **快速加载**: 静态站点快速访问
- 🔗 **SEO 优化**: 搜索引擎友好
- 📈 **自动部署**: GitHub Actions 自动化部署

## 内容分类

### 💭 思考感悟 (`/note/idea/`)

- 生活思考与人生感悟
- 技术思辨与前沿观点
- 创意想法与构思记录

### 📚 学习笔记 (`/note/note/`)

- 技术学习笔记
- 课程总结整理
- 知识点梳理

## 文档说明

- 📖 **开发指南**: 详见 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- 🚀 **部署说明**: 详见 [DEPLOYMENT.md](DEPLOYMENT.md)
- 🏗️ **项目结构**: 详见 [docs/STRUCTURE.md](docs/STRUCTURE.md)

## 部署方式

项目使用 GitHub Pages 进行自动部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建
3. 部署到 `gh-pages` 分支
4. 网站自动更新

详细部署说明请参考 [DEPLOYMENT.md](DEPLOYMENT.md)

## 技术栈

- **框架**: VitePress
- **语言**: JavaScript, Markdown
- **部署**: GitHub Pages
- **CI/CD**: GitHub Actions

## 开源协议

MIT License

---

💡 **提示**: 如果你也想搭建类似的博客，可以 fork 本项目并根据需要进行定制。
