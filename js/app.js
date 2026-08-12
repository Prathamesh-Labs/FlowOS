/**
 * FLOWOS - MASTER OPERATING SYSTEM CONTROLLER (V4.0)
 * Coordinates the Unified Operational Loop:
 * GOAL -> PLAN -> EXECUTE -> OBSERVE REALITY -> DETECT DEVIATION -> REASON -> ADAPT -> LEARN
 */

document.addEventListener('DOMContentLoaded', () => {
  initMasterApp();
});

function initMasterApp() {
  // 1. Initialize Sub-modules
  window.focusEngine?.init();
  window.screenGuardian?.init();
  window.notificationEngine?.init();
  window.customMediaController?.init();
  window.voiceEngine?.init();
  window.pipTimerController?.init();
  window.heatmapEngine?.init();
  window.readinessEngine?.init();
  window.questsEngine?.init();
  window.qrSyncEngine?.init();
  window.personalFlowProfileEngine?.init();
  window.memoryReplayEngine?.init();
  window.copilotEngine?.init();
  window.onboardingEngine?.init();
  window.flowosExperience?.init();

  // 2. Live Clock & Activity Awareness
  startLiveClock();
  setupBrowserActivityAwareness();

  // 3. Navigation & Subnav Switchers
  setupNavigation();

  // 4. Setup Interactive Handlers
  setupCommandCenterInteractions();
  setupAskFlowOSInteractions();
  setupScenarioSimulatorInteractions();
  setupScheduleInteractions();
  setupGoalInteractions();
  setupTasksAndHabitsInteractions();
  setupDietInteractions();
  setupSoundscapeInteractions();
  setupOlderAdultInteractions();
  setupPortabilityInteractions();
  setupObstacleModal();
  setupGeneratorModal();
  setupThemeToggle();

  // 5. Subscribe to Reactive State Store
  window.appState.subscribe(renderAllState);

  // Initial Full Render
  renderAllState(window.appState.getState());

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   BROWSER-LEVEL ACTIVITY AWARENESS
   ========================================================================== */
let tabBlurTime = null;

function setupBrowserActivityAwareness() {
  window.addEventListener('blur', () => {
    tabBlurTime = Date.now();
  });

  window.addEventListener('focus', () => {
    if (tabBlurTime) {
      const awayMinutes = Math.floor((Date.now() - tabBlurTime) / 60000);
      if (awayMinutes >= 5) {
        showToast(`🌿 Welcome back! You were away from FlowOS for ${awayMinutes} mins. Focus state preserved.`);
      }
      tabBlurTime = null;
    }
  });
}

/* ==========================================================================
   LIVE CLOCK
   ========================================================================== */
function startLiveClock() {
  const clockEl = document.getElementById('header-live-clock');
  const dateEl = document.getElementById('header-live-date');

  function update() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   NAVIGATION & SUBNAV PILLS ROUTING
   ========================================================================== */
const TAB_ROUTING_MAP = {
  'today': { layer: 'today', subnav: null },
  'now': { layer: 'today', subnav: null },
  'plan': { layer: 'plan', subnav: 'plan-goals' },
  'goals': { layer: 'plan', subnav: 'plan-goals' },
  'tasks-habits': { layer: 'plan', subnav: 'plan-tasks' },
  'tasks': { layer: 'plan', subnav: 'plan-tasks' },
  'habits': { layer: 'plan', subnav: 'plan-tasks' },
  'timeline': { layer: 'plan', subnav: 'plan-timeline' },
  'schedule': { layer: 'plan', subnav: 'plan-timeline' },
  'adapt': { layer: 'adapt', subnav: null },
  'reality': { layer: 'adapt', subnav: null },
  'understand': { layer: 'understand', subnav: 'understand-analytics' },
  'analytics': { layer: 'understand', subnav: 'understand-analytics' },
  'heatmap': { layer: 'understand', subnav: 'understand-heatmap' },
  'memory-replay': { layer: 'understand', subnav: 'understand-replay' },
  'replay': { layer: 'understand', subnav: 'understand-replay' },
  'digital-twin': { layer: 'understand', subnav: 'understand-profile' },
  'profile': { layer: 'understand', subnav: 'understand-profile' },
  'debrief': { layer: 'understand', subnav: 'understand-debrief' },
  'wellness': { layer: 'wellness', subnav: 'wellness-hydration' },
  'hydration': { layer: 'wellness', subnav: 'wellness-hydration' },
  'diet': { layer: 'wellness', subnav: 'wellness-nutrition' },
  'nutrition': { layer: 'wellness', subnav: 'wellness-nutrition' },
  'screen': { layer: 'wellness', subnav: 'wellness-screen' },
  'study': { layer: 'study', subnav: null },
  'focus': { layer: 'study', subnav: null },
  'motivation': { layer: 'motivation', subnav: null },
  'quests': { layer: 'motivation', subnav: null },
  'elderly': { layer: 'elderly', subnav: null },
  'accessibility': { layer: 'elderly', subnav: null },
  'sync': { layer: 'sync', subnav: null },
  'welcome': { layer: 'welcome', subnav: null }
};

function navigateToTab(targetKey) {
  const route = TAB_ROUTING_MAP[targetKey] || { layer: targetKey, subnav: null };
  const targetTab = route.layer;

  const navItems = document.querySelectorAll('.nav-item, .sidebar-sub-item');
  const tabPanels = document.querySelectorAll('.tab-panel');

  navItems.forEach(n => {
    n.classList.toggle('active', n.dataset.tab === targetTab);
  });

  tabPanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${targetTab}`);
  });

  if (route.subnav) {
    const targetPill = document.querySelector(`.subnav-pill[data-subnav="${route.subnav}"]`);
    if (targetPill) targetPill.click();
  }

  // Close mobile sidebar if open
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.lucide) lucide.createIcons();
}

window.navigateToTab = navigateToTab;

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item, .sidebar-sub-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.dataset.tab;
      navigateToTab(targetTab);
    });
  });

  // Setup Subnav Pills Switchers across panels
  document.querySelectorAll('.subnav-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      const subnavKey = pill.dataset.subnav;
      const panelContainer = pill.closest('.tab-panel') || document;
      panelContainer.querySelectorAll('.subnav-pill').forEach(p => p.classList.remove('active'));
      panelContainer.querySelectorAll('.subnav-panel').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const targetPanel = document.getElementById(`panel-${subnavKey}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
      if (window.lucide) lucide.createIcons();
    });
  });

  // Mobile menu toggle
  const menuToggleBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Care mode toggle
  const accessibilityToggle = document.getElementById('toggle-accessibility-mode');
  if (accessibilityToggle) {
    accessibilityToggle.addEventListener('click', () => {
      window.ElderlyModeController.toggleAccessibilityMode();
    });
  }
}

