(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var panel = qs('[data-mobile-nav]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupImageFallbacks() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var holder = image.closest('.movie-poster, .poster-card, .hero-slide, .category-preview, .category-overview-media');

        if (holder) {
          holder.classList.add('is-missing-image');
        }
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = qs('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var current = 0;
    var timer = null;

    function goTo(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });

      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        goTo(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        goTo(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        goTo(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        goTo(current + 1);
        restart();
      });
    }

    restart();
  }

  function setupMovieFilters() {
    var list = qs('[data-movie-list]');

    if (!list) {
      return;
    }

    var root = document;
    var cards = qsa('[data-movie-card]', list);
    var search = qs('[data-movie-search]', root);
    var yearFilter = qs('[data-filter="year"]', root);
    var typeFilter = qs('[data-filter="type"]', root);
    var quickButtons = qsa('[data-quick-filter]', root);
    var reset = qs('[data-reset-filters]', root);
    var counter = qs('[data-filter-count]', root);
    var activeQuick = '';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(search && search.value);
      var year = normalize(yearFilter && yearFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var quick = normalize(activeQuick);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
        var termText = normalize([
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-title'),
          card.getAttribute('data-search')
        ].join(' '));
        var matchesQuick = !quick || termText.indexOf(quick) !== -1;
        var show = matchesQuery && matchesYear && matchesType && matchesQuick;

        card.classList.toggle('is-hidden', !show);

        if (show) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = visible;
      }
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilters);
    }

    quickButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-quick-filter') || '';
        activeQuick = activeQuick === value ? '' : value;

        quickButtons.forEach(function (item) {
          item.classList.toggle('is-active', item.getAttribute('data-quick-filter') === activeQuick);
        });

        applyFilters();
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        activeQuick = '';

        if (search) {
          search.value = '';
        }

        if (yearFilter) {
          yearFilter.value = '';
        }

        if (typeFilter) {
          typeFilter.value = '';
        }

        quickButtons.forEach(function (button) {
          button.classList.remove('is-active');
        });

        applyFilters();
      });
    }
  }

  function setupShareButtons() {
    qsa('[data-share-title]').forEach(function (button) {
      button.addEventListener('click', function () {
        var title = button.getAttribute('data-share-title') || document.title;
        var url = window.location.href;

        if (navigator.share) {
          navigator.share({ title: title, url: url }).catch(function () {});
          return;
        }

        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            button.textContent = '已复制链接';
            window.setTimeout(function () {
              button.textContent = '分享';
            }, 1600);
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupImageFallbacks();
    setupHeroCarousel();
    setupMovieFilters();
    setupShareButtons();
  });
})();
