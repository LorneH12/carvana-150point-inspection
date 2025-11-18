// ========================== SAFE INITIALIZATION ==========================
// Wait for DOM and translations to be ready
(function initApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startModules);
  } else {
    startModules();
  }

  function startModules() {
    // Check if translations loaded
    if (typeof translations === 'undefined') {
      console.error('Translations failed to load. Using fallback text.');
      // App will still work with hardcoded HTML text
    }
    
    LanguageModule.init();
    SidebarModule.init();
    NavigationModule.init();
    AccordionModule.init();
    ParallaxModule.init();
    BlueprintModule.init();
    LazyLoadModule.init();
  }
})();

// ========================== LANGUAGE / I18N ==========================
const LanguageModule = (() => {
  let currentLang = "en";
  let buttons = [];
  let i18nEls = [];

  function init() {
    buttons = document.querySelectorAll("[data-lang-btn]");
    i18nEls = document.querySelectorAll("[data-i18n]");

    if (!buttons.length) {
      console.warn('No language buttons found');
      return;
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        setLanguage(btn.dataset.langBtn);
      });
    });

    // Initialize with English
    setLanguage("en");
  }

  function applyTranslations() {
    if (typeof translations === 'undefined') {
      console.warn('Translations object not available');
      return;
    }

    const dict = translations[currentLang] || translations.en;
    if (!dict) {
      console.error('Translation dictionary not found for:', currentLang);
      return;
    }

    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      if (!key || !dict[key]) return;
      
      const value = dict[key];
      
      // Sanitize HTML to prevent XSS while allowing safe HTML
      if (value.includes('<strong>') || value.includes('<em>')) {
        // Only allow specific safe tags
        const sanitized = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+="[^"]*"/gi, '')
          .replace(/javascript:/gi, '');
        el.innerHTML = sanitized;
      } else {
        el.textContent = value;
      }
    });
    
    // Recalculate accordion heights after language change
    AccordionModule.recalculateHeights();
  }

  function setLanguage(lang) {
    if (!lang || !['en', 'es', 'zh'].includes(lang)) {
      console.warn('Invalid language:', lang);
      return;
    }
    
    currentLang = lang;

    // Update button states
    buttons.forEach((btn) => {
      const isActive = btn.dataset.langBtn === lang;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    // Update HTML lang attribute
    const htmlLangMap = { en: "en", es: "es", zh: "zh-Hans" };
    document.documentElement.lang = htmlLangMap[lang] || "en";

    // Apply translations
    applyTranslations();
  }

  return {
    init,
    get current() {
      return currentLang;
    },
    refresh: applyTranslations
  };
})();

// ========================== SIDEBAR ==========================
const SidebarModule = (() => {
  let sidebar, toggleBtn, body;
  let currentWidth = window.innerWidth;

  function init() {
    sidebar = document.getElementById("sidebar");
    toggleBtn = document.getElementById("sidebarToggle");
    body = document.body;

    if (!sidebar || !toggleBtn) {
      console.warn('Sidebar elements not found');
      return;
    }

    toggleBtn.addEventListener("click", toggleSidebar);
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    });
    
    // Close sidebar when clicking nav items on mobile
    setupMobileNavClosing();
  }

  function toggleSidebar() {
    const isOpen = body.classList.toggle("sidebar-open");
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    sidebar.setAttribute("aria-hidden", String(!isOpen));
  }

  function handleResize() {
    const newWidth = window.innerWidth;
    
    // If resizing from desktop to mobile while sidebar is open
    if (currentWidth > 900 && newWidth <= 900) {
      if (body.classList.contains('sidebar-open')) {
        // Keep it open but prepare for mobile behavior
      }
    }
    
    // If resizing from mobile to desktop
    if (currentWidth <= 900 && newWidth > 900) {
      // Ensure sidebar can be seen on desktop
      body.classList.add('sidebar-open');
    }
    
    currentWidth = newWidth;
  }

  function setupMobileNavClosing() {
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
          body.classList.remove("sidebar-open");
          toggleBtn.setAttribute("aria-expanded", "false");
          sidebar.setAttribute("aria-hidden", "true");
        }
      });
    });
  }

  return { init };
})();

// ========================== NAVIGATION (SMOOTH SCROLL) ==========================
const NavigationModule = (() => {
  let items = [];

  function init() {
    items = document.querySelectorAll(".nav-item");
    
    if (!items.length) {
      console.warn('No navigation items found');
      return;
    }

    items.forEach((item) => {
      item.addEventListener("click", () => handleNavClick(item));
    });
  }

  function handleNavClick(item) {
    const targetId = item.dataset.target;
    if (!targetId) return;

    const target = document.querySelector(targetId);
    if (!target) {
      console.warn('Navigation target not found:', targetId);
      return;
    }

    // Update active state
    items.forEach((n) => {
      n.classList.remove("active");
      n.removeAttribute("aria-current");
    });
    item.classList.add("active");
    item.setAttribute("aria-current", "page");

    // Smooth scroll with offset
    const offset = 110;
    const rect = target.getBoundingClientRect();
    const top = rect.top + window.scrollY - offset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  }

  return { init };
})();