/* ==========================================================================
   COMMAND CENTER (NOW, MISSION, WHAT CHANGED, NEXT ACTION)
   ========================================================================== */
function setupCommandCenterInteractions() {
  // Reality Trigger Buttons
  document.querySelectorAll('.btn-reality-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventType = e.currentTarget.dataset.event;
      window.RealityEventEngine.triggerEvent(eventType);
    });
  });
}

function renderCommandCenter(state) {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // 1. Render NOW Active Block
  const activeBlock = (state.todaySchedule || []).find(b => {
    const [sh, sm] = (b.timeStart || '00:00').split(':').map(Number);
    const [eh, em] = (b.timeEnd || '00:00').split(':').map(Number);
    return currentMins >= (sh * 60 + sm) && currentMins < (eh * 60 + em);
  }) || (state.todaySchedule && state.todaySchedule[0]);

  const nowTitleEl = document.getElementById('command-now-title');
  const nowTimeEl = document.getElementById('command-now-time');
  const nowDescEl = document.getElementById('command-now-desc');

  if (activeBlock) {
    if (nowTitleEl) nowTitleEl.textContent = activeBlock.title;
    if (nowTimeEl) nowTimeEl.textContent = `${activeBlock.timeStart} - ${activeBlock.timeEnd}`;
    if (nowDescEl) nowDescEl.textContent = activeBlock.desc;
  }

  // 2. Render Current Mission
  const missionTitleEl = document.getElementById('command-mission-title');
  const missionTargetEl = document.getElementById('command-mission-target');
  if (missionTitleEl && state.currentMission) {
    missionTitleEl.textContent = state.currentMission.title;
  }
  if (missionTargetEl && state.currentMission) {
    missionTargetEl.textContent = `🎯 Target: ${state.currentMission.targetCompletion}`;
  }

  // 3. Render WHAT CHANGED (Active Reality Event)
  const realityCard = document.getElementById('command-reality-alert-card');
  const alert = state.activeRealityAlert;

  if (realityCard) {
    if (alert && alert.active) {
      realityCard.style.display = 'block';
      realityCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="badge" style="background: rgba(245,158,11,0.2); color: var(--accent-screen-light); border: 1px solid rgba(245,158,11,0.4);">
                ⚡ WHAT CHANGED • REALITY EVENT
              </span>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-top: 0.4rem;">
              ${alert.title}
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-primary); margin-top: 0.2rem;">
              <strong>Observation:</strong> ${alert.whatChanged}
            </p>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 0.2rem;">
              <strong>Schedule Impact:</strong> ${alert.impactSummary}
            </p>
          </div>
          <button class="btn-icon" onclick="window.RealityEventEngine.dismissAlert()" title="Dismiss">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div style="margin-top: 1rem; font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">
          Concrete Adaptation Options:
        </div>

        <div class="reality-options-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.8rem; margin-top: 0.6rem;">
          ${(alert.options || []).map(opt => {
            const isRec = opt.id === alert.recommendedOptionId;
            return `
              <div class="card" style="padding: 0.9rem; background: ${isRec ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.25)'}; border: 1px solid ${isRec ? 'var(--accent-diet)' : 'var(--border-subtle)'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                  ${isRec ? '<span style="font-size: 0.68rem; font-weight: 800; color: var(--accent-diet-light); text-transform: uppercase;">★ Recommended</span>' : '<span></span>'}
                  <span class="badge" style="font-size: 0.65rem; background: rgba(99,102,241,0.15); color: var(--accent-study-light);">Adaptation</span>
                </div>
                <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--text-primary); margin-top: 0.2rem;">${opt.title}</h4>
                <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.3rem; line-height: 1.35;">${opt.desc}</p>
                <div style="display: flex; gap: 0.4rem; margin-top: 0.6rem;">
                  <button class="btn ${isRec ? 'btn-emerald' : 'btn-secondary'}" onclick="window.RealityEventEngine.applyOption('${opt.id}')" style="flex: 1; font-size: 0.78rem; padding: 0.35rem 0.6rem;">
                    Apply
                  </button>
                  <button class="btn btn-secondary" onclick="openScenarioSimulator('spend-extra-hours-coding')" style="font-size: 0.78rem; padding: 0.35rem 0.6rem;" title="Simulate in What-If">
                    Simulate
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      realityCard.style.display = 'none';
    }
  }

  // 4. Render NEXT ACTION
  const pendingTasks = (state.tasks || []).filter(t => !t.completed);
  const nextTask = pendingTasks[0];
  const nextActionEl = document.getElementById('command-next-action-text');
  if (nextActionEl) {
    if (nextTask) {
      nextActionEl.innerHTML = `
        <strong>${nextTask.title}</strong>
        <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
          Est. ${nextTask.estimatedMinutes}m • Priority: ${nextTask.priority.toUpperCase()}
        </div>
      `;
    } else {
      nextActionEl.textContent = 'All priority tasks completed for today!';
    }
  }

  // 5. Render Learned Reality Insight
  const learnedContainer = document.getElementById('learned-reality-summary');
  if (learnedContainer) {
    const validated = window.PersonalRealityLearningEngine.getValidatedInsights();
    if (validated.hasData) {
      learnedContainer.innerHTML = validated.insights.map(ins => `
        <div style="padding: 0.65rem 0.85rem; background: rgba(99,102,241,0.1); border-left: 3px solid var(--accent-study); border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--text-primary); margin-top: 0.4rem;">
          🧠 <strong>Observed Pattern:</strong> ${ins.insight}
        </div>
      `).join('');
    } else {
      learnedContainer.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem 0;">${validated.message}</p>`;
    }
  }

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   ASK FLOWOS CONTEXTUAL ASSISTANT
   ========================================================================== */
function setupAskFlowOSInteractions() {
  const form = document.getElementById('ask-zenith-form');
  const input = document.getElementById('ask-zenith-input');
  const resultBox = document.getElementById('ask-zenith-result-box');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;

      const engine = window.AskFlowOSEngine || window.AskZenithEngine;
      const res = engine ? engine.ask(q) : { title: 'Analysis', analysisHtml: '<p>Processing...</p>', recommendation: 'Review schedule.', options: [] };

      if (resultBox) {
        resultBox.innerHTML = `
          <div style="margin-top: 1rem; padding: 1.2rem; background: rgba(99, 102, 241, 0.12); border: 1px solid var(--accent-study-light); border-radius: var(--radius-md);">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff;">🤖 ${res.title}</h4>
            ${res.analysisHtml}
            <div style="margin-top: 0.8rem; padding: 0.65rem 0.9rem; background: rgba(16,185,129,0.1); border-left: 3px solid var(--accent-diet); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--accent-diet-light);">
              💡 <strong>Recommendation:</strong> ${res.recommendation}
            </div>
            <div style="display: flex; gap: 0.6rem; margin-top: 0.8rem; flex-wrap: wrap;">
              ${(res.options || []).map(opt => `
                <button class="btn btn-emerald" onclick="applyAskZenithOption('${opt.action}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                  <i data-lucide="check"></i> ${opt.title}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (window.lucide) lucide.createIcons();
    });
  }

  // Quick prompt chips
  document.querySelectorAll('.btn-ask-quick-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const q = e.currentTarget.textContent.trim();
      if (input) {
        input.value = q;
        form.dispatchEvent(new Event('submit'));
      }
    });
  });
}

