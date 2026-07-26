// ============================================
// Swup.js 初始化 - Hugo PaperMod 兼容版
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const swup = new Swup({
    // 只有 main 内容区域参与过渡，导航栏/页脚不动
    containers: ['#content', 'main.main', '.main', 'main'],
    
    // 插件
    plugins: [
      new SwupHeadPlugin({
        persistTags: 'style, link[rel=stylesheet], script[src*="chroma"], script[src*="highlight"]'
      }),
      new SwupScriptsPlugin({
        optin: true  // 只执行带 data-swup-reload-script 的脚本
      })
    ],
    
    // 动画时长（与 CSS 保持一致）
    animationSelector: '[class*="swup-transition-"]',
    cache: true,
    preload: true
  });

  // ==========================================
  // 页面切换前：清理旧状态
  // ==========================================
  swup.hooks.on('visit:start', () => {
    // 关闭移动端菜单
    const menuTrigger = document.querySelector('#menu-trigger');
    if (menuTrigger && menuTrigger.checked) {
      menuTrigger.checked = false;
    }
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  // ==========================================
  // 页面内容替换后：重新初始化 PaperMod 功能
  // ==========================================
  swup.hooks.on('content:replace', () => {
    initPaperModFeatures();
  });

  // ==========================================
  // 页面动画完成后：最终清理
  // ==========================================
  swup.hooks.on('page:view', () => {
    // 重新触发 lazyload（如果有）
    if (window.lazyLoadInstance) {
      window.lazyLoadInstance.update();
    }
  });
});

// ==========================================
// PaperMod 功能重新初始化
// ==========================================
function initPaperModFeatures() {
  // 1. 重新高亮代码块（Chroma / highlight.js）
  if (window.hljs) {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }
  
  // 2. 重新初始化复制按钮
  initCopyCodeButtons();
  
  // 3. 重新初始化目录高亮（TOC scroll spy）
  initTocScrollSpy();
  
  // 4. 重新初始化数学公式（KaTeX / MathJax）
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ]
    });
  }
  if (window.MathJax) {
    MathJax.typesetPromise && MathJax.typesetPromise();
  }
  
  // 5. 重新初始化图片懒加载
  if (window.lazyLoadInstance) {
    window.lazyLoadInstance.update();
  }
  
  // 6. 重新绑定搜索（如果有 Fuse.js 搜索）
  if (window.initSearch) {
    window.initSearch();
  }
  
  // 7. 重新执行自定义代码块样式（你的 code-style.css）
  // 不需要额外操作，CSS 已全局加载
  
  // 8. 重新初始化头像/昵称 hover 效果（如果之前加了）
  initProfileHover();
}

// ==========================================
// 复制按钮重新初始化
// ==========================================
function initCopyCodeButtons() {
  document.querySelectorAll('.highlight').forEach((highlight) => {
    const copyBtn = highlight.querySelector('.copy-code');
    if (!copyBtn) return;
    
    // 移除旧事件防止重复绑定
    const newBtn = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newBtn, copyBtn);
    
    newBtn.addEventListener('click', () => {
      const code = highlight.querySelector('code');
      if (!code) return;
      
      navigator.clipboard.writeText(code.innerText).then(() => {
        const originalText = newBtn.innerText;
        newBtn.innerText = '已复制!';
        newBtn.style.background = '#8faa8f';
        setTimeout(() => {
          newBtn.innerText = originalText;
          newBtn.style.background = '';
        }, 2000);
      });
    });
  });
}

// ==========================================
// 目录滚动高亮重新初始化
// ==========================================
function initTocScrollSpy() {
  const tocLinks = document.querySelectorAll('#TableOfContents a');
  if (!tocLinks.length) return;
  
  const headings = Array.from(tocLinks).map(link => {
    const id = link.getAttribute('href')?.replace('#', '');
    return document.getElementById(id);
  }).filter(Boolean);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`#TableOfContents a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -80% 0px' });
  
  headings.forEach(h => observer.observe(h));
}

// ==========================================
// 头像/昵称 hover 重新绑定（如果用了 JS 方案）
// ==========================================
function initProfileHover() {
  const avatar = document.querySelector('.profile img, .profile_inner img');
  const name = document.querySelector('.profile h1, .profile_inner h1');
  
  if (avatar) {
    avatar.style.cursor = 'pointer';
    avatar.addEventListener('click', () => window.location.href = '/about');
  }
  if (name) {
    name.style.cursor = 'pointer';
    name.addEventListener('click', () => window.location.href = '/about');
  }
}
