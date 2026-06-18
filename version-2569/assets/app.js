(function () {
  var header = document.getElementById("siteHeader");
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobileNav");

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && header && mobileNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = header.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === activeSlide);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === activeSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      window.clearInterval(heroTimer);
      showSlide(Number(dot.getAttribute("data-target")) || 0);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var searchForms = Array.prototype.slice.call(document.querySelectorAll(".site-search-form"));

  searchForms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[type='search']");
      var value = input ? input.value.trim() : "";

      if (!value) {
        return;
      }

      event.preventDefault();
      window.location.href = "./movies.html?q=" + encodeURIComponent(value);
    });
  });

  var movieGrid = document.getElementById("movieGrid");
  var movieSearch = document.getElementById("movieSearch");
  var categoryFilter = document.getElementById("categoryFilter");
  var sortFilter = document.getElementById("sortFilter");

  if (movieGrid) {
    var cards = Array.prototype.slice.call(movieGrid.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (movieSearch && query) {
      movieSearch.value = query;
    }

    function cardText(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-genre") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
    }

    function applyFilters() {
      var keyword = movieSearch ? movieSearch.value.trim().toLowerCase() : "";
      var category = categoryFilter ? categoryFilter.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var haystack = cardText(card);
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okCategory = !category || haystack.indexOf(category) !== -1;
        card.classList.toggle("is-hidden", !(okKeyword && okCategory));
      });
    }

    function applySort() {
      var mode = sortFilter ? sortFilter.value : "default";
      var sorted = cards.slice();

      if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      }

      if (mode === "heat") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-heat")) - Number(a.getAttribute("data-heat"));
        });
      }

      if (mode === "title") {
        sorted.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
        });
      }

      sorted.forEach(function (card) {
        movieGrid.appendChild(card);
      });
    }

    if (movieSearch) {
      movieSearch.addEventListener("input", applyFilters);
    }

    if (categoryFilter) {
      categoryFilter.addEventListener("change", applyFilters);
    }

    if (sortFilter) {
      sortFilter.addEventListener("change", function () {
        applySort();
        applyFilters();
      });
    }

    applySort();
    applyFilters();
  }
})();
