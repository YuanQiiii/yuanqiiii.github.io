# 开发指南

## 环境要求

- **Node.js**: 16+ 
- **Python**: 3.6+ (用于预处理脚本)
- **操作系统**: Linux/macOS/Windows

### 可选依赖
- **Pillow**: Python 图片处理库 (用于图片压缩)

## 开发环境设置

### 1. 克隆项目
```bash
git clone https://github.com/YuanQiiii/yuanqiiii.github.io.git
cd yuanqiiii.github.io
```

### 2. 安装依赖
```bash
# 安装 Node.js 依赖
npm install

# 安装 Python 依赖（可选）
pip install pillow
```

### 3. 启动开发服务器
```bash
# 运行预处理（可选，用于生成文章元数据）
npm run preprocess

# 启动开发服务器
npm run docs:dev
```

浏览器访问: http://localhost:5173

## 开发工作流

### 添加新文章

1. 在 `core/note/` 目录下创建 Markdown 文件
2. 文章建议使用以下 Front Matter 格式：

```yaml
---
title: 文章标题
date: 2025-01-01
tags: [标签1, 标签2]
category: 分类
description: 文章描述
---
```

3. 运行预处理脚本更新文章数据：
```bash
npm run preprocess
```

### 开发自定义组件

1. 在 `core/.vitepress/theme/components/` 目录下创建 Vue 组件
2. 在 `core/.vitepress/theme/index.js` 中注册组件：

```javascript
import NewComponent from './components/NewComponent.vue'

export default {
  // ...existing code...
  enhanceApp({ app }) {
    app.component('NewComponent', NewComponent)
    // ...existing code...
  }
}
```

### 修改样式

- **全局样式**: 编辑 `core/.vitepress/theme/custom.css`
- **组件样式**: 在各组件的 `<style>` 标签中定义

### 配置修改

主要配置文件: `core/.vitepress/config.mjs`

包含：
- 站点基本信息
- 导航栏配置
- 侧边栏配置
- 主题配置
- 插件配置

## 调试技巧

### 1. 查看构建日志
```bash
npm run docs:build
```

### 2. 清理缓存
```bash
npm run clean
```

### 3. 预览构建结果
```bash
npm run docs:preview
```

### 4. 检查文章数据
查看生成的数据文件：
- `core/.vitepress/posts.data.js`
- `core/.vitepress/articlesData.js`

## 常见问题

### Q: 新文章没有出现在导航中？
A: 运行 `npm run preprocess` 重新生成文章数据

### Q: 组件样式不生效？
A: 检查组件是否正确注册，CSS 选择器是否正确

### Q: 图片显示问题？
A: 确保图片路径正确，建议使用相对路径

### Q: 构建失败？
A: 
1. 检查 Node.js 和 Python 版本
2. 清理缓存后重新构建
3. 查看构建日志定位问题

## 代码规范

### JavaScript/Vue
- 使用 ES6+ 语法
- 组件名使用 PascalCase
- 文件名使用 camelCase

### CSS
- 使用 CSS 变量定义主题色彩
- 遵循 BEM 命名规范
- 优先使用 Flexbox/Grid 布局

### Markdown
- 使用标准 Markdown 语法
- 图片使用相对路径
- 代码块指定语言类型

## 性能优化建议

1. **图片优化**: 使用预处理脚本自动压缩图片
2. **代码分割**: 合理使用动态 import
3. **缓存策略**: 充分利用 VitePress 的缓存机制
4. **懒加载**: 对大图片和组件使用懒加载

## 扩展功能开发

### 添加新的预处理功能
在 `scripts/preprocess.py` 中添加新的处理逻辑

### 集成第三方服务
如评论系统、统计分析等，在主题配置中添加相关配置
