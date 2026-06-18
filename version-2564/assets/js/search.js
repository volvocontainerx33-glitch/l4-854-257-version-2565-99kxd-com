(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-movie-card>',
      '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-fallback">' + escapeHtml(movie.title.slice(0, 2)) + '</span>',
      '    <span class="play-mark">▶</span>',
      '  </a>',
      '  <div class="movie-body">',
      '    <div class="movie-meta-line">',
      '      <a class="category-chip" href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function renderResults(query) {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-global-search]');
    var heading = document.querySelector('[data-search-heading]');
    var count = document.querySelector('[data-search-count]');
    var normalized = query.toLowerCase();
    var data = window.MOVIE_SEARCH_INDEX || [];
    var matched = data.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine,
        movie.category
      ].join(' ').toLowerCase();

      return !normalized || haystack.indexOf(normalized) !== -1;
    });

    if (!normalized) {
      matched = matched.slice(0, 60);
    }

    if (input) {
      input.value = query;
    }

    if (heading) {
      heading.textContent = normalized ? '搜索结果：' + query : '推荐影片';
    }

    if (count) {
      count.textContent = matched.length;
    }

    if (!results) {
      return;
    }

    if (!matched.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配影片，请尝试更换关键词。</div>';
      return;
    }

    results.innerHTML = matched.slice(0, 240).map(card).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-global-search]');
    var query = getQuery();

    renderResults(query);

    if (form && input) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input.value.trim();
        var nextUrl = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        history.pushState(null, '', nextUrl);
        renderResults(value);
      });
    }
  });
})();
