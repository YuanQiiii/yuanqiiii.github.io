---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Home"
  text: "a place to place my soul"
  actions:
    - theme: brand
      text: list
      link: /note/list.md
    - theme: alt
      text: about
      link: /note/about.md
    - theme: alt
      text: game
      link: /note/game.md

---
<script setup>
import SearchBox from './components/SearchBox.vue'
</script>


<ClientOnly>
   <SearchBox/>
</ClientOnly>