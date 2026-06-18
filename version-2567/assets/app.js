(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(nextSlide, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                nextSlide();
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var genreSelect = root.querySelector('[data-filter-genre]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (input && initial) {
            input.value = initial;
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var genre = normalize(genreSelect ? genreSelect.value : '');

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = card.getAttribute('data-year') || '';
                var cardGenre = normalize(card.getAttribute('data-genre'));
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okYear = !year || cardYear === year;
                var okGenre = !genre || cardGenre.indexOf(genre) !== -1 || text.indexOf(genre) !== -1;
                card.classList.toggle('is-hidden', !(okKeyword && okYear && okGenre));
            });
        }

        [input, yearSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play-overlay]');
        var hlsInstance = null;
        var ready = false;

        function attachStream() {
            if (!video || ready) {
                return;
            }
            var stream = video.getAttribute('data-hls') || '';
            if (!stream) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function startPlayback() {
            if (!video) {
                return;
            }
            attachStream();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
