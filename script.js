// script.js
// Core interactions for the Carvana 150-Point Inspection course:
// - Language toggle (EN / ES)
// - Smooth scrolling with dynamic header offset
// - Sidebar active state
// - Scroll progress
// - Scroll reveal (with reduced-motion + fallback)
// - Accordions
// - "Back to top" button

document.addEventListener("DOMContentLoaded", () => {
  const sections = Array.from(document.querySelectorAll(".course-section"));
  const navItems = Array.from(document.querySelectorAll(".nav-item"));
  const progressFill = document.querySelector(".progress-fill");
  const progressPercent = document.querySelector(".progress-percent");
  const backToTopBtn = document.getElementById("back-to-top");
  const startBtn = document.getElementById("btn-start-course");
  const ghostButtons = Array.from(document.querySelectorAll(".btn-ghost"));

  const langButtons = Array.from(document.querySelectorAll("[data-lang-select]"));
  const localizedEls = Array.from(document.querySelectorAll("[data-lang]"));
  const revealables = Array.from(document.querySelectorAll(".reveal"));

  const prefersReducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* -------------------------------------------
   * LANGUAGE HANDLING (EN / ES)
   * ----------------------------------------- */

  function applyLanguage(lang) {
    // Update body class if needed for future styling
    document.body.classList.remove("lang-en", "lang-es");
    document.body.classList.add(`lang-${lang}`);

    // Toggle active state on language buttons
    langButtons.forEach((btn) => {
      const btnLang = btn.getAttribute("data-lang-select");
      btn.classList.toggle("active", btnLang === lang);
    });

    // Show matching localized elements, hide the rest
    localizedEls.forEach((el) => {
      const elLang = el.getAttribute("data-lang");
      if (elLang === lang) {
        const displayType = el.getAttribute("data-display") || "block";
        el.style.display = displayType;
      } else {
        el.style.display = "none";
      }
    });
  }

  // Attach language toggle handlers
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetLang = btn.getAttribute("data-lang-select") || "en";
      applyLanguage(targetLang);
    });
  });

  // Initial language
  applyLanguage("en");

  /* -------------------------------------------
   * SMOOTH SCROLLING (with dynamic header offset)
   * ----------------------------------------- */

  function getHeaderOffset() {
    const header = document.querySelector(".global-header");
    if (!header) return 0;
    return header.offsetHeight || 0;
  }

  function scrollToSelector(selector) {
    const target = document.querySelector(selector);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const offset = getHeaderOffset() + 12; // small spacing below header

    const finalTop = rect.top + scrollTop - offset;

    const behavior = prefersReducedMotion ? "auto" : "smooth";

    window.scrollTo({
      top: finalTop,
      behavior,
    });
  }

  /* Sidebar navigation clicks */
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.getAttribute("data-target");
      if (!targetSelector) return;
      scrollToSelector(targetSelector);
    });
  });

  /* Hero primary CTA */
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      scrollToSelector("#section-lesson1");
    });
  }

  /* Ghost buttons with data-target attribute */
  ghostButtons.forEach((btn) => {
    const targetSelector = btn.getAttribute("data-target");
    if (!targetSelector) return;

    btn.addEventListener("click", () => {
      scrollToSelector(targetSelector);
    });
  });

  /* -------------------------------------------
   * SCROLL-BASED ACTIVE STATE & PROGRESS
   * ----------------------------------------- */

  // Progress bar update
  function updateProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    if (!progressFill || !progressPercent) return;

    if (docHeight <= 0) {
      progressFill.style.width = "0%";
      progressPercent.textContent = "0%";
      return;
    }

    const ratio = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    const percent = Math.round(ratio * 100);

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
  }

  // Throttle scroll events for performance
  let scrollTicking = false;
  function onScroll() {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        updateProgress();
        scrollTicking = false;
      });
    }
  }

  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* -------------------------------------------
   * INTERSECTION OBSERVER: ACTIVE SECTION
   * + SCROLL REVEAL (with fallback)
   * ----------------------------------------- */

  function setActiveNavForSection(sectionId) {
    const selector = `#${sectionId}`;
    navItems.forEach((btn) => {
      const target = btn.getAttribute("data-target");
      btn.classList.toggle("active", target === selector);
    });
  }

  // If IntersectionObserver is supported
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target;
            if (section && section.id) {
              setActiveNavForSection(section.id);
            }
          }
        });
      },
      {
        threshold: 0.35,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    // Reveal observer
    if (!prefersReducedMotion) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
            }
          });
        },
        {
          threshold: 0.25,
        }
      );

      revealables.forEach((el) => revealObserver.observe(el));
    } else {
      // If user prefers reduced motion, show content immediately
      revealables.forEach((el) => el.classList.add("in-view"));
    }
  } else {
    // Fallback for older browsers: highlight based on scroll position
    function fallbackActiveSection() {
      let currentSectionId = null;
      const offset = getHeaderOffset() + 20;
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop;

      sections.forEach((section) => {
        const top = section.offsetTop - offset;
        const bottom = top + section.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          currentSectionId = section.id;
        }
      });

      if (currentSectionId) {
        setActiveNavForSection(currentSectionId);
      }
    }

    window.addEventListener("scroll", () => {
      fallbackActiveSection();
      if (!prefersReducedMotion) {
        revealables.forEach((el) => el.classList.add("in-view"));
      } else {
        revealables.forEach((el) => el.classList.add("in-view"));
      }
    });

    fallbackActiveSection();
  }

  /* -------------------------------------------
   * ACCORDION LOGIC
   * ----------------------------------------- */

  const accordionItems = Array.from(document.querySelectorAll(".accordion-item"));

  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    if (!header) return;

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close all accordions on small screens for simplicity,
      // but keep behavior unified across devices.
      accordionItems.forEach((i) => i.classList.remove("open"));

      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });

  /* -------------------------------------------
   * BACK TO TOP BUTTON
   * ----------------------------------------- */

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      const behavior = prefersReducedMotion ? "auto" : "smooth";
      window.scrollTo({ top: 0, behavior });
    });
  }
});
