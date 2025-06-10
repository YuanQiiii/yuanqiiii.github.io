---
layout: page
title: About Me
---

<script setup>
import { ref } from 'vue'

// 个人数据
const profile = {
  name: "YuanQiiii",
  avatar: "https://avatars.githubusercontent.com/u/YuanQiiii",
  bio: "学习心理学与计算机科学的学生，喜欢思考和分享",
  location: "北京大学",
  email: "shihuaidexianyu@gmail.com",
  keywords: [
    { name: "Psychology", color: "#0277bd" },
    { name: "Computer Science", color: "#2e7d32" },
    { name: "Peking University", color: "#c2185b" },
    { name: "永劫无间", color: "#ff5722" },
    { name: "习惯性消极", color: "#7b1fa2" },
    { name: "业余选手", color: "#00796b" },
    { name: "完美主义", color: "#d32f2f" }
  ],
  skills: [
    { name: "Web开发", level: 85 },
    { name: "数据分析", level: 75 },
    { name: "写作能力", level: 90 },
    { name: "设计", level: 65 },
    { name: "问题解决", level: 80 }
  ],
  socialLinks: [
    { name: "GitHub", icon: "github", url: "https://github.com/YuanQiiii" },
    { name: "Email", icon: "email", url: "mailto:shihuaidexianyu@gmail.com" }
  ]
}

// 互动功能
const activatedIndex = ref(-1)
const showEmail = ref(false)
const copied = ref(false)

// 复制邮箱地址
const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(profile.email)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('无法复制邮箱:', err)
  }
}
</script>

<div class="profile-container">
  <div class="profile-card">
    <div class="profile-header">
      <div class="avatar-container">
        <img class="avatar" :src="profile.avatar" alt="Profile Avatar" />
      </div>
      <div class="name-container">
        <h1 class="name">{{ profile.name }}</h1>
        <p class="bio">{{ profile.bio }}</p>
        <p class="location">
          <span class="location-icon">📍</span>
          {{ profile.location }}
        </p>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">关于我</h2>
      <div class="section-content">
        <p>我是一名热爱学习和探索的学生，主修心理学与计算机科学。喜欢思考人类行为背后的原理，也热衷于用技术解决问题。</p>
        <p>在这个博客中，我会分享我的学习笔记、思考和生活点滴，希望能与志同道合的朋友交流。</p>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">关键词</h2>
      <div class="keywords-container">
        <div 
          v-for="(keyword, index) in profile.keywords" 
          :key="index"
          class="keyword-tag"
          :style="{ backgroundColor: keyword.color + '22', color: keyword.color, borderColor: keyword.color }"
          @mouseenter="activatedIndex = index"
          @mouseleave="activatedIndex = -1"
          :class="{ 'activated': activatedIndex === index }"
        >
          {{ keyword.name }}
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">技能</h2>
      <div class="skills-container">
        <div v-for="(skill, index) in profile.skills" :key="index" class="skill-item">
          <div class="skill-info">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-percentage">{{ skill.level }}%</span>
          </div>
          <div class="skill-bar">
            <div class="skill-progress" :style="{ width: skill.level + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">联系我</h2>
      <div class="contact-container">
        <div class="social-links">
          <a 
            v-for="link in profile.socialLinks" 
            :key="link.name" 
            :href="link.url" 
            target="_blank" 
            class="social-link"
            :title="link.name"
          >
            <span v-if="link.icon === 'github'" class="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </span>
            <span v-else-if="link.icon === 'email'" class="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/>
              </svg>
            </span>
          </a>
        </div>
        
        <div class="email-container">
          <button v-if="!showEmail" @click="showEmail = true" class="email-button">显示邮箱</button>
          <div v-else class="email-display">
            <span>{{ profile.email }}</span>
            <button @click="copyEmail" class="copy-button" :class="{ 'copied': copied }">
              <span v-if="!copied">复制</span>
              <span v-else>已复制 ✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-card {
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.avatar-container {
  flex-shrink: 0;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--vp-c-brand);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
  border-color: var(--vp-c-brand-lighter);
}

.name-container {
  flex-grow: 1;
}

.name {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
  background: linear-gradient(90deg, var(--vp-c-brand), var(--vp-c-brand-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bio {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
}

.location-icon {
  font-size: 1.2em;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 1.2em;
  background: var(--vp-c-brand);
  border-radius: 2px;
}

.section-content {
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.keywords-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.keyword-tag {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.3s ease;
  cursor: default;
}

.keyword-tag.activated {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.skills-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 1rem;
}

.skill-item {
  width: 100%;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.skill-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.skill-percentage {
  color: var(--vp-c-text-2);
}

.skill-bar {
  height: 8px;
  background: var(--vp-c-bg-alt);
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--vp-c-brand), var(--vp-c-brand-light));
  border-radius: 4px;
  width: 0;
  animation: progressAnimation 1.5s ease-out forwards;
}

@keyframes progressAnimation {
  from { width: 0; }
  to { width: v-bind('skill.level + "%"'); }
}

.contact-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.social-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
  border: 1px solid var(--vp-c-divider);
}

.social-icon {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-link:hover {
  background: var(--vp-c-brand);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.email-button {
  background: var(--vp-c-brand);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.email-button:hover {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.email-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--vp-c-bg-alt);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.copy-button {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-button:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.copy-button.copied {
  background: var(--vp-c-green-soft);
  border-color: var(--vp-c-green-dimm);
  color: var(--vp-c-green);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .location {
    justify-content: center;
  }
  
  .skills-container {
    gap: 1rem;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .profile-card {
    padding: 1.5rem;
  }
}

/* 暗黑模式适应 */
:root.dark .profile-card {
  background: var(--vp-c-bg-alt);
}

:root.dark .keyword-tag {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
