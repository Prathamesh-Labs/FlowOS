/**
 * ZENITH AI - PROCEDURAL WEB AUDIO SYNTHESIZER (V2.0)
 * Synthesizes 8 procedural soundscapes and crystal-clear UI sound effects
 * using the native browser Web Audio API with zero external audio assets.
 */

class AudioZenithSynth {
  constructor() {
    this.ctx = null;
    this.currentMode = null;
    this.activeNodes = [];
    this.masterGain = null;
    this.sfxGain = null;
    this.volume = 0.5;
    this.sfxVolume = 0.6;
    this.sfxMuted = false;
    this.sleepTimerId = null;
    this.sleepTimerMinutes = 0;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master gain for ambient soundscapes
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Dedicated gain for sound effects
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stopAll() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.currentMode = null;
    this.clearSleepTimer();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx && !this.sfxMuted) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  toggleSfxMute() {
    this.sfxMuted = !this.sfxMuted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
    return this.sfxMuted;
  }

  setSleepTimer(minutes) {
    this.clearSleepTimer();
    this.sleepTimerMinutes = minutes;
    if (minutes > 0) {
      this.sleepTimerId = setTimeout(() => {
        this.fadeOutAndStop(5);
        window.showToast?.(`🌙 Ambient audio sleep timer finished (${minutes}m)`);
      }, minutes * 60 * 1000);
    }
  }

  clearSleepTimer() {
    if (this.sleepTimerId) {
      clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    this.sleepTimerMinutes = 0;
  }

  fadeOutAndStop(durationSec = 3) {
    if (!this.ctx || !this.masterGain || !this.currentMode) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    setTimeout(() => {
      this.stopAll();
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
      document.querySelectorAll('.sound-card').forEach(c => c.classList.remove('playing'));
    }, durationSec * 1000);
  }

  /**
   * Play procedural soundscape:
   * 'rain' | 'binaural' | 'ocean' | 'drone' | 'campfire' | 'forest' | 'gamma' | 'white'
   */
  playSound(mode) {
    this.initContext();
    if (this.currentMode === mode) {
      this.stopAll();
      return false; // toggled off
    }

    this.stopAll();
    this.currentMode = mode;

    switch (mode) {
      case 'rain':
        this.createRainSound();
        break;
      case 'binaural':
        this.createBinauralBeats(216, 10); // 10Hz Alpha
        break;
      case 'ocean':
        this.createOceanWaves();
        break;
      case 'drone':
        this.createDeepZenDrone();
        break;
      case 'campfire':
        this.createCampfireSound();
        break;
      case 'forest':
        this.createForestWindSound();
        break;
      case 'gamma':
        this.createBinauralBeats(240, 40); // 40Hz Gamma Super-Focus
        break;
      case 'white':
        this.createCosmicWhiteNoise();
        break;
    }
    return true; // started playing
  }

  /* ==========================================================================
     PROCEDURAL SOUNDSCAPES
     ========================================================================== */

  createRainSound() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);
  }

  createBinauralBeats(baseFreq = 216, diffHz = 10) {
    const merger = this.ctx.createChannelMerger(2);

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(baseFreq + diffHz, this.ctx.currentTime);

    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.28, this.ctx.currentTime);
    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.28, this.ctx.currentTime);

    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    oscL.start();
    oscR.start();
    this.activeNodes.push(oscL, oscR, gainL, gainR, merger);
  }

  createOceanWaves() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    lfo.start();
    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, lfo, lfoGain, waveGain);
  }

  createDeepZenDrone() {
    const freqs = [108, 162, 216, 324];
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.15 / freqs.length, this.ctx.currentTime);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start();
      this.activeNodes.push(osc, g);
    });
  }

  createCampfireSound() {
    // 1. Warm Brown Noise Bed
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const fireNoise = this.ctx.createBufferSource();
    fireNoise.buffer = noiseBuffer;
    fireNoise.loop = true;

    const fireFilter = this.ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.setValueAtTime(500, this.ctx.currentTime);

    const fireGain = this.ctx.createGain();
    fireGain.gain.setValueAtTime(0.45, this.ctx.currentTime);

    fireNoise.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(this.masterGain);
    fireNoise.start();

    // 2. Procedural Wood Crackles & Pops
    let isRunning = true;
    const scheduleCrackles = () => {
      if (!isRunning || !this.ctx) return;
      const delay = Math.random() * 250 + 60; // 60ms - 310ms randomized interval
      setTimeout(() => {
        if (!isRunning || !this.ctx || this.currentMode !== 'campfire') return;
        try {
          const osc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();
          const now = this.ctx.currentTime;
          
          osc.type = Math.random() > 0.4 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(Math.random() * 1200 + 400, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

          popGain.gain.setValueAtTime(Math.random() * 0.25 + 0.05, now);
          popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

          osc.connect(popGain);
          popGain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.05);
        } catch (e) {}
        scheduleCrackles();
      }, delay);
    };

    scheduleCrackles();
    this.activeNodes.push(fireNoise, fireFilter, fireGain, { stop: () => { isRunning = false; } });
  }

  createForestWindSound() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const windNoise = this.ctx.createBufferSource();
    windNoise.buffer = noiseBuffer;
    windNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.2, this.ctx.currentTime);
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // Dual LFO for whispering wind gusts
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    windNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);

    lfo.start();
    windNoise.start();
    this.activeNodes.push(windNoise, filter, lfo, lfoGain, windGain);
  }

  createCosmicWhiteNoise() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.activeNodes.push(noise, filter, gain);
  }

  /* ==========================================================================
     SPECIALIZED UI HAPTIC SOUND EFFECTS (SFX)
     ========================================================================== */

  /**
   * Harmonious Solfeggio Chime (528Hz) for completed actions
   */
  playChime() {
    if (this.sfxMuted) return;
    this.initContext();
    const freqs = [528, 1056, 1584];
    const now = this.ctx.currentTime;

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      const amp = (0.28 / (idx + 1));
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 3.0);
    });
  }

  /**
   * Fluid organic water drop "bloop" for hydration logging
   */
  playWaterDrop() {
    if (this.sfxMuted) return;
    this.initContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency sweeps swiftly upward to mimic droplet surface tension
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Ascending celebratory fanfare for streaks & level-ups
   */
  playFanfare() {
    if (this.sfxMuted) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, i) => {
      const startTime = now + (i * 0.09);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.75);
    });
  }

  /**
   * Deep Tibetan Singing Bowl / Gong for timer & pomodoro completion
   */
  playGong() {
    if (this.sfxMuted) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const freqs = [216, 432, 648, 864]; // Tibetan harmonic ratios

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      const amp = (0.35 / (idx + 1));
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 4.6);
    });
  }

  /**
   * Dual-tone alert chime for desktop notification alerts
   */
  playAlert() {
    if (this.sfxMuted) return;
    this.initContext();
    const now = this.ctx.currentTime;

    [
      { f: 587.33, t: now },         // D5
      { f: 880.00, t: now + 0.14 }   // A5
    ].forEach(tone => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.f, tone.t);

      gain.gain.setValueAtTime(0.3, tone.t);
      gain.gain.exponentialRampToValueAtTime(0.0001, tone.t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(tone.t);
      osc.stop(tone.t + 0.45);
    });
  }

  /**
   * Subtle micro-click for UI buttons
   */
  playClick() {
    if (this.sfxMuted) return;
    this.initContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }
}

window.audioZenith = new AudioZenithSynth();
