// Simple UI state for the pulse sequence
let menuClicked = false;
let langInteracted = false;
let scrollInteracted = false;
let accordionInteracted = false;

// ============================================================================
// DOM READY
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initLanguageToggle();
  initSidebarToggle();
  initNavScroll();
  initAccordionWithProgress();
  initScrollHintPulse();
});

// ============================================================================
// LANGUAGE TOGGLE (EN / ES / ZH) - uses translations.js
// ============================================================================
function initLanguageToggle() {
  const langButtons = document.querySelectorAll(".lang-btn");
  const html = document.documentElement;

  const htmlLangMap = {
    en: "en",
    es: "es",
    zh: "zh-Hans",
  };

  function applyTranslations(lang) {
    const allTranslations = window.translations;
    if (typeof allTranslations !== "object" || !allTranslations) return;

    const dict = allTranslations[lang] || allTranslations.en || {};
    const nodes = document.querySelectorAll("[data-i18n]");

    nodes.forEach((node) => {
      const key = node.getAttribute("data-i18n");
      const value = dict[key];
      if (typeof value === "string") {
        node.innerHTML = value;
      }
    });
  }

  function setLanguage(lang) {
    // Update active button
    langButtons.forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    // Update <html lang="...">
    html.lang = htmlLangMap[lang] || "en";

    // Apply translations
    applyTranslations(lang);
  }

  // Click handlers
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (!lang) return;

      setLanguage(lang);

      // First time interacting with language toggle
      if (!langInteracted) {
        langInteracted = true;
        // Stop any pulse on language buttons
        langButtons.forEach((b) => b.classList.remove("has-pulse"));

        // Start scroll hint pulse if not already scrolled
        const scrollHint = document.getElementById("scrollHint");
        if (scrollHint && !scrollInteracted) {
          scrollHint.classList.add("has-pulse");
        }
      }
    });
  });

  // Default language (start in Spanish)
  setLanguage("es");
}

// ============================================================================
// SIDEBAR TOGGLE (FLOATING SIDEBAR + MAIN CONTENT SHIFT)
// ============================================================================
function initSidebarToggle() {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (!sidebar || !toggleBtn) return;

  // Initial pulse on the menu button
  toggleBtn.classList.add("has-pulse");

  // INITIAL STATE:
  // - Desktop (width > 900): sidebar OPEN
  // - Mobile/tablet (width <= 900): sidebar CLOSED
  if (
    !body.classList.contains("sidebar-open") &&
    !body.classList.contains("sidebar-closed")
  ) {
    if (window.innerWidth <= 900) {
      body.classList.add("sidebar-closed");
      sidebar.classList.add("is-collapsed");
    } else {
      body.classList.add("sidebar-open");
      sidebar.classList.remove("is-collapsed");
    }
  }

  function toggleSidebar() {
    const isOpen =
      body.classList.contains("sidebar-open") &&
      !body.classList.contains("sidebar-closed");

    // First click on menu
    if (!menuClicked) {
      menuClicked = true;
      // Stop menu pulse
      toggleBtn.classList.remove("has-pulse");

      // Start Mandarin (中文) toggle pulse
      const mandarinBtn = document.querySelector('.lang-btn[data-lang="zh"]');
      if (mandarinBtn && !langInteracted) {
        mandarinBtn.classList.add("has-pulse");
      }
    }

    if (isOpen) {
      body.classList.add("sidebar-closed");
      body.classList.remove("sidebar-open");
      sidebar.classList.add("is-collapsed");
    } else {
      body.classList.remove("sidebar-closed");
      body.classList.add("sidebar-open");
      sidebar.classList.remove("is-collapsed");
    }
  }

  toggleBtn.addEventListener("click", toggleSidebar);

  // Close sidebar on small screens after navigation
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        body.classList.add("sidebar-closed");
        body.classList.remove("sidebar-open");
        sidebar.classList.add("is-collapsed");
      }
    });
  });
}

// ============================================================================
// SCROLL HINT PULSE (stops on first scroll, then starts "+" pulse)
// ============================================================================
function initScrollHintPulse() {
  const scrollHint = document.getElementById("scrollHint");
  if (!scrollHint) return;

  // Scroll hint will actually start pulsing when language is first used.
  // But if the user skips language and scrolls right away, we still want
  // to handle the stop + "+" sequence correctly.

  function handleScroll() {
    if (scrollInteracted) return;

    if (window.scrollY > 20) {
      scrollInteracted = true;

      // Stop and hide scroll hint
      scrollHint.classList.remove("has-pulse");
      scrollHint.classList.add("is-hidden");

      // Start "+" pulse on first accordion icon (if accordion not yet used)
      if (!accordionInteracted) {
        const firstIcon = document.querySelector(".accordion-item .accordion-icon");
        if (firstIcon) {
          firstIcon.classList.add("has-pulse");
        }
      }

      window.removeEventListener("scroll", handleScroll);
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
}

// ============================================================================
// SMOOTH SCROLL NAVIGATION
// ============================================================================
function initNavScroll() {
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  if (!navItems.length) return;

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.getAttribute("data-target");
      if (!targetSelector) return;

      const target = document.querySelector(targetSelector);
      if (!target) return;

      // Set active state on nav
      navItems.forEach((n) => n.classList.remove("is-active"));
      btn.classList.add("is-active");

      // Scroll with offset for top bar
      const offset = 90;
      const rect = target.getBoundingClientRect();
      const top = rect.top + window.scrollY - offset;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    });
  });
}

// ============================================================================
// ACCORDION + PROGRESS TRACKING
// ============================================================================
function initAccordionWithProgress() {
  const accordionItems = document.querySelectorAll(".accordion-item");
  const progressFill = document.getElementById("progressFill");
  const progressPercent = document.getElementById("progressPercent");

  if (!accordionItems.length) return;

  // Initialize max-heights for any pre-open items
  accordionItems.forEach((item) => {
    const body = item.querySelector(".accordion-body");
    if (!body) return;
    if (item.classList.contains("is-open")) {
      body.style.maxHeight = body.scrollHeight + "px";
    } else {
      body.style.maxHeight = null;
    }
  });

  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    const body = item.querySelector(".accordion-body");
    if (!header || !body) return;

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // First time they click any accordion header:
      if (!accordionInteracted) {
        accordionInteracted = true;
        // Stop "+" pulse on all icons
        const icons = document.querySelectorAll(".accordion-icon");
        icons.forEach((icon) => icon.classList.remove("has-pulse"));
      }

      // Close all items
      accordionItems.forEach((other) => {
        const otherBody = other.querySelector(".accordion-body");
        if (!otherBody) return;
        other.classList.remove("is-open");
        otherBody.style.maxHeight = null;
      });

      // Toggle this one
      if (!isOpen) {
        item.classList.add("is-open");
        body.style.maxHeight = body.scrollHeight + "px";
      } else {
        item.classList.remove("is-open");
        body.style.maxHeight = null;
      }

      updateProgress();
    });
  });

  function updateProgress() {
    if (!progressFill || !progressPercent) return;

    const total = accordionItems.length;
    if (!total) return;

    const openCount = Array.from(accordionItems).filter((item) =>
      item.classList.contains("is-open")
    ).length;

    const percent = Math.round((openCount / total) * 100);

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
  }

  // Update on load
  updateProgress();

  // When window resizes, recalc heights for open items
  window.addEventListener("resize", () => {
    accordionItems.forEach((item) => {
      const body = item.querySelector(".accordion-body");
      if (!body) return;
      if (item.classList.contains("is-open")) {
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
}
