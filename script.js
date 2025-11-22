// ============================================================================
// CONFIG
// ============================================================================

const ANALYTICS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxOutoyjQ8fGH60LFT3wFqYtLZY06py3zdzOpqBf4AK3GdHvrbsIFP_XLCzlwrTHrA4/exec";

let analyticsSession = {
  sessionId: null,
  startedAt: null,
};

let analyticsFlags = {
  esDefaultRecorded: false,
  scrolledRecorded: false,
  videoPlayed: {},
  accordionClicked: {},
  section1Recorded: false,
  section2Recorded: false,
  section3Recorded: false,
};

let pulseState = {
  menuDone: false,
  langDone: false,
  scrollDone: false,
  plusDone: false,
};

// ============================================================================
// DOM READY
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initAnalyticsSession();
  initLanguageToggle();
  initSidebarToggle();
  initNavScroll();
  initAccordionWithProgress();
  initVideoTracking();
  initScrollTracking();
  initPulses();
});

// ============================================================================
// ANALYTICS
// ============================================================================
function initAnalyticsSession() {
  try {
    const storedId = sessionStorage.getItem("carvanaSessionId");
    const storedStartedAt = sessionStorage.getItem("carvanaSessionStartedAt");

    if (storedId && storedStartedAt) {
      analyticsSession.sessionId = storedId;
      analyticsSession.startedAt = storedStartedAt;
    } else {
      const sessionId =
        "cvn-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 8);
      const startedAt = new Date().toISOString();
      analyticsSession.sessionId = sessionId;
      analyticsSession.startedAt = startedAt;

      sessionStorage.setItem("carvanaSessionId", sessionId);
      sessionStorage.setItem("carvanaSessionStartedAt", startedAt);
    }

    trackEvent("accessed_site");
  } catch (err) {
    console.warn("Analytics session init failed:", err);
  }
}

function trackEvent(eventType, meta = {}) {
  if (!ANALYTICS_ENDPOINT || !eventType) return;
  if (!analyticsSession.sessionId || !analyticsSession.startedAt) return;

  const payload = {
    sessionId: analyticsSession.sessionId,
    startedAt: analyticsSession.startedAt,
    eventType,
    meta,
    ts: new Date().toISOString(),
  };

  try {
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    } else {
      fetch(ANALYTICS_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("trackEvent error:", err);
  }
}

// ============================================================================
// LANGUAGE TOGGLE (EN / ES / ZH) - uses window.translations
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
    const dict =
      (window.translations && window.translations[lang]) ||
      (window.translations && window.translations.en) ||
      {};

    const nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach((node) => {
      const key = node.getAttribute("data-i18n");
      const value = dict[key];
      if (typeof value === "string") {
        node.innerHTML = value;
      }
    });
  }

  function setLanguage(lang, opts = {}) {
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

    // Analytics
    if (!opts.silent) {
      trackEvent("clicked_any_language_toggle", { lang });
      if (lang === "en") {
        trackEvent("language_en_clicked");
      } else if (lang === "es") {
        trackEvent("language_es_clicked");
      } else if (lang === "zh") {
        trackEvent("language_zh_clicked");
      }
    }

    // Record that ES was the default starting language only once
    if (lang === "es" && !analyticsFlags.esDefaultRecorded && opts.isDefault) {
      analyticsFlags.esDefaultRecorded = true;
      trackEvent("language_es_default");
    }
  }

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (!lang) return;
      setLanguage(lang);

      // Pulse chain: stop lang pulse, start scroll pulse
      const langToggle = document.querySelector(".lang-toggle");
      const scrollHint = document.getElementById("scrollHint");
      if (langToggle && !pulseState.langDone) {
        langToggle.classList.remove("attention-pulse");
        pulseState.langDone = true;

        if (scrollHint && !pulseState.scrollDone) {
          scrollHint.classList.add("attention-pulse", "is-visible");
        }
      }
    });
  });

  // Default language (start in Spanish)
  setLanguage("es", { silent: true, isDefault: true });
}

