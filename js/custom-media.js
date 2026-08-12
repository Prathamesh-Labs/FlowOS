/**
 * FLOWOS - CUSTOM MEDIA & SOUND CONTROLLER (V2.0)
 * Supports local audio file playback with soundscape mixing,
 * and optional Spotify / YouTube Focus Embeds.
 */

class FlowOSCustomMediaController {
  constructor() {
    this.audio = new Audio();
    this.currentFile = null;
    this.isPlaying = false;
    this.isLooping = true;
    this.audio.loop = true;
    this.volume = 0.7;
    this.audio.volume = 0.7;
    this.embedStorageKey = 'flowos_focus_embed_url';
  }

  init() {
    this.bindAudioEvents();
    this.bindUI();
    this.loadSavedEmbed();
  }

  bindAudioEvents() {
    this.audio.addEventListener('timeupdate', () => {
      this.updateProgress();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.updateDuration();
    });

    this.audio.addEventListener('ended', () => {
      if (!this.isLooping) {
        this.isPlaying = false;
        this.updatePlayBtn();
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      window.showToast?.('⚠️ Could not play selected audio format.');
      this.isPlaying = false;
      this.updatePlayBtn();
    });
  }

  bindUI() {
    // 1. Audio Sub-Tab Switching (Synth / My Music / Spotify & YouTube)
    const audioTabs = document.querySelectorAll('.audio-subtab-btn');
    const audioPanels = document.querySelectorAll('.audio-subpanel');

    audioTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.subtab;
        audioTabs.forEach(b => b.classList.remove('active'));
        audioPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePanel = document.getElementById(`audio-panel-${target}`);
        if (activePanel) activePanel.classList.add('active');
      });
    });

    // 2. File Upload & Drop Zone
    const fileInput = document.getElementById('custom-audio-file-input');
    const dropZone = document.getElementById('custom-audio-dropzone');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.loadLocalAudioFile(file);
      });
    }

    if (dropZone) {
      dropZone.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
          this.loadLocalAudioFile(file);
        } else {
          window.showToast?.('⚠️ Please drop a valid audio file (MP3, WAV, FLAC, etc.)');
        }
      });
    }

    // 3. Local Player Controls
    const playBtn = document.getElementById('btn-custom-audio-play');
    const loopBtn = document.getElementById('btn-custom-audio-loop');
    const seekSlider = document.getElementById('custom-audio-seek');
    const volSlider = document.getElementById('custom-audio-vol-slider');

    if (playBtn) {
      playBtn.addEventListener('click', () => this.togglePlay());
    }

    if (loopBtn) {
      loopBtn.addEventListener('click', () => {
        this.isLooping = !this.isLooping;
        this.audio.loop = this.isLooping;
        loopBtn.classList.toggle('active', this.isLooping);
        loopBtn.title = this.isLooping ? 'Repeat Track: ON' : 'Repeat Track: OFF';
        window.showToast?.(this.isLooping ? '🔁 Repeat Track enabled' : '➡️ Repeat Track disabled');
      });
    }

    if (seekSlider) {
      seekSlider.addEventListener('input', (e) => {
        if (this.audio.duration) {
          const seekTime = (parseFloat(e.target.value) / 100) * this.audio.duration;
          this.audio.currentTime = seekTime;
        }
      });
    }

    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.volume = val;
        this.audio.volume = val;
        const volLabel = document.getElementById('custom-audio-vol-label');
        if (volLabel) volLabel.textContent = `${Math.round(val * 100)}%`;
      });
    }

    // 4. Spotify & YouTube Embed Controls
    const embedForm = document.getElementById('focus-embed-form');
    const embedUrlInput = document.getElementById('focus-embed-url-input');
    const embedPresets = document.querySelectorAll('.embed-preset-btn');

    if (embedForm && embedUrlInput) {
      embedForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = embedUrlInput.value.trim();
        if (url) this.loadEmbedUrl(url);
      });
    }

    embedPresets.forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.embedUrl;
        if (url) {
          if (embedUrlInput) embedUrlInput.value = url;
          this.loadEmbedUrl(url);
        }
      });
    });
  }

  loadLocalAudioFile(file) {
    if (!file) return;
    this.currentFile = file;

    // Create object URL
    const objectUrl = URL.createObjectURL(file);
    this.audio.src = objectUrl;
    this.audio.load();

    // Update UI track info
    const trackNameEl = document.getElementById('custom-track-title');
    const trackMetaEl = document.getElementById('custom-track-meta');
    const playerControls = document.getElementById('custom-audio-player-controls');
    const dropZone = document.getElementById('custom-audio-dropzone');

    if (trackNameEl) trackNameEl.textContent = file.name;
    if (trackMetaEl) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      trackMetaEl.textContent = `${file.type || 'audio'} • ${sizeMb} MB`;
    }

    if (dropZone) dropZone.style.display = 'none';
    if (playerControls) playerControls.style.display = 'flex';

    // Autoplay
    this.play();
    window.showToast?.(`🎵 Loaded: ${file.name}`);
  }

  togglePlay() {
    if (!this.audio.src) return;
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.audio.src) return;
    this.audio.play()
      .then(() => {
        this.isPlaying = true;
        this.updatePlayBtn();
      })
      .catch(e => {
        console.warn('Playback blocked or failed:', e);
      });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayBtn();
  }

  updatePlayBtn() {
    const playBtn = document.getElementById('btn-custom-audio-play');
    if (!playBtn) return;
    if (this.isPlaying) {
      playBtn.innerHTML = '<i data-lucide="pause" style="width: 18px; height: 18px;"></i>';
    } else {
      playBtn.innerHTML = '<i data-lucide="play" style="width: 18px; height: 18px;"></i>';
    }
    if (window.lucide) lucide.createIcons();
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  updateProgress() {
    const timeDisplay = document.getElementById('custom-audio-time');
    const seekSlider = document.getElementById('custom-audio-seek');

    if (this.audio.duration) {
      const current = this.audio.currentTime;
      const total = this.audio.duration;
      const pct = (current / total) * 100;

      if (seekSlider) seekSlider.value = pct;
      if (timeDisplay) {
        timeDisplay.textContent = `${this.formatTime(current)} / ${this.formatTime(total)}`;
      }
    }
  }

  updateDuration() {
    const timeDisplay = document.getElementById('custom-audio-time');
    if (timeDisplay && this.audio.duration) {
      timeDisplay.textContent = `00:00 / ${this.formatTime(this.audio.duration)}`;
    }
  }

  /* ==========================================================================
     SPOTIFY & YOUTUBE EMBED ENGINE
     ========================================================================== */

  parseEmbedUrl(inputUrl) {
    if (!inputUrl) return null;
    const url = inputUrl.trim();

    // 1. Spotify URL parsing
    if (url.includes('spotify.com')) {
      // Examples:
      // https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS
      // https://open.spotify.com/album/4eLPsYPBmXABThSJ821sqY
      // https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
      const match = url.match(/spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
      if (match) {
        const type = match[1];
        const id = match[2];
        return {
          type: 'spotify',
          src: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
        };
      }
    }

    // 2. YouTube URL parsing
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = null;
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }

      if (videoId) {
        return {
          type: 'youtube',
          src: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
        };
      }
    }

    // Direct embed link fallback
    if (url.startsWith('https://')) {
      return { type: 'generic', src: url };
    }

    return null;
  }

  loadEmbedUrl(rawUrl) {
    const parsed = this.parseEmbedUrl(rawUrl);
    const container = document.getElementById('focus-embed-container');
    if (!container) return;

    if (!parsed) {
      window.showToast?.('⚠️ Invalid Spotify playlist or YouTube link.');
      return;
    }

    try {
      localStorage.setItem(this.embedStorageKey, rawUrl);
    } catch (e) {}

    if (parsed.type === 'spotify') {
      container.innerHTML = `
        <iframe 
          style="border-radius: 12px; border: 0; width: 100%; height: 152px;" 
          src="${parsed.src}" 
          allowfullscreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy">
        </iframe>
      `;
    } else if (parsed.type === 'youtube') {
      container.innerHTML = `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
            src="${parsed.src}" 
            title="Focus Video" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    } else {
      container.innerHTML = `
        <iframe style="width: 100%; height: 200px; border: 0; border-radius: 12px;" src="${parsed.src}"></iframe>
      `;
    }

    window.showToast?.('🎧 Focus Stream Loaded!');
  }

  loadSavedEmbed() {
    try {
      const saved = localStorage.getItem(this.embedStorageKey);
      if (saved) {
        const input = document.getElementById('focus-embed-url-input');
        if (input) input.value = saved;
        this.loadEmbedUrl(saved);
      }
    } catch (e) {}
  }
}

window.FlowOSCustomMediaController = FlowOSCustomMediaController;
window.ZenithCustomMediaController = FlowOSCustomMediaController;
window.customMediaController = new FlowOSCustomMediaController();
