/**
 * ZENITH AI - MEMORY REPLAY & EXPERIENTIAL TIMELINE ENGINE (V1.0)
 * Replays past days as a living story of focus, reality divergence, AI rebalancing, and recovery.
 */

class ZenithMemoryReplayEngine {
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

    // 2. Playback Speed Pills
    const speedPills = document.querySelectorAll('.replay-speed-pill');
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

  switchDay(dayKey) {
    this.pause();
    this.currentMomentIndex = 0;

    window.appState.update(s => ({
      ...s,
      dailyMemories: {
        ...s.dailyMemories,
        activeDayKey: dayKey
      }
    }));

    this.render();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    const state = window.appState.getState();
    const dayKey = state.dailyMemories.activeDayKey || 'today';
    const dayData = state.dailyMemories.days[dayKey];
    if (!dayData || !dayData.moments || dayData.moments.length === 0) return;

    this.isPlaying = true;
    this.updatePlayBtn(true);

    if (this.currentMomentIndex >= dayData.moments.length - 1) {
      this.currentMomentIndex = 0;
    }

    const intervalMs = Math.round(2500 / this.playbackSpeed);

    if (this.playbackTimer) clearInterval(this.playbackTimer);
    
    // Highlight initial step
    this.highlightActiveMoment();

    this.playbackTimer = setInterval(() => {
      if (this.currentMomentIndex < dayData.moments.length - 1) {
        this.currentMomentIndex++;
        this.highlightActiveMoment();
      } else {
        this.pause();
        window.showToast?.('🎬 Day Replay Complete!');
        if (window.audioZenith) window.audioZenith.playFanfare();
      }
    }, intervalMs);
  }

  pause() {
    this.isPlaying = false;
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    this.updatePlayBtn(false);
  }

  seekTo(index) {
    this.currentMomentIndex = index;
    this.highlightActiveMoment();
  }

  updatePlayBtn(isPlaying) {
    const btn = document.getElementById('btn-replay-play');
    if (btn) {
      btn.innerHTML = isPlaying 
        ? '<i data-lucide="pause"></i> Pause Replay'
        : '<i data-lucide="play"></i> Replay My Day';
      if (window.lucide) lucide.createIcons();
    }
  }

  highlightActiveMoment() {
    const state = window.appState.getState();
    const dayKey = state.dailyMemories.activeDayKey || 'today';
    const dayData = state.dailyMemories.days[dayKey];
    if (!dayData || !dayData.moments) return;

    const cards = document.querySelectorAll('.memory-moment-card');
    cards.forEach((card, idx) => {
      const isActive = idx === this.currentMomentIndex;
      card.classList.toggle('active-replay-step', isActive);
      if (isActive) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    const scrubber = document.getElementById('replay-scrub-slider');
    if (scrubber) {
      scrubber.value = this.currentMomentIndex;
      scrubber.max = Math.max(0, dayData.moments.length - 1);
    }

    const activeMoment = dayData.moments[this.currentMomentIndex];
    if (activeMoment && window.audioZenith) {
      if (activeMoment.type === 'focus' || activeMoment.type === 'genesis') {
        window.audioZenith.playClick();
      } else if (activeMoment.type === 'overrun' || activeMoment.type === 'reality') {
        window.audioZenith.playAlert();
      } else if (activeMoment.type === 'ai-decision' || activeMoment.type === 'habit') {
        window.audioZenith.playChime();
      }
    }
  }

  /**
   * Capture a new meaningful event into today's living memory
   */
  addMemoryMoment(type, title, description, metrics, badge, icon = 'sparkles') {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMoment = {
      id: `mem_${Date.now()}`,
      time: timeStr,
      title,
      type,
      icon,
      description,
      metrics: metrics || 'Logged live',
      badge: badge || 'Momentum'
    };

    window.appState.update(s => {
      const dm = s.dailyMemories || {};
      const days = dm.days || {};
      const today = days.today || { moments: [] };

      const updatedToday = {
        ...today,
        moments: [...today.moments, newMoment]
      };

      return {
        ...s,
        dailyMemories: {
          ...dm,
          days: {
            ...days,
            today: updatedToday
          }
        }
      };
    });

    this.render();
  }

  render() {
    const state = window.appState.getState();
    const dm = state.dailyMemories;
    if (!dm || !dm.days) return;

    const dayKey = dm.activeDayKey || 'today';
    const dayData = dm.days[dayKey];
    if (!dayData) return;

    // 1. Date Header
    const dateTitleEl = document.getElementById('replay-day-title');
    if (dateTitleEl) dateTitleEl.textContent = dayData.dateTitle;

    // 2. AI Narrative Summary Box
    const narrativeEl = document.getElementById('replay-ai-narrative');
    const winEl = document.getElementById('replay-ai-win');
    const frictionEl = document.getElementById('replay-ai-friction');
    const adaptEl = document.getElementById('replay-ai-adaptation');
    const tomorrowEl = document.getElementById('replay-ai-tomorrow');

    if (dayData.aiSummary) {
      if (narrativeEl) narrativeEl.textContent = dayData.aiSummary.narrative;
      if (winEl) winEl.textContent = dayData.aiSummary.primaryWin;
      if (frictionEl) frictionEl.textContent = dayData.aiSummary.frictionPoint;
      if (adaptEl) adaptEl.textContent = dayData.aiSummary.adaptationTaken;
      if (tomorrowEl) tomorrowEl.textContent = dayData.aiSummary.tomorrowFocus;
    }

    // 3. Render Memory Moments Timeline
    const timelineContainer = document.getElementById('replay-timeline-list');
    if (timelineContainer && dayData.moments) {
      timelineContainer.innerHTML = dayData.moments.map((m, idx) => {
        let typeBadgeClass = 'badge-blue';
        if (m.type === 'overrun' || m.type === 'reality') typeBadgeClass = 'badge-amber';
        else if (m.type === 'ai-decision') typeBadgeClass = 'badge-purple';
        else if (m.type === 'habit' || m.type === 'genesis') typeBadgeClass = 'badge-emerald';

        return `
          <div class="memory-moment-card ${idx === this.currentMomentIndex ? 'active-replay-step' : ''}" 
               data-index="${idx}"
               onclick="window.memoryReplayEngine.seekTo(${idx})">
            <div class="memory-time-marker">
              <span class="memory-time-str">${m.time}</span>
              <div class="memory-timeline-dot"></div>
            </div>

            <div class="memory-moment-body">
              <div class="memory-moment-header">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <div class="memory-icon-box">
                    <i data-lucide="${m.icon || 'sparkles'}"></i>
                  </div>
                  <h4 style="font-size: 1rem; font-weight: 700; color: #fff;">${m.title}</h4>
                </div>
                <span class="badge ${typeBadgeClass}">${m.badge}</span>
              </div>

              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45; margin: 0.6rem 0;">
                ${m.description}
              </p>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.45rem;">
                <span style="font-family: var(--font-mono); color: var(--accent-study-light);">📊 ${m.metrics}</span>
                <span style="font-size: 0.7rem;">Click to Jump</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Update scrubber bounds
    const scrubber = document.getElementById('replay-scrub-slider');
    if (scrubber && dayData.moments) {
      scrubber.max = Math.max(0, dayData.moments.length - 1);
    }

    if (window.lucide) lucide.createIcons();
  }
}

window.memoryReplayEngine = new ZenithMemoryReplayEngine();
