# 项目结构说明

## 整理后的项目结构

```
yuanqiiii.github.io/
├── README.md                      # 项目主要说明文档
├── package.json                   # Node.js 项目配置
├── package-lock.json              # 依赖锁定文件
├── .gitignore                     # Git 忽略文件配置
├── .github/                       # GitHub Actions 配置
├── docs/                          # 📁 项目文档目录
│   ├── README.md                  # 文档目录说明
│   ├── STRUCTURE.md              # 项目结构说明（本文件）
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
│   │   ├── posts.data.js         # 文章数据文件
│   │   ├── articlesData.js       # 文章元数据
│   │   ├── sidebarArticles.js    # 侧边栏文章配置
│   │   ├── sidebarItems.js       # 侧边栏项目配置
│   │   ├── theme/                # 自定义主题目录
│   │   │   ├── index.js          # 主题入口文件
│   │   │   ├── Layout.vue        # 自定义布局组件
│   │   │   ├── style.css         # 原有样式文件
│   │   │   ├── custom.css        # 新增自定义样式
│   │   │   └── components/       # Vue 组件目录
│   │   │       ├── ArticleList.vue      # 文章列表组件
│   │   │       ├── CodeBlock.vue        # 代码块组件
│   │   │       ├── Effect.vue           # 特效组件
│   │   │       ├── ImageGallery.vue     # 图片画廊组件
│   │   │       ├── ImageLightbox.vue    # 图片灯箱组件
│   │   │       └── ReadingProgress.vue  # 阅读进度组件
│   │   ├── cache/                # VitePress 缓存目录
│   │   └── dist/                 # 构建输出目录
│   ├── note/                     # 📁 文章内容目录
│   │   ├── about.md              # 关于页面
│   │   ├── friend.md             # 友情链接
│   │   ├── list.md               # 文章列表
│   │   ├── 想法/                 # 思考类文章目录
│   │   │   ├── *.md              # 各种想法文章
│   │   │   └── *.assets/         # 文章相关资源
│   │   └── 笔记/                 # 学习笔记目录
│   │       ├── *.md              # 各种学习笔记
│   │       └── *.assets/         # 笔记相关资源
│   └── public/                   # 📁 静态资源目录
│       └── sitemap.xml           # 站点地图
└── node_modules/                  # Node.js 依赖包目录
```

## 结构优化说明

### 1. 目录分层清晰化

- **`scripts/`**: 所有构建、预处理和工具脚本集中管理
- **`docs/`**: 项目文档统一放置，便于维护和查阅
- **`core/.vitepress/theme/`**: 遵循 VitePress 官方推荐结构

### 2. 组件管理标准化

- 所有 Vue 组件移至 `core/.vitepress/theme/components/`
- 主题配置统一在 `core/.vitepress/theme/index.js`
- 样式文件分离：`style.css`（原有）+ `custom.css`（新增）

### 3. 配置文件合并

- 移除根目录重复的 `config.mjs`
- 统一使用 `core/.vitepress/config.mjs`
- 避免配置冲突和维护复杂性

### 4. 脚本路径优化

- 所有构建相关脚本集中在 `scripts/` 目录
- `package.json` 中的脚本路径相应更新
- 保持从根目录执行的便利性

## 文件用途说明

### 核心配置文件

- `package.json`: Node.js 项目配置，依赖管理
- `core/.vitepress/config.mjs`: VitePress 主配置，包含站点信息、导航、侧边栏等

### 构建脚本

- `scripts/build.sh`: 一键构建脚本，包含清理、预处理、构建全流程
- `scripts/preprocess.py`: 文档预处理，提取元数据、生成摘要、优化图片
- `scripts/generateArticlesData.js`: 生成文章索引数据

### 主题组件

- `ReadingProgress.vue`: 阅读进度指示器
- `ImageLightbox.vue`: 图片点击放大查看
- `CodeBlock.vue`: 代码块语法高亮和复制功能

### 内容文件

- `core/note/`: 所有 Markdown 文章内容
- `core/public/`: 静态资源文件（图片、sitemap等）

这样的结构更加清晰、易于维护，符合现代前端项目的最佳实践。
