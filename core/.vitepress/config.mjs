import { defineConfig } from 'vitepress'
import sidebarArticles from './sidebarArticles'
import { resolve } from 'path'

// Vite 配置
const viteConfig = {
  assetsInclude: ['**/*.jpg', '**/*.JPG', '**/*.jpeg', '**/*.JPEG', '**/*.gif', '**/*.GIF'],
  resolve: {
    alias: {
      '@': resolve(__dirname, '..'),
      '@data': resolve(__dirname, '.')
    }
  }
}
export default defineConfig({
  vite: viteConfig,
  title: "Home",
  lastUpdated: true, // 使用 git 提交获取时间戳，使默认主题能够显示页面的上次更新时间
  ignoreDeadLinks: true, // 不会因死链接而使构建失败
  markdown: {
    lineNumbers: true, // 显示代码行数
    math: true, // 支持数学公式
    image: {
      // 启用图片懒加载
      lazyLoading: true
    },
    // 配置代码块
    config: (md) => {
      // 添加代码复制功能
      md.renderer.rules.fence = (tokens, idx, options, env, renderer) => {
        const token = tokens[idx]
        const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
        const langName = info.split(/\s+/g)[0]

        const rawCode = token.content
        const encodedCode = md.utils.escapeHtml(rawCode)

        return `<CodeBlock language="${langName}" code="${encodedCode}">
<pre class="language-${langName}"><code>${encodedCode}</code></pre>
</CodeBlock>`
      }
    }
  },
  head: [
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'YuanQiiii 的博客', href: '/rss.xml' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh_CN' }],
    ['meta', { name: 'og:site_name', content: 'YuanQiiii 的博客' }],
    ['meta', { name: 'og:image', content: 'https://yuanqiiii.github.io/og-image.jpg' }],
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID' }],
    ['script', {}, `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');`]
  ],
  description: "a place to place my soul",
  themeConfig: {
    // 启用本地搜索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },
    sidebar: [
      ...sidebarArticles // 使用按文章分类的侧边栏
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/YuanQiiii' }
    ],
    // 添加导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '列表', link: '/note/list.md' },
      { text: '关于', link: '/note/about.md' },
      { text: '友链', link: '/note/friend.md' }
    ],
    // 启用目录导航
    outline: {
      level: [2, 3],
      label: '文章目录'
    },
    // 添加编辑链接
    editLink: {
      pattern: 'https://github.com/YuanQiiii/yuanqiiii.github.io/edit/main/core/:path',
      text: '在 GitHub 上编辑此页面'
    },
    // 添加上一页/下一页导航
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    // 添加最后更新时间文本
    lastUpdatedText: '最后更新',
    // 添加返回顶部按钮
    returnToTopLabel: '返回顶部',
    // 添加暗黑模式切换按钮
    darkModeSwitchLabel: '切换暗色模式'
  }
})
