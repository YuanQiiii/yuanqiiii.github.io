---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'
const members = [
  {
    avatar: 'https://pku-cs-cjw.top/image/头像.jpg',
    name: 'c+v',
    title: 'Friend',
    links: [
      { icon: { svg: '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="64" height="64" viewBox="0 0 64 64"><polyline fill="none" stroke="#9c34c2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="5" points="48,49 14,31 48,13"></polyline><ellipse cx="32" cy="61" opacity=".3" rx="24.5" ry="3"></ellipse><circle cx="14" cy="31" r="8" fill="#98c900"></circle><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3" d="M9.5,31c0-2.481,2.019-4.5,4.5-4.5"></path><path fill="#fff" d="M14,23c-4.418,0-8,3.582-8,8c0,1.771,0.583,3.402,1.557,4.728	C9.551,35.07,11,33.214,11,31c0-1.654,1.346-3,3-3c2.214,0,4.071-1.449,4.728-3.443C17.402,23.583,15.771,23,14,23z" opacity=".3"></path><circle cx="48" cy="13" r="8" fill="#98c900"></circle><circle cx="48" cy="49" r="8" fill="#98c900"></circle><path d="M48,57c4.418,0,8-3.582,8-8c0-1.771-0.583-3.402-1.557-4.728C52.449,44.93,51,46.786,51,49	c0,1.654-1.346,3-3,3c-2.214,0-4.071,1.449-4.728,3.443C44.598,56.417,46.229,57,48,57z" opacity=".15"></path></svg>'},  link: 'https://pku-cs-cjw.top/' }
    ]
  }
]

</script>

<div class="center-content">
  <VPTeamPage>
    <VPTeamPageTitle>My Friends</VPTeamPageTitle>
    <VPTeamMembers :members="members" />
  </VPTeamPage>
</div>

<style>
.center-content {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>