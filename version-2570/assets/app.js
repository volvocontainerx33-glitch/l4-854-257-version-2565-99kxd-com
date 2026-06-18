const header = document.querySelector('[data-header]');

function updateHeaderState() {
  if (!header) {
    return;
  }

  if (window.scrollY > 20 || document.body.classList.contains('inner-page')) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateHeaderState, { passive: true });
updateHeaderState();

const navToggle = document.querySelector('[data-nav-toggle]');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
}

document.querySelectorAll('[data-nav-menu] a').forEach((link) => {
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
  });
});

function setupHeroSlider() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));

  if (slides.length <= 1) {
    return;
  }

  let currentIndex = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === currentIndex);
    });
  }

  let timer = window.setInterval(() => showSlide(currentIndex + 1), 5200);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(currentIndex + 1), 5200);
    });
  });
}

function setupFilters() {
  document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
    const scope = panel.parentElement || document;
    const list = scope.querySelector('[data-filter-list]') || document;
    const cards = Array.from(list.querySelectorAll('.searchable-card'));
    const keywordInput = panel.querySelector('[data-filter-keyword]');
    const regionSelect = panel.querySelector('[data-filter-region]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const result = panel.querySelector('[data-filter-result]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardMatches(card) {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.terms,
      ].join(' '));

      if (keyword && !haystack.includes(keyword)) {
        return false;
      }

      if (region && card.dataset.region !== region) {
        return false;
      }

      if (type && card.dataset.type !== type) {
        return false;
      }

      if (year && card.dataset.year !== year) {
        return false;
      }

      return true;
    }

    function applyFilters() {
      let visibleCount = 0;

      cards.forEach((card) => {
        const matched = cardMatches(card);
        card.hidden = !matched;

        if (matched) {
          visibleCount += 1;
        }
      });

      if (result) {
        result.textContent = `当前显示 ${visibleCount} / ${cards.length} 部作品`;
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get('q');

    if (initialKeyword && keywordInput) {
      keywordInput.value = initialKeyword;
    }

    applyFilters();
  });
}

async function loadHlsModule() {
  const module = await import('./hls-vendor-dru42stk.js');
  return module.H || module.default || window.Hls;
}

async function attachHls(video, source, status) {
  if (!video || !source || video.dataset.ready === 'true') {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.ready = 'true';

    if (status) {
      status.textContent = 'HLS 片源已就绪';
    }

    return;
  }

  try {
    const Hls = await loadHlsModule();

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (status) {
          status.textContent = 'HLS 片源已加载，点击播放';
        }
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (status && data && data.fatal) {
          status.textContent = '片源加载异常，请刷新页面后重试';
        }
      });
      video.dataset.ready = 'true';
      return;
    }
  } catch (error) {
    if (status) {
      status.textContent = 'HLS 模块加载异常，尝试使用浏览器原生播放';
    }
  }

  video.src = source;
  video.dataset.ready = 'true';
}

function setupPlayers() {
  document.querySelectorAll('[data-video-player]').forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-player-play]');
    const status = player.querySelector('[data-player-status]');
    const source = player.dataset.source;

    attachHls(video, source, status);

    async function playVideo() {
      await attachHls(video, source, status);

      try {
        await video.play();
      } catch (error) {
        if (status) {
          status.textContent = '播放器已准备好，请再次点击播放按钮';
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', () => {
        player.classList.add('is-playing');

        if (status) {
          status.textContent = '正在播放';
        }
      });

      video.addEventListener('pause', () => {
        player.classList.remove('is-playing');
      });
    }
  });
}

setupHeroSlider();
setupFilters();
setupPlayers();
