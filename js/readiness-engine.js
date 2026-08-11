/**
 * ZENITH AI - DAILY READINESS & ENERGY INDEX ENGINE
 * Calculates circadian cognitive capacity and provides fatigue-aware schedule adaptation.
 */

class ZenithReadinessEngine {
  constructor() {
    this.storageKey = 'zenith_readiness_history';
  }

  init() {
    this.bindUI();
    this.render();
  }

  calculateReadiness(sleepHours, sleepQuality, soreness, mentalEnergy) {
    // 1. Sleep score (Ideal ~7.5 - 8.5 hrs)
    const sleepDiff = Math.abs(sleepHours - 8.0);
    const sleepRatio = Math.max(0, 1 - (sleepDiff / 4.0));
    const sleepComponent = sleepRatio * 35; // 35% weight

    // 2. Sleep Quality component (1 to 5)
    const qualityComponent = (sleepQuality / 5.0) * 25; // 25% weight

    // 3. Soreness / Physical Tension (1 fresh, 5 sore)
    const sorenessComponent = ((6 - soreness) / 5.0) * 15; // 15% weight

    // 4. Mental Energy (1 to 10)
    const mentalComponent = (mentalEnergy / 10.0) * 25; // 25% weight

    const totalScore = Math.round(sleepComponent + qualityComponent + sorenessComponent + mentalComponent);
    const clampedScore = Math.max(15, Math.min(100, totalScore));

    let status = 'Peak Flow State';
    let blockMins = 50;
    let recommendation = 'Cognitive readiness is peak. Ideal for deep complex problem solving and 50m study blocks.';

    if (clampedScore < 45) {
      status = 'Exhaustion & Fatigue Warning';
      blockMins = 15;
      recommendation = 'High nervous system strain detected. Prioritize 15m micro-sprints, hydration, and an early bedtime.';
    } else if (clampedScore < 65) {
      status = 'Moderate Stamina';
      blockMins = 25;
      recommendation = 'Energy is average. Stick to standard 25m Pomodoros with 5m eye relief breaks.';
    } else if (clampedScore < 85) {
      status = 'Steady Momentum';
      blockMins = 35;
      recommendation = 'Solid cognitive foundation. Great for 35m productive execution.';
    }

    return {
      score: clampedScore,
      status,
      recommendedBlockMins: blockMins,
      recommendation
    };
  }

  bindUI() {
    const form = document.getElementById('readiness-checkin-form');
    const sleepInput = document.getElementById('readiness-sleep-hrs');
    const qualityInput = document.getElementById('readiness-sleep-qual');
    const sorenessInput = document.getElementById('readiness-soreness');
    const energyInput = document.getElementById('readiness-energy');
    const adaptBtn = document.getElementById('btn-readiness-adapt-schedule');

    const updateLivePreview = () => {
      if (!sleepInput || !qualityInput || !sorenessInput || !energyInput) return;
      const sh = parseFloat(sleepInput.value) || 7.5;
      const sq = parseInt(qualityInput.value, 10) || 4;
      const sr = parseInt(sorenessInput.value, 10) || 2;
      const en = parseInt(energyInput.value, 10) || 8;

      const result = this.calculateReadiness(sh, sq, sr, en);
      
      const scoreNumEl = document.getElementById('readiness-score-display');
      const statusEl = document.getElementById('readiness-status-display');
      const recEl = document.getElementById('readiness-rec-display');
      const blockEl = document.getElementById('readiness-block-mins');

      if (scoreNumEl) scoreNumEl.textContent = `${result.score}%`;
      if (statusEl) statusEl.textContent = result.status;
      if (recEl) recEl.textContent = result.recommendation;
      if (blockEl) blockEl.textContent = `${result.recommendedBlockMins} mins`;
    };

    [sleepInput, qualityInput, sorenessInput, energyInput].forEach(input => {
      if (input) input.addEventListener('input', updateLivePreview);
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const sh = parseFloat(sleepInput.value) || 7.5;
        const sq = parseInt(qualityInput.value, 10) || 4;
        const sr = parseInt(sorenessInput.value, 10) || 2;
        const en = parseInt(energyInput.value, 10) || 8;

        const result = this.calculateReadiness(sh, sq, sr, en);

        window.appState.update(s => ({
          ...s,
          readiness: {
            sleepHours: sh,
            sleepQuality: sq,
            physicalSoreness: sr,
            mentalEnergy: en,
            ...result
          }
        }));

        if (window.audioZenith) window.audioZenith.playChime();
        window.showToast?.(`⚡ Daily Readiness Saved: ${result.score}% (${result.status})`);
      });
    }

    if (adaptBtn) {
      adaptBtn.addEventListener('click', () => {
        this.adaptScheduleToReadiness();
      });
    }
  }

  adaptScheduleToReadiness() {
    const state = window.appState.getState();
    const readiness = state.readiness || { score: 85, recommendedBlockMins: 50 };

    // Update study timer duration to recommended block mins
    const focusSelect = document.getElementById('focus-duration-select');
    if (focusSelect) {
      focusSelect.value = readiness.recommendedBlockMins.toString();
      focusSelect.dispatchEvent(new Event('change'));
    }

    window.showToast?.(`🎯 Schedule adapted: Focus blocks tuned to ${readiness.recommendedBlockMins}m based on your ${readiness.score}% readiness.`);
    if (window.audioZenith) window.audioZenith.playFanfare();
  }

  render() {
    const state = window.appState.getState();
    const r = state.readiness;
    if (!r) return;

    const scoreNumEl = document.getElementById('readiness-score-display');
    const statusEl = document.getElementById('readiness-status-display');
    const recEl = document.getElementById('readiness-rec-display');
    const blockEl = document.getElementById('readiness-block-mins');

    if (scoreNumEl) scoreNumEl.textContent = `${r.score}%`;
    if (statusEl) statusEl.textContent = r.status;
    if (recEl) recEl.textContent = r.recommendation;
    if (blockEl) blockEl.textContent = `${r.recommendedBlockMins} mins`;
  }
}

window.readinessEngine = new ZenithReadinessEngine();
