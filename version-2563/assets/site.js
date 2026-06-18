(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) return;
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) return;
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) return;
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            if (timer) clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function initCards() {
        var list = document.querySelector("[data-card-list]");
        if (!list) return;
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        var search = document.querySelector("[data-search]");
        var sort = document.querySelector("[data-sort]");
        var empty = document.querySelector("[data-empty-state]");
        var original = cards.slice();

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var query = normalize(search ? search.value : "");
            var shown = 0;
            cards.forEach(function (card) {
                var match = !query || normalize(card.getAttribute("data-search")).indexOf(query) !== -1;
                card.style.display = match ? "" : "none";
                if (match) shown += 1;
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        function applySort() {
            var value = sort ? sort.value : "default";
            var sorted = original.slice();
            if (value === "year-desc") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
            }
            if (value === "year-asc") {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
                });
            }
            if (value === "title") {
                sorted.sort(function (a, b) {
                    return normalize(a.getAttribute("data-search")).localeCompare(normalize(b.getAttribute("data-search")), "zh-CN");
                });
            }
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
            cards = sorted;
            apply();
        }

        if (search) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) search.value = q;
            search.addEventListener("input", apply);
        }
        if (sort) {
            sort.addEventListener("change", applySort);
        }
        apply();
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) return;
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-play-button]");
        if (!video) return;
        var source = video.getAttribute("data-hls");
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared || !source) return;
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            if (button) button.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) play();
        });
        video.addEventListener("play", function () {
            if (button) button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (button && video.currentTime === 0) button.classList.remove("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) hlsInstance.destroy();
        });
        prepare();
    }

    function initContact() {
        var form = document.querySelector("[data-contact-form]");
        var message = document.querySelector("[data-form-message]");
        if (!form || !message) return;
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            message.textContent = "反馈已提交，感谢支持。";
            form.reset();
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initCards();
        initPlayer();
        initContact();
    });
})();
