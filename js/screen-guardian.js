/**
 * ZENITH AI - SCREEN TIME & DIGITAL DETOX GUARDIAN
 * Enforces 20-20-20 eye relief, posture checks, and digital sunset routines.
 */

class ScreenGuardianController {
  constructor() {
    this.interval = null;
    this.eyeCountdownSeconds = 20 * 60; // 20 minutes countdown
    this.initialEyeSeconds = 20 * 60;
    this.isTracking = true;
    this.postureInterval = 45 * 60; // 45 min
  }

  init() {
    this.eyeTimerDisplay = document.getElementById('eye-timer-display');
    this.postureBtn = document.getElementById('posture-check-btn');
    this.takeBreakBtn = document.getElementById('take-screen-break-btn');

    this.startTracking();

    if (this.takeBreakBtn) {
      this.takeBreakBtn.addEventListener('click', () => {
        this.logScreenBreak();
      });
    }

    if (this.postureBtn) {
      this.postureBtn.addEventListener('click', () => {
        this.triggerPostureCheck();
      });
    }
  }

  startTracking() {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      // Tick eye timer
      if (this.eyeCountdownSeconds > 0) {
        this.eyeCountdownSeconds--;
        this.renderEyeTimer();
      } else {
        this.triggerEyeAlert();
        this.eyeCountdownSeconds = this.initialEyeSeconds;
      }

      // Increment active screen time in app state once per minute
      if (this.eyeCountdownSeconds % 60 === 0) {
        window.appState.update(s => ({
          ...s,
          screenTimeMinutes: s.screenTimeMinutes + 1
        }));
      }
    }, 1000);
  }

  renderEyeTimer() {
    if (!this.eyeTimerDisplay) return;
    const m = Math.floor(this.eyeCountdownSeconds / 60);
    const s = this.eyeCountdownSeconds % 60;
    this.eyeTimerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  triggerEyeAlert() {
    if (window.notificationEngine) {
      window.notificationEngine.notifyEyeBreak();
    } else {
      if (window.audioZenith) window.audioZenith.playAlert();
      window.showToast?.('👀 20-20-20 Eye Rule: Look at an object 20 feet away for 20 seconds!');
    }
  }

  triggerPostureCheck() {
    if (window.notificationEngine) {
      window.notificationEngine.notifyPostureCheck();
    } else {
      if (window.audioZenith) window.audioZenith.playAlert();
      window.showToast?.('🧘 Posture Check: Roll shoulders back, chin parallel, feet flat on floor.');
    }
  }

  logScreenBreak() {
    window.appState.update(s => ({
      ...s,
      screenBreaksTaken: s.screenBreaksTaken + 1
    }));
    this.eyeCountdownSeconds = this.initialEyeSeconds;
    this.renderEyeTimer();
    window.showToast?.('🌿 Screen Break Logged! Your eyes and mind thank you.');
  }
}

window.screenGuardian = new ScreenGuardianController();
