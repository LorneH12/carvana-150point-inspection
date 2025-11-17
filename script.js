// ========================== LANGUAGE / I18N ==========================
const LanguageModule = (() => {
  let currentLang = "en";

  const buttons = document.querySelectorAll("[data-lang-btn]");
  const i18nEls = document.querySelectorAll("[data-i18n]");

  function applyTranslations() {
    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      const dict = translations[currentLang] || translations.en;
      if (!dict || !dict[key]) return;
      el.innerHTML = dict[key];
    });
  }

  function setLanguage(lang) {
    currentLang = lang;

    buttons.forEach((btn) => {
      const isActive = btn.dataset.langBtn === lang;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive);
    });

    applyTranslations();
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.langBtn);
    });
  });

  // Initialize
  setLanguage("en");

  return {
    get current() {
      return currentLang;
    },
    refresh: applyTranslations
  };
})();

// ========================== SIDEBAR ==========================
const SidebarModule = (() => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  toggleBtn.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("sidebar-open");
    toggleBtn.setAttribute("aria-expanded", isOpen);
  });
})();

// ========================== NAVIGATION (SMOOTH SCROLL) ==========================
const NavigationModule = (() => {
  const items = document.querySelectorAll(".nav-item");

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const targetId = item.dataset.target;
      const target = document.querySelector(targetId);
      if (!target) return;

      items.forEach((n) => n.classList.remove("active"));
      item.classList.add("active");

      const topOffset = 110; // height of header + glow line
      const y =
        target.getBoundingClientRect().top + window.scrollY - topOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    });
  });
})();

// ========================== ACCORDION + PROGRESS ==========================
const AccordionModule = (() => {
  const items = document.querySelectorAll(".accordion-item");
  const progressFill = document.getElementById("progressFill");
  const progressPercent = document.getElementById("progressPercent");
  const openedIndices = new Set();

  items.forEach((item, index) => {
    const header = item.querySelector(".accordion-header");
    const body = item.querySelector(".accordion-body");

    // Initialize open state
    if (item.classList.contains("open")) {
      body.style.maxHeight = body.scrollHeight + "px";
      openedIndices.add(index);
    }

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close others
      items.forEach((other, i) => {
        if (i !== index) {
          other.classList.remove("open");
          const otherBody = other.querySelector(".accordion-body");
          otherBody.style.maxHeight = null;
          openedIndices.delete(i);
        }
      });

      // Toggle this one
      if (!isOpen) {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
        openedIndices.add(index);
      } else {
        item.classList.remove("open");
        body.style.maxHeight = null;
        openedIndices.delete(index);
      }

      updateProgress();
    });
  });

  function updateProgress() {
    const total = items.length;
    const percent = total === 0 ? 0 : Math.round((openedIndices.size / total) * 100);
    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
  }

  updateProgress();
})();

// ========================== PARALLAX ==========================
const ParallaxModule = (() => {
  const elements = document.querySelectorAll("[data-parallax]");

  function onScroll() {
    const scrollY = window.scrollY;
    elements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }

  window.addEventListener("scroll", onScroll);
  onScroll();
})();

// ========================== BLUEPRINT STREAKS ==========================
const BlueprintModule = (() => {
  const ground = document.getElementById("ground-bg");

  function addStreak() {
    if (!ground) return;
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

    setTimeout(() => streak.remove(), duration * 1000);
  }

  // inject keyframes
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

  setInterval(addStreak, 2200);
})();
