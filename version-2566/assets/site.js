(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupSlider() {
    var slider = document.querySelector('[data-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter(input) {
    var scope = input.closest('main') || document;
    var grid = scope.querySelector('.filter-grid') || document.querySelector('.filter-grid');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.filter-card'));
    var empty = scope.querySelector('.no-results');
    var query = normalize(input.value);
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search') || card.textContent);
      var matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  function setupFilters() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));
    inputs.forEach(function (input) {
      if (q && !input.value) {
        input.value = q;
      }
      input.addEventListener('input', function () {
        applyFilter(input);
      });
      if (input.value) {
        applyFilter(input);
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSlider();
    setupFilters();
  });
})();

function setupMoviePlayer(url) {
  var video = document.getElementById('movie-player');
  var overlay = document.getElementById('movie-play-overlay');
  if (!video || !overlay || !url) {
    return;
  }

  var started = false;
  var hlsInstance = null;

  function attach() {
    if (started) {
      return;
    }
    started = true;
    video.controls = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = url;
  }

  function play() {
    attach();
    overlay.classList.add('is-hidden');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
