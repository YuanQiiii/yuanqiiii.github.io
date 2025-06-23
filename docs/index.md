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
      link: /content/list
    - theme: alt
      text: 关于我
      link: /content/about
    - theme: alt
      text: 友情链接
      link: /content/friend



---



<script setup>
import Effect from './.vitepress/theme/components/Effect.vue'
</script>

<ClientOnly>
  <Effect />
</ClientOnly>
