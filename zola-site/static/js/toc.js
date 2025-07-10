document.addEventListener("DOMContentLoaded", () => {
  // 阅读进度计算
  const updateReadingProgress = () => {
    const article = document.querySelector("article");
    if (!article) return;
    
    // 获取文章的位置信息
    const articleTop = article.offsetTop;
    const articleHeight = article.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // 计算已滚动的距离
    const scrollDistance = scrollPosition + viewportHeight - articleTop;
    // 计算总的可滚动距离
    const totalDistance = articleHeight;
    
    // 计算进度百分比
    let progress = 0;
    if (scrollDistance > 0 && totalDistance > 0) {
      progress = Math.min(100, Math.max(0, (scrollDistance / totalDistance) * 100));
    }
    
    // 更新独立的进度环
    const progressIndicator = document.querySelector('.reading-progress-indicator');
    if (progressIndicator) {
      const progressCircle = progressIndicator.querySelector('.progress-circle');
      const progressText = progressIndicator.querySelector('.progress-text');
      
      if (progressCircle && progressText) {
        const circumference = 2 * Math.PI * 20; // radius = 20
        const offset = circumference - (progress / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset + "";
        progressText.textContent = Math.round(progress) + "%";
      }
    }
  };
  
  // 监听滚动事件
  window.addEventListener("scroll", updateReadingProgress);
  window.addEventListener("resize", updateReadingProgress);
  // 延迟初始化，确保页面完全加载
  setTimeout(updateReadingProgress, 100);

  // TOC主折叠功能
  const tocToggle = document.querySelector(".toc-toggle");
  const toc = document.querySelector(".toc");
  
  if (tocToggle && toc) {
    tocToggle.addEventListener("click", () => {
      const isCollapsed = toc.classList.contains("collapsed");
      toc.classList.toggle("collapsed");
      tocToggle.setAttribute("aria-expanded", isCollapsed ? "true" : "false");
    });
  }

  // 每个标题项的折叠功能
  const tocItemToggles = document.querySelectorAll(".toc-item-toggle");
  tocItemToggles.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const tocItem = toggle.closest(".toc-item");
      const isCollapsed = tocItem.classList.contains("collapsed");
      tocItem.classList.toggle("collapsed");
      toggle.setAttribute("aria-expanded", isCollapsed ? "true" : "false");
    });
  });

  // 默认展开所有一级标题
  document.querySelectorAll(".toc-list > .toc-item.collapsible").forEach(item => {
    item.classList.remove("collapsed");
    const toggle = item.querySelector(".toc-item-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
    }
  });

  // 默认折叠所有二级标题
  document.querySelectorAll(".toc-children .toc-item.collapsible").forEach(item => {
    item.classList.add("collapsed");
    const toggle = item.querySelector(".toc-item-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // 原有的目录高亮功能
  let observer = new IntersectionObserver(handler, {
    threshold: [0],
  });
  let paragraphs = [...document.querySelectorAll("section > *")];
  let submenu = [...document.querySelectorAll(".toc a")];

  function previousHeaderId(e) {
    for (; e && !e.matches("h1, h2, h3, h4"); ) e = e.previousElementSibling;
    return e?.id;
  }
  let paragraphMenuMap = paragraphs.reduce((e, t) => {
    let n = previousHeaderId(t);
    if (((t.previousHeader = n), n)) {
      let t = submenu.find((e) => decodeURIComponent(e.hash) === "#" + n);
      e[n] = t;
    }
    return e;
  }, {});

  paragraphs.forEach((e) => observer.observe(e));
  let selection;
  function handler(e) {
    selection = (selection || e).map(
      (t) => e.find((e) => e.target === t.target) || t,
    );
    for (s of selection)
      s.isIntersecting ||
        paragraphMenuMap[
          s.target.previousHeader
        ]?.closest(".toc-item").classList.remove("selected", "parent");
    for (s of selection)
      if (s.isIntersecting) {
        let e = paragraphMenuMap[s.target.previousHeader]?.closest(".toc-item");
        if ((e?.classList.add("selected"), e === void 0)) continue;
        
        // 展开包含当前选中项的所有父级
        let parent = e.parentElement.closest(".toc-item");
        while (parent) {
          parent.classList.remove("collapsed");
          const toggle = parent.querySelector(":scope > .toc-item-toggle");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "true");
          }
          parent.classList.add("parent");
          parent = parent.parentElement.closest(".toc-item");
        }
        
        // 滚动到视图中
        const link = e.querySelector("a");
        if (link) {
          link.scrollIntoView({
            block: "nearest",
            inline: "nearest",
          });
        }
      }
  }
});