// ============================================================================
// SIDEBAR TOGGLE (FLOATING SIDEBAR + MAIN CONTENT SHIFT)
// ============================================================================
function initSidebarToggle() {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (!sidebar || !toggleBtn) return;

  // Ensure body starts as "open"
  if (
    !body.classList.contains("sidebar-open") &&
    !body.classList.contains("sidebar-closed")
  ) {
    body.classList.add("sidebar-open");
  }

  function toggleSidebar() {
    const isOpen =
      body.classList.contains("sidebar-open") &&
      !body.classList.contains("sidebar-closed");

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

  toggleBtn.addEventListener("click", () => {
    toggleSidebar();
    trackEvent("clicked_menu");

    // Stop menu pulse, start language toggle pulse
    const langToggle = document.querySelector(".lang-toggle");
    if (!pulseState.menuDone) {
      toggleBtn.classList.remove("attention-pulse");
      pulseState.menuDone = true;

      if (langToggle && !pulseState.langDone) {
        langToggle.classList.add("attention-pulse");
      }
    }
  });

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
  const accordionIcons = document.querySelectorAll(".accordion-icon");

  if (!accordionItems.length) return;

  // Give plus icons a soft pulse initially (will be triggered later by scroll)
  accordionIcons.forEach((icon) => {
    icon.classList.remove("attention-pulse-soft");
  });

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
      const index = header.getAttribute("data-accordion-index");

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

      // Analytics: which accordion
      if (index && !analyticsFlags.accordionClicked[index]) {
        analyticsFlags.accordionClicked[index] = true;
        trackEvent(`accordion${index}_clicked`);
        checkSectionCompletionFromAccordions();
      }

      // Stop plus pulses after first click
      if (!pulseState.plusDone) {
        const icons = document.querySelectorAll(".accordion-icon");
        icons.forEach((ic) => ic.classList.remove("attention-pulse-soft"));
        pulseState.plusDone = true;
      }
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

// Check if all 4 accordions have been clicked at least once
function checkSectionCompletionFromAccordions() {
  if (analyticsFlags.section1Recorded) return;
  const allClicked = [1, 2, 3, 4].every(
    (idx) => analyticsFlags.accordionClicked[idx]
  );
  if (allClicked) {
    analyticsFlags.section1Recorded = true;
    trackEvent("section1_completed");
  }
}

// ============================================================================
// VIDEO TRACKING
// ============================================================================
function initVideoTracking() {
  const videoFrames = document.querySelectorAll("[data-track-video]");
  if (!videoFrames.length) return;

  videoFrames.forEach((frame) => {
    const key = frame.getAttribute("data-track-video");
    if (!key) return;

    frame.addEventListener("click", () => {
      if (analyticsFlags.videoPlayed[key]) return;
      analyticsFlags.videoPlayed[key] = true;

      if (key === "welcome") {
        trackEvent("played_video_welcome");
      } else if (key === "flow") {
        trackEvent("played_video_flow");
        // Treat flow video as section 2 completion
        if (!analyticsFlags.section2Recorded) {
          analyticsFlags.section2Recorded = true;
          trackEvent("section2_completed");
        }
      } else if (key === "quality") {
        trackEvent("played_video_quality");
        // Treat quality video as section 3 completion
        if (!analyticsFlags.section3Recorded) {
          analyticsFlags.section3Recorded = true;
          trackEvent("section3_completed");
        }
      } else if (key === "cleanliness") {
        trackEvent("played_video_cleanliness");
      }
    });
  });
}

// ============================================================================
// SCROLL TRACKING + PULSE CHAIN
// ============================================================================
function initScrollTracking() {
  const scrollHint = document.getElementById("scrollHint");

  let hasScrolled = false;

  function onScroll() {
    if (!hasScrolled && window.scrollY > 40) {
      hasScrolled = true;

      if (!analyticsFlags.scrolledRecorded) {
        analyticsFlags.scrolledRecorded = true;
        trackEvent("scrolled");
      }

      // Stop scroll pulse, hide hint, start plus pulses
      if (scrollHint && !pulseState.scrollDone) {
        scrollHint.classList.remove("attention-pulse");
        scrollHint.classList.add("is-visible");
        setTimeout(() => {
          scrollHint.classList.remove("is-visible");
        }, 600);

        pulseState.scrollDone = true;

        if (!pulseState.plusDone) {
          const icons = document.querySelectorAll(".accordion-icon");
          icons.forEach((icon) =>
            icon.classList.add("attention-pulse-soft")
          );
        }
      }

      window.removeEventListener("scroll", onScroll);
    }
  }

  window.addEventListener("scroll", onScroll);
}

// ============================================================================
// INITIAL PULSES (MENU STARTS FIRST)
// ============================================================================
function initPulses() {
  const menuBtn = document.getElementById("sidebarToggle");
  if (menuBtn) {
    menuBtn.classList.add("attention-pulse");
  }
}
