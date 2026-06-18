document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var previous = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  function restartSlider() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    restartSlider();
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(activeIndex - 1);
      restartSlider();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(activeIndex + 1);
      restartSlider();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
      restartSlider();
    });
  });

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-filter-search]');
    var categorySelect = filterPanel.querySelector('[data-filter-category]');
    var sortSelect = filterPanel.querySelector('[data-filter-sort]');
    var grid = document.querySelector('[data-filter-grid]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];

    function getText(card, name) {
      return (card.getAttribute(name) || '').toLowerCase();
    }

    function sortCards() {
      if (!grid || !sortSelect) {
        return;
      }

      var mode = sortSelect.value;

      cards.sort(function (a, b) {
        if (mode === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }

        if (mode === 'title') {
          return getText(a, 'data-title').localeCompare(getText(b, 'data-title'), 'zh-CN');
        }

        return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
      });

      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : 'all';
      var visible = 0;

      sortCards();

      cards.forEach(function (card) {
        var matchesQuery = !query || getText(card, 'data-search').indexOf(query) !== -1;
        var matchesCategory = category === 'all' || card.getAttribute('data-category') === category;
        var isVisible = matchesQuery && matchesCategory;

        card.hidden = !isVisible;

        if (isVisible) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', applyFilters);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilters);
    }

    applyFilters();
  }
});
