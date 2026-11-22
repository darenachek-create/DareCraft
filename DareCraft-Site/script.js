document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    const menuToggle = document.getElementById("menuToggle");
    const navigation = document.getElementById("navigation");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const yearEl = document.getElementById("year");

    // Актуальный год в футере
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    // Тень шапки при прокрутке
    const updateHeaderScroll = () => {
        if (!header) return;
        header.classList.toggle("is-scrolled", window.scrollY > 16);
    };
    window.addEventListener("scroll", updateHeaderScroll, { passive: true });
    updateHeaderScroll();

    // Мобильное меню
    const setMenuOpen = (open) => {
        if (!menuToggle || !navigation) return;
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
        navigation.classList.toggle("is-open", open);
    };

    if (menuToggle && navigation) {
        menuToggle.addEventListener("click", () => {
            const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
            setMenuOpen(!isOpen);
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => setMenuOpen(false));
        });

        document.addEventListener("click", (event) => {
            const target = event.target;
            if (
                navigation.classList.contains("is-open") &&
                target instanceof Node &&
                !navigation.contains(target) &&
                !menuToggle.contains(target)
            ) {
                setMenuOpen(false);
            }
        });
    }

    // Подсветка активного раздела в навигации
    const updateActiveNav = () => {
        const scrollPos = window.scrollY + 130;
        let currentId = sections[0]?.id || "home";

        for (const section of sections) {
            if (section.offsetTop <= scrollPos) {
                currentId = section.id;
            }
        }

        navLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            link.classList.toggle("active", href === `#${currentId}`);
        });
    };
    window.addEventListener("scroll", updateActiveNav, { passive: true });
    updateActiveNav();

    // Живой фон (слайд-шоу с плавным переходом) в hero-блоке
    // Поддерживает файлы "фон1" и "фон2" с любым популярным расширением (.png, .jpg, .jpeg, .webp)
    const HERO_BACKGROUNDS = [
        {
            candidates: [
                "assets/фон1.png",
                "assets/фон1.jpg",
                "assets/фон1.jpeg",
                "assets/фон1.webp",
                "фон1.png",
                "фон1.jpg",
                "фон1.webp"
            ],
            label: "Стройка дома на закате в DareCraft"
        },
        {
            candidates: [
                "assets/фон2.png",
                "assets/фон2.jpg",
                "assets/фон2.jpeg",
                "assets/фон2.webp",
                "фон2.png",
                "фон2.jpg",
                "фон2.webp"
            ],
            label: "Ночная битва с монстрами в DareCraft"
        }
    ];

    const resolveImagePath = (candidates) => new Promise((resolve) => {
        let index = 0;

        const tryNext = () => {
            if (index >= candidates.length) {
                resolve(null);
                return;
            }

            const path = candidates[index++];
            const probe = new Image();
            probe.onload = () => resolve(path);
            probe.onerror = tryNext;
            probe.src = path;
        };

        tryNext();
    });

    const initHeroBackground = async () => {
        const heroSection = document.querySelector(".hero");
        if (!heroSection) return;

        const resolvedList = [];
        for (const item of HERO_BACKGROUNDS) {
            const validSrc = await resolveImagePath(item.candidates);
            if (validSrc) {
                resolvedList.push({ src: validSrc, label: item.label });
            }
        }

        if (resolvedList.length === 0) return;

        const bgLayerA = document.createElement("div");
        const bgLayerB = document.createElement("div");
        const bgOverlay = document.createElement("div");

        const baseSlideStyle = {
            position: "absolute",
            inset: "0",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            transition: "opacity 1.1s ease, transform 7s ease",
            pointerEvents: "none",
            zIndex: "0"
        };

        Object.assign(bgLayerA.style, baseSlideStyle, {
            backgroundImage: `url("${resolvedList[0].src}")`,
            opacity: "0.34",
            transform: "scale(1.02)"
        });

        Object.assign(bgLayerB.style, baseSlideStyle, {
            opacity: "0",
            transform: "scale(1.05)"
        });

        Object.assign(bgOverlay.style, {
            position: "absolute",
            inset: "0",
            background: "linear-gradient(180deg, rgba(17, 17, 20, 0.68) 0%, rgba(17, 17, 20, 0.84) 100%)",
            pointerEvents: "none",
            zIndex: "0"
        });

        heroSection.prepend(bgOverlay);
        heroSection.prepend(bgLayerB);
        heroSection.prepend(bgLayerA);

        if (resolvedList.length < 2) return;

        let currentSlide = 0;
        let showingA = true;

        setInterval(() => {
            currentSlide = (currentSlide + 1) % resolvedList.length;
            const nextSrc = resolvedList[currentSlide].src;

            const activeLayer = showingA ? bgLayerA : bgLayerB;
            const incomingLayer = showingA ? bgLayerB : bgLayerA;

            incomingLayer.style.backgroundImage = `url("${nextSrc}")`;
            incomingLayer.style.transform = "scale(1.06)";
            incomingLayer.style.opacity = "0.34";

            activeLayer.style.opacity = "0";
            activeLayer.style.transform = "scale(1.01)";

            showingA = !showingA;
        }, 5500);
    };

    initHeroBackground();

    // Данные галереи с поддержкой файлов "фон1" и "фон2"
    const GALLERY_ITEMS = [
        {
            candidates: [
                "assets/фон1.png",
                "assets/фон1.jpg",
                "assets/фон1.jpeg",
                "assets/фон1.webp",
                "фон1.png",
                "фон1.jpg",
                "фон1.webp"
            ],
            category: "crafting",
            categoryLabel: "СТРОЙКА И МИР",
            caption: "Уютный закат и стройка дома в DareCraft (фон1)"
        },
        {
            candidates: [
                "assets/фон2.png",
                "assets/фон2.jpg",
                "assets/фон2.jpeg",
                "assets/фон2.webp",
                "фон2.png",
                "фон2.jpg",
                "фон2.webp"
            ],
            category: "world",
            categoryLabel: "БИТВА С МОБАМИ",
            caption: "Ночная битва с монстрами в DareCraft (фон2)"
        },
        {
            candidates: [
                "assets/gallery/crafting-1.png",
                "assets/gallery/crafting-1.jpg"
            ],
            category: "crafting",
            categoryLabel: "КРАФТ И БАЗЫ",
            caption: "Верстак, печка, сундуки и добыча ресурсов для выживания"
        },
        {
            candidates: [
                "assets/gallery/updates-1.png",
                "assets/gallery/updates-1.jpg"
            ],
            category: "updates",
            categoryLabel: "ОБНОВЛЕНИЯ",
            caption: "Будущие структуры и развитие мира в новых сборках"
        }
    ];

    const galleryGrid = document.getElementById("galleryGrid");
    const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
    const viewer = document.getElementById("galleryViewer");
    const viewerBackdrop = document.getElementById("galleryBackdrop");
    const viewerClose = document.getElementById("galleryClose");
    const viewerPrev = document.getElementById("galleryPrev");
    const viewerNext = document.getElementById("galleryNext");
    const viewerImage = document.getElementById("galleryViewerImage");
    const viewerStage = viewerImage?.parentElement;
    const viewerCaption = document.getElementById("galleryViewerCaption");
    const viewerFallbackTitle = document.getElementById("galleryViewerFallbackTitle");
    const viewerFallbackPath = document.getElementById("galleryViewerFallbackPath");

    let activeFilter = "all";
    let visibleItems = [...GALLERY_ITEMS];
    let currentIndex = 0;
    let lastFocusedElement = null;

    const openViewer = async (index) => {
        if (!viewer || visibleItems.length === 0) return;
        lastFocusedElement = document.activeElement;
        currentIndex = (index + visibleItems.length) % visibleItems.length;
        const item = visibleItems[currentIndex];
        const foundSrc = item.resolvedSrc || (await resolveImagePath(item.candidates || []));
        item.resolvedSrc = foundSrc;

        if (viewerImage && viewerStage) {
            if (foundSrc) {
                viewerStage.classList.remove("is-fallback");
                viewerImage.alt = item.caption;
                viewerImage.src = foundSrc;
            } else {
                viewerStage.classList.add("is-fallback");
                if (viewerFallbackTitle) viewerFallbackTitle.textContent = item.caption;
                if (viewerFallbackPath) {
                    viewerFallbackPath.textContent = `Ожидаемые файлы: ${(item.candidates || []).join(", ")}`;
                }
            }
        }

        if (viewerCaption) {
            viewerCaption.textContent = `${item.caption} (${currentIndex + 1} из ${visibleItems.length})`;
        }

        viewer.classList.add("is-open");
        viewer.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        viewerClose?.focus();
    };

    const closeViewer = () => {
        if (!viewer) return;
        viewer.classList.remove("is-open");
        viewer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    };

    const renderGallery = async () => {
        if (!galleryGrid) return;
        visibleItems = activeFilter === "all"
            ? [...GALLERY_ITEMS]
            : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

        galleryGrid.innerHTML = "";

        for (let idx = 0; idx < visibleItems.length; idx++) {
            const item = visibleItems[idx];
            const card = document.createElement("button");
            card.type = "button";
            card.className = "gallery-card";
            card.setAttribute("aria-label", `Открыть скриншот: ${item.caption}`);

            const placeholder = document.createElement("div");
            placeholder.className = "gallery-card-placeholder";
            placeholder.innerHTML = `
                <span class="gallery-card-tag">${item.categoryLabel}</span>
                <div>
                    <strong>${item.caption}</strong>
                </div>
            `;

            const captionBar = document.createElement("span");
            captionBar.className = "gallery-card-caption";
            captionBar.textContent = item.caption;

            card.appendChild(placeholder);
            card.appendChild(captionBar);

            const foundSrc = item.resolvedSrc || (await resolveImagePath(item.candidates || []));
            item.resolvedSrc = foundSrc;

            if (foundSrc) {
                const img = document.createElement("img");
                img.src = foundSrc;
                img.alt = item.caption;
                img.loading = "lazy";
                placeholder.style.opacity = "0";
                card.insertBefore(img, captionBar);
            }

            card.addEventListener("click", () => openViewer(idx));
            galleryGrid.appendChild(card);
        }
    };

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            activeFilter = btn.dataset.filter || "all";
            filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
            renderGallery();
        });
    });

    viewerClose?.addEventListener("click", closeViewer);
    viewerBackdrop?.addEventListener("click", closeViewer);
    viewerPrev?.addEventListener("click", () => openViewer(currentIndex - 1));
    viewerNext?.addEventListener("click", () => openViewer(currentIndex + 1));

    document.addEventListener("keydown", (event) => {
        if (!viewer?.classList.contains("is-open")) return;
        if (event.key === "Escape") closeViewer();
        if (event.key === "ArrowLeft") openViewer(currentIndex - 1);
        if (event.key === "ArrowRight") openViewer(currentIndex + 1);
    });

    renderGallery();

    // Подсказка при клике на скачивание
    const downloadBtn = document.getElementById("downloadBtn");
    const downloadFeedback = document.getElementById("downloadFeedback");
    downloadBtn?.addEventListener("click", () => {
        if (downloadFeedback) {
            downloadFeedback.textContent = "Запущено скачивание DareCraft.zip. Если файл не загрузился — проверьте папку assets/downloads/DareCraft.zip.";
        }
    });
});
