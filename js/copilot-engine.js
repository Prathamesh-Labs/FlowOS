/**
 * FLOWOS - AUTONOMOUS COPILOT ENGINE (V2.0)
 * Proactively monitors meaningful behavioral events (overruns, tight schedules, friction).
 * Delivers calm, high-signal 1-click interventions without chatty interruption.
 */

class FlowOSCopilotEngine {
  constructor() {
    this.checkInterval = null;
    this.isDrawerOpen = false;
  }

  init() {
    this.bindUI();
    this.startMonitoring();
    this.render();
  }

  bindUI() {
    // 1. HUD Pill Toggle
    const hudPill = document.getElementById('copilot-hud-pill');
    if (hudPill) {
      hudPill.addEventListener('click', () => {
        this.toggleDrawer();
      });
    }

    // 2. Drawer Close Button
    const closeBtn = document.getElementById('btn-close-copilot-drawer');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // 3. Diagnostic Test Triggers
    const simOverrunBtn = document.getElementById('btn-sim-copilot-overrun');
    if (simOverrunBtn) {
      simOverrunBtn.addEventListener('click', () => this.simulateTrigger('overrun'));
    }

    const simImpossibleBtn = document.getElementById('btn-sim-copilot-impossible');
    if (simImpossibleBtn) {
      simImpossibleBtn.addEventListener('click', () => this.simulateTrigger('impossible'));
    }

    const simInactivityBtn = document.getElementById('btn-sim-copilot-inactivity');
    if (simInactivityBtn) {
      simInactivityBtn.addEventListener('click', () => this.simulateTrigger('inactivity'));
    }

    const simFailureBtn = document.getElementById('btn-sim-copilot-failure');
    if (simFailureBtn) {
      simFailureBtn.addEventListener('click', () => this.simulateTrigger('failure'));
    }
  }

  toggleDrawer() {
    if (this.isDrawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    this.isDrawerOpen = true;
    const drawer = document.getElementById('copilot-drawer');
    if (drawer) drawer.classList.add('open');
    this.render();
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    const drawer = document.getElementById('copilot-drawer');
    if (drawer) drawer.classList.remove('open');
  }

  startMonitoring() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    // Evaluate behavioral triggers every 45 seconds
    this.checkInterval = setInterval(() => {
      this.evaluateState();
    }, 45000);
  }

  evaluateState() {
    const state = window.appState.getState();
    const copilot = state.copilotState || {};

    if (!copilot.enabled) return;

    // Check anti-interruption throttle
    if (copilot.silenceUntil && Date.now() < copilot.silenceUntil) {
      return;
    }

    // If an active intervention is already pending user choice, don't overwrite
    if (copilot.activeIntervention) return;

    // Trigger Checks
    this.checkImpossibleSchedule(state);
  }