window.applyAskZenithOption = function(action) {
  const state = window.appState.getState();
  let updatedSchedule = [...state.todaySchedule];

  if (action === 'compress-secondary') {
    updatedSchedule = updatedSchedule.map(b => {
      if (b.title.toLowerCase().includes('review') || b.title.toLowerCase().includes('reading')) {
        return { ...b, timeStart: '19:45', timeEnd: '20:15', title: '[Condensed] Evening Review (30m)' };
      }
      return b;
    });
  } else if (action === 'take-20m-walk') {
    showToast('🌿 20-Min restorative walk scheduled! Hydrate and step away.');
  }

  window.appState.update(s => ({ ...s, todaySchedule: updatedSchedule }));
  const box = document.getElementById('ask-zenith-result-box');
  if (box) box.innerHTML = '';
  showToast('✨ Decision applied! Schedule recalibrated.');
};

/* ==========================================================================
   WHAT-IF SCENARIO SIMULATOR
   ========================================================================== */
function setupScenarioSimulatorInteractions() {
  const modal = document.getElementById('simulator-modal');
  const closeBtn = document.getElementById('btn-close-simulator');
  const form = document.getElementById('simulator-form');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = form.scenarioType.value;
      const duration = parseInt(form.scenarioDuration.value, 10);

      const sim = window.ScenarioSimulator.simulateScenario(type, duration);
      renderSimulationResult(sim);
    });
  }
}

