/**
 * ZENITH AI - MASTER COMMAND CENTER CONTROLLER (V4)
 * Coordinates the Unified Operational Loop:
 * GOAL -> PLAN -> EXECUTE -> REALITY -> UNDERSTAND -> SIMULATE -> ADAPT -> RECOVER -> LEARN
 */

document.addEventListener('DOMContentLoaded', () => {
  initMasterApp();
});

function initMasterApp() {
  // 1. Initialize Sub-modules
  window.focusEngine?.init();
  window.screenGuardian?.init();
  window.notificationEngine?.init();

  // 2. Live Clock & Browser Awareness
  startLiveClock();
  setupBrowserActivityAwareness();

  // 3. Navigation
  setupNavigation();

  // 4. Setup Interactive Handlers
  setupCommandCenterInteractions();
  setupAskZenithInteractions();
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

  // 5. Subscribe to State Store
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
        showToast(`🌿 Welcome back! You were away from Zenith for ${awayMinutes} mins. Focus state preserved.`);
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
   NAVIGATION
   ========================================================================== */
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.dataset.tab;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      tabPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `tab-${targetTab}`);
      });

      if (window.lucide) lucide.createIcons();
    });
  });

  const menuToggleBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

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
  const activeBlock = state.todaySchedule.find(b => {
    const [sh, sm] = b.timeStart.split(':').map(Number);
    const [eh, em] = b.timeEnd.split(':').map(Number);
    return currentMins >= (sh * 60 + sm) && currentMins < (eh * 60 + em);
  }) || state.todaySchedule[0];

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
              <span class="pulse-badge" style="background: rgba(245,158,11,0.2); color: var(--accent-screen-light);">
                <span class="pulse-dot"></span> REALITY DIVERGENCE DETECTED
              </span>
            </div>
            <h3 style="font-size: 1.3rem; font-weight: 700; color: #fff; margin-top: 0.5rem;">
              ⚡ ${alert.title}
            </h3>
            <p style="font-size: 0.9rem; color: var(--text-primary); margin-top: 0.2rem;">
              <strong>What Happened:</strong> ${alert.whatChanged}
            </p>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
              <strong>Schedule Impact:</strong> ${alert.impactSummary}
            </p>
          </div>
          <button class="btn-icon" onclick="window.RealityEventEngine.dismissAlert()" title="Dismiss">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div style="margin-top: 1rem; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">
          Calculated Concrete Adaptation Options:
        </div>

        <div class="reality-options-grid">
          ${alert.options.map(opt => {
            const isRec = opt.id === alert.recommendedOptionId;
            return `
              <div class="reality-option-box ${isRec ? 'recommended' : ''}">
                <div>
                  ${isRec ? '<span style="font-size: 0.68rem; font-weight: 800; color: var(--accent-diet-light); text-transform: uppercase; letter-spacing: 0.05em;">★ Recommended by Zenith</span>' : ''}
                  <h4 style="font-size: 0.98rem; font-weight: 700; color: var(--text-primary); margin-top: 0.2rem;">${opt.title}</h4>
                  <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.3rem;">${opt.desc}</p>
                </div>
                <button class="btn ${isRec ? 'btn-emerald' : 'btn-secondary'}" onclick="window.RealityEventEngine.applyOption('${opt.id}')" style="width: 100%; font-size: 0.82rem; margin-top: 0.6rem;">
                  Apply Option
                </button>
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
  const pendingTasks = state.tasks.filter(t => !t.completed);
  const nextTask = pendingTasks[0];
  const nextActionEl = document.getElementById('command-next-action-text');
  if (nextActionEl) {
    if (nextTask) {
      nextActionEl.innerHTML = `<strong>${nextTask.title}</strong> (Est. ${nextTask.estimatedMinutes}m • Priority: ${nextTask.priority.toUpperCase()})`;
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
        <div style="padding: 0.75rem 1rem; background: rgba(99,102,241,0.1); border-left: 3px solid var(--accent-study); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-primary); margin-top: 0.5rem;">
          🧠 <strong>Learned Pattern:</strong> ${ins.insight}
        </div>
      `).join('');
    } else {
      learnedContainer.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted);">${validated.message}</p>`;
    }
  }

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   ASK ZENITH CONTEXTUAL ASSISTANT
   ========================================================================== */
