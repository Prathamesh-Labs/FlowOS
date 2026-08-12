/**
 * FLOWOS - DAY REPLAY & EXPERIENTIAL TIMELINE ENGINE (V2.0)
 * Replays past days as a living story of focus, reality divergence, adaptive rebalancing, and recovery.
 */

class FlowOSMemoryReplayEngine {
  constructor() {
    this.isPlaying = false;
    this.playbackTimer = null;
    this.playbackSpeed = 1; // 1x | 2x | 4x
    this.currentMomentIndex = 0;
  }

  init() {
    this.bindUI();
    this.render();
  }

  bindUI() {
    // 1. Play / Pause Button
    const playBtn = document.getElementById('btn-replay-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.togglePlay());
    }

    const pauseBtn = document.getElementById('btn-replay-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pause());
    }

    // 2. Playback Speed Pills
    const speedPills = document.querySelectorAll('.btn-replay-speed, .replay-speed-pill');
    speedPills.forEach(pill => {
      pill.addEventListener('click', () => {
        speedPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.playbackSpeed = parseFloat(pill.dataset.speed) || 1;
        if (this.isPlaying) {
          this.pause();
          this.play();
        }
      });
    });

    // 3. Day Selector Tabs (Today / Yesterday)
    const dayPills = document.querySelectorAll('.replay-day-tab');
    dayPills.forEach(pill => {
      pill.addEventListener('click', () => {
        dayPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const dayKey = pill.dataset.day;
        this.switchDay(dayKey);
      });
    });

    // 4. Scrub Slider
    const scrubber = document.getElementById('replay-scrub-slider');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.seekTo(val);
      });
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    const dayData = this.getActiveDayData();
    if (!dayData.moments || dayData.moments.length === 0) return;

    this.isPlaying = true;
    const playBtn = document.getElementById('btn-replay-play');
    if (playBtn) {
      playBtn.innerHTML = `<i data-lucide="pause"></i> Pause Replay`;
    }

    const stepInterval = Math.max(500, 2500 / this.playbackSpeed);

    if (this.playbackTimer) clearInterval(this.playbackTimer);
    this.playbackTimer = setInterval(() => {
      if (this.currentMomentIndex < dayData.moments.length - 1) {
        this.currentMomentIndex++;
        this.renderPlaybackFrame();
      } else {
        this.pause();
        this.currentMomentIndex = 0;
        if (window.audioFlowOS) window.audioFlowOS.playFanfare();
        window.showToast?.('🎬 Day Replay playback complete!');
      }
    }, stepInterval);

    if (window.lucide) lucide.createIcons();
  }

  pause() {
    this.isPlaying = false;
    if (this.playbackTimer) clearInterval(this.playbackTimer);
    const playBtn = document.getElementById('btn-replay-play');
    if (playBtn) {
      playBtn.innerHTML = `<i data-lucide="play"></i> Play Replay`;
    }
    if (window.lucide) lucide.createIcons();
  }

  seekTo(index) {
    const dayData = this.getActiveDayData();
    if (!dayData.moments) return;
    this.currentMomentIndex = Math.max(0, Math.min(index, dayData.moments.length - 1));
    this.renderPlaybackFrame();
  }

  switchDay(dayKey) {
    this.pause();
    this.currentMomentIndex = 0;
    this.render();
    window.showToast?.(`📅 Switched Day Replay to: ${dayKey.toUpperCase()}`);
  }

  renderPlaybackFrame() {
    const dayData = this.getActiveDayData();
    const activeMoment = dayData.moments ? dayData.moments[this.currentMomentIndex] : null;

    const timeLabel = document.getElementById('replay-current-time-label');
    if (timeLabel && activeMoment) {
      timeLabel.textContent = `Time: ${activeMoment.time}`;
    }

    const scrubber = document.getElementById('replay-scrub-slider');
    if (scrubber) {
      scrubber.value = this.currentMomentIndex;
    }

    const cards = document.querySelectorAll('.memory-moment-card');
    cards.forEach((c, idx) => {
      c.classList.toggle('active-replay-step', idx === this.currentMomentIndex);
      if (idx === this.currentMomentIndex) {
        c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    if (activeMoment && window.audioFlowOS) {
      if (activeMoment.type === 'overrun') {
        window.audioFlowOS.playAlert();
      } else if (activeMoment.type === 'habit' || activeMoment.type === 'completion') {
        window.audioFlowOS.playChime();
      }
    }
  }

  getActiveDayData() {
    const state = window.appState.getState();
    const activeDayKey = document.querySelector('.replay-day-tab.active')?.dataset.day || 'today';
    return state.memoryReplayDays ? (state.memoryReplayDays[activeDayKey] || state.memoryReplayDays.today) : {
      date: new Date().toISOString().split('T')[0],
      dayName: 'Today',
      stats: { totalFocusMinutes: 240, flowRatio: 92, habitsCompleted: 4, adaptationsTriggered: 1 },
      aiSummary: { narrative: 'Solid high-focus day.', headline: 'High Focus Balance', adaptationTaken: 'Schedule rebalanced', tomorrowFocus: 'Continue momentum' },
      moments: []
    };
  }

  render() {
    const dayData = this.getActiveDayData();
    if (!dayData) return;

    // Render Stats
    const focusEl = document.getElementById('replay-stat-focus');
    const flowEl = document.getElementById('replay-stat-flow');
    const habitsEl = document.getElementById('replay-stat-habits');
    const adaptsEl = document.getElementById('replay-stat-adapts');

    if (focusEl && dayData.stats) focusEl.textContent = `${Math.floor(dayData.stats.totalFocusMinutes / 60)}h ${dayData.stats.totalFocusMinutes % 60}m`;
    if (flowEl && dayData.stats) flowEl.textContent = `${dayData.stats.flowRatio}%`;
    if (habitsEl && dayData.stats) habitsEl.textContent = `${dayData.stats.habitsCompleted}/4`;
    if (adaptsEl && dayData.stats) adaptsEl.textContent = `${dayData.stats.adaptationsTriggered} Recalibrated`;

    // Render Summary
    if (dayData.aiSummary) {
      const headlineEl = document.getElementById('replay-summary-headline');
      const narrativeEl = document.getElementById('replay-summary-narrative');
      const adaptEl = document.getElementById('replay-summary-adaptation');
      const tomorrowEl = document.getElementById('replay-summary-tomorrow');

      if (headlineEl) headlineEl.textContent = dayData.aiSummary.headline;
      if (narrativeEl) narrativeEl.textContent = `"${dayData.aiSummary.narrative}"`;
      if (adaptEl) adaptEl.textContent = dayData.aiSummary.adaptationTaken;
      if (tomorrowEl) tomorrowEl.textContent = dayData.aiSummary.tomorrowFocus;
    }

    // Render Moments Timeline
    const timelineContainer = document.getElementById('memory-replay-moments-list') || document.getElementById('replay-timeline-list');
    if (timelineContainer && dayData.moments) {
      if (dayData.moments.length === 0) {
        timelineContainer.innerHTML = `
          <div class="empty-state-box">
            <p>Not enough history yet for this date.</p>
          </div>
        `;
      } else {
        timelineContainer.innerHTML = dayData.moments.map((m, idx) => {
          let typeBadgeClass = 'badge-blue';
          if (m.type === 'overrun' || m.type === 'reality') typeBadgeClass = 'badge-amber';
          else if (m.type === 'ai-decision') typeBadgeClass = 'badge-purple';
          else if (m.type === 'habit' || m.type === 'genesis') typeBadgeClass = 'badge-emerald';

          return `
            <div class="card memory-moment-card ${idx === this.currentMomentIndex ? 'active-replay-step' : ''}" 
                 data-index="${idx}"
                 onclick="window.memoryReplayEngine.seekTo(${idx})"
                 style="padding: 0.9rem 1.1rem; cursor: pointer;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-study-light); font-weight: 700;">${m.time}</span>
                  <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff;">${m.title}</h4>
                </div>
                <span class="badge ${typeBadgeClass}" style="font-size: 0.7rem;">${m.badge}</span>
              </div>

              <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.4; margin: 0.4rem 0;">
                ${m.description}
              </p>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.35rem;">
                <span style="font-family: var(--font-mono); color: var(--accent-diet-light);">📊 ${m.metrics}</span>
                <span style="font-size: 0.68rem;">Click to Scrub</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Update scrubber bounds
    const scrubber = document.getElementById('replay-scrub-slider');
    if (scrubber && dayData.moments) {
      scrubber.max = Math.max(0, dayData.moments.length - 1);
    }

    if (window.lucide) lucide.createIcons();
  }
}

window.FlowOSMemoryReplayEngine = FlowOSMemoryReplayEngine;
window.ZenithMemoryReplayEngine = FlowOSMemoryReplayEngine;
window.memoryReplayEngine = new FlowOSMemoryReplayEngine();