window.openScenarioSimulator = function(scenarioType = 'spend-extra-hours-coding') {
  const modal = document.getElementById('simulator-modal');
  if (modal) {
    modal.classList.add('open');
    const sim = window.ScenarioSimulator.simulateScenario(scenarioType, 120);
    renderSimulationResult(sim);
  }
};

function renderSimulationResult(sim) {
  const box = document.getElementById('simulation-comparison-box');
  if (!box) return;

  box.innerHTML = `
    <div style="margin-top: 1rem;">
      <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--accent-study-light);">🔮 ${sim.title}</h4>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">${sim.description}</p>

      <div class="whatif-comparison-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin: 0.8rem 0;">
        <div style="padding: 0.8rem; background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <h5 style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">LIVE SCHEDULE</h5>
          <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.3rem;">
            <div>• Focus Block: 1h 00m</div>
            <div>• Evening Review: 60m (07:00 PM)</div>
            <div>• Bedtime: 10:30 PM</div>
          </div>
        </div>

        <div style="padding: 0.8rem; background: rgba(99,102,241,0.1); border-radius: var(--radius-sm); border: 1px solid var(--accent-study);">
          <h5 style="font-size: 0.78rem; color: var(--accent-study-light); text-transform: uppercase; margin-bottom: 0.4rem;">SIMULATED SCENARIO</h5>
          <div style="font-size: 0.8rem; color: var(--text-primary); display: flex; flex-direction: column; gap: 0.3rem;">
            <div>• Extended Focus: 3h 00m (+2h)</div>
            <div>• Evening Review: Condensed to 15m</div>
            <div>• Bedtime: 11:00 PM (+30m drift)</div>
          </div>
        </div>
      </div>

      <div style="padding: 0.8rem; background: rgba(0,0,0,0.25); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 0.9rem;">
        <div style="font-size: 0.8rem; color: var(--accent-screen-light);">
          ${sim.conflicts.join('<br>')}
        </div>
        <div style="font-size: 0.8rem; color: var(--accent-diet-light); margin-top: 0.4rem;">
          ${sim.goalImpact}
        </div>
      </div>

      <div style="display: flex; gap: 0.6rem;">
        <button class="btn btn-emerald" onclick="window.ScenarioSimulator.applySimulation(); document.getElementById('simulator-modal').classList.remove('open');" style="flex: 1; font-size: 0.82rem;">
          <i data-lucide="check"></i> Apply Simulated Schedule to Live Day
        </button>
        <button class="btn btn-secondary" onclick="window.ScenarioSimulator.discardSimulation(); document.getElementById('simulator-modal').classList.remove('open');" style="font-size: 0.82rem;">
          Discard Simulation
        </button>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   SCHEDULE TIMELINE & ADAPTATION HANDLERS
   ========================================================================== */
function setupScheduleInteractions() {
  const exportICSBtn = document.getElementById('btn-export-ics');
  if (exportICSBtn) {
    exportICSBtn.addEventListener('click', () => {
      const schedule = window.appState.getState().todaySchedule;
      window.CalendarExporter.exportToICS(schedule);
      showToast('📅 iCalendar (.ics) routine downloaded!');
    });
  }

  const exportTxtBtn = document.getElementById('btn-export-txt');
  if (exportTxtBtn) {
    exportTxtBtn.addEventListener('click', () => {
      const schedule = window.appState.getState().todaySchedule;
      window.CalendarExporter.exportTextSummary(schedule);
      showToast('📄 Daily Blueprint text exported!');
    });
  }
}

function renderTimeline(schedule) {
  const container = document.getElementById('timeline-items-wrapper');
  if (!container) return;

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  container.innerHTML = (schedule || []).map((item) => {
    const [sh, sm] = (item.timeStart || '00:00').split(':').map(Number);
    const [eh, em] = (item.timeEnd || '00:00').split(':').map(Number);
    const startM = sh * 60 + sm;
    const endM = eh * 60 + em;

    const isCurrent = currentMins >= startM && currentMins < endM;
    const completedClass = item.completed ? 'completed' : '';
    const currentClass = isCurrent ? 'current-active' : '';

    return `
      <div class="timeline-item ${completedClass} ${currentClass}" data-id="${item.id}">
        <div class="timeline-time-badge">
          <span class="time-start">${item.timeStart}</span>
          <span class="time-duration">${item.timeEnd}</span>
        </div>
        <div class="timeline-content">
          <div class="item-meta">
            <span class="category-tag cat-${item.category}">${item.category}</span>
            ${item.isFixed ? '<span style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">FIXED</span>' : '<span style="font-size:0.65rem; color:var(--accent-study-light); font-weight:700;">FLEXIBLE</span>'}
            ${isCurrent ? '<span class="pulse-badge"><span class="pulse-dot"></span> NOW ACTIVE</span>' : ''}
          </div>
          <h4 class="item-title">${item.title}</h4>
          <p class="item-desc">${item.desc}</p>
        </div>
        <button class="timeline-action-btn" onclick="toggleScheduleItem('${item.id}')" title="Toggle Done">
          <i data-lucide="${item.completed ? 'check-circle-2' : 'circle'}"></i>
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

window.toggleScheduleItem = function(id) {
  window.appState.update(s => {
    const updated = (s.todaySchedule || []).map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState && window.audioFlowOS) window.audioFlowOS.playChime();
        return { ...item, completed: nextState };
      }
      return item;
    });
    return { ...s, todaySchedule: updated };
  });
};