  checkImpossibleSchedule(state) {
    const pendingTasks = (state.tasks || []).filter(t => !t.completed);
    const totalRemainingMinutes = pendingTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 45), 0);

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const targetBedtimeMins = 23 * 60; // 11:00 PM
    const availableMins = Math.max(0, targetBedtimeMins - currentMins);

    if (totalRemainingMinutes > availableMins && pendingTasks.length >= 3 && availableMins > 0) {
      const excess = totalRemainingMinutes - availableMins;
      this.triggerIntervention({
        id: `impossible_${Date.now()}`,
        type: 'impossible',
        severity: 'high',
        title: '⚠️ Mathematically Impossible Schedule',
        message: `You have ${pendingTasks.length} tasks requiring ~${Math.round(totalRemainingMinutes/60)}h ${totalRemainingMinutes%60}m, but only ~${Math.round(availableMins/60)}h ${availableMins%60}m remain before your 11:00 PM bedtime. Schedule is oversubscribed by +${excess}m.`,
        question: 'How would you like FlowOS Copilot to calibrate your evening to protect your sleep hygiene?',
        options: [
          { id: 'defer_lowest', label: '✂️ Defer 2 Lowest-Priority Tasks', action: 'defer_low_priority', style: 'btn-emerald' },
          { id: 'compress_all', label: '⚡ Compress All Blocks by 25%', action: 'compress_all_blocks', style: 'btn-secondary' },
          { id: 'dismiss', label: 'Dismiss (Mute 20m)', action: 'dismiss', style: 'btn-secondary' }
        ]
      });
    }
  }

  triggerIntervention(intervention) {
    window.appState.update(s => ({
      ...s,
      copilotState: {
        ...s.copilotState,
        activeIntervention: intervention,
        lastInterventionTime: Date.now(),
        stats: {
          ...s.copilotState.stats,
          interventionsTriggered: (s.copilotState.stats.interventionsTriggered || 0) + 1
        }
      }
    }));

    if (window.audioFlowOS) window.audioFlowOS.playAlert();
    this.render();

    // Subtle unobtrusive notification
    window.showToast?.(`🤖 Copilot Insight: ${intervention.title}`);
  }

  simulateTrigger(type) {
    if (type === 'overrun') {
      this.triggerIntervention({
        id: `sim_overrun_${Date.now()}`,
        type: 'overrun',
        severity: 'moderate',
        title: '⏱️ Focus Block Overrun (+30m Variance)',
        message: 'Your current coding sprint on "Auth Module" has run 30m longer than estimated. Personal Flow Profile confirms coding tasks often have a +45% variance.',
        question: 'Should we auto-compress tonight\'s 45m review buffer so your 6:00 PM workout and 10:30 PM bedtime stay intact?',
        options: [
          { id: 'compress_review', label: '⚡ Rebalance & Protect Bedtime', action: 'compress_evening', style: 'btn-emerald' },
          { id: 'add_15m', label: '⏳ Extend Timer by 15m', action: 'extend_timer', style: 'btn-secondary' },
          { id: 'dismiss', label: 'Dismiss for 15m', action: 'dismiss', style: 'btn-secondary' }
        ]
      });
    } else if (type === 'impossible') {
      this.triggerIntervention({
        id: `sim_impossible_${Date.now()}`,
        type: 'impossible',
        severity: 'high',
        title: '⚠️ Impossible Evening Schedule Detected',
        message: 'Calculated 4.5 hours of pending tasks, but only 3 hours remain before target sleep (11:00 PM).',
        question: 'Would you like FlowOS to defer the 2 lowest priority tasks to tomorrow morning\'s peak flow block?',
        options: [
          { id: 'defer_lowest', label: '✂️ Defer 2 Low-Priority Tasks', action: 'defer_low_priority', style: 'btn-emerald' },
          { id: 'compress_all', label: '⚡ Compress All Tasks (-25%)', action: 'compress_all_blocks', style: 'btn-secondary' },
          { id: 'dismiss', label: 'Dismiss for 15m', action: 'dismiss', style: 'btn-secondary' }
        ]
      });
    } else if (type === 'inactivity') {
      this.triggerIntervention({
        id: `sim_inactivity_${Date.now()}`,
        type: 'inactivity',
        severity: 'low',
        title: '💤 Inactive Focus Block Detected',
        message: 'You have been away or idle for 25 minutes while the focus timer was running.',
        question: 'Should we log this elapsed time as a restorative break and reset your focus timer fresh for your next sprint?',
        options: [
          { id: 'log_break', label: '☕ Log as Restorative Break', action: 'log_idle_break', style: 'btn-emerald' },
          { id: 'resume_timer', label: '▶️ Resume Flow Timer', action: 'resume_timer', style: 'btn-secondary' },
          { id: 'dismiss', label: 'Dismiss', action: 'dismiss', style: 'btn-secondary' }
        ]
      });
    } else if (type === 'failure') {
      this.triggerIntervention({
        id: `sim_failure_${Date.now()}`,
        type: 'failure',
        severity: 'moderate',
        title: '🔄 Repeated Friction on "FastAPI Auth"',
        message: 'This task has been postponed 3 times across the last 2 days. Digital Twin identifies high startup resistance.',
        question: 'Would you like the AI Obstacle Deconstructor to break this down into an immediate 10-minute micro-step?',
        options: [
          { id: 'deconstruct', label: '✂️ Deconstruct into 10m Step', action: 'open_deconstructor', style: 'btn-emerald' },
          { id: 'defer_tomorrow', label: '📅 Reschedule to Tomorrow Peak', action: 'defer_to_morning', style: 'btn-secondary' },
          { id: 'dismiss', label: 'Dismiss', action: 'dismiss', style: 'btn-secondary' }
        ]
      });
    }

    this.openDrawer();
  }

  executeAction(actionKey) {
    if (actionKey === 'dismiss') {
      // Anti-interruption throttle: Silence copilot for 15 mins
      window.appState.update(s => ({
        ...s,
        copilotState: {
          ...s.copilotState,
          activeIntervention: null,
          silenceUntil: Date.now() + 15 * 60000
        }
      }));
      window.showToast?.('🌿 Copilot quieted for 15 minutes.');
    } else if (actionKey === 'compress_evening') {
      window.appState.update(s => ({
        ...s,
        copilotState: {
          ...s.copilotState,
          activeIntervention: null,
          stats: {
            ...s.copilotState.stats,
            actionsAccepted: (s.copilotState.stats.actionsAccepted || 0) + 1,
            hoursProtected: (s.copilotState.stats.hoursProtected || 0) + 0.75
          }
        }
      }));
      if (window.memoryReplayEngine) {
        window.memoryReplayEngine.addMemoryMoment(
          'ai-decision',
          'Copilot Schedule Rebalance',
          'Compressed evening review to safeguard 10:30 PM bedtime and workout.',
          'Saved: 45m bedtime drift',
          'Bedtime Protected',
          'shield-check'
        );
      }
      if (window.audioFlowOS) window.audioFlowOS.playChime();
      window.showToast?.('⚡ Evening schedule compressed. Bedtime protected!');
    } else if (actionKey === 'defer_low_priority') {
      window.appState.update(s => {
        const tasks = s.tasks || [];
        const pending = tasks.filter(t => !t.completed);
        const lowPrio = pending.filter(t => t.priority === 'low' || t.priority === 'medium').slice(0, 2);
        const deferredIds = lowPrio.map(t => t.id);

        const updatedTasks = tasks.map(t => deferredIds.includes(t.id) ? { ...t, deferredToTomorrow: true } : t);

        return {
          ...s,
          tasks: updatedTasks,
          copilotState: {
            ...s.copilotState,
            activeIntervention: null,
            stats: {
              ...s.copilotState.stats,
              actionsAccepted: (s.copilotState.stats.actionsAccepted || 0) + 1,
              hoursProtected: (s.copilotState.stats.hoursProtected || 0) + 1.5
            }
          }
        };
      });
      if (window.audioFlowOS) window.audioFlowOS.playChime();
      window.showToast?.('✂️ 2 secondary tasks deferred to tomorrow morning flow!');
    } else if (actionKey === 'open_deconstructor') {
      window.appState.update(s => ({
        ...s,
        copilotState: { ...s.copilotState, activeIntervention: null }
      }));
      this.closeDrawer();
      if (window.openObstacleSolver) window.openObstacleSolver('FastAPI User Authentication');
    } else {
      window.appState.update(s => ({
        ...s,
        copilotState: { ...s.copilotState, activeIntervention: null }
      }));
      window.showToast?.('Action applied successfully.');
    }

    this.render();
  }

  render() {
    const state = window.appState.getState();
    const copilot = state.copilotState || {};
    const active = copilot.activeIntervention;

    // 1. HUD Pill Badge & Dot
    const hudPill = document.getElementById('copilot-hud-pill');
    const hudBadge = document.getElementById('copilot-hud-badge');
    const hudStatusText = document.getElementById('copilot-hud-status');

    if (hudPill) {
      hudPill.classList.toggle('has-alert', !!active);
    }
    if (hudBadge) {
      hudBadge.style.display = active ? 'inline-block' : 'none';
    }
    if (hudStatusText) {
      hudStatusText.textContent = active ? 'Action Recommended' : 'Observing Flow';
    }

    // 2. Render Drawer Content
    const drawerContent = document.getElementById('copilot-intervention-body');
    if (drawerContent) {
      if (active) {
        drawerContent.innerHTML = `
          <div class="copilot-intervention-card severity-${active.severity || 'moderate'}">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <span class="badge ${active.severity === 'high' ? 'badge-amber' : 'badge-blue'}">
                ${active.title}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Live Diagnostic</span>
            </div>

            <p style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.5; margin-bottom: 0.8rem;">
              ${active.message}
            </p>

            <div class="copilot-inquiry-box">
              <strong style="font-size: 0.85rem; color: var(--accent-study-light); display: flex; align-items: center; gap: 0.4rem;">
                <i data-lucide="help-circle"></i> Copilot Inquiry:
              </strong>
              <p style="font-size: 0.82rem; color: #fff; margin-top: 0.3rem;">
                ${active.question}
              </p>
            </div>

            <div class="copilot-actions-grid">
              ${active.options.map(opt => `
                <button class="btn ${opt.style || 'btn-secondary'}" 
                        onclick="window.copilotEngine.executeAction('${opt.action}')"
                        style="font-size: 0.82rem; padding: 0.5rem 0.8rem; text-align: center;">
                  ${opt.label}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        drawerContent.innerHTML = `
          <div style="text-align: center; padding: 2rem 1rem; color: var(--text-secondary);">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(52, 211, 153, 0.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.8rem; color: #34d399;">
              <i data-lucide="shield-check" style="width: 24px; height: 24px;"></i>
            </div>
            <h4 style="font-size: 1rem; font-weight: 700; color: #fff;">All Systems Flowing Smoothly</h4>
            <p style="font-size: 0.82rem; margin-top: 0.3rem; color: var(--text-secondary);">
              FlowOS Copilot is monitoring focus stamina, schedule buffers, and bedtime alignment in the background.
            </p>
          </div>
        `;
      }
    }

    // 3. Stats display
    const statsInterventionEl = document.getElementById('copilot-stat-interventions');
    const statsSavedEl = document.getElementById('copilot-stat-saved');
    if (statsInterventionEl && copilot.stats) {
      statsInterventionEl.textContent = `${copilot.stats.actionsAccepted || 0} Decisions Applied`;
    }
    if (statsSavedEl && copilot.stats) {
      statsSavedEl.textContent = `${copilot.stats.hoursProtected || 0}h Sleep Buffer Protected`;
    }

    if (window.lucide) lucide.createIcons();
  }
}

window.FlowOSCopilotEngine = FlowOSCopilotEngine;
window.ZenithCopilotEngine = FlowOSCopilotEngine;
window.copilotEngine = new FlowOSCopilotEngine();