function setupAskZenithInteractions() {
  const form = document.getElementById('ask-zenith-form');
  const input = document.getElementById('ask-zenith-input');
  const resultBox = document.getElementById('ask-zenith-result-box');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;

      const res = window.AskZenithEngine.ask(q);

      if (resultBox) {
        resultBox.innerHTML = `
          <div style="margin-top: 1.2rem; padding: 1.4rem; background: rgba(99, 102, 241, 0.12); border: 1px solid var(--accent-study-light); border-radius: var(--radius-lg);">
            <h4 style="font-size: 1.1rem; font-weight: 700; color: #fff;">🤖 ${res.title}</h4>
            ${res.analysisHtml}
            <div style="margin-top: 0.8rem; padding: 0.75rem 1rem; background: rgba(16,185,129,0.1); border-left: 3px solid var(--accent-diet); border-radius: var(--radius-sm); font-size: 0.88rem; color: var(--accent-diet-light);">
              💡 <strong>Recommendation:</strong> ${res.recommendation}
            </div>
            <div style="display: flex; gap: 0.6rem; margin-top: 1rem;">
              ${res.options.map(opt => `
                <button class="btn btn-emerald" onclick="applyAskZenithOption('${opt.action}')" style="font-size: 0.82rem;">
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
    window.showToast?.('🌿 20-Min restorative walk scheduled! Hydrate and step away.');
  }

  window.appState.update(s => ({ ...s, todaySchedule: updatedSchedule }));
  document.getElementById('ask-zenith-result-box').innerHTML = '';
  window.showToast?.('✨ Decision applied! Schedule updated.');
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
    <div style="margin-top: 1.2rem;">
      <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--accent-study-light);">🔮 ${sim.title}</h4>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">${sim.description}</p>

      <div class="whatif-comparison-grid">
        <div class="whatif-column">
          <h5 style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.6rem;">CURRENT LIVE SCHEDULE</h5>
          <div style="font-size: 0.82rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.4rem;">
            <div>• Morning Coding: 1h 00m</div>
            <div>• Evening Review: 60m (07:00 PM)</div>
            <div>• Bedtime: 10:30 PM</div>
          </div>
        </div>

        <div class="whatif-column simulated">
          <h5 style="font-size: 0.85rem; color: var(--accent-study-light); text-transform: uppercase; margin-bottom: 0.6rem;">SIMULATED SCENARIO SCHEDULE</h5>
          <div style="font-size: 0.82rem; color: var(--text-primary); display: flex; flex-direction: column; gap: 0.4rem;">
            <div>• Extended Coding: 3h 00m (+2h Sprint)</div>
            <div>• Evening Review: Condensed to 15m</div>
            <div>• Bedtime: 11:00 PM (+30m drift)</div>
          </div>
        </div>
      </div>

      <div style="padding: 0.9rem; background: rgba(0,0,0,0.3); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1rem;">
        <div style="font-size: 0.85rem; color: var(--text-primary);">
          <strong>Affected Tasks:</strong>
          <ul style="margin-left: 1.2rem; margin-top: 0.3rem;">
            ${sim.affectedTasks.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
        <div style="font-size: 0.85rem; color: var(--accent-screen-light); margin-top: 0.6rem;">
          ${sim.conflicts.join('<br>')}
        </div>
        <div style="font-size: 0.85rem; color: var(--accent-diet-light); margin-top: 0.6rem;">
          ${sim.goalImpact}
        </div>
      </div>

      <div style="display: flex; gap: 0.8rem;">
        <button class="btn btn-emerald" onclick="window.ScenarioSimulator.applySimulation(); document.getElementById('simulator-modal').classList.remove('open');" style="flex: 1;">
          <i data-lucide="check"></i> Apply Simulated Schedule to Live Day
        </button>
        <button class="btn btn-secondary" onclick="window.ScenarioSimulator.discardSimulation(); document.getElementById('simulator-modal').classList.remove('open');">
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
  document.querySelectorAll('.btn-adapt-schedule').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reason = e.currentTarget.dataset.reason;
      const state = window.appState.getState();
      const adapted = window.AIScheduleEngine.adaptSchedule(state.todaySchedule, reason);
      
      window.appState.update(s => ({
        ...s,
        todaySchedule: adapted
      }));

      showToast(`⚡ Schedule adapted for ${btn.textContent.trim()}!`);
    });
  });

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

  container.innerHTML = schedule.map((item) => {
    const [sh, sm] = item.timeStart.split(':').map(Number);
    const [eh, em] = item.timeEnd.split(':').map(Number);
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
    const updated = s.todaySchedule.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState && window.audioZenith) window.audioZenith.playChime();
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
      showToast('📦 Full Zenith JSON backup downloaded!');
    });
  }

  const jsonImportInput = document.getElementById('input-import-json');
  if (jsonImportInput) {
    jsonImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        window.CalendarExporter.importJSONBackup(
          file,
          () => showToast('✨ Backup successfully restored!'),
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
        goals: [goal, ...s.goals],
        tasks: [...tasks, ...s.tasks]
      }));

      form.reset();
      showToast('🎯 Goal intelligence roadmap synthesized into daily tasks!');
    });
  }
}

