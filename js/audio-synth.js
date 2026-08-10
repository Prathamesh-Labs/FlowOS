/**
 * ZENITH AI - PROCEDURAL WEB AUDIO SYNTHESIZER
 * Generates ambient soundscapes (Rain, Binaural Alpha Beats, Ocean Surf, Deep Drone)
 * and harmonic focus chimes directly in the browser with ZERO audio file downloads.
 */

class AudioZenithSynth {
  constructor() {
    this.ctx = null;
    this.currentMode = null;
    this.activeNodes = [];
    this.masterGain = null;
    this.volume = 0.5;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
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
  }

  setVolume(val) {
    this.volume = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  /**
   * Play procedural soundscape: 'rain' | 'binaural' | 'ocean' | 'drone'
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
        this.createBinauralAlpha();
        break;
      case 'ocean':
        this.createOceanWaves();
        break;
      case 'drone':
        this.createDeepZenDrone();
        break;
    }
    return true; // started playing
  }

  createRainSound() {
    // Generate pink noise buffer
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

  createBinauralAlpha() {
    // 10 Hz Alpha wave: Left 216Hz, Right 226Hz
    const merger = this.ctx.createChannelMerger(2);

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(216, this.ctx.currentTime);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(226, this.ctx.currentTime); // 10Hz differential

    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.3, this.ctx.currentTime);
    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.3, this.ctx.currentTime);

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

    // LFO for wave rhythmic ebb and flow
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave period
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

  /**
   * Harmonious Tibetan Chime / Bell for completion alerts
   */
  playChime() {
    this.initContext();
    const freqs = [528, 1056, 1584]; // 528Hz Solfeggio frequency
    const now = this.ctx.currentTime;

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      const amp = (0.3 / (idx + 1));
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.2);
    });
  }
}

window.audioZenith = new AudioZenithSynth();
