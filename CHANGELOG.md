# 变更日志

## 2025-06-23 - 删除 ArticleInfo 和 ArticleTags 组件

### 已删除的文件

- `/core/.vitepress/theme/components/ArticleInfo.vue` - 文章信息展示组件
- `/core/.vitepress/theme/components/ArticleTags.vue` - 文章标签展示组件

### 修改的文件

#### `/core/.vitepress/theme/index.js`

- 移除了 `ArticleInfo` 和 `ArticleTags` 组件的导入
- 移除了这两个组件的全局注册

#### `/core/.vitepress/theme/Layout.vue`

- 移除了 `ArticleInfo` 和 `ArticleTags` 组件的导入
- 移除了在 `doc-before` 模板中对这两个组件的使用
- 简化了文章头部区域的渲染逻辑

#### `/core/.vitepress/theme/custom.css`

- 移除了 `.article-info` 相关样式
- 移除了 `.article-tags` 相关样式
- 移除了响应式设计中的相关样式

#### `/README.md`

- 更新了项目结构说明，移除了已删除组件的描述

#### `/docs/STRUCTURE.md`

- 更新了项目结构文档，移除了已删除组件的说明
- 更新了主题组件列表

### 影响

- 文章页面不再显示作者、发布时间、更新时间、阅读时间、字数统计等信息
- 文章页面不再显示标签信息
- 减少了代码复杂度和维护负担
- 布局更加简洁

### 注意事项

- 如果需要重新添加文章元信息显示功能，需要重新实现相应的组件
- 相关的文章数据（作者、标签等）仍然在 `articlesData.js` 中保留，可供其他功能使用