/* ==========================================================================
   PORTABILITY & JSON BACKUP / RESTORE
   ========================================================================== */
function setupPortabilityInteractions() {
  const jsonExportBtn = document.getElementById('btn-export-json');
  if (jsonExportBtn) {
    jsonExportBtn.addEventListener('click', () => {
      const state = window.appState.getState();
      window.CalendarExporter.exportJSONBackup(state);
      showToast('📦 Full FlowOS JSON backup downloaded!');
    });
  }

  const jsonImportInput = document.getElementById('input-import-json');
  if (jsonImportInput) {
    jsonImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        window.CalendarExporter.importJSONBackup(
          file,
          () => showToast('✨ State backup successfully restored!'),
          (err) => showToast(`❌ Error: ${err}`)
        );
      }
    });
  }
}

/* ==========================================================================
   GOAL INTELLIGENCE & OBSTACLE DECONSTRUCTOR
   ========================================================================== */
function setupGoalInteractions() {
  const form = document.getElementById('new-goal-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const prompt = form.goalPrompt.value;
      const category = form.goalCategory.value;
      if (!prompt) return;

      const { goal, tasks } = window.GoalIntelligenceEngine.synthesizeGoalFromPrompt(prompt, category);

      window.appState.update(s => ({
        ...s,
        goals: [goal, ...(s.goals || [])],
        tasks: [...tasks, ...(s.tasks || [])]
      }));

      form.reset();
      showToast('🎯 Goal intelligence roadmap synthesized into daily tasks!');
    });
  }
}

