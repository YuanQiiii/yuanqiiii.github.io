---
title: 自动生成功能说明
description: "博客支持的多种数据自动生成功能说明"
author: shihuaidexianyu
date: 2025-06-26
tags:
  - 自动生成
  - 功能说明
---
# 自动生成功能说明

## 🤖 功能概述

博客现在支持多种数据的自动生成，让内容管理更加智能化：

### 📊 自动生成的数据文件

1. **`/public/articles.json`** - 文章列表数据
2. **`/public/timeline.json`** - 时间线数据  
3. **`/public/tags.json`** - 标签云数据
4. **`/public/stats.json`** - 统计数据

### 🔄 触发生成

数据会在以下情况自动生成：

- 运行 `npm run dev` 时
- 运行 `npm run build` 时  
- 手动运行 `npm run generate:articles` 时

### 📝 文章元数据

为了让自动生成功能工作得更好，请在每篇文章的 frontmatter 中添加：

```yaml
---
title: 文章标题
description: 文章描述
date: 2024-12-25  # YYYY-MM-DD 格式
tags: [标签1, 标签2, 标签3]
category: note  # 可选，会根据文件路径自动推断
author: YuanQiiii  # 可选，默认为 YuanQiiii
---
```

### 🎯 组件使用

以下组件会自动使用生成的数据：

- **`<BlogStats />`** - 显示博客统计信息
- **`<TimelineView />`** - 显示文章时间线
- **`<TagsView />`** - 显示标签云和相关文章
- **`<CategoryPage />`** - 显示分类页面

### 📈 生成的统计信息

- 文章总数和字数统计
- 阅读时间计算
- 分类和标签分布
- 月度发布统计
- 热门标签排行

### 🔧 自定义配置

可以在 `scripts/generate-article-list.js` 中修改：

- 扫描的目录
- 输出文件路径
- 统计计算方式
- 数据过滤规则

这样你只需要专注于写作，所有的数据聚合和页面更新都会自动完成！