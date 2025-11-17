/* ==========================================================================
   MODULE 1 — LANGUAGE SWITCHING
   ========================================================================== */

const LanguageModule = (() => {
    const langButtons = document.querySelectorAll("[data-lang-btn]");
    const translatableElements = document.querySelectorAll("[data-lang]");

    function setLanguage(lang) {
        // Update button UI
        langButtons.forEach(btn => {
            const isActive = btn.dataset.langBtn === lang;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", isActive);
        });

        // Show the selected language text
        translatableElements.forEach(el => {
            const show = el.dataset.lang === lang;
            if (show) {
                el.hidden = false;
            } else {
                el.hidden = true;
            }
        });
    }

    // Click listeners
    langButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            setLanguage(btn.dataset.langBtn);
        });
    });

    // Default to English
    setLanguage("en");
})();



/* ==========================================================================
   MODULE 2 — SIDEBAR TOGGLE
   ========================================================================== */

const SidebarModule = (() => {

    const sidebar = document.getElementById("sidebar");
    const toggleButton = document.getElementById("sidebarToggle");

    toggleButton.addEventListener("click", () => {
        const isCollapsed = sidebar.classList.toggle("collapsed");

        // Accessibility
        toggleButton.setAttribute("aria-expanded", !isCollapsed);
    });

})();



/* ==========================================================================
   MODULE 3 — SMOOTH SCROLL NAVIGATION
   ========================================================================== */

const NavigationModule = (() => {
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetSelector = item.dataset.target;
            const target = document.querySelector(targetSelector);
            if (!target) return;

            // Set active item
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            // Smooth scroll
            const yOffset = -120; // adjust for floating bar
            const y = target.getBoundingClientRect().top + window.scrollY + yOffset;

            window.scrollTo({
                top: y,
                behavior: "smooth"
            });
        });
    });
})();



/* ==========================================================================
   MODULE 4 — ACCORDION + PROGRESS TRACKING
   ========================================================================== */

const AccordionModule = (() => {
    const accordionItems = document.querySelectorAll(".accordion-item");
    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");

    const openedSections = new Set();

    accordionItems.forEach((item, index) => {
        const header = item.querySelector(".accordion-header");
        const body = item.querySelector(".accordion-body");

        // If open on load
        if (item.classList.contains("open")) {
            body.style.maxHeight = body.scrollHeight + "px";
            openedSections.add(index);
        }

        header.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            // Close all other panels
            accordionItems.forEach((panel, i) => {
                if (i !== index) {
                    panel.classList.remove("open");
                    panel.querySelector(".accordion-body").style.maxHeight = null;
                }
            });

            // Toggle selected
            if (!isOpen) {
                item.classList.add("open");
                body.style.maxHeight = body.scrollHeight + "px";
                openedSections.add(index);
            } else {
                item.classList.remove("open");
                body.style.maxHeight = null;
                openedSections.delete(index);
            }

            updateProgress();
        });
    });

    function updateProgress() {
        const total = accordionItems.length;
        const completed = openedSections.size;
        const percent = Math.round((completed / total) * 100);

        progressFill.style.width = percent + "%";
        progressPercent.textContent = percent + "%";
    }

    updateProgress();

})();



/* ==========================================================================
   MODULE 5 — RANDOM BLUEPRINT STREAK ANIMATION
   ========================================================================== */

const BlueprintAnimation = (() => {
    const ground = document.getElementById("ground-bg");

    function spawnStreak() {
        const streak = document.createElement("div");
        streak.classList.add("ground-streak");

        const width = Math.random() * 120 + 40;
        const top = Math.random() * 100;
        const duration = Math.random() * 4 + 3;

        Object.assign(streak.style, {
            width: `${width}px`,
            top: `${top}%`,
            left: `-${width}px`,
            animation: `streakMove ${duration}s linear forwards`
        });

        ground.appendChild(streak);

        setTimeout(() => streak.remove(), duration * 1000);
    }

    // Spawn every 2–3 seconds
    setInterval(spawnStreak, 2000);

    // Inject keyframes
    const style = document.createElement("style");
    style.textContent = `
        @keyframes streakMove {
            0% { opacity: 0; transform: translateX(0); }
            25% { opacity: 1; }
            80% { opacity: 0.4; }
            100% { opacity: 0; transform: translateX(160vw); }
        }
    `;
    document.head.appendChild(style);
})();



/* ==========================================================================
   MODULE 6 — HERO IMAGE ADAPTIVE TEXT & RESPONSIVE SIZING
   ========================================================================== */

const HeroModule = (() => {
    const heroImage = document.querySelector(".hero-image");

    // Ensures proper scaling on mobile / ultra-wide
    function adjustHero() {
        if (!heroImage) return;

        const ratio = window.innerWidth / window.innerHeight;

        // Slight zoom for cinematic feel
        if (ratio > 1.8) {
            heroImage.style.objectFit = "cover";
        } else {
            heroImage.style.objectFit = "cover";
        }
    }

    window.addEventListener("resize", adjustHero);
    adjustHero();
})();



/* ==========================================================================
   END OF FILE
   ========================================================================== */
