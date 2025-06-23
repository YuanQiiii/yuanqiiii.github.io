# 部署指南

本项目支持多种部署方式，推荐使用 GitHub Pages 进行自动化部署。

## GitHub Pages 部署（推荐）

### 自动化部署

项目已配置 GitHub Actions，推送到 `main` 分支时自动触发构建和部署。

#### 部署流程

1. 推送代码到 `main` 分支
2. GitHub Actions 自动运行构建
3. 构建完成后自动部署到 `gh-pages` 分支
4. 网站更新完成

#### GitHub Actions 配置

查看 `.github/workflows/` 目录下的配置文件。

### 手动部署

如需手动部署：

```bash
# 1. 构建项目
npm run docs:build

# 2. 部署 docs/.vitepress/dist 目录到 GitHub Pages
# 或推送到 gh-pages 分支
```

## 其他部署平台

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 设置构建命令：

   ```bash
   npm run docs:build
   ```

3. 设置输出目录：

   ```bash
   docs/.vitepress/dist
   ```

### Netlify 部署

1. 连接 GitHub 仓库到 Netlify
2. 构建设置：
   - **构建命令**: `npm run docs:build`
   - **发布目录**: `docs/.vitepress/dist`
   - **Node.js 版本**: 16 或更高

### 服务器部署

```bash
# 1. 构建项目
npm run docs:build

# 2. 将 docs/.vitepress/dist 目录上传到服务器
scp -r docs/.vitepress/dist/* user@server:/path/to/web/root/

# 或使用 rsync
rsync -avz docs/.vitepress/dist/ user@server:/path/to/web/root/
```

## 本地预览

构建并预览生产版本：

```bash
# 构建
npm run docs:build

# 预览
npm run docs:preview

# 访问 http://localhost:4173
```

## 环境要求

- **Node.js**: 16 或更高版本
- **npm**: 8 或更高版本

## 构建优化

项目已配置以下优化：

- **代码分割**: 自动按路由分割代码
- **静态资源优化**: 图片压缩和懒加载
- **Tree-shaking**: 移除未使用的代码
- **压缩**: Gzip 和 Brotli 压缩
- **缓存**: 长期缓存策略

## 域名配置

如果使用自定义域名：

1. 在 `docs/public/` 目录下创建 `CNAME` 文件
2. 文件内容为你的域名，如：`example.com`
3. 推送到仓库，GitHub Pages 会自动识别

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本是否符合要求
   - 清除缓存：`rm -rf node_modules package-lock.json && npm install`

2. **页面无法访问**
   - 检查 GitHub Pages 设置
   - 确认部署分支是否正确

3. **样式缺失**
   - 检查基础路径配置
   - 确认静态资源路径是否正确

### 调试模式

启用详细日志：

```bash
# 构建时显示详细信息
npm run docs:build -- --debug

# 开发时显示详细信息
npm run docs:dev -- --debug
```

---

💡 **提示**: 如果遇到部署问题，请检查 GitHub Actions 的运行日志，通常能找到具体的错误信息。