function renderGoals(goals) {
  const container = document.getElementById('goals-tree-wrapper');
  if (!container) return;

  container.innerHTML = goals.map(goal => `
    <div class="card" style="margin-bottom: 1.25rem;">
      <div class="card-header">
        <div>
          <span class="category-tag cat-${goal.category}">${goal.category}</span>
          <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-top: 0.4rem;">${goal.title}</h4>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Target: ${goal.targetDate}</span>
        </div>
        <div style="text-align: right;">
          <span style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-study-light); font-size: 1.2rem;">${goal.progress}%</span>
        </div>
      </div>

      <div class="progress-bar-bg" style="height: 6px; margin-bottom: 1rem;">
        <div class="progress-bar-fill" style="width: ${goal.progress}%;"></div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Milestones</span>
        ${(goal.milestones || []).map(m => `
          <label style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; color: ${m.completed ? 'var(--text-muted)' : 'var(--text-primary)'}; text-decoration: ${m.completed ? 'line-through' : 'none'}; cursor: pointer;">
            <input type="checkbox" ${m.completed ? 'checked' : ''} onchange="toggleMilestone('${goal.id}', '${m.id}')" style="accent-color: var(--accent-study);">
            ${m.title}
          </label>
        `).join('')}
      </div>

      <button class="btn btn-secondary" onclick="openObstacleSolver('${goal.title}')" style="margin-top: 1rem; width: 100%; font-size: 0.85rem;">
        <i data-lucide="help-circle"></i> Stuck on this goal? Deconstruct Obstacle
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

window.toggleMilestone = function(goalId, milestoneId) {
  window.appState.update(s => {
    const updatedGoals = s.goals.map(g => {
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
  const closeBtn = document.getElementById('btn-close-obstacle');
  const form = document.getElementById('obstacle-form');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const desc = form.obstacleDesc.value;
      const res = window.GoalIntelligenceEngine.deconstructObstacle(desc);

      const resultBox = document.getElementById('obstacle-result-box');
      resultBox.innerHTML = `
        <div style="margin-top: 1.2rem; padding: 1.2rem; background: rgba(99, 102, 241, 0.12); border: 1px solid var(--accent-study); border-radius: var(--radius-md);">
          <h4 style="color: var(--accent-study-light); font-size: 1rem; margin-bottom: 0.4rem;">🎯 Immediate 10-Min Micro-Step:</h4>
          <p style="font-size: 0.92rem; color: var(--text-primary); margin-bottom: 0.6rem;">${res.immediateMicroStep}</p>
          <p style="font-size: 0.8rem; color: var(--text-secondary);">💡 <em>Psychological Strategy: ${res.recoveryStrategy}</em></p>
          <button class="btn btn-emerald" onclick="applyObstacleMicroTask()" style="margin-top: 0.8rem;">
            <i data-lucide="plus"></i> Add Micro-Step Directly to Today's Tasks
          </button>
        </div>
      `;

      window.currentObstacleMicroTask = res.suggestedTask;
      if (window.lucide) lucide.createIcons();
    });
  }
}

window.openObstacleSolver = function(goalTitle) {
  const modal = document.getElementById('obstacle-modal');
  if (modal) {
    modal.classList.add('open');
    const input = document.getElementById('obstacle-desc-input');
    if (input) input.placeholder = `Describe what's blocking you on "${goalTitle}"...`;
  }
};

window.applyObstacleMicroTask = function() {
  if (window.currentObstacleMicroTask) {
    window.appState.update(s => ({
      ...s,
      tasks: [window.currentObstacleMicroTask, ...s.tasks]
    }));
    document.getElementById('obstacle-modal').classList.remove('open');
    showToast('✨ Micro-step added to your tasks! Momentum restored.');
  }
};

/* ==========================================================================
   TASKS & HABITS
   ========================================================================== */
