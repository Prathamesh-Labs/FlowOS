/**
 * FLOWOS - FOCUS & DEEP WORK ENGINE (V2.0)
 * Dual Pomodoro Countdown + Continuous Stopwatch mode,
 * task-linked planned vs actual tracking, and overrun adaptation (+10m, complete, rebalance).
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

    // Add +10 Min button handler
    const add10Btn = document.getElementById('btn-focus-add-10m');
    if (add10Btn) {
      add10Btn.addEventListener('click', () => {
        this.addMinutes(10);
      });
    }

    // Mark complete button handler
    const completeBtn = document.getElementById('btn-focus-complete-task');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        this.completeFocusTask();
      });
    }
  }

  addMinutes(mins) {
    window.appState.update(s => ({
      ...s,
      activeFocus: {
        ...s.activeFocus,
        plannedSeconds: (s.activeFocus?.plannedSeconds || 1500) + (mins * 60),
        isOverrun: false
      }
    }));
    const banner = document.getElementById('overrun-divergence-banner');
    if (banner) banner.style.display = 'none';
    if (window.audioFlowOS) window.audioFlowOS.playChime();
    window.showToast?.(`⏱️ Added +${mins} minutes to planned focus time.`);
    this.render();
  }

  completeFocusTask() {
    const state = window.appState.getState();
    const taskId = state.activeFocus?.taskId;
    if (taskId) {
      window.TasksHabitsManager?.toggleTask(taskId);

      // Record completed session to the Personal Reality Learning Engine
      const task = (state.tasks || []).find(t => t.id === taskId);
      if (task) {
        const plannedMin = Math.round((state.activeFocus?.plannedSeconds || 1500) / 60);
        const actualMin = Math.round((state.activeFocus?.elapsedSeconds || 0) / 60) || plannedMin;
        window.PersonalRealityLearningEngine?.recordSession(task.category || 'general', task.title, plannedMin, actualMin);
      }
    }
    this.pause();
    if (window.audioFlowOS) window.audioFlowOS.playFanfare();
    if (window.zenithExperience?.triggerConfetti) window.zenithExperience.triggerConfetti();
    window.showToast?.('🎉 Focus task completed!');
  }

  selectTask(taskId) {
    const state = window.appState.getState();
    const task = (state.tasks || []).find(t => t.id === taskId);
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
    if (state.activeFocus?.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    window.appState.update(s => ({
      ...s,
      activeFocus: { ...(s.activeFocus || {}), isRunning: true }
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
      activeFocus: { ...(s.activeFocus || {}), isRunning: false }
    }));
    this.render();
  }

  reset() {
    this.pause();
    window.appState.update(s => ({
      ...s,
      activeFocus: {
        ...(s.activeFocus || {}),
        elapsedSeconds: 0,
        isOverrun: false
      }
    }));
    this.render();
  }

  tick() {
    const state = window.appState.getState();
    const active = state.activeFocus || { plannedSeconds: 1500, elapsedSeconds: 0 };
    const nextElapsed = active.elapsedSeconds + 1;
    const isOverrun = nextElapsed > active.plannedSeconds;

    let addedStudyMin = 0;
    if (nextElapsed % 60 === 0) {
      addedStudyMin = 1;
    }

    const overrunMinutes = Math.floor((nextElapsed - active.plannedSeconds) / 60);
    const triggerPrompt = isOverrun && overrunMinutes >= 5 && !active.overrunPromptActive;

    // Increment actual minutes on the linked task
    const updatedTasks = (state.tasks || []).map(t => {
      if (t.id === active.taskId && addedStudyMin > 0) {
        return { ...t, actualMinutes: (t.actualMinutes || 0) + addedStudyMin };
      }
      return t;
    });

    window.appState.update(s => ({
      ...s,
      tasks: updatedTasks,
      studyMinutesCompleted: (s.studyMinutesCompleted || 0) + addedStudyMin,
      activeFocus: {
        ...s.activeFocus,
        elapsedSeconds: nextElapsed,
        isOverrun,
        overrunPromptActive: triggerPrompt ? true : s.activeFocus?.overrunPromptActive
      }
    }));

    if (triggerPrompt) {
      this.triggerOverrunAlert(overrunMinutes);
    }

    this.render();
  }

  triggerOverrunAlert(overrunMinutes) {
    if (window.audioFlowOS) window.audioFlowOS.playChime();

    const banner = document.getElementById('overrun-divergence-banner');
    const textEl = document.getElementById('overrun-banner-text');

    const state = window.appState.getState();
    const plannedMin = Math.floor((state.activeFocus?.plannedSeconds || 0) / 60);
    const actualMin = Math.floor((state.activeFocus?.elapsedSeconds || 0) / 60);

    if (textEl) {
      textEl.innerHTML = `
        <strong>⚡ Reality Divergence Detected:</strong> You planned <strong>${plannedMin}m</strong> on <em>"${state.activeFocus?.taskTitle || 'Task'}"</em>, but have worked <strong>${actualMin}m</strong> (+${overrunMinutes}m overrun). FlowOS can rebalance your remaining day in 1 click.
      `;
    }

    if (banner) banner.style.display = 'flex';
    window.showToast?.('⚠️ Focus overrun detected. Rebalancing available.');
  }

  executeOverrunRebalance() {
    const state = window.appState.getState();
    const overrunMinutes = Math.max(15, Math.floor(((state.activeFocus?.elapsedSeconds || 0) - (state.activeFocus?.plannedSeconds || 0)) / 60));

    const rebalanced = window.AIScheduleEngine?.rebalanceAfterOverrun 
      ? window.AIScheduleEngine.rebalanceAfterOverrun(state.todaySchedule, overrunMinutes)
      : state.todaySchedule;

    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      taskId: state.activeFocus?.taskId,
      taskTitle: state.activeFocus?.taskTitle,
      plannedMinutes: Math.floor((state.activeFocus?.plannedSeconds || 0) / 60),
      actualMinutes: Math.floor((state.activeFocus?.elapsedSeconds || 0) / 60),
      overrunMinutes
    };

    window.appState.update(s => ({
      ...s,
      todaySchedule: rebalanced,
      focusHistory: [historyEntry, ...(s.focusHistory || [])]
    }));

    const banner = document.getElementById('overrun-divergence-banner');
    if (banner) banner.style.display = 'none';

    window.showToast?.('✨ Schedule intelligently rebalanced to preserve bedtime & recovery!');
  }

  render() {
    const state = window.appState.getState();
    const active = state.activeFocus || { plannedSeconds: 1500, elapsedSeconds: 0, isRunning: false, taskTitle: 'Focus Block' };

    let displaySeconds = 0;
    let isOverrun = false;

    if (this.mode === 'stopwatch') {
      displaySeconds = active.elapsedSeconds;
      isOverrun = active.elapsedSeconds > active.plannedSeconds;
    } else {
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

    // Update Dashboard Mini Circular Timer if present
    const dashTimeEl = document.getElementById('dashboard-timer-display');
    const dashCircleEl = document.getElementById('dashboard-timer-circle-fill');
    
    if (dashTimeEl) {
      dashTimeEl.textContent = formatted;
      dashTimeEl.style.color = isOverrun ? 'var(--accent-screen-light)' : 'var(--text-primary)';
    }

    if (dashCircleEl) {
      const circ = 251.2; // 2 * Math.PI * 40
      const progress = isOverrun ? 1 : (active.elapsedSeconds / (active.plannedSeconds || 1));
      const offset = circ * (1 - Math.min(1, progress));
      dashCircleEl.style.strokeDashoffset = offset;
    }

    if (this.phaseDisplay) {
      const modeLabel = this.mode === 'stopwatch' ? 'Stopwatch Flow' : 'Pomodoro Countdown';
      const modeLabelEl = document.getElementById('timer-mode-label');
      if (modeLabelEl) {
        modeLabelEl.textContent = modeLabel.toUpperCase();
      }
      this.phaseDisplay.textContent = active.taskTitle || 'Deep Focus';
      this.phaseDisplay.title = active.taskTitle || 'Deep Focus';
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

window.FocusEngineController = FocusEngineController;
window.focusEngine = new FocusEngineController();
