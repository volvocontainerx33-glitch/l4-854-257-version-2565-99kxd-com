(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
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
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.dataset.title,
      card.dataset.genre,
      card.dataset.year,
      card.dataset.type,
      card.dataset.category,
      card.textContent
    ].join(' '));
  }

  function setupFilters() {
    var bars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
    bars.forEach(function (bar) {
      var section = bar.parentElement;
      var grid = section ? section.querySelector('[data-filterable]') : null;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.children);
      var textInput = bar.querySelector('[data-filter-text]');
      var yearSelect = bar.querySelector('[data-filter-year]');
      var typeSelect = bar.querySelector('[data-filter-type]');
      var categorySelect = bar.querySelector('[data-filter-category]');
      var sortSelect = bar.querySelector('[data-filter-sort]');
      var empty = section.querySelector('[data-empty-state]');

      cards.forEach(function (card, index) {
        card.dataset.originalIndex = index;
        var heat = (card.textContent.length * 97 + index * 131) % 100000;
        card.dataset.heat = heat;
        var ratingMatch = card.textContent.match(/(\d\.\d)分/);
        card.dataset.rating = ratingMatch ? ratingMatch[1] : '0';
      });

      function apply() {
        var q = normalize(textInput && textInput.value);
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var category = categorySelect ? categorySelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var ok = true;
          if (q && cardText(card).indexOf(q) === -1) {
            ok = false;
          }
          if (year) {
            var cardYear = Number(card.dataset.year || 0);
            if (year === '2020') {
              ok = ok && cardYear <= 2020;
            } else {
              ok = ok && String(cardYear) === year;
            }
          }
          if (type) {
            ok = ok && normalize(card.dataset.type).indexOf(normalize(type)) !== -1;
          }
          if (category) {
            ok = ok && card.dataset.category === category;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (sortSelect) {
          var sorted = cards.slice().sort(function (a, b) {
            switch (sortSelect.value) {
              case 'year':
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
              case 'views':
                return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
              case 'rating':
                return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
              default:
                return Number(a.dataset.originalIndex || 0) - Number(b.dataset.originalIndex || 0);
            }
          });
          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        }

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [textInput, yearSelect, typeSelect, categorySelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="duration-pill">' + escapeHtml(movie.duration) + '</span>' +
      '<span class="play-hover">▶</span>' +
      '</a>' +
      '<div class="movie-info">' +
      '<div class="movie-meta top-meta"><a href="category-' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span></div>' +
      '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var empty = document.querySelector('[data-search-empty]');
    var title = document.querySelector('[data-search-title]');
    var input = document.querySelector('[data-search-input]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function render(q) {
      var key = normalize(q);
      if (!key) {
        results.innerHTML = '';
        if (empty) {
          empty.textContent = '输入关键词开始搜索';
          empty.classList.add('show');
        }
        if (title) {
          title.textContent = '搜索结果';
        }
        return;
      }
      var list = window.SITE_MOVIES.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' ')).indexOf(key) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.map(movieCardTemplate).join('');
      if (empty) {
        empty.textContent = '没有找到匹配内容';
        empty.classList.toggle('show', list.length === 0);
      }
      if (title) {
        title.textContent = '“' + q + '”的搜索结果';
      }
    }

    render(query);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var source = player.dataset.videoUrl;
      var hls = null;
      var bound = false;

      function bindSource() {
        if (!video || !source || bound) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        bound = true;
      }

      function play() {
        bindSource();
        if (!video) {
          return;
        }
        video.play().then(function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        }).catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
        video.addEventListener('pause', function () {
          if (overlay && video.currentTime === 0) {
            overlay.classList.remove('is-hidden');
          }
        });
        video.addEventListener('ended', function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function setupShare() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-share]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var payload = {
          title: document.title,
          url: window.location.href
        };
        if (navigator.share) {
          navigator.share(payload);
          return;
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
    setupShare();
  });
})();
