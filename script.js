// script.js
document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------------------------------------
     ELEMENT QUERIES
  --------------------------------------------------------- */
  const body = document.body;

  const sections = Array.from(document.querySelectorAll(".course-section"));
  const navItems = Array.from(document.querySelectorAll(".nav-item"));

  const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
  const localizedEls = Array.from(document.querySelectorAll("[data-lang]"));

  const sidebar = document.querySelector(".sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");

  const settingsToggle = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const lockToggle = document.getElementById("lock-toggle");
  const resetBtn = document.getElementById("reset-progress");

  const progressFill = document.querySelector(".progress-fill");
  const progressPercent = document.querySelector(".progress-percent");

  const startBtn = document.getElementById("btn-start-course");
  const ghostButtons = Array.from(document.querySelectorAll(".btn-ghost"));

  const quizChoices = Array.from(document.querySelectorAll(".quiz-choice"));

  const finalSection = document.getElementById("final-assessment");
  const courseCompleteSection = document.getElementById("course-complete");
  const restartBtn = document.getElementById("restart-course");

  const prefersReducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  // Number of lessons (based on data-lesson-id, 0..N-1)
  const lessonIds = sections
    .map((s) => parseInt(s.getAttribute("data-lesson-id"), 10))
    .filter((n) => !isNaN(n));
  const maxLessonId = lessonIds.length ? Math.max(...lessonIds) : 0;
  const totalLessons = maxLessonId + 1; // includes overview + final if marked

  /* ---------------------------------------------------------
     STATE & LOCALSTORAGE
  --------------------------------------------------------- */

  const STORAGE_KEY = "carvana150_progress";

  const defaultState = {
    lockEnabled: false,
    completedLessons: {}, // lessonId: true
  };

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      const parsed = JSON.parse(raw);
      return {
        lockEnabled:
          typeof parsed.lockEnabled === "boolean"
            ? parsed.lockEnabled
            : defaultState.lockEnabled,
        completedLessons: parsed.completedLessons || {},
      };
    } catch (e) {
      return { ...defaultState };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }

  function resetState() {
    state = { ...defaultState };
    saveState();
    // Quick reset: reload for simplicity
    window.location.reload();
  }

  /* ---------------------------------------------------------
     LANGUAGE LOGIC
  --------------------------------------------------------- */

  function applyLanguage(lang) {
    body.classList.remove("lang-en", "lang-es");
    body.classList.add(`lang-${lang}`);

    langButtons.forEach((btn) => {
      const btnLang = btn.getAttribute("data-lang-select");
      btn.classList.toggle("active", btnLang === lang);
    });

    localizedEls.forEach((el) => {
      const elLang = el.getAttribute("data-lang");
      el.style.display = elLang === lang ? "" : "none";
    });
  }

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang-select") || "en";
      applyLanguage(lang);
    });
  });

  // Default language EN
  applyLanguage("en");

  /* ---------------------------------------------------------
     SMOOTH SCROLLING + NAV BEHAVIOR
  --------------------------------------------------------- */

  function getHeaderOffset() {
    const header = document.querySelector(".global-header");
    return header ? header.offsetHeight : 0;
  }

  function scrollToSelector(selector) {
    const target = document.querySelector(selector);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
    const offset = getHeaderOffset() + 10;
    const finalTop = rect.top + scrollTop - offset;
    const behavior = prefersReducedMotion ? "auto" : "smooth";

    window.scrollTo({
      top: finalTop,
      behavior,
    });
  }

  function canNavigateToLesson(targetLessonId) {
    if (!state.lockEnabled) return true;
    // When lock is on: only allow lessons up to highestCompleted+1
    const completedIds = Object.keys(state.completedLessons)
      .map((k) => parseInt(k, 10))
      .filter((n) => !isNaN(n));
    const highestCompleted = completedIds.length
      ? Math.max(...completedIds)
      : 0;
    const maxAllowed = highestCompleted + 1;
    return targetLessonId <= maxAllowed;
  }

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.getAttribute("data-target");
      const lessonId = parseInt(btn.getAttribute("data-lesson"), 10);

      if (!targetSelector) return;
      if (!isNaN(lessonId) && !canNavigateToLesson(lessonId)) {
        // locked
        return;
      }

      scrollToSelector(targetSelector);
    });
  });

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      scrollToSelector("#section-lesson1");
    });
  }

  ghostButtons.forEach((btn) => {
    const target = btn.getAttribute("data-target");
    if (!target) return;
    btn.addEventListener("click", () => scrollToSelector(target));
  });

  /* ---------------------------------------------------------
     SIDEBAR COLLAPSE
  --------------------------------------------------------- */

  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  /* ---------------------------------------------------------
     SETTINGS PANEL (⚙️) + LOCK TOGGLE + RESET
  --------------------------------------------------------- */

  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener("click", () => {
      settingsPanel.classList.toggle("open");
    });
  }

  if (lockToggle) {
    // Initialize from state
    lockToggle.checked = !!state.lockEnabled;

    lockToggle.addEventListener("change", () => {
      state.lockEnabled = lockToggle.checked;
      saveState();
      applyLockState();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetState);
  }

  /* ---------------------------------------------------------
     PROGRESS & LESSON COMPLETION
  --------------------------------------------------------- */

  function markLessonCompleted(lessonId) {
    if (isNaN(lessonId)) return;
    if (state.completedLessons[lessonId]) return; // already done

    state.completedLessons[lessonId] = true;
    saveState();
    updateProgressUI();
    applyLockState();
    checkForCourseCompletion();
  }

  function updateProgressUI() {
    // Completed lessons ratio
    const completedIds = Object.keys(state.completedLessons)
      .map((k) => parseInt(k, 10))
      .filter((n) => !isNaN(n));
    const completedCount = completedIds.length;

    const ratio =
      totalLessons > 0 ? Math.min(completedCount / totalLessons, 1) : 0;
    const percent = Math.round(ratio * 100);

    if (progressFill) progressFill.style.width = percent + "%";
    if (progressPercent) progressPercent.textContent = percent + "%";

    // Update nav statuses
    navItems.forEach((item) => {
      const lessonId = parseInt(item.getAttribute("data-lesson"), 10);
      const statusSpan = item.querySelector(".nav-status");
      if (isNaN(lessonId) || !statusSpan) return;

      if (state.completedLessons[lessonId]) {
        statusSpan.textContent = "✓";
      } else {
        statusSpan.textContent = "";
      }
    });
  }

  function applyLockState() {
    navItems.forEach((item) => {
      const lessonId = parseInt(item.getAttribute("data-lesson"), 10);
      if (isNaN(lessonId)) return;

      if (!state.lockEnabled) {
        item.classList.remove("locked");
      } else {
        const completedIds = Object.keys(state.completedLessons)
          .map((k) => parseInt(k, 10))
          .filter((n) => !isNaN(n));
        const highestCompleted = completedIds.length
          ? Math.max(...completedIds)
          : 0;
        const maxAllowed = highestCompleted + 1;

        if (lessonId > maxAllowed) {
          item.classList.add("locked");
        } else {
          item.classList.remove("locked");
        }
      }
    });
  }

  function checkForCourseCompletion() {
    // Simple version: course complete when all lessons are completed
    const allCompleted = lessonIds.every(
      (id) => state.completedLessons[id]
    );
    if (!allCompleted) return;

    if (courseCompleteSection) {
      sections.forEach((s) => {
        if (s !== courseCompleteSection) s.style.display = "none";
      });
      courseCompleteSection.style.display = "block";
      scrollToSelector("#course-complete");
    }
  }

  // Initialize progress UI & lock state
  updateProgressUI();
  applyLockState();

  /* ---------------------------------------------------------
     RESTART COURSE
  --------------------------------------------------------- */

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      resetState();
    });
  }

  /* ---------------------------------------------------------
     INTERSECTION OBSERVER: ACTIVE NAV + SCROLL COMPLETION + REVEAL
  --------------------------------------------------------- */

  function setActiveNavForSection(sectionId) {
    const selector = `#${sectionId}`;
    navItems.forEach((btn) => {
      const target = btn.getAttribute("data-target");
      btn.classList.toggle("active", target === selector);
    });
  }

  const revealables = Array.from(document.querySelectorAll(".reveal"));

  if ("IntersectionObserver" in window) {
    // Active nav + scroll-based completion
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target;
            if (section && section.id) {
              setActiveNavForSection(section.id);

              const lessonId = parseInt(
                section.getAttribute("data-lesson-id"),
                10
              );
              // Mark some lessons complete on scroll (overview, lesson 3, final)
              if (!isNaN(lessonId)) {
                // Only auto-complete if no quiz block inside
                const hasQuiz = section.querySelector(".block-quiz");
                if (!hasQuiz) {
                  markLessonCompleted(lessonId);
                }
              }
            }
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    // Reveal blocks
    if (!prefersReducedMotion) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
            }
          });
        },
        { threshold: 0.2 }
      );

      revealables.forEach((el) => revealObserver.observe(el));
    } else {
      revealables.forEach((el) => el.classList.add("in-view"));
    }
  } else {
    // Fallback if IntersectionObserver not supported
    window.addEventListener("scroll", () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const offset = getHeaderOffset() + 20;

      sections.forEach((section) => {
        const top = section.offsetTop - offset;
        const bottom = top + section.offsetHeight;
        if (scrollTop >= top && scrollTop < bottom) {
          setActiveNavForSection(section.id);
        }
      });

      revealables.forEach((el) => el.classList.add("in-view"));
    });
  }

  /* ---------------------------------------------------------
     QUIZ LOGIC (ALL QUIZ BLOCKS)
  --------------------------------------------------------- */

  quizChoices.forEach((choice) => {
    choice.addEventListener("click", () => {
      const quizBlock = choice.closest(".block-quiz");
      if (!quizBlock) return;

      const choices = Array.from(
        quizBlock.querySelectorAll(".quiz-choice")
      );
      const feedbackCorrect = quizBlock.querySelector(".quiz-correct");
      const feedbackIncorrect = quizBlock.querySelector(".quiz-incorrect");

      // Reset states
      choices.forEach((btn) =>
        btn.classList.remove("correct", "incorrect")
      );
      if (feedbackCorrect) feedbackCorrect.style.display = "none";
      if (feedbackIncorrect) feedbackIncorrect.style.display = "none";

      const isCorrect = choice.getAttribute("data-correct") === "true";

      if (isCorrect) {
        choice.classList.add("correct");
        if (feedbackCorrect) feedbackCorrect.style.display = "block";

        // Mark parent lesson complete
        const section = choice.closest(".course-section");
        if (section) {
          const lessonId = parseInt(
            section.getAttribute("data-lesson-id"),
            10
          );
          if (!isNaN(lessonId)) {
            markLessonCompleted(lessonId);
          }
        }
      } else {
        choice.classList.add("incorrect");
        if (feedbackIncorrect) feedbackIncorrect.style.display = "block";
      }
    });
  });
});
