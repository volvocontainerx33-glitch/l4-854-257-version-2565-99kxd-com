(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
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
            if (timer) {
                clearInterval(timer);
            }
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

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var search = panel.querySelector("[data-filter-search]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var category = panel.querySelector("[data-filter-category]");
            var reset = panel.querySelector("[data-filter-reset]");

            function value(node) {
                return node ? node.value.trim().toLowerCase() : "";
            }

            function apply() {
                var q = value(search);
                var y = value(year);
                var t = value(type);
                var c = value(category);
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var match = true;
                    if (q && text.indexOf(q) === -1) {
                        match = false;
                    }
                    if (y && String(card.getAttribute("data-year") || "").toLowerCase().indexOf(y) === -1) {
                        match = false;
                    }
                    if (t && String(card.getAttribute("data-type") || "").toLowerCase().indexOf(t) === -1) {
                        match = false;
                    }
                    if (c && String(card.getAttribute("data-category") || "").toLowerCase() !== c) {
                        match = false;
                    }
                    card.classList.toggle("is-hidden", !match);
                });
            }

            [search, year, type, category].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    [search, year, type, category].forEach(function (node) {
                        if (node) {
                            node.value = "";
                        }
                    });
                    apply();
                });
            }
        });
    }

    window.initPlayer = function (url) {
        var video = document.getElementById("movie-player");
        var cover = document.querySelector(".player-cover");
        var instance = null;
        var attached = false;

        if (!video || !url) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                instance.loadSource(url);
                instance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playing = video.play();
            if (playing && typeof playing.catch === "function") {
                playing.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (!attached) {
                start();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (instance) {
                instance.destroy();
            }
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
