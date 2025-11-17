/* ==========================================================================
   GLOBAL LANGUAGE TOGGLE (EN / ES)
   ==========================================================================
   All elements with [data-lang="en"] or [data-lang="es"] switch visibility.
   ========================================================================== */

(function () {
    const langButtons = document.querySelectorAll("[data-lang-btn]");
    const langElements = document.querySelectorAll("[data-lang]");

    function setLanguage(lang) {
        langButtons.forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.langBtn === lang);
        });

        langElements.forEach((el) => {
            el.style.display = el.dataset.lang === lang ? "" : "none";
        });

        document.documentElement.setAttribute("data-current-lang", lang);
    }

    langButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            setLanguage(btn.dataset.langBtn);
        });
    });

    setLanguage("en"); // default
})();

/* ==========================================================================
   SIDEBAR COLLAPSE / EXPAND
   ==========================================================================
   Sidebar floats. When collapsed → slides left. Main content auto-expands.
   ========================================================================== */

(function () {
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebarToggle");

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
    });
})();

/* ==========================================================================
   NAVIGATION BUTTONS → SMOOTH SCROLL TO SECTIONS
   ========================================================================== */

(function () {
    const navItems = document.querySelectorAll(".nav-item");
    const content = document.getElementById("content");

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            const target = document.querySelector(item.dataset.target);
            if (!target) return;

            navItems.forEach((n) => n.classList.remove("active"));
            item.classList.add("active");

            const yOffset = -80; // offset for floating header
            const top = target.getBoundingClientRect().top + window.scrollY + yOffset;

            window.scrollTo({ top, behavior: "smooth" });
        });
    });
})();

/* ==========================================================================
   ACCORDION BEHAVIOR (OPEN/CLOSE + PROGRESS)
   ==========================================================================
   Neon accordion with auto-height transitions and progress tracking.
   ========================================================================== */

(function () {
    const accItems = document.querySelectorAll(".accordion-item");
    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");
    const openedSet = new Set();

    accItems.forEach((item, index) => {
        const header = item.querySelector(".accordion-header");
        const body = item.querySelector(".accordion-body");

        // Pre-open first accordion
        if (item.classList.contains("open")) {
            body.style.maxHeight = body.scrollHeight + "px";
            openedSet.add(index);
        }

        header.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            // Close all
            accItems.forEach((other) => {
                other.classList.remove("open");
                const otherBody = other.querySelector(".accordion-body");
                otherBody.style.maxHeight = null;
            });

            // Reopen this one if it was closed
            if (!isOpen) {
                item.classList.add("open");
                body.style.maxHeight = body.scrollHeight + "px";
                openedSet.add(index);
            }

            updateProgress();
        });
    });

    function updateProgress() {
        const total = accItems.length;
        const percent = Math.round((openedSet.size / total) * 100);

        progressFill.style.width = percent + "%";
        progressPercent.textContent = percent + "%";
    }

    updateProgress(); // initial update
})();

/* ==========================================================================
   TRON ANIMATION ENGINE
   ==========================================================================
   - Ground streaks
   - Floating panel pulses
   - Separator glow spikes
   ==========================================================================
   Uses dynamically injected <div> streak elements on #ground-bg and
   animated shadows on .floating-panel & .separator.
   ========================================================================== */

(function () {
    const ground = document.getElementById("ground-bg");
    const panels = document.querySelectorAll(".floating-panel");
    const seps = document.querySelectorAll(".separator");

    /* --------------------------
       RANDOM GROUND STREAKS
       -------------------------- */
    function spawnGroundStreak() {
        const streak = document.createElement("div");
        streak.className = "ground-streak";

        const size = Math.random() * 80 + 40;
        const top = Math.random() * 100;
        const duration = Math.random() * 6 + 4;

        streak.style.position = "fixed";
        streak.style.left = "-120px";
        streak.style.top = `${top}%`;
        streak.style.width = `${size}px`;
        streak.style.height = "2px";
        streak.style.background = "rgba(0, 200, 255, 0.7)";
        streak.style.boxShadow = "0 0 20px rgba(0, 200, 255, 0.9)";
        streak.style.zIndex = -10;
        streak.style.opacity = "0";

        streak.style.animation = `streakMove ${duration}s linear forwards`;

        ground.appendChild(streak);

        setTimeout(() => streak.remove(), duration * 1000);
    }

    setInterval(spawnGroundStreak, 1600);

    /* --------------------------
       PANEL SOFT PULSE
       -------------------------- */
    function randomPanelPulse() {
        const panel = panels[Math.floor(Math.random() * panels.length)];
        if (!panel) return;

        panel.style.transition = "box-shadow 0.6s ease";
        panel.style.boxShadow = "0 12px 35px rgba(0, 200, 255, 0.45)";

        setTimeout(() => {
            panel.style.boxShadow = "0 12px 35px rgba(0, 200, 255, 0.2)";
        }, 600);
    }

    setInterval(randomPanelPulse, 4500);

    /* --------------------------
       SEPARATOR GLOW PULSE
       -------------------------- */
    function pulseSeparator() {
        const sep = seps[Math.floor(Math.random() * seps.length)];
        if (!sep) return;

        sep.style.transition = "filter 0.7s ease";
        sep.style.filter = "drop-shadow(0 0 35px rgba(0, 200, 255, 1))";

        setTimeout(() => {
            sep.style.filter = "drop-shadow(0 0 18px rgba(0, 200, 255, 0.6))";
        }, 700);
    }

    setInterval(pulseSeparator, 5200);

})();

/* ==========================================================================
   KEYFRAME INJECTION FOR JS ANIMATIONS (streaking)
   ========================================================================== */

(function injectKeyframes() {
    const style = document.createElement("style");
    style.innerHTML = `
        @keyframes streakMove {
            0% { opacity: 0; transform: translateX(-20%); }
            15% { opacity: 1; }
            85% { opacity: 0.6; }
            100% { opacity: 0; transform: translateX(120%); }
        }
    `;
    document.head.appendChild(style);
})();
