(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  });

  document.querySelectorAll('[data-search-area]').forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var clear = area.querySelector('[data-clear-search]');
    var empty = area.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var pills = Array.prototype.slice.call(area.querySelectorAll('[data-filter]'));
    var activeFilter = 'all';

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      cards.forEach(function (card) {
        var text = cardText(card);
        var passSearch = !query || text.indexOf(query) !== -1;
        var passFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
        var visible = passSearch && passFilter;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
          input.focus();
        }
        activeFilter = 'all';
        pills.forEach(function (pill) {
          pill.classList.toggle('is-active', pill.getAttribute('data-filter') === 'all');
        });
        apply();
      });
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        activeFilter = pill.getAttribute('data-filter') || 'all';
        pills.forEach(function (item) {
          item.classList.toggle('is-active', item === pill);
        });
        apply();
      });
    });

    apply();
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-play-trigger]');
    var loaded = false;
    var hls = null;

    function streamUrl() {
      return video ? video.getAttribute('data-stream') : '';
    }

    function loadVideo() {
      var source = streamUrl();
      if (!video || !source || loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function play(event) {
      if (event) {
        event.preventDefault();
      }
      loadVideo();
      shell.classList.add('is-playing');
      if (video) {
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video || event.target.closest('[data-play-trigger]')) {
        return;
      }
      play(event);
    });

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('error', function () {
        if (hls) {
          hls.destroy();
          hls = null;
          loaded = false;
        }
      });
    }
  });
})();