function renderGoals(goals) {
  const container = document.getElementById('goals-list-container');
  if (!container) return;

  if (!goals || goals.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon"><i data-lucide="target"></i></div>
        <p>No active goals yet. Use the synthesizer on the left to set your first goal.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = goals.map(goal => `
    <div class="card" style="padding: 1.25rem;">
      <div class="card-header" style="margin-bottom: 0.6rem;">
        <div>
          <span class="category-tag cat-${goal.category}">${goal.category}</span>
          <h4 style="font-size: 1.15rem; color: var(--text-primary); margin-top: 0.3rem;">${goal.title}</h4>
          <span style="font-size: 0.76rem; color: var(--text-muted);">Target: ${goal.targetDate}</span>
        </div>
        <div style="text-align: right;">
          <span style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-study-light); font-size: 1.15rem;">${goal.progress || 0}%</span>
        </div>
      </div>

      <div class="progress-bar-bg" style="height: 5px; margin-bottom: 0.8rem;">
        <div class="progress-bar-fill" style="width: ${goal.progress || 0}%;"></div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.45rem;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Milestones</span>
        ${(goal.milestones || []).map(m => `
          <label style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: ${m.completed ? 'var(--text-muted)' : 'var(--text-primary)'}; text-decoration: ${m.completed ? 'line-through' : 'none'}; cursor: pointer;">
            <input type="checkbox" ${m.completed ? 'checked' : ''} onchange="toggleMilestone('${goal.id}', '${m.id}')" style="accent-color: var(--accent-study);">
            ${m.title}
          </label>
        `).join('')}
      </div>

      <button class="btn btn-secondary" onclick="openObstacleSolver('${goal.title}')" style="margin-top: 0.8rem; width: 100%; font-size: 0.8rem; padding: 0.4rem;">
        <i data-lucide="help-circle"></i> Stuck on this goal? Deconstruct Obstacle
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

window.toggleMilestone = function(goalId, milestoneId) {
  window.appState.update(s => {
    const updatedGoals = (s.goals || []).map(g => {
      if (g.id === goalId) {
        const updatedM = g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
        const nextProgress = window.GoalIntelligenceEngine.recalculateGoalProgress({ ...g, milestones: updatedM });
        return { ...g, milestones: updatedM, progress: nextProgress };
      }
      return g;
    });
    return { ...s, goals: updatedGoals };
  });
};

/* ==========================================================================
   OBSTACLE SOLVER MODAL
   ========================================================================== */
function setupObstacleModal() {
  const modal = document.getElementById('obstacle-modal');
  const closeBtn = document.getElementById('btn-close-obstacle-modal');
  const form = document.getElementById('obstacle-deconstruct-form');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const desc = form.obstacleText.value;
      const res = window.GoalIntelligenceEngine.deconstructObstacle(desc);

      const resultBox = document.getElementById('obstacle-solution-box');
      if (resultBox) {
        resultBox.innerHTML = `
          <div style="margin-top: 1rem; padding: 1.1rem; background: rgba(99, 102, 241, 0.12); border: 1px solid var(--accent-study); border-radius: var(--radius-md);">
            <h4 style="color: var(--accent-study-light); font-size: 0.95rem; margin-bottom: 0.3rem;">🎯 Immediate 10-Min Micro-Step:</h4>
            <p style="font-size: 0.88rem; color: var(--text-primary); margin-bottom: 0.5rem;">${res.immediateMicroStep}</p>
            <p style="font-size: 0.78rem; color: var(--text-secondary);">💡 <em>Strategy: ${res.recoveryStrategy}</em></p>
            <button class="btn btn-emerald" onclick="applyObstacleMicroTask()" style="margin-top: 0.8rem; width: 100%; font-size: 0.82rem;">
              <i data-lucide="plus"></i> Add Micro-Step Directly to Today's Tasks
            </button>
          </div>
        `;
      }

      window.currentObstacleMicroTask = res.suggestedTask;
      if (window.lucide) lucide.createIcons();
    });
  }
}

window.openObstacleSolver = function(goalTitle) {
  const modal = document.getElementById('obstacle-modal');
  if (modal) {
    modal.classList.add('open');
  }
};

window.openObstacleModal = window.openObstacleSolver;

window.applyObstacleMicroTask = function() {
  if (window.currentObstacleMicroTask) {
    window.appState.update(s => ({
      ...s,
      tasks: [window.currentObstacleMicroTask, ...(s.tasks || [])]
    }));
    document.getElementById('obstacle-modal')?.classList.remove('open');
    showToast('✨ Micro-step added to your tasks! Momentum restored.');
  }
};

/* ==========================================================================
   TASKS & HABITS
   ========================================================================== */
function setupTasksAndHabitsInteractions() {
  const taskForm = document.getElementById('add-task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = taskForm.taskTitle.value;
      const priority = taskForm.taskPriority.value;
      const estimatedMinutes = parseInt(taskForm.estimatedMins.value, 10);

      window.TasksHabitsManager.addTask({ title, priority, estimatedMinutes });
      taskForm.reset();
      showToast('✅ Task added successfully.');
    });
  }
}

function renderTasksAndHabits(state) {
  const tasksContainer = document.getElementById('tasks-list-container');
  if (tasksContainer) {
    if (!state.tasks || state.tasks.length === 0) {
      tasksContainer.innerHTML = `<div class="empty-state-box"><p>No active tasks. Add a task above to start planning.</p></div>`;
    } else {
      tasksContainer.innerHTML = state.tasks.map(task => `
        <div class="card" style="padding: 0.9rem 1.1rem; border-left: 4px solid ${task.priority === 'high' ? 'var(--accent-screen)' : 'var(--accent-study)'};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="display: flex; align-items: center; gap: 0.8rem; cursor: pointer; flex: 1; text-decoration: ${task.completed ? 'line-through' : 'none'}; color: ${task.completed ? 'var(--text-muted)' : 'var(--text-primary)'}; font-size: 0.92rem;">
              <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="window.TasksHabitsManager.toggleTask('${task.id}')" style="accent-color: var(--accent-study); width: 17px; height: 17px;">
              <div>
                <strong>${task.title}</strong>
                <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 0.1rem;">
                  ⏱️ Planned: ${task.estimatedMinutes}m • Actual: ${task.actualMinutes || 0}m • Priority: ${(task.priority || 'medium').toUpperCase()}
                </div>
              </div>
            </label>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-secondary" onclick="window.focusEngine.selectTask('${task.id}'); navigateToTab('study');" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">
                <i data-lucide="play"></i> Focus
              </button>
              <button class="btn-icon" onclick="window.TasksHabitsManager.deleteTask('${task.id}')" style="border: none; background: transparent;">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  const focusTaskSelect = document.getElementById('focus-task-select');
  if (focusTaskSelect) {
    focusTaskSelect.innerHTML = (state.tasks || []).filter(t => !t.completed).map(t => `
      <option value="${t.id}" ${t.id === state.activeFocus?.taskId ? 'selected' : ''}>${t.title} (${t.estimatedMinutes}m)</option>
    `).join('');
  }

  const past7Days = window.TasksHabitsManager.getPast7Days();
  const habitsContainer = document.getElementById('habits-list-container');
  if (habitsContainer) {
    if (!state.habits || state.habits.length === 0) {
      habitsContainer.innerHTML = `<div class="empty-state-box"><p>No habits tracked yet.</p></div>`;
    } else {
      habitsContainer.innerHTML = state.habits.map(habit => {
        const historySet = new Set(habit.history || []);
        const heatmapCells = past7Days.map(dateStr => {
          const isDone = historySet.has(dateStr);
          return `<div title="${dateStr}: ${isDone ? 'Completed' : 'Missed'}" style="flex: 1; height: 14px; border-radius: 2px; background: ${isDone ? 'var(--accent-diet)' : 'rgba(255,255,255,0.08)'};"></div>`;
        }).join('');

        return `
          <div class="card" style="padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="category-tag cat-${habit.category}">${habit.badge || 'Routine'}</span>
                <h4 style="font-size: 1rem; color: var(--text-primary); margin-top: 0.3rem;">${habit.title}</h4>
              </div>
              <div style="text-align: right;">
                <span style="font-family: var(--font-mono); font-weight: 800; font-size: 1.15rem; color: var(--accent-diet-light);">🔥 ${habit.streak || 0}</span>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Best: ${habit.bestStreak || 0}d</div>
              </div>
            </div>

            <div style="margin-top: 0.6rem;">
              <div style="font-size: 0.68rem; color: var(--text-muted); margin-bottom: 0.2rem;">7-Day Consistency</div>
              <div style="display: flex; gap: 3px; width: 100%;">
                ${heatmapCells}
              </div>
            </div>

            <div style="margin-top: 0.8rem; display: flex; align-items: center; justify-content: space-between;">
              <button class="btn ${habit.completedToday ? 'btn-emerald' : 'btn-secondary'}" onclick="window.TasksHabitsManager.toggleHabitToday('${habit.id}')" style="font-size: 0.8rem; width: 100%; padding: 0.4rem;">
                <i data-lucide="${habit.completedToday ? 'check-circle' : 'circle'}"></i>
                ${habit.completedToday ? 'Completed Today!' : 'Check In Today'}
              </button>
            </div>

            ${!habit.completedToday && (habit.graceDaysLeft > 0) ? `
              <button class="btn" onclick="window.TasksHabitsManager.applyGraceRecovery('${habit.id}')" style="margin-top: 0.4rem; width: 100%; font-size: 0.72rem; padding: 0.3rem; background: rgba(245, 158, 11, 0.15); color: var(--accent-screen-light); border: 1px solid var(--accent-screen);">
                🛡️ Recover Streak (${habit.graceDaysLeft} Grace Left)
              </button>
            ` : ''}
          </div>
        `;
      }).join('');
    }
  }

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   OLDER-ADULT & ACCESSIBILITY
   ========================================================================== */
function setupOlderAdultInteractions() {}

function renderOlderAdultMode(state) {
  const medContainer = document.getElementById('elderly-med-list');
  if (medContainer) {
    medContainer.innerHTML = (state.medicineReminders || []).map(med => `
      <div class="card" style="padding: 1rem; margin-bottom: 0.6rem; border-left: 4px solid var(--accent-diet);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--accent-study-light); font-weight: 700;">⏰ ${med.time}</span>
            <h4 style="font-size: 1.05rem; color: var(--text-primary); margin-top: 0.2rem;">${med.name}</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary);">${med.instructions}</p>
          </div>
          <button class="btn ${med.takenToday ? 'btn-emerald' : 'btn-primary'}" onclick="window.ElderlyModeController.toggleMedicineTaken('${med.id}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
            <i data-lucide="${med.takenToday ? 'check-circle' : 'circle'}"></i>
            ${med.takenToday ? 'Taken' : 'Mark Taken'}
          </button>
        </div>
      </div>
    `).join('');
  }

  const aptContainer = document.getElementById('elderly-apt-list');
  if (aptContainer) {
    aptContainer.innerHTML = (state.appointments || []).map(apt => `
      <div class="card" style="padding: 1rem; margin-bottom: 0.6rem;">
        <h4 style="font-size: 1.05rem; color: var(--text-primary);">${apt.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">
          📅 ${apt.date} at ${apt.time} • 📍 ${apt.location}
        </p>
      </div>
    `).join('');
  }

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   ANALYTICS ENGINE
   ========================================================================== */
function renderAnalytics(state) {
  const timeLeakData = window.AnalyticsEngine.analyzeTimeLeakage(state);
  const habitData = window.AnalyticsEngine.analyzeHabitConsistency(state);
  const realismData = window.AnalyticsEngine.analyzePlanExecutionRealism(state);
  const goalVelocityData = window.AnalyticsEngine.analyzeGoalVelocity(state);

  const leakEl = document.getElementById('analytics-time-leak-body');
  if (leakEl) {
    leakEl.innerHTML = `
      <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.4;">
        ${timeLeakData.insight}
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem;">
        Total Overrun Logged: <strong>${timeLeakData.totalOverrunMinutes} mins</strong>
      </div>
    `;
  }

  const habitEl = document.getElementById('analytics-habit-body');
  if (habitEl) {
    habitEl.innerHTML = `
      <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.4;">
        ${habitData.insight}
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem;">
        Consistency: <strong>${habitData.consistencyScore || 0}%</strong>
      </div>
    `;
  }

  const realismEl = document.getElementById('analytics-realism-body');
  if (realismEl) {
    realismEl.innerHTML = `
      <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.4;">
        ${realismData.verdict}
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem;">
        Planning Realism: <strong>${realismData.combinedScore}%</strong>
      </div>
    `;
  }

  const velocityEl = document.getElementById('analytics-velocity-body');
  if (velocityEl) {
    velocityEl.innerHTML = `
      <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.4;">
        ${goalVelocityData.insight}
      </div>
    `;
  }
}

/* ==========================================================================
   DIET & HYDRATION
   ========================================================================== */
function setupDietInteractions() {
  const waterContainer = document.getElementById('water-glasses-container');
  if (waterContainer) {
    waterContainer.addEventListener('click', (e) => {
      const glass = e.target.closest('.water-glass-btn');
      if (glass) {
        const glassIndex = parseInt(glass.dataset.index, 10);
        window.appState.update(s => ({
          ...s,
          waterGlasses: glassIndex + 1
        }));
        if (window.audioFlowOS) window.audioFlowOS.playWaterDrop();
        window.questsEngine?.dealDamage(20, 'Hydration');
      }
    });
  }
}

/* ==========================================================================
   SOUNDSCAPES
   ========================================================================== */
function setupSoundscapeInteractions() {
  document.querySelectorAll('.sound-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const mode = e.currentTarget.dataset.sound;
      const isPlaying = window.audioFlowOS ? window.audioFlowOS.playSound(mode) : false;

      document.querySelectorAll('.sound-card').forEach(c => c.classList.remove('playing'));
      if (isPlaying) {
        card.classList.add('playing');
        showToast(`🎧 Playing soundscape: ${mode.toUpperCase()}`);
      }
    });
  });

  const volSlider = document.getElementById('soundscape-vol-slider');
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      if (window.audioFlowOS) window.audioFlowOS.setVolume(val);
    });
  }
}

