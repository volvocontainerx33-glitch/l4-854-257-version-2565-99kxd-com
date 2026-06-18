function initializeMoviePlayer(sourceUrl) {
  var video = document.getElementById("movieVideo");
  var overlay = document.getElementById("playerOverlay");
  var hlsInstance = null;
  var loaded = false;

  if (!video || !overlay || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          }
        });
      });
    }

    video.src = sourceUrl;
    return Promise.resolve();
  }

  function playVideo() {
    overlay.classList.add("hidden");
    attachSource().then(function () {
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("hidden");
        });
      }
    });
  }

  overlay.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
}
