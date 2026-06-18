document.addEventListener('DOMContentLoaded', function () {
  var loaderPromise = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!loaderPromise) {
      loaderPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return loaderPromise;
  }

  function startVideo(container) {
    var video = container.querySelector('video');
    var trigger = container.querySelector('[data-stream]');
    var streamUrl = trigger ? trigger.getAttribute('data-stream') : '';

    if (!video || !streamUrl) {
      return;
    }

    if (trigger) {
      trigger.classList.add('hidden');
    }

    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(function () {});
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
        video.play().catch(function () {});
      }
    }).catch(function () {
      video.src = streamUrl;
      video.play().catch(function () {});
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (container) {
    var trigger = container.querySelector('[data-stream]');

    if (trigger) {
      trigger.addEventListener('click', function () {
        startVideo(container);
      });
    }
  });
});