/* ==========================================================================
   AI GENERATOR WIZARD MODAL
   ========================================================================== */
function setupGeneratorModal() {
  const modal = document.getElementById('ai-generator-modal');
  const openBtn = document.getElementById('btn-open-generator');
  const closeBtn = document.getElementById('btn-close-generator');
  const form = document.getElementById('schedule-generator-form');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.classList.add('open'));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const archetype = form.archetype.value;
      const wakeTime = form.wakeTime.value;
      const bedTime = form.bedTime.value;
      const studyHours = parseFloat(form.studyHours.value);
      const dietGoal = form.dietGoal.value;

      const newSchedule = window.AIScheduleEngine.generateSchedule({
        archetype,
        wakeTime,
        bedTime,
        studyHours,
        dietGoal
      });

      window.appState.update(s => ({
        ...s,
        activeArchetype: archetype,
        profile: { ...(s.profile || {}), archetype, wakeTime, bedTime, targetStudyHours: studyHours, dietGoal },
        todaySchedule: newSchedule
      }));

      modal.classList.remove('open');
      showToast('✨ Custom AI Routine synthesized connecting active Goals, Tasks & Habits!');
    });
  }
}

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      toggleBtn.innerHTML = `<i data-lucide="${next === 'light' ? 'moon' : 'sun'}"></i>`;
      if (window.lucide) lucide.createIcons();
    });
  }
}

