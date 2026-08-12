/**
 * FLOWOS - DAILY READINESS & PLANNING SIGNAL ENGINE (V2.0)
 * Uses self-reported inputs (sleep quality, perceived energy, physical soreness)
 * as an optional planning signal to adapt flexible focus block sizes.
 * (Non-medical planning aid, not a clinical measurement).
 */

class FlowOSReadinessEngine {
  constructor() {
    this.storageKey = 'flowos_readiness_history';
    this.previousFocusSeconds = null;
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
    let recommendation = 'Self-reported readiness is high. Ideal for 50-minute deep work blocks.';

    if (clampedScore < 45) {
      status = 'Low Energy Signal';
      blockMins = 15;
      recommendation = 'Energy is reported low. FlowOS recommends 15m micro-sprints and protecting bedtime.';
    } else if (clampedScore < 65) {
      status = 'Moderate Energy';
      blockMins = 25;
      recommendation = 'Standard 25m Pomodoros with 5m recovery breaks recommended.';
    } else if (clampedScore < 85) {
      status = 'Steady Momentum';
      blockMins = 35;
      recommendation = 'Solid energy foundation. Well suited for 35m execution blocks.';
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

        if (window.audioFlowOS) window.audioFlowOS.playChime();
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

    this.previousFocusSeconds = state.activeFocus?.plannedSeconds || 3600;

    // Update active focus timer planned duration
    window.appState.update(s => ({
      ...s,
      activeFocus: {
        ...s.activeFocus,
        plannedSeconds: readiness.recommendedBlockMins * 60,
        elapsedSeconds: 0
      }
    }));

    if (window.focusEngine) {
      window.focusEngine.render();
    }

    window.showToast?.(`🎯 Schedule adapted: Focus blocks tuned to ${readiness.recommendedBlockMins}m based on your self-reported readiness. <button onclick="window.readinessEngine.undoAdaptation()" style="margin-left:8px; background:rgba(255,255,255,0.2); border:none; color:#fff; padding:2px 8px; border-radius:4px; cursor:pointer;">Undo</button>`);
    if (window.audioFlowOS) window.audioFlowOS.playFanfare();
  }

  undoAdaptation() {
    if (this.previousFocusSeconds) {
      window.appState.update(s => ({
        ...s,
        activeFocus: {
          ...s.activeFocus,
          plannedSeconds: this.previousFocusSeconds
        }
      }));
      if (window.focusEngine) window.focusEngine.render();
      window.showToast?.('Restored previous focus block size.');
    }
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

window.FlowOSReadinessEngine = FlowOSReadinessEngine;
window.ZenithReadinessEngine = FlowOSReadinessEngine;
window.readinessEngine = new FlowOSReadinessEngine();
