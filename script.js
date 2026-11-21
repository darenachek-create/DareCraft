
const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

navigation.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

document.getElementById("year").textContent =
    new Date().getFullYear();
// DARECRAFT GALLERY

(() => {
    const gallery = document.getElementById("galleryGrid");
    const viewer = document.getElementById("galleryViewer");

    if (!gallery || !viewer) return;

    const totalImages = 18;
    let currentIndex = 0;
    let previousFocus = null;

    const viewerImage = document.getElementById("galleryViewerImage");
    const caption = document.getElementById("galleryViewerCaption");
    const closeButton = document.getElementById("galleryClose");

    // Создаём 18 карточек
    for (let i = 1; i <= totalImages; i++) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "gallery-item";
        card.setAttribute("aria-label", `Открыть скриншот ${i}`);

        const img = document.createElement("img");
        img.src = `assets/skrean ${i}.png`;
        img.alt = `Скриншот DareCraft ${i}`;
        img.loading = "lazy";
        img.decoding = "async";

        const label = document.createElement("span");
        label.textContent = `СКРИНШОТ №${i}`;

        card.appendChild(img);
        card.appendChild(label);
        gallery.appendChild(card);

        card.addEventListener("click", () => {
            openViewer(i - 1);
        });

        img.addEventListener("error", () => {
            card.classList.add("image-missing");
            label.textContent = `Файл skrean ${i}.png не найден`;
        });
    }

    function openViewer(index) {
        currentIndex = (index + totalImages) % totalImages;
        previousFocus = document.activeElement;

        viewerImage.src = `assets/skrean ${currentIndex + 1}.png`;
        viewerImage.alt = `Скриншот DareCraft ${currentIndex + 1}`;
        caption.textContent = `СКРИНШОТ ${currentIndex + 1} / ${totalImages}`;

        viewer.classList.add("is-open");
        viewer.setAttribute("aria-hidden", "false");
        document.body.classList.add("gallery-viewer-open");

        closeButton.focus();
    }

    function closeViewer() {
        viewer.classList.remove("is-open");
        viewer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("gallery-viewer-open");
        viewerImage.src = "";

        if (previousFocus) {
            previousFocus.focus();
        }
    }

    function changeImage(direction) {
        openViewer(currentIndex + direction);
    }

    closeButton.addEventListener("click", closeViewer);

    document.getElementById("galleryBackdrop")
        .addEventListener("click", closeViewer);

    document.getElementById("galleryPrev")
        .addEventListener("click", () => changeImage(-1));

    document.getElementById("galleryNext")
        .addEventListener("click", () => changeImage(1));

    document.addEventListener("keydown", (event) => {
        if (!viewer.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            closeViewer();
        } else if (event.key === "ArrowRight") {
            changeImage(1);
        } else if (event.key === "ArrowLeft") {
            changeImage(-1);
        }
    });
})();