/* ==========================================================================
   GLOBAL REACTIVE RENDERER
   ========================================================================== */
function renderAllState(state) {
  const score = state.dayBalanceScore || state.vitalityScore || 85;

  const vitalityScoreEls = document.querySelectorAll('.vitality-score-val, .day-balance-score-val');
  vitalityScoreEls.forEach(el => el.textContent = `${score}%`);

  const vitalityBars = document.querySelectorAll('.vitality-progress-bar');
  vitalityBars.forEach(el => el.style.width = `${score}%`);

  const waterContainer = document.getElementById('water-glasses-container');
  if (waterContainer) {
    let glassesHtml = '';
    const goal = state.waterGoal || 8;
    for (let i = 0; i < goal; i++) {
      const isFilled = i < (state.waterGlasses || 0);
      glassesHtml += `
        <button class="water-glass-btn btn-icon ${isFilled ? 'filled' : ''}" data-index="${i}" title="${isFilled ? 'Hydrated' : 'Click to log'}">
          <i data-lucide="droplet" style="color: ${isFilled ? 'var(--accent-movement-light)' : 'var(--text-muted)'}; fill: ${isFilled ? 'var(--accent-movement-light)' : 'none'}; width: 18px; height: 18px;"></i>
        </button>
      `;
    }
    waterContainer.innerHTML = glassesHtml;
  }

  renderCommandCenter(state);
  renderTimeline(state.todaySchedule);
  renderGoals(state.goals);
  renderTasksAndHabits(state);
  renderOlderAdultMode(state);
  renderAnalytics(state);
  window.personalFlowProfileEngine?.render();
  window.memoryReplayEngine?.render();
  window.copilotEngine?.render();
  window.questsEngine?.render();

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   TOAST HELPER
   ========================================================================== */
function showToast(msg) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="sparkles" style="color: var(--accent-study-light);"></i> <span>${msg}</span>`;
  toastContainer.appendChild(toast);

  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

window.showToast = showToast;

window.toggleDemoCleanMode = function() {
  const state = window.appState.getState();
  const hasGoals = state.goals && state.goals.length > 0;
  const label = document.getElementById('label-demo-mode');

  if (hasGoals) {
    window.appState.resetCleanState();
    if (label) label.textContent = 'Clean State';
  } else {
    window.appState.loadDemoData();
    if (label) label.textContent = 'Demo Mode';
  }
  if (window.lucide) lucide.createIcons();
};

window.triggerLiveRealityRecalibrationDemo = function() {
  const box = document.getElementById('reality-before-after-demo');
  if (box) {
    box.style.display = box.style.display === 'none' || box.style.display === '' ? 'block' : 'none';
  }

  if (window.audioFlowOS) window.audioFlowOS.playChime();
  if (window.flowosExperience?.triggerConfetti) window.flowosExperience.triggerConfetti();

  if (window.RealityEventsEngine) {
    window.RealityEventsEngine.triggerEvent('task-overrun');
  }

  showToast('⚡ Live Demonstration: Task overrun detected & evening schedule automatically rebalanced!');
};

document.addEventListener('click', (e) => {
  const menu = document.getElementById('header-tools-menu');
  const btn = document.getElementById('btn-header-more-tools');
  if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
  }
});
