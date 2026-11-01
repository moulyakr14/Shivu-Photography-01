(() => {
    const box = document.getElementById("lightbox");
    const media = box.querySelector(".lb-media");
    const capEl = box.querySelector(".lb-caption");
    const countEl = box.querySelector(".lb-count");
    const closeBtn = box.querySelector(".lb-close");
    const prevBtn = box.querySelector(".lb-prev");
    const nextBtn = box.querySelector(".lb-next");
    const all = [...document.querySelectorAll(".lb-link")];

    let list = [];
    let index = 0;
    let opener = null;
    let swiped = false;

    /* only the tiles currently on screen, so hidden (filtered) tiles are skipped */
    const visible = () =>
        all.filter((el) => el.offsetParent !== null);

    function show(i) {
        index = (i + list.length) % list.length;
        const el = list[index];
        const url = el.getAttribute("href");
        media.innerHTML = "";

        let node;
        if (el.dataset.type === "video") {
            node = document.createElement("video");
            node.controls = true;
            node.playsInline = true;
            node.autoplay = true;
            node.addEventListener("loadeddata", () =>
                node.classList.add("loaded"),
            );
            node.src = url;
        } else {
            node = document.createElement("img");
            node.alt = (el.querySelector("img") || {}).alt || "";
            node.addEventListener("load", () =>
                node.classList.add("loaded"),
            );
            node.src = url;
        }
        media.appendChild(node);

        capEl.textContent = el.dataset.caption || "";
        countEl.textContent = index + 1 + " / " + list.length;
        prevBtn.style.display = nextBtn.style.display =
            list.length > 1 ? "" : "none";

        [index - 1, index + 1].forEach((k) => {
            /* preload the neighbours */
            const nb = list[(k + list.length) % list.length];
            if (nb && nb.dataset.type !== "video")
                new Image().src = nb.getAttribute("href");
        });
    }

    function open(el) {
        list = visible();
        opener = el;
        show(list.indexOf(el));
        box.classList.add("open");
        box.setAttribute("aria-hidden", "false");
        document.body.style.overflow =
            "hidden"; /* stops the page scrolling behind */
        closeBtn.focus();
    }

    function close() {
        box.classList.remove("open");
        box.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        setTimeout(() => {
            if (!box.classList.contains("open"))
                media.innerHTML = "";
        }, 300);
        if (opener) opener.focus();
    }

    all.forEach((el) =>
        el.addEventListener("click", (e) => {
            e.preventDefault();
            open(el);
        }),
    );
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => show(index - 1));
    nextBtn.addEventListener("click", () => show(index + 1));

    /* click the dark area around the photo to close */
    box.addEventListener("click", (e) => {
        if (swiped) {
            swiped = false;
            return;
        }
        if (
            e.target === box ||
            e.target.classList.contains("lb-stage") ||
            e.target === media
        )
            close();
    });

    /* keyboard: arrows, Esc, and Tab stays inside the lightbox */
    document.addEventListener("keydown", (e) => {
        if (!box.classList.contains("open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowRight") show(index + 1);
        if (e.key === "ArrowLeft") show(index - 1);

        if (e.key === "Tab") {
            const f = [
                closeBtn,
                prevBtn,
                nextBtn,
                ...media.querySelectorAll("video"),
            ].filter((x) => x.offsetParent !== null);
            const first = f[0],
                last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (
                !e.shiftKey &&
                document.activeElement === last
            ) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    /* swipe left or right to change photo, swipe down to close */
    let sx = 0,
        sy = 0,
        tracking = false;
    box.addEventListener("pointerdown", (e) => {
        if (
            e.target.closest(".lb-btn") ||
            e.target.closest("video")
        )
            return;
        tracking = true;
        swiped = false;
        sx = e.clientX;
        sy = e.clientY;
    });
    box.addEventListener("pointerup", (e) => {
        if (!tracking) return;
        tracking = false;
        const dx = e.clientX - sx,
            dy = e.clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            swiped = true;
            show(dx < 0 ? index + 1 : index - 1);
        } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
            swiped = true;
            close();
        }
    });
    box.addEventListener("pointercancel", () => {
        tracking = false;
    });
})();