function setupTasksAndHabitsInteractions() {
  const taskForm = document.getElementById('tasks-create-form');
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = taskForm.taskTitle.value;
      const priority = taskForm.taskPriority.value;
      const estimatedMinutes = taskForm.taskEstimate.value;

      window.TasksHabitsManager.addTask({ title, priority, estimatedMinutes });
      taskForm.reset();
      showToast('✅ Task added successfully.');
    });
  }

  const habitForm = document.getElementById('habits-create-form');
  if (habitForm) {
    habitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = habitForm.habitTitle.value;
      const category = habitForm.habitCategory.value;

      window.TasksHabitsManager.addHabit({ title, category });
      habitForm.reset();
      showToast('🌱 New habit streak started!');
    });
  }
}

function renderTasksAndHabits(state) {
  const tasksContainer = document.getElementById('task-list-view');
  if (tasksContainer) {
    tasksContainer.innerHTML = state.tasks.map(task => `
      <div class="card" style="padding: 1rem 1.25rem; margin-bottom: 0.75rem; border-left: 4px solid ${task.priority === 'high' ? 'var(--accent-screen)' : 'var(--accent-study)'};">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label style="display: flex; align-items: center; gap: 0.8rem; cursor: pointer; flex: 1; text-decoration: ${task.completed ? 'line-through' : 'none'}; color: ${task.completed ? 'var(--text-muted)' : 'var(--text-primary)'}; font-size: 0.95rem;">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="window.TasksHabitsManager.toggleTask('${task.id}')" style="accent-color: var(--accent-study); width: 18px; height: 18px;">
            <div>
              <strong>${task.title}</strong>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem;">
                ⏱️ Planned: ${task.estimatedMinutes}m • Actual: ${task.actualMinutes || 0}m • Priority: ${task.priority.toUpperCase()}
              </div>
            </div>
          </label>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary" onclick="window.focusEngine.selectTask('${task.id}'); document.querySelector('[data-tab=study]').click();" style="padding: 0.35rem 0.7rem; font-size: 0.78rem;">
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

  const focusTaskSelect = document.getElementById('focus-task-select');
  if (focusTaskSelect) {
    focusTaskSelect.innerHTML = state.tasks.filter(t => !t.completed).map(t => `
      <option value="${t.id}" ${t.id === state.activeFocus.taskId ? 'selected' : ''}>${t.title} (${t.estimatedMinutes}m)</option>
    `).join('');
  }

  const past7Days = window.TasksHabitsManager.getPast7Days();
  const habitsContainer = document.getElementById('habits-grid-view');
  if (habitsContainer) {
    habitsContainer.innerHTML = state.habits.map(habit => {
      const historySet = new Set(habit.history || []);
      const heatmapCells = past7Days.map(dateStr => {
        const isDone = historySet.has(dateStr);
        return `<div title="${dateStr}: ${isDone ? 'Completed' : 'Missed'}" style="flex: 1; height: 16px; border-radius: 3px; background: ${isDone ? 'var(--accent-diet)' : 'rgba(255,255,255,0.08)'};"></div>`;
      }).join('');

      return `
        <div class="card" style="padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="category-tag cat-${habit.category}">${habit.badge}</span>
              <h4 style="font-size: 1.1rem; color: var(--text-primary); margin-top: 0.4rem;">${habit.title}</h4>
            </div>
            <div style="text-align: right;">
              <span style="font-family: var(--font-mono); font-weight: 800; font-size: 1.3rem; color: var(--accent-diet-light);">🔥 ${habit.streak}</span>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Best: ${habit.bestStreak}d</div>
            </div>
          </div>

          <div style="margin-top: 0.8rem;">
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">7-Day Consistency Heatmap</div>
            <div style="display: flex; gap: 4px; width: 100%;">
              ${heatmapCells}
            </div>
          </div>

          <div style="margin-top: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <button class="btn ${habit.completedToday ? 'btn-emerald' : 'btn-secondary'}" onclick="window.TasksHabitsManager.toggleHabitToday('${habit.id}')" style="font-size: 0.85rem; width: 100%;">
              <i data-lucide="${habit.completedToday ? 'check-circle' : 'circle'}"></i>
              ${habit.completedToday ? 'Completed Today!' : 'Check In Today'}
            </button>
          </div>

          ${!habit.completedToday && habit.graceDaysLeft > 0 ? `
            <button class="btn" onclick="window.TasksHabitsManager.applyGraceRecovery('${habit.id}')" style="margin-top: 0.5rem; width: 100%; font-size: 0.75rem; background: rgba(245, 158, 11, 0.15); color: var(--accent-screen-light); border: 1px solid var(--accent-screen);">
              🛡️ Recover Streak (${habit.graceDaysLeft} Grace Days Left)
            </button>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  if (window.lucide) lucide.createIcons();
}

/* ==========================================================================
   OLDER-ADULT HUB & ACCESSIBILITY
   ========================================================================== */
function setupOlderAdultInteractions() {
  const medForm = document.getElementById('elderly-med-form');
  if (medForm) {
    medForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = medForm.medName.value;
      const time = medForm.medTime.value;
      const instructions = medForm.medInstructions.value;

      window.ElderlyModeController.addMedicineReminder({ name, time, instructions });
      medForm.reset();
      showToast('💊 Medicine reminder added.');
    });
  }
}

function renderOlderAdultMode(state) {
  const medContainer = document.getElementById('elderly-med-list');
  if (medContainer) {
    medContainer.innerHTML = (state.medicineReminders || []).map(med => `
      <div class="medicine-card ${med.takenToday ? 'taken' : ''}">
        <div>
          <span class="med-time-tag">⏰ ${med.time}</span>
          <h4 class="med-name">${med.name}</h4>
          <p class="med-instructions">${med.instructions}</p>
        </div>
        <button class="btn ${med.takenToday ? 'btn-emerald' : 'btn-primary'} med-btn-taken" onclick="window.ElderlyModeController.toggleMedicineTaken('${med.id}')">
          <i data-lucide="${med.takenToday ? 'check-circle' : 'circle'}"></i>
          ${med.takenToday ? 'Taken Today' : 'Mark as Taken'}
        </button>
      </div>
    `).join('');
  }

  const aptContainer = document.getElementById('elderly-apt-list');
  if (aptContainer) {
    aptContainer.innerHTML = (state.appointments || []).map(apt => `
      <div class="card" style="padding: 1.25rem; margin-bottom: 0.8rem;">
        <h4 style="font-size: 1.15rem; color: var(--text-primary);">${apt.title}</h4>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.2rem;">
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

  const leakEl = document.getElementById('analytics-time-leak-text');
  if (leakEl) leakEl.textContent = timeLeakData.insight;

  const habitEl = document.getElementById('analytics-habit-text');
  if (habitEl) habitEl.textContent = habitData.insight;

  const realismEl = document.getElementById('analytics-realism-text');
  if (realismEl) realismEl.textContent = realismData.verdict;

  const realismScoreEl = document.getElementById('analytics-realism-score');
  if (realismScoreEl) realismScoreEl.textContent = `${realismData.combinedScore}%`;

  const velocityEl = document.getElementById('analytics-velocity-text');
  if (velocityEl) velocityEl.textContent = goalVelocityData.insight;
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
        if (window.audioZenith) window.audioZenith.playWaterDrop();
      }
    });
  }

  const genSnackBtn = document.getElementById('btn-random-snack');
  if (genSnackBtn) {
    genSnackBtn.addEventListener('click', () => {
      const snack = window.DietPlanner.getRandomSnack();
      const resultBox = document.getElementById('quick-snack-result');
      if (resultBox) {
        resultBox.innerHTML = `
          <div style="margin-top: 0.8rem; padding: 0.9rem; background: rgba(16, 185, 129, 0.12); border: 1px solid var(--accent-diet); border-radius: var(--radius-md);">
            <strong style="color: var(--accent-diet-light); font-size: 0.95rem;">💡 ${snack.name}</strong>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">⏱️ Prep: ${snack.prep} • ⚡ ${snack.benefit}</p>
          </div>
        `;
      }
    });
  }
}

