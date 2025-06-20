# 部署指南

## 部署方式

本项目支持多种部署方式，推荐使用 GitHub Pages 进行自动化部署。

## GitHub Pages 部署

### 自动化部署（推荐）

项目已配置 GitHub Actions，推送到 `main` 分支时自动触发构建和部署。

#### 部署流程：
1. 推送代码到 GitHub
2. GitHub Actions 自动运行构建
3. 构建完成后自动部署到 GitHub Pages

#### GitHub Actions 配置
查看 `.github/workflows/` 目录下的配置文件。

### 手动部署

```bash
# 1. 本地构建
./scripts/build.sh

# 2. 推送构建产物
git add core/.vitepress/dist
git commit -m "Deploy: $(date)"
git push origin main
```

## 其他部署平台

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 设置构建命令：
   ```bash
   npm run build
   ```
3. 设置输出目录：
   ```bash
   core/.vitepress/dist
   ```

### Netlify 部署

1. 连接 GitHub 仓库到 Netlify
2. 构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `core/.vitepress/dist`

### 服务器部署

#### 使用 Nginx

1. 构建静态文件：
```bash
./scripts/build.sh
```

2. 上传 `core/.vitepress/dist` 目录到服务器

3. Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/css application/javascript text/javascript application/json;
}
```

## 环境变量配置

### 生产环境变量

在部署平台设置以下环境变量：

- `NODE_ENV=production`
- `VITE_SITE_URL=https://your-domain.com` (可选)

### 自定义域名

#### GitHub Pages 自定义域名

1. 在仓库设置中配置自定义域名
2. 在 `core/public/` 目录下创建 `CNAME` 文件：
```
your-domain.com
```

## 构建优化

### 构建前检查

```bash
# 检查文章元数据
npm run preprocess

# 检查构建产物
npm run docs:build

# 本地预览
npm run docs:preview
```

### 性能优化

#### 图片优化
预处理脚本会自动压缩图片，建议：
- 原图分辨率不超过 1920px
- 使用 WebP 格式（自动转换）
- 图片文件大小控制在 500KB 以内

#### 代码压缩
生产构建自动启用：
- JavaScript/CSS 压缩
- HTML 压缩
- Tree-shaking

#### CDN 加速
建议使用 CDN 加速静态资源：
- jsDelivr
- Cloudflare
- 阿里云 CDN

## 监控和分析

### 站点性能监控

推荐工具：
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

### 访问统计

可集成以下统计服务：
- Google Analytics
- 百度统计
- 不蒜子统计

在 `core/.vitepress/config.mjs` 中配置相关代码。

## 备份策略

### 代码备份
- GitHub 作为主要代码仓库
- 定期同步到其他代码托管平台

### 内容备份
- 定期备份 `core/note/` 目录
- 备份图片资源文件
- 导出文章为 PDF（可选）

## 故障排除

### 常见部署问题

#### 1. 构建失败
```bash
# 检查依赖
npm install

# 清理缓存重新构建
npm run clean
npm run build
```

#### 2. 页面空白
- 检查 base URL 配置
- 确认静态资源路径正确

#### 3. 样式丢失
- 检查 CSS 文件是否正确引入
- 确认文件路径大小写

#### 4. 图片不显示
- 检查图片路径和文件名
- 确认图片文件已提交到仓库

### 回滚方案

#### GitHub Pages 回滚
```bash
# 回滚到上一个版本
git revert HEAD
git push origin main
```

#### 手动回滚
1. 找到正常工作的版本
2. 重新构建和部署

## 更新维护

### 依赖更新
```bash
# 检查过时的依赖
npm outdated

# 更新依赖
npm update

# 安全更新
npm audit fix
```

### VitePress 版本升级
```bash
# 升级 VitePress
npm install vitepress@latest

# 检查配置兼容性
npm run docs:dev
```

### 定期维护任务
- 每月检查依赖更新
- 每季度性能评估
- 每年进行大版本升级评估
