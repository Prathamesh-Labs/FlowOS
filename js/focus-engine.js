/**
 * ZENITH AI - FOCUS & DEEP WORK ENGINE (V2)
 * Features dual Pomodoro Countdown + Continuous Stopwatch mode,
 * task-linked planned vs actual tracking, and proactive overrun rebalancing.
 */

class FocusEngineController {
  constructor() {
    this.interval = null;
    this.circumference = 2 * Math.PI * 120; // 753.98
    this.mode = 'pomodoro'; // 'pomodoro' | 'stopwatch'
  }

  init() {
    this.timeDisplay = document.getElementById('timer-time-display');
    this.phaseDisplay = document.getElementById('timer-phase-display');
    this.progressRing = document.getElementById('timer-progress-ring');
    this.startBtn = document.getElementById('timer-start-btn');
    this.resetBtn = document.getElementById('timer-reset-btn');
    this.taskSelect = document.getElementById('focus-task-select');
    this.modeSelector = document.getElementById('focus-timer-type-selector');

    if (this.progressRing) {
      this.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
      this.progressRing.style.strokeDashoffset = '0';
    }

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.toggle());
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.reset());
    }

    if (this.taskSelect) {
      this.taskSelect.addEventListener('change', (e) => {
        const taskId = e.target.value;
        this.selectTask(taskId);
      });
    }

    if (this.modeSelector) {
      this.modeSelector.addEventListener('change', (e) => {
        this.mode = e.target.value;
        this.render();
      });
    }

    // Overrun actions
    const rebalanceBtn = document.getElementById('btn-overrun-rebalance-accept');
    if (rebalanceBtn) {
      rebalanceBtn.addEventListener('click', () => {
        this.executeOverrunRebalance();
      });
    }

    const dismissOverrunBtn = document.getElementById('btn-overrun-rebalance-dismiss');
    if (dismissOverrunBtn) {
      dismissOverrunBtn.addEventListener('click', () => {
        const banner = document.getElementById('overrun-divergence-banner');
        if (banner) banner.style.display = 'none';
      });
    }
  }

  selectTask(taskId) {
    const state = window.appState.getState();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const plannedSeconds = (task.estimatedMinutes || 45) * 60;

    window.appState.update(s => ({
      ...s,
      activeFocus: {
        ...s.activeFocus,
        taskId: task.id,
        taskTitle: task.title,
        plannedSeconds,
        elapsedSeconds: 0,
        isOverrun: false
      }
    }));

    this.render();
  }

  toggle() {
    const state = window.appState.getState();
    if (state.activeFocus.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    window.appState.update(s => ({
      ...s,
      activeFocus: { ...s.activeFocus, isRunning: true }
    }));

    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.tick();
    }, 1000);

    this.render();
  }

  pause() {
    clearInterval(this.interval);
    window.appState.update(s => ({
      ...s,
      activeFocus: { ...s.activeFocus, isRunning: false }
    }));
    this.render();
  }

  reset() {
    this.pause();
    window.appState.update(s => ({
      ...s,
      activeFocus: {
        ...s.activeFocus,
        elapsedSeconds: 0,
        isOverrun: false
      }
    }));
    this.render();
  }

  tick() {
    const state = window.appState.getState();
    const active = state.activeFocus;
    const nextElapsed = active.elapsedSeconds + 1;
    const isOverrun = nextElapsed > active.plannedSeconds;

    let addedStudyMin = 0;
    if (nextElapsed % 60 === 0) {
      addedStudyMin = 1;
    }

    const overrunMinutes = Math.floor((nextElapsed - active.plannedSeconds) / 60);
    const triggerPrompt = isOverrun && overrunMinutes >= 5 && !active.overrunPromptActive;

    // Increment actual minutes on the linked task
    const updatedTasks = state.tasks.map(t => {
      if (t.id === active.taskId && addedStudyMin > 0) {
        return { ...t, actualMinutes: (t.actualMinutes || 0) + addedStudyMin };
      }
      return t;
    });

    window.appState.update(s => ({
      ...s,
      tasks: updatedTasks,
      studyMinutesCompleted: s.studyMinutesCompleted + addedStudyMin,
      activeFocus: {
        ...s.activeFocus,
        elapsedSeconds: nextElapsed,
        isOverrun,
        overrunPromptActive: triggerPrompt ? true : s.activeFocus.overrunPromptActive
      }
    }));

    if (triggerPrompt) {
      this.triggerOverrunAlert(overrunMinutes);
    }

    this.render();
  }

  triggerOverrunAlert(overrunMinutes) {
    if (window.audioZenith) window.audioZenith.playChime();

    const banner = document.getElementById('overrun-divergence-banner');
    const textEl = document.getElementById('overrun-banner-text');

    const state = window.appState.getState();
    const plannedMin = Math.floor(state.activeFocus.plannedSeconds / 60);
    const actualMin = Math.floor(state.activeFocus.elapsedSeconds / 60);

    if (textEl) {
      textEl.innerHTML = `
        <strong>⚡ Reality Divergence Detected:</strong> You planned <strong>${plannedMin}m</strong> on <em>"${state.activeFocus.taskTitle}"</em>, but have worked <strong>${actualMin}m</strong> (+${overrunMinutes}m overrun). Your evening schedule has been compressed.
      `;
    }

    if (banner) banner.style.display = 'flex';
    window.showToast?.('⚠️ Focus overrun detected. Proactive schedule rebalancing available.');
  }

  executeOverrunRebalance() {
    const state = window.appState.getState();
    const overrunMinutes = Math.max(15, Math.floor((state.activeFocus.elapsedSeconds - state.activeFocus.plannedSeconds) / 60));

    const rebalanced = window.AIScheduleEngine.rebalanceAfterOverrun(state.todaySchedule, overrunMinutes);

    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      taskId: state.activeFocus.taskId,
      taskTitle: state.activeFocus.taskTitle,
      plannedMinutes: Math.floor(state.activeFocus.plannedSeconds / 60),
      actualMinutes: Math.floor(state.activeFocus.elapsedSeconds / 60),
      overrunMinutes
    };

    window.appState.update(s => ({
      ...s,
      todaySchedule: rebalanced,
      focusHistory: [historyEntry, ...s.focusHistory]
    }));

    const banner = document.getElementById('overrun-divergence-banner');
    if (banner) banner.style.display = 'none';

    window.showToast?.('✨ Evening schedule intelligently rebalanced to preserve bedtime & wellness!');
  }

  render() {
    const state = window.appState.getState();
    const active = state.activeFocus;

    let displaySeconds = 0;
    let isOverrun = false;

    if (this.mode === 'stopwatch') {
      // Continuous Count-up Mode
      displaySeconds = active.elapsedSeconds;
      isOverrun = active.elapsedSeconds > active.plannedSeconds;
    } else {
      // Pomodoro Count-down Mode
      const rem = active.plannedSeconds - active.elapsedSeconds;
      isOverrun = rem < 0;
      displaySeconds = Math.abs(rem);
    }

    const mins = Math.floor(displaySeconds / 60);
    const secs = displaySeconds % 60;
    const formatted = `${isOverrun ? '+' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (this.timeDisplay) {
      this.timeDisplay.textContent = formatted;
      this.timeDisplay.style.color = isOverrun ? 'var(--accent-screen-light)' : 'var(--text-primary)';
    }

    if (this.phaseDisplay) {
      const modeLabel = this.mode === 'stopwatch' ? 'Stopwatch Flow' : 'Pomodoro Countdown';
      this.phaseDisplay.textContent = `${modeLabel}: ${active.taskTitle}`;
    }

    if (this.startBtn) {
      this.startBtn.innerHTML = active.isRunning 
        ? `<i data-lucide="pause"></i> Pause Flow` 
        : `<i data-lucide="play"></i> Start ${this.mode === 'stopwatch' ? 'Stopwatch' : 'Flow'}`;
      if (window.lucide) lucide.createIcons();
    }

    if (this.progressRing) {
      const progress = isOverrun ? 1 : (active.elapsedSeconds / (active.plannedSeconds || 1));
      const offset = this.circumference * (1 - Math.min(1, progress));
      this.progressRing.style.strokeDashoffset = offset;
    }
  }
}

window.focusEngine = new FocusEngineController();
