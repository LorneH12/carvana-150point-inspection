// ============================================================
// LANGUAGE TOGGLE – affects ALL [data-lang] elements
// ============================================================
(function () {
  const langButtons = document.querySelectorAll("[data-lang-btn]");
  const langElements = document.querySelectorAll("[data-lang]");

  function setLanguage(lang) {
    // toggle button state
    langButtons.forEach((btn) => {
      const isActive = btn.getAttribute("data-lang-btn") === lang;
      btn.classList.toggle("active", isActive);
    });

    // show/hide all lang-tagged elements
    langElements.forEach((el) => {
      const elLang = el.getAttribute("data-lang");
      el.style.display = elLang === lang ? "" : "none";
    });

    document.documentElement.setAttribute("data-current-lang", lang);
  }

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang-btn");
      setLanguage(lang);
    });
  });

  // default to EN
  setLanguage("en");
})();

// ============================================================
// SIDEBAR TOGGLE – floats, shrinks/expands main content
// ============================================================
(function () {
  const sidebar = document.getElementById("courseSidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (!sidebar || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
})();

// ============================================================
// NAV BUTTONS – scroll to sections inside main content
// ============================================================
(function () {
  const navItems = document.querySelectorAll(".nav-item");
  const content = document.querySelector(".content");

  if (!content) return;

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetSelector = item.getAttribute("data-target");
      const target = document.querySelector(targetSelector);
      if (!target) return;

      navItems.forEach((n) => n.classList.remove("active"));
      item.classList.add("active");

      const top = target.offsetTop - 70; // clear header
      content.scrollTo({
        top,
        behavior: "smooth",
      });
    });
  });
})();

// ============================================================
// HERO CTA – scroll to first lesson section
// ============================================================
(function () {
  const btn = document.getElementById("btn-start-course");
  const content = document.querySelector(".content");
  const target = document.getElementById("section-welcome");

  if (!btn || !content || !target) return;

  btn.addEventListener("click", () => {
    const top = target.offsetTop - 70;
    content.scrollTo({ top, behavior: "smooth" });
  });
})();

// ============================================================
// PREMIUM ACCORDION LOGIC – Carvana Standard
// ============================================================
(function () {
  const accordion = document.getElementById("carvana-standard-accordion");
  if (!accordion) return;

  const items = Array.from(accordion.querySelectorAll(".accordion-item"));

  items.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    const body = item.querySelector(".accordion-body");
    if (!header || !body) return;

    // set initial open height
    if (item.classList.contains("open")) {
      body.style.maxHeight = body.scrollHeight + "px";
    }

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // close all
      items.forEach((other) => {
        const otherBody = other.querySelector(".accordion-body");
        if (!otherBody) return;
        other.classList.remove("open");
        otherBody.style.maxHeight = null;
      });

      // reopen if previously closed
      if (!isOpen) {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }

      updateProgress();
    });
  });

  // basic progress: % of accordion items opened at least once
  const openedSet = new Set();

  function updateProgress() {
    items.forEach((item, index) => {
      if (item.classList.contains("open")) {
        openedSet.add(index);
      }
    });

    const fill = document.getElementById("progressFill");
    const label = document.getElementById("progressPercent");
    if (!fill || !label) return;

    const total = items.length || 1;
    const percent = Math.round((openedSet.size / total) * 100);
    fill.style.width = percent + "%";
    label.textContent = percent + "%";
  }

  // initialize once
  updateProgress();
})();
