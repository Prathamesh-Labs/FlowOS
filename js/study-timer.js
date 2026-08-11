/**
 * ZENITH AI - STUDY & FLOW TIMER CONTROLLER
 * Precision Pomodoro/Deep Work timer with circular SVG progress and task integration.
 */

class StudyTimerController {
  constructor() {
    this.totalSeconds = 25 * 60;
    this.remainingSeconds = 25 * 60;
    this.isRunning = false;
    this.interval = null;
    this.currentMode = 'focus'; // 'focus' | 'break' | 'long-break'
    this.modes = {
      focus: 25 * 60,
      break: 5 * 60,
      longBreak: 15 * 60
    };
    this.circumference = 2 * Math.PI * 120; // radius = 120 -> 753.98
  }

  init() {
    this.displayEl = document.getElementById('timer-time-display');
    this.phaseEl = document.getElementById('timer-phase-display');
    this.progressRing = document.getElementById('timer-progress-ring');
    this.startBtn = document.getElementById('timer-start-btn');
    this.resetBtn = document.getElementById('timer-reset-btn');

    if (this.progressRing) {
      this.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
      this.progressRing.style.strokeDashoffset = '0';
    }

    this.bindEvents();
    this.updateDisplay();
  }

  bindEvents() {
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.toggle());
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.reset());
    }

    // Mode Selector Buttons
    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.setMode(mode);
      });
    });
  }

  setMode(mode) {
    this.pause();
    this.currentMode = mode;
    this.totalSeconds = this.modes[mode] || 25 * 60;
    this.remainingSeconds = this.totalSeconds;

    document.querySelectorAll('.timer-mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    if (this.phaseEl) {
      this.phaseEl.textContent = mode === 'focus' ? 'Deep Work Focus' : (mode === 'break' ? 'Short Rest' : 'Long Rejuvenation');
    }

    this.updateDisplay();
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.startBtn) {
      this.startBtn.innerHTML = `<i data-lucide="pause"></i> Pause`;
      if (window.lucide) lucide.createIcons();
    }

    this.interval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    clearInterval(this.interval);
    if (this.startBtn) {
      this.startBtn.innerHTML = `<i data-lucide="play"></i> Start Flow`;
      if (window.lucide) lucide.createIcons();
    }
  }

  reset() {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
  }

  tick() {
    if (this.remainingSeconds > 0) {
      this.remainingSeconds--;
      this.updateDisplay();

      // If in focus mode, log every minute to state
      if (this.currentMode === 'focus' && this.remainingSeconds % 60 === 0) {
        window.appState.update(s => ({
          ...s,
          studyMinutesCompleted: s.studyMinutesCompleted + 1
        }));
      }
    } else {
      this.onComplete();
    }
  }

  onComplete() {
    this.pause();
    if (window.notificationEngine) {
      window.notificationEngine.notifyTimerComplete(this.currentMode);
    } else if (window.audioZenith) {
      window.audioZenith.playGong();
    }
    
    if (this.currentMode === 'focus') {
      window.questsEngine?.dealDamage(150, 'Focus Sprint');
      this.setMode('break');
    } else {
      this.setMode('focus');
    }
  }

  updateDisplay() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (this.displayEl) {
      this.displayEl.textContent = formatted;
    }

    // Update document title for background productivity
    document.title = this.isRunning ? `(${formatted}) Zenith Focus` : 'Zenith AI - Habit & Routine OS';

    // Update SVG Circle Offset
    if (this.progressRing) {
      const progress = 1 - (this.remainingSeconds / this.totalSeconds);
      const offset = this.circumference * (1 - progress);
      this.progressRing.style.strokeDashoffset = offset;
    }
  }
}

window.studyTimer = new StudyTimerController();