function renderDietPlans(goalKey) {
  const plan = window.DietPlanner.getPlan(goalKey);
  const container = document.getElementById('diet-meal-cards-wrapper');
  if (!container) return;

  container.innerHTML = `
    <div class="meal-card">
      <div>
        <span class="meal-badge">🌅 Morning Brain Fuel</span>
        <h4 style="margin-top: 0.6rem; color: var(--text-primary); font-size: 1.05rem;">${plan.breakfast.name}</h4>
        <ul class="meal-items-list">
          ${plan.breakfast.ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
      <p style="font-size: 0.78rem; color: var(--accent-diet-light); font-style: italic;">${plan.breakfast.benefits}</p>
    </div>

    <div class="meal-card">
      <div>
        <span class="meal-badge">☀️ Sustained Focus Lunch</span>
        <h4 style="margin-top: 0.6rem; color: var(--text-primary); font-size: 1.05rem;">${plan.lunch.name}</h4>
        <ul class="meal-items-list">
          ${plan.lunch.ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
      <p style="font-size: 0.78rem; color: var(--accent-diet-light); font-style: italic;">${plan.lunch.benefits}</p>
    </div>

    <div class="meal-card">
      <div>
        <span class="meal-badge">🌙 Restorative Sleep Dinner</span>
        <h4 style="margin-top: 0.6rem; color: var(--text-primary); font-size: 1.05rem;">${plan.dinner.name}</h4>
        <ul class="meal-items-list">
          ${plan.dinner.ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
      <p style="font-size: 0.78rem; color: var(--accent-diet-light); font-style: italic;">${plan.dinner.benefits}</p>
    </div>
  `;
}