// ========================== ACCORDION + PROGRESS ==========================
const AccordionModule = (() => {
  let items = [];
  let progressFill, progressPercent, progressBar;
  const openedIndices = new Set();

  function init() {
    items = Array.from(document.querySelectorAll(".accordion-item"));
    progressFill = document.getElementById("progressFill");
    progressPercent = document.getElementById("progressPercent");
    progressBar = document.querySelector(".progress-bar");

    if (!items.length) {
      console.warn('No accordion items found');
      return;
    }

    items.forEach((item, index) => {
      const header = item.querySelector(".accordion-header");
      const body = item.querySelector(".accordion-body");

      if (!header || !body) return;

      // Initialize open state
      if (item.classList.contains("open")) {
        initializeOpenAccordion(item, body, index);
      }

      // Add click handler
      header.addEventListener("click", () => handleAccordionClick(item, body, index));
    });

    updateProgress();
  }

  function initializeOpenAccordion(item, body, index) {
    body.style.maxHeight = body.scrollHeight + "px";
    openedIndices.add(index);
    
    // Recalculate after images/videos load
    setTimeout(() => {
      if (item.classList.contains("open")) {
        body.style.maxHeight = body.scrollHeight + "px";
      }
    }, 500);
  }

  function handleAccordionClick(item, body, index) {
    const isOpen = item.classList.contains("open");

    // Close all accordions
    items.forEach((other, i) => {
      const otherBody = other.querySelector(".accordion-body");
      const otherHeader = other.querySelector(".accordion-header");
      if (!otherBody || !otherHeader) return;
      
      other.classList.remove("open");
      otherBody.style.maxHeight = null;
      otherHeader.setAttribute("aria-expanded", "false");
      openedIndices.delete(i);
      
      // Pause any videos in closed accordions
      pauseVideosInElement(otherBody);
    });

    // Toggle clicked accordion
    if (!isOpen) {
      item.classList.add("open");
      body.style.maxHeight = body.scrollHeight + "px";
      item.querySelector(".accordion-header").setAttribute("aria-expanded", "true");
      openedIndices.add(index);
      
      // Load lazy iframes
      loadLazyIframesInElement(body);
      
      // Recalculate height after potential iframe load
      setTimeout(() => {
        if (item.classList.contains("open")) {
          body.style.maxHeight = body.scrollHeight + "px";
        }
      }, 300);
    }

    updateProgress();
  }

  function pauseVideosInElement(element) {
    const iframes = element.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.src;
      if (src) {
        iframe.src = '';
        iframe.src = src; // Reload to stop video
      }
    });
  }

  function loadLazyIframesInElement(element) {
    const lazyIframes = element.querySelectorAll('iframe.lazy-iframe[data-src]');
    lazyIframes.forEach(iframe => {
      if (!iframe.src && iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
        iframe.classList.remove('lazy-iframe');
      }
    });
  }

  function updateProgress() {
    if (!progressFill || !progressPercent || !progressBar) return;

    const total = items.length;
    if (total === 0) return;

    const percent = Math.round((openedIndices.size / total) * 100);

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
    progressBar.setAttribute("aria-valuenow", String(percent));
  }

  function recalculateHeights() {
    // Recalculate heights for open accordions (used after language change)
    items.forEach((item) => {
      if (item.classList.contains("open")) {
        const body = item.querySelector(".accordion-body");
        if (body) {
          body.style.maxHeight = body.scrollHeight + "px";
        }
      }
    });
  }

  return { 
    init,
    recalculateHeights 
  };
})();

// ========================== PARALLAX (THROTTLED) ==========================
const ParallaxModule = (() => {
  let elements = [];
  let ticking = false;

  function init() {
    elements = document.querySelectorAll("[data-parallax]");
    
    if (!elements.length) return;

    window.addEventListener("scroll", requestTick);
    onScroll(); // Initial position
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }

  function onScroll() {
    const scrollY = window.scrollY;
    elements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
    ticking = false;
  }

  return { init };
})();

// ========================== BLUEPRINT STREAKS (MEMORY SAFE) ==========================
const BlueprintModule = (() => {
  let ground;
  let activeStreaks = 0;
  const MAX_STREAKS = 10;
  let intervalId;

  function init() {
    ground = document.getElementById("ground-bg");
    if (!ground) return;

    // Inject keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes streakMove {
        0%   { opacity: 0; transform: translateX(0); }
        20%  { opacity: 1; }
        80%  { opacity: 0.5; }
        100% { opacity: 0; transform: translateX(160vw); }
      }
    `;
    document.head.appendChild(style);

    // Start creating streaks
    intervalId = setInterval(addStreak, 2200);
  }

  function addStreak() {
    if (!ground || activeStreaks >= MAX_STREAKS) return;

    const streak = document.createElement("div");
    streak.className = "ground-streak";

    const width = Math.random() * 140 + 60;
    const top = Math.random() * 100;
    const duration = Math.random() * 3 + 3;

    streak.style.width = `${width}px`;
    streak.style.top = `${top}%`;
    streak.style.left = `-${width}px`;
    streak.style.animation = `streakMove ${duration}s linear forwards`;

    ground.appendChild(streak);
    activeStreaks++;

    setTimeout(() => {
      if (streak.parentNode) {
        streak.remove();
      }
      activeStreaks--;
    }, duration * 1000);
  }

  return { init };
})();

// ========================== LAZY LOAD IFRAMES ==========================
const LazyLoadModule = (() => {
  let observer;

  function init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all iframes immediately
      loadAllLazyIframes();
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          if (iframe.dataset.src && !iframe.src) {
            iframe.src = iframe.dataset.src;
            iframe.classList.remove('lazy-iframe');
            observer.unobserve(iframe);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Observe all lazy iframes
    const lazyIframes = document.querySelectorAll('iframe.lazy-iframe[data-src]');
    lazyIframes.forEach(iframe => observer.observe(iframe));
  }

  function loadAllLazyIframes() {
    const lazyIframes = document.querySelectorAll('iframe.lazy-iframe[data-src]');
    lazyIframes.forEach(iframe => {
      iframe.src = iframe.dataset.src;
      iframe.classList.remove('lazy-iframe');
    });
  }

  return { init };
})();
