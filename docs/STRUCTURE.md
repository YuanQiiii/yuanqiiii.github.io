# 项目结构说明

本文档详细说明了 YuanQiiii's Blog 项目的目录结构和文件组织方式。

## 当前项目结构

```text
yuanqiiii.github.io/
├── .git/                          # Git 版本控制
├── .github/                       # GitHub 配置
│   └── workflows/                 # GitHub Actions 工作流
├── .gitignore                     # Git 忽略文件配置
├── README.md                      # 项目主要说明文档
├── DEPLOYMENT.md                  # 部署指南
├── CHANGELOG.md                   # 变更日志
├── CHANGELOG_NEW.md               # 新变更日志
├── COMPLETION_REPORT.md           # 完成报告
├── package.json                   # Node.js 项目配置
├── package-lock.json              # 依赖锁定文件
├── node_modules/                  # Node.js 依赖包（自动生成）
└── docs/                          # 📁 VitePress 文档目录
    ├── .vitepress/                # VitePress 配置目录
    │   ├── config.js              # VitePress 主配置文件
    │   ├── cache/                 # VitePress 缓存（自动生成）
    │   ├── dist/                  # 构建输出目录（自动生成）
    │   └── theme/                 # 自定义主题目录（可选）
    ├── index.md                   # 网站首页
    ├── public/                    # 📁 静态资源目录
    │   ├── sitemap.xml            # 站点地图
    │   └── favicon.ico            # 网站图标（如有）
    ├── note/                      # 📁 文章内容目录
    │   ├── about.md               # 关于页面
    │   ├── friend.md              # 友情链接页面
    │   ├── list.md                # 文章列表页面
    │   ├── idea/                  # 📁 思考感悟类文章
    │   │   ├── love.md            # 爱情思考
    │   │   ├── nvidia.md          # NVIDIA 思考
    │   │   ├── prompt.md          # 提示词工程
    │   │   ├── server.md          # 服务器思考
    │   │   ├── 基于邮件通信的AI伙伴.md
    │   │   ├── 年终总结.md
    │   │   ├── 知识库.md
    │   │   ├── 网站设计思路.md
    │   │   ├── 谈谈对于git设计的理解.md
    │   │   ├── 随想01.md
    │   │   ├── 随想02.md
    │   │   ├── 韭菜模拟器.md
    │   │   └── 年终总结.assets/    # 年终总结文章的图片资源
    │   └── note/                  # 📁 学习笔记类文章
    │       ├── day0.md            # 开始笔记
    │       ├── questions.md       # 问题记录
    │       ├── 普通心理学.md      # 心理学笔记
    │       ├── 模板.md            # 模板文件
    │       └── 普通心理学.assets/ # 心理学笔记的图片资源
    └── 📁 项目文档目录
        ├── README.md              # 文档目录说明
        ├── STRUCTURE.md           # 项目结构说明（本文件）
        ├── DEVELOPMENT.md         # 开发指南
        └── DEPLOYMENT.md          # 部署指南
```

## 目录说明

### 根目录文件

| 文件/目录 | 说明 |
|----------|------|
| `README.md` | 项目主要说明文档，包含快速开始和基本信息 |
| `DEPLOYMENT.md` | 详细的部署指南和配置说明 |
| `package.json` | Node.js 项目配置，包含依赖和脚本 |
| `package-lock.json` | 锁定依赖版本，确保安装一致性 |
| `.gitignore` | 指定 Git 忽略的文件和目录 |
| `.github/` | GitHub 相关配置，如 Actions 工作流 |

### VitePress 目录 (`docs/`)

#### 配置目录 (`.vitepress/`)

| 文件/目录 | 说明 |
|----------|------|
| `config.js` | VitePress 主配置文件，控制站点行为 |
| `cache/` | VitePress 缓存目录，提高构建速度 |
| `dist/` | 构建输出目录，包含静态网站文件 |
| `theme/` | 自定义主题目录（可选） |

#### 内容目录

| 目录 | 说明 |
|------|------|
| `index.md` | 网站首页内容 |
| `public/` | 静态资源，如图片、图标等 |
| `note/` | 所有文章内容的根目录 |
| `note/idea/` | 思考感悟类文章 |
| `note/note/` | 学习笔记类文章 |

### 文章组织规则

#### 文章分类

1. **思考感悟** (`note/idea/`)
   - 个人思考和感悟
   - 技术观点和见解
   - 创意想法记录

2. **学习笔记** (`note/note/`)
   - 课程学习笔记
   - 技术文档整理
   - 知识点总结

#### 资源文件管理

- 每篇文章的图片资源放在同名的 `.assets/` 目录中
- 例如：`普通心理学.md` 的图片放在 `普通心理学.assets/`
- 这样可以保持文章和资源的对应关系清晰

#### 文件命名规范

- 使用有意义的文件名
- 中文文件名可以使用，但建议英文文件名用于技术类文章
- 避免使用特殊字符和空格

## 配置文件详解

### VitePress 配置 (`docs/.vitepress/config.js`)

这是 VitePress 的核心配置文件，控制：

- 站点基本信息（标题、描述等）
- 导航栏和侧边栏配置
- 主题和样式设置
- 插件和功能配置
- SEO 和 Meta 信息

### 项目配置 (`package.json`)

包含：

- 项目依赖列表
- 构建和开发脚本
- 项目元信息
- npm 配置

## 构建流程

1. **开发阶段**：修改 `docs/` 目录下的 Markdown 文件
2. **预览阶段**：使用 `npm run docs:dev` 本地预览
3. **构建阶段**：使用 `npm run docs:build` 生成静态文件
4. **部署阶段**：将 `docs/.vitepress/dist/` 目录部署到服务器

## 维护建议

### 1. 定期清理

- 清理 `docs/.vitepress/cache/` 缓存目录
- 检查并删除无用的图片资源
- 整理重复或过时的文章

### 2. 备份重要文件

- 定期备份 `docs/` 目录
- 保存配置文件的副本
- 使用 Git 进行版本控制

### 3. 性能优化

- 压缩图片资源
- 使用适当的图片格式
- 定期检查构建产物大小

---

💡 **提示**: 本文档会随着项目结构的变化而更新，建议定期查看以了解最新的结构信息。

- `ImageLightbox.vue`: 图片点击放大查看
- `CodeBlock.vue`: 代码块语法高亮和复制功能

### 内容文件

- `core/note/`: 所有 Markdown 文章内容
- `core/public/`: 静态资源文件（图片、sitemap等）

这样的结构更加清晰、易于维护，符合现代前端项目的最佳实践。