/* ==========================================================================
   SOUNDSCAPES
   ========================================================================== */
function setupSoundscapeInteractions() {
  document.querySelectorAll('.sound-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const mode = e.currentTarget.dataset.sound;
      const isPlaying = window.audioZenith.playSound(mode);

      document.querySelectorAll('.sound-card').forEach(c => c.classList.remove('playing'));
      if (isPlaying) {
        card.classList.add('playing');
        showToast(`🎧 Playing soundscape: ${card.querySelector('.sound-label').textContent}`);
      }
    });
  });

  const volSlider = document.getElementById('sound-volume-slider');
  const volLabel = document.getElementById('ambient-vol-label');
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      window.audioZenith.setVolume(val);
      if (volLabel) volLabel.textContent = `${Math.round(val * 100)}%`;
    });
  }

  const sfxBtn = document.getElementById('btn-toggle-sfx');
  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      const isMuted = window.audioZenith.toggleSfxMute();
      sfxBtn.innerHTML = isMuted 
        ? '<i data-lucide="volume-x" style="width: 13px;"></i> SFX Muted'
        : '<i data-lucide="volume-2" style="width: 13px;"></i> SFX On';
      if (window.lucide) lucide.createIcons();
      showToast(isMuted ? '🔇 Sound effects muted' : '🔊 Sound effects active');
    });
  }

  const sleepPills = document.querySelectorAll('.sleep-pill');
  sleepPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sleepPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const mins = parseInt(pill.dataset.mins, 10);
      window.audioZenith.setSleepTimer(mins);
      if (mins > 0) {
        showToast(`🌙 Sleep timer set: Ambient sound will fade and stop in ${mins} mins`);
      } else {
        showToast(`🌙 Sleep timer disabled`);
      }
    });
  });
}

/* ==========================================================================
   AI GENERATOR WIZARD MODAL
   ========================================================================== */
function setupGeneratorModal() {
  const modal = document.getElementById('generator-modal');
  const openBtn = document.getElementById('btn-open-generator');
  const closeBtn = document.getElementById('btn-close-generator');
  const form = document.getElementById('routine-generator-form');

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
        profile: { archetype, wakeTime, bedTime, targetStudyHours: studyHours, dietGoal },
        todaySchedule: newSchedule
      }));

      modal.classList.remove('open');
      showToast('✨ Custom AI Routine generated connecting active Goals, Tasks & Habits!');
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
  const vitalityScoreEls = document.querySelectorAll('.vitality-score-val');
  vitalityScoreEls.forEach(el => el.textContent = `${state.vitalityScore}%`);

  const vitalityBars = document.querySelectorAll('.vitality-progress-bar');
  vitalityBars.forEach(el => el.style.width = `${state.vitalityScore}%`);

  const screenTimeEl = document.getElementById('stat-screen-time');
  if (screenTimeEl) {
    const hours = Math.floor(state.screenTimeMinutes / 60);
    const mins = state.screenTimeMinutes % 60;
    screenTimeEl.textContent = `${hours}h ${mins}m`;
  }

  const studyTimeEl = document.getElementById('stat-study-time');
  if (studyTimeEl) {
    const hours = Math.floor(state.studyMinutesCompleted / 60);
    const mins = state.studyMinutesCompleted % 60;
    studyTimeEl.textContent = `${hours}h ${mins}m`;
  }

  const waterContainer = document.getElementById('water-glasses-container');
  if (waterContainer) {
    let glassesHtml = '';
    for (let i = 0; i < state.waterGoal; i++) {
      const isFilled = i < state.waterGlasses;
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
  renderDietPlans(state.profile.dietGoal || 'clean-energy');

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
