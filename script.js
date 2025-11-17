/* ==========================================================================
   TRAINING APP — MODULAR JS ARCHITECTURE
   ==========================================================================
   All logic is organized under one global object to prevent namespace issues,
   improve readability, and support future features (quizzes, SCORM/xAPI, etc.)
   ========================================================================== */

const TrainingApp = {

    /* ============================================================
       LANGUAGE MODULE
       ============================================================ */
    language: {
        current: "en",

        init() {
            this.buttons = document.querySelectorAll("[data-lang-btn]");
            this.elements = document.querySelectorAll("[data-lang]");

            this.buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    this.set(btn.dataset.langBtn);
                });
            });

            this.set("en");
        },

        set(lang) {
            this.current = lang;

            this.buttons.forEach(btn =>
                btn.classList.toggle("active", btn.dataset.langBtn === lang)
            );

            this.elements.forEach(el =>
                el.style.display = (el.dataset.lang === lang) ? "" : "none"
            );
        }
    },


    /* ============================================================
       SIDEBAR MODULE
       ============================================================ */
    sidebar: {
        init() {
            this.sidebar = document.getElementById("sidebar");
            this.toggleBtn = document.getElementById("sidebarToggle");
            this.content = document.getElementById("content");

            this.toggleBtn.addEventListener("click", () => {
                this.sidebar.classList.toggle("collapsed");
            });
        }
    },


    /* ============================================================
       NAVIGATION MODULE (Smooth Scroll + Highlight)
       ============================================================ */
    navigation: {
        init() {
            this.items = document.querySelectorAll(".nav-item");

            this.items.forEach(item => {
                item.addEventListener("click", () => {
                    this.go(item);
                });
            });
        },

        go(item) {
            const target = document.querySelector(item.dataset.target);
            if (!target) return;

            // Update active state
            this.items.forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            const yOffset = -80;
            const y = target.getBoundingClientRect().top + window.scrollY + yOffset;

            window.scrollTo({ top: y, behavior: "smooth" });
        }
    },


    /* ============================================================
       ACCORDION MODULE (Accessible + Animated)
       ============================================================ */
    accordion: {
        init() {
            this.items = document.querySelectorAll(".accordion-item");
            this.progress = TrainingApp.progress;

            this.items.forEach((item, index) => {
                const header = item.querySelector(".accordion-header");
                const body = item.querySelector(".accordion-body");

                // Collapse all initially
                body.style.maxHeight = null;
                item.classList.remove("open");

                header.addEventListener("click", () => {
                    this.toggle(item, body, index);
                });
            });
        },

        toggle(item, body, index) {
            const isOpen = item.classList.contains("open");

            // Close all
            this.items.forEach(i => {
                i.classList.remove("open");
                const b = i.querySelector(".accordion-body");
                b.style.maxHeight = null;
                b.setAttribute("aria-hidden", "true");
                i.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
            });

            // Open if previously closed
            if (!isOpen) {
                item.classList.add("open");
                body.style.maxHeight = body.scrollHeight + "px";

                body.setAttribute("aria-hidden", "false");
                item.querySelector(".accordion-header").setAttribute("aria-expanded", "true");

                this.progress.markComplete(index);
            }
        }
    },


    /* ============================================================
       PROGRESS MODULE
       ============================================================ */
    progress: {
        completed: new Set(),

        init() {
            this.fill = document.getElementById("progressFill");
            this.percentText = document.getElementById("progressPercent");
            this.update();
        },

        markComplete(index) {
            this.completed.add(index);
            this.update();
        },

        update() {
            const total = document.querySelectorAll(".accordion-item").length;
            const percent = Math.round((this.completed.size / total) * 100);

            this.fill.style.width = percent + "%";
            this.percentText.textContent = percent + "%";
        }
    },


    /* ============================================================
       ANIMATION MODULE — Optimized Blueprint FX
       ============================================================ */
    animations: {
        init() {
            this.ground = document.getElementById("ground-bg");
            this.lastStreakTime = 0;
            this.streakInterval = 1800; // ms

            requestAnimationFrame(this.frame.bind(this));
        },

        frame(timestamp) {
            // spawn streaks (performance-friendly)
            if (timestamp - this.lastStreakTime > this.streakInterval) {
                this.spawnStreak();
                this.lastStreakTime = timestamp;
            }

            requestAnimationFrame(this.frame.bind(this));
        },

        spawnStreak() {
            const streak = document.createElement("div");
            streak.className = "ground-streak";

            const width = Math.random() * 90 + 40;
            const top = Math.random() * 100;

            Object.assign(streak.style, {
                width: width + "px",
                top: top + "%",
                left: "-150px",
                animation: "streakMove 3.5s linear forwards"
            });

            this.ground.appendChild(streak);

            setTimeout(() => streak.remove(), 3500);
        }
    },


    /* ============================================================
       PRELOAD MODULE — Faster initial rendering
       ============================================================ */
    preload: {
        init() {
            const assets = [
                "assets/img/background-floating-1.png",
                "assets/img/background-not-floating-1.png",
                "assets/img/seperater-1.png",
                "assets/img/Intro image carvana2.png"
            ];

            assets.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }
    },


    /* ============================================================
       INIT APP
       ============================================================ */
    init() {
        this.language.init();
        this.sidebar.init();
        this.navigation.init();
        this.progress.init();
        this.accordion.init();
        this.animations.init();
        this.preload.init();
    }
};


/* ==========================================================================
   START THE APP
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    TrainingApp.init();
});
