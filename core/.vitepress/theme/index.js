import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './style.css'
import './custom.css'

// 全局组件
import ReadingProgress from './components/ReadingProgress.vue'
import ArticleInfo from './components/ArticleInfo.vue'
import ArticleTags from './components/ArticleTags.vue'
import ArticleList from './components/ArticleList.vue'
import CodeBlock from './components/CodeBlock.vue'
import Effect from './components/Effect.vue'
import ImageGallery from './components/ImageGallery.vue'
import ImageLightbox from './components/ImageLightbox.vue'

export default {
    extends: DefaultTheme,
    Layout,
    enhanceApp({ app, router }) {
        // 注册全局组件
        app.component('ReadingProgress', ReadingProgress)
        app.component('ArticleInfo', ArticleInfo)
        app.component('ArticleTags', ArticleTags)
        app.component('ArticleList', ArticleList)
        app.component('CodeBlock', CodeBlock)
        app.component('Effect', Effect)
        app.component('ImageGallery', ImageGallery)
        app.component('ImageLightbox', ImageLightbox)

        // 路由守卫
        if (router) {
            router.beforeEach((to, from, next) => {
                if (to.path !== from.path) {
                    window.scrollTo(0, 0)
                }
                next()
            })
        }
    }
}

