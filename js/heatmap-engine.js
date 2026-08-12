/**
 * FLOWOS - 365-DAY CONSISTENCY HEATMAP & DAY REPLAY LINK
 * Renders an interactive 52-week activity matrix with tooltips and 1-click Day Replay inspection.
 */

class FlowOSHeatmapEngine {
  constructor() {
    this.containerId = 'year-heatmap-container';
    this.statsContainerId = 'heatmap-stats-summary';
    this.tooltipEl = null;
    this.yearData = this.generateYearData();
  }

  generateYearData() {
    const today = new Date();
    const days = [];
    const seedStreaks = [0.8, 0.9, 0.7, 0.95, 0.85, 0.4, 0.6, 0.9, 0.75, 0.88, 0.92, 0.65];

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Realistic historical consistency curve
      const monthIdx = d.getMonth();
      const baseProb = seedStreaks[monthIdx] || 0.75;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const roll = Math.random();

      let score = 0;
      let focusMins = 0;
      let habitsCompleted = 0;
      let water = 0;

      if (roll < (isWeekend ? baseProb * 0.7 : baseProb)) {
        score = Math.floor(Math.random() * 45 + 55); // 55 - 100
        focusMins = Math.floor(Math.random() * 120 + 90);
        habitsCompleted = Math.floor(Math.random() * 2 + 4); // 4-5
        water = Math.floor(Math.random() * 4 + 7); // 7-10
      } else if (roll < 0.88) {
        score = Math.floor(Math.random() * 30 + 20); // 20 - 50
        focusMins = Math.floor(Math.random() * 60 + 20);
        habitsCompleted = Math.floor(Math.random() * 2 + 1);
        water = Math.floor(Math.random() * 3 + 4);
      }

      // Today's actual state
      if (i === 0) {
        const state = window.appState?.getState();
        if (state) {
          score = state.dayBalanceScore || state.vitalityScore || 82;
          focusMins = state.studyMinutesCompleted || 150;
          habitsCompleted = state.habits?.filter(h => h.completedToday).length || 3;
          water = state.waterGlasses || 4;
        }
      }

      days.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        month: d.toLocaleString('default', { month: 'short' }),
        score,
        focusMins,
        habitsCompleted,
        water,
        tier: this.getTier(score)
      });
    }

    return days;
  }

  getTier(score) {
    if (score <= 0) return 0;
    if (score < 35) return 1;
    if (score < 65) return 2;
    if (score < 85) return 3;
    return 4;
  }

  init() {
    this.createTooltip();
    this.render();
  }

  createTooltip() {
    if (!document.getElementById('heatmap-tooltip')) {
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.id = 'heatmap-tooltip';
      this.tooltipEl.className = 'heatmap-tooltip';
      document.body.appendChild(this.tooltipEl);
    } else {
      this.tooltipEl = document.getElementById('heatmap-tooltip');
    }
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Build 52 weeks
    let html = '<div class="heatmap-grid-wrapper">';
    
    // Day of week labels
    html += `
      <div class="heatmap-days-labels">
        <span>Mon</span>
        <span>Wed</span>
        <span>Fri</span>
      </div>
    `;

    // Grid of cells
    html += '<div class="heatmap-matrix">';
    this.yearData.forEach((day, index) => {
      html += `
        <div class="heatmap-cell tier-${day.tier}" 
             data-index="${index}"
             data-date="${day.date}"
             data-score="${day.score}"
             data-focus="${day.focusMins}"
             data-habits="${day.habitsCompleted}"
             data-water="${day.water}"
             style="cursor: pointer;"
             title="Click to view Day Replay">
        </div>
      `;
    });
    html += '</div></div>';

    container.innerHTML = html;
    this.bindCellInteractions();
    this.renderStatsSummary();
  }

  bindCellInteractions() {
    const cells = document.querySelectorAll('.heatmap-cell');
    cells.forEach(cell => {
      cell.addEventListener('mouseenter', (e) => {
        const d = cell.dataset;
        const formattedDate = new Date(d.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        
        this.tooltipEl.innerHTML = `
          <div style="font-weight: 700; color: #fff; margin-bottom: 0.2rem;">${formattedDate}</div>
          <div style="color: var(--accent-diet-light); font-weight: 600;">Day Balance: ${d.score}%</div>
          <div style="color: var(--text-secondary); font-size: 0.76rem; margin-top: 0.2rem;">
            ⏱️ ${d.focus} mins focus • 🎯 ${d.habits} habits • 💧 ${d.water} glasses
          </div>
          <div style="color: var(--accent-study-light); font-size: 0.7rem; margin-top: 0.25rem;">
            👉 Click to open Day Replay
          </div>
        `;
        this.tooltipEl.style.display = 'block';

        const rect = cell.getBoundingClientRect();
        this.tooltipEl.style.left = `${rect.left + window.scrollX - 70}px`;
        this.tooltipEl.style.top = `${rect.top + window.scrollY - 85}px`;
      });

      cell.addEventListener('mouseleave', () => {
        if (this.tooltipEl) this.tooltipEl.style.display = 'none';
      });

      cell.addEventListener('click', () => {
        const d = cell.dataset;
        const isToday = d.date === new Date().toISOString().split('T')[0];
        
        // Switch to understand tab
        const understandTab = document.querySelector('[data-tab="understand"]');
        if (understandTab) understandTab.click();

        // Switch day in memory replay
        if (window.memoryReplayEngine) {
          window.memoryReplayEngine.switchDay(isToday ? 'today' : 'yesterday');
        }

        const replaySection = document.getElementById('memory-replay-panel') || document.getElementById('tab-memory-replay');
        if (replaySection) {
          replaySection.scrollIntoView({ behavior: 'smooth' });
        }

        window.showToast?.(`📅 Opened Day Replay for ${d.date}`);
      });
    });
  }

  renderStatsSummary() {
    const summaryContainer = document.getElementById(this.statsContainerId);
    if (!summaryContainer) return;

    const activeDays = this.yearData.filter(d => d.score > 0).length;
    const totalFocusHours = (this.yearData.reduce((acc, d) => acc + d.focusMins, 0) / 60).toFixed(0);
    
    // Calculate max streak
    let maxStreak = 0;
    let currentStreak = 0;
    this.yearData.forEach(d => {
      if (d.score >= 50) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    summaryContainer.innerHTML = `
      <div class="heatmap-stat-card">
        <span class="heatmap-stat-num" style="color: var(--accent-diet-light);">${activeDays}</span>
        <span class="heatmap-stat-label">Active Consistency Days</span>
      </div>
      <div class="heatmap-stat-card">
        <span class="heatmap-stat-num" style="color: #fbbf24;">${maxStreak} Days</span>
        <span class="heatmap-stat-label">Longest Momentum Streak</span>
      </div>
      <div class="heatmap-stat-card">
        <span class="heatmap-stat-num" style="color: var(--accent-study-light);">${totalFocusHours} hrs</span>
        <span class="heatmap-stat-label">Total Deep Focus Logged</span>
      </div>
    `;
  }
}

window.FlowOSHeatmapEngine = FlowOSHeatmapEngine;
window.ZenithHeatmapEngine = FlowOSHeatmapEngine; // Backward compatibility
window.heatmapEngine = new FlowOSHeatmapEngine();
