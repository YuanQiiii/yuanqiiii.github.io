---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "start"
  text: "愿美好的事情即将发生"
  tagline: "记录学习，分享思考，记载生活"
  actions:
    - theme: brand
      text: 浏览文章
      link: /note/list.md
    - theme: alt
      text: 关于我
      link: /note/about.md
    - theme: alt
      text: 友情链接
      link: /note/friend.md

features:
  - icon: 📚
    title: 学习笔记
    details: 记录学习过程中的知识点和心得体会，包含各种学科的学习笔记和总结。
    link: /note/笔记/普通心理学.md
  - icon: 💭
    title: 随想感悟
    details: 生活感悟、思考随笔和心情记录，记录成长路上的点点滴滴。
    link: /note/想法/随想01.md
  - icon: 🔍
    title: 全文搜索
    details: 支持全站内容搜索，快速找到您感兴趣的文章和内容。
---

<script setup>
import RecentPosts from './components/RecentPosts.vue'
import CategoryCards from './components/CategoryCards.vue'
import RssSubscribe from './components/RssSubscribe.vue'
</script>

<RecentPosts />
<CategoryCards />
<RssSubscribe />
