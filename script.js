document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    const scrollProgress = document.getElementById("scrollProgress");
    const menuToggle = document.getElementById("menuToggle");
    const navigation = document.getElementById("navigation");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const yearEl = document.getElementById("year");

    // Актуальный год в футере
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    // Тень шапки и верхний индикатор прогресса прокрутки
    const updateScrollUI = () => {
        const scrollTop = window.scrollY;
        if (header) {
            header.classList.toggle("is-scrolled", scrollTop > 16);
        }
        if (scrollProgress) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
            scrollProgress.style.width = `${ratio}%`;
        }
    };
    window.addEventListener("scroll", updateScrollUI, { passive: true });
    updateScrollUI();

    // Плавное появление секций при прокрутке
    const revealEls = Array.from(document.querySelectorAll(".reveal"));
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
    }

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

    // Живой фон в hero-блоке с ручным переключателем сцен ("фон1" и "фон2") и лёгким параллаксом
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
            label: "Закат и стройка"
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
            label: "Ночная битва"
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
        const sceneButtons = Array.from(document.querySelectorAll(".scene-btn"));
        if (!heroSection) return;

        const resolvedList = [];
        for (let i = 0; i < HERO_BACKGROUNDS.length; i++) {
            const item = HERO_BACKGROUNDS[i];
            const validSrc = await resolveImagePath(item.candidates);
            if (validSrc) {
                resolvedList.push({ index: i, src: validSrc, label: item.label });
            }
        }

        if (resolvedList.length === 0) return;

        const bgLayerA = document.createElement("div");
        const bgLayerB = document.createElement("div");
        const bgOverlay = document.createElement("div");

        const baseSlideStyle = {
            position: "absolute",
            inset: "-2%",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            transition: "opacity 1s ease, transform 0.35s ease-out",
            pointerEvents: "none",
            zIndex: "0"
        };

        Object.assign(bgLayerA.style, baseSlideStyle, {
            backgroundImage: `url("${resolvedList[0].src}")`,
            opacity: "0.38",
            transform: "scale(1.03)"
        });

        Object.assign(bgLayerB.style, baseSlideStyle, {
            opacity: "0",
            transform: "scale(1.03)"
        });

        Object.assign(bgOverlay.style, {
            position: "absolute",
            inset: "0",
            background: "linear-gradient(180deg, rgba(17, 17, 20, 0.62) 0%, rgba(17, 17, 20, 0.84) 100%)",
            pointerEvents: "none",
            zIndex: "0"
        });

        heroSection.prepend(bgOverlay);
        heroSection.prepend(bgLayerB);
        heroSection.prepend(bgLayerA);

        let currentPos = 0;
        let showingA = true;
        let timerId = null;

        const syncButtons = (sceneIndex) => {
            sceneButtons.forEach((btn) => {
                btn.classList.toggle("active", Number(btn.dataset.scene) === sceneIndex);
            });
        };

        const showSlide = (pos) => {
            if (resolvedList.length === 0) return;
            currentPos = (pos + resolvedList.length) % resolvedList.length;
            const slide = resolvedList[currentPos];

            const activeLayer = showingA ? bgLayerA : bgLayerB;
            const incomingLayer = showingA ? bgLayerB : bgLayerA;

            incomingLayer.style.backgroundImage = `url("${slide.src}")`;
            incomingLayer.style.opacity = "0.38";
            activeLayer.style.opacity = "0";

            showingA = !showingA;
            syncButtons(slide.index);
        };

        const startAutoplay = () => {
            if (resolvedList.length < 2) return;
            if (timerId) clearInterval(timerId);
            timerId = setInterval(() => {
                showSlide(currentPos + 1);
            }, 6000);
        };

        sceneButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const requestedIndex = Number(btn.dataset.scene);
                const foundPos = resolvedList.findIndex((item) => item.index === requestedIndex);
                if (foundPos !== -1) {
                    showSlide(foundPos);
                    startAutoplay();
                }
            });
        });

        // Лёгкий параллакс от движения мыши на ПК
        heroSection.addEventListener("mousemove", (e) => {
            const rect = heroSection.getBoundingClientRect();
            const offsetX = ((e.clientX - rect.left) / rect.width - 0.5) * -14;
            const offsetY = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
            const transformValue = `scale(1.04) translate(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px)`;
            bgLayerA.style.transform = transformValue;
            bgLayerB.style.transform = transformValue;
        });

        heroSection.addEventListener("mouseleave", () => {
            bgLayerA.style.transform = "scale(1.03)";
            bgLayerB.style.transform = "scale(1.03)";
        });

        syncButtons(resolvedList[0].index);
        startAutoplay();
    };

    initHeroBackground();

    // Данные галереи
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
            caption: "Уютный закат и стройка дома в DareCraft"
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
            caption: "Ночная битва с монстрами в DareCraft"
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

    // Подсказка при скачивании
    const downloadBtn = document.getElementById("downloadBtn");
    const downloadFeedback = document.getElementById("downloadFeedback");
    downloadBtn?.addEventListener("click", () => {
        if (downloadFeedback) {
            downloadFeedback.textContent = "Запущено скачивание DareCraft.zip. Распакуйте архив перед запуском.";
        }
    });

    // Копирование шаблона баг-репорта
    const copyBugBtn = document.getElementById("copyBugBtn");
    const bugFeedback = document.getElementById("bugFeedback");
    const BUG_TEMPLATE = [
        "DareCraft — Баг-репорт",
        "Версия сборки: 0.1",
        "Платформа (ПК / телефон): ",
        "Что произошло: ",
        "Как повторить ошибку: "
    ].join("\n");

    copyBugBtn?.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(BUG_TEMPLATE);
            if (bugFeedback) {
                bugFeedback.textContent = "Шаблон баг-репорта скопирован в буфер обмена!";
            }
        } catch {
            if (bugFeedback) {
                bugFeedback.textContent = "Не удалось скопировать автоматически — скопируйте вручную.";
            }
        }
    });
});
