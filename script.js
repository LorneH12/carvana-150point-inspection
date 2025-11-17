/* ==========================================================================
   MODULE 1 — LANGUAGE SWITCHING
   ========================================================================== */
const LanguageModule = (() => {
    const langButtons = document.querySelectorAll("[data-lang-btn]");
    const langElements = document.querySelectorAll("[data-lang]");

    function applyLanguage(lang) {
        // Update active button
        langButtons.forEach((btn) => {
            const isActive = btn.dataset.langBtn === lang;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", isActive);
        });

        // Show correct content
        langElements.forEach((el) => {
            el.hidden = el.dataset.lang !== lang;
        });
    }

    // Set up listeners
    langButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            applyLanguage(btn.dataset.langBtn);
        });
    });

    // Default
    applyLanguage("en");
})();



/* ==========================================================================
   MODULE 2 — SIDEBAR TOGGLE
   ========================================================================== */
const SidebarModule = (() => {
    const sidebar = document.getElementById("sidebar");
    const toggleButton = document.getElementById("sidebarToggle");
    const content = document.getElementById("content");

    toggleButton.addEventListener("click", () => {
        const collapsed = sidebar.classList.toggle("collapsed");

        toggleButton.setAttribute("aria-expanded", collapsed);
        
        // Adjust content area (CSS already handles this)
    });
})();



/* ==========================================================================
   MODULE 3 — SMOOTH SCROLL NAVIGATION
   ========================================================================== */
const NavigationModule = (() => {
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            const targetSelector = item.dataset.target;
            const targetElement = document.querySelector(targetSelector);
            if (!targetElement) return;

            navItems.forEach((n) => n.classList.remove("active"));
            item.classList.add("active");

            const headerOffset = 130; // floating top bar
            const y = targetElement.getBoundingClientRect().top + window.scrollY - headerOffset;

            window.scrollTo({
                top: y,
                behavior: "smooth",
            });
        });
    });
})();



/* ==========================================================================
   MODULE 4 — ACCORDION + PROGRESS TRACKING
   ========================================================================== */
const AccordionModule = (() => {
    const items = document.querySelectorAll(".accordion-item");
    const progressFill = document.getElementById("progressFill");
    const progressPercent = document.getElementById("progressPercent");

    const opened = new Set();

    items.forEach((item, index) => {
        const header = item.querySelector(".accordion-header");
        const body = item.querySelector(".accordion-body");

        // Default open
        if (item.classList.contains("open")) {
            opened.add(index);
            body.style.maxHeight = body.scrollHeight + "px";
        }

        header.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            // Close all others
            items.forEach((other, i) => {
                if (i !== index) {
                    other.classList.remove("open");
                    other.querySelector(".accordion-body").style.maxHeight = null;
                    opened.delete(i);
                }
            });

            // Toggle clicked one
            if (!isOpen) {
                item.classList.add("open");
                body.style.maxHeight = body.scrollHeight + "px";
                opened.add(index);
            } else {
                item.classList.remove("open");
                body.style.maxHeight = null;
                opened.delete(index);
            }

            updateProgress();
        });
    });

    function updateProgress() {
        const total = items.length;
        const percent = Math.round((opened.size / total) * 100);

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

    function addStreak() {
        const streak = document.createElement("div");
        streak.className = "ground-streak";

        const size = Math.floor(Math.random() * 120 + 60);
        const top = Math.random() * 100;
        const duration = Math.random() * 3 + 2;

        streak.style.width = `${size}px`;
        streak.style.top = `${top}%`;
        streak.style.left = `-${size}px`;
        streak.style.animation = `streakMove ${duration}s linear forwards`;

        ground.appendChild(streak);

        setTimeout(() => streak.remove(), duration * 1000);
    }

    setInterval(addStreak, 2200);

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
})();



/* ==========================================================================
   MODULE 6 — HERO RESPONSIVE behavior
   ========================================================================== */
const HeroModule = (() => {
    const heroImg = document.querySelector(".hero-image");

    function adjustHero() {
        if (!heroImg) return;
        heroImg.style.objectFit = "cover";
    }

    window.addEventListener("resize", adjustHero);
    adjustHero();
})();
