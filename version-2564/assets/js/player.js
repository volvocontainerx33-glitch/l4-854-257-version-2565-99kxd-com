import { H as Hls } from './hls.js';

function initializePlayer(player) {
  const video = player.querySelector('video[data-hls]');
  const overlay = player.querySelector('[data-play-button]');

  if (!video) {
    return;
  }

  const source = video.getAttribute('data-hls');

  if (!source) {
    return;
  }

  function attachSource() {
    if (video.dataset.ready === 'true') {
      return Promise.resolve();
    }

    video.dataset.ready = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;

      return new Promise(function (resolve) {
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            console.error('HLS fatal error:', data);
          }
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  function play() {
    attachSource().then(function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      video.play().catch(function (error) {
        console.warn('Video playback was blocked or failed:', error);
      });
    });
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

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
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(initializePlayer);
});
