document.addEventListener("DOMContentLoaded", () => {
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
