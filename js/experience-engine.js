/**
 * FLOWOS - IMMERSIVE EXPERIENCE & REFLECTION ENGINE (V2.0)
 * Powers the Morning Briefing, Fullscreen Focus Room with Live Audio Visualizer,
 * Evening Reflection Ritual, Motivation XP / Level Progression, and Confetti.
 */

class FlowOSExperienceEngine {
  constructor() {
    this.audioVisualizerRunning = false;
    this.animFrameId = null;
  }

  init() {
    this.setupMorningBriefing();
    this.setupFocusRoom();
    this.setupEveningDebrief();
    this.setupInteractiveEnergyCurve();
    this.renderLevelAndXP();
  }

  /* ==========================================================================
     1. FIRST IMPRESSION: AI MORNING READINESS BRIEFING
     ========================================================================== */
  setupMorningBriefing() {
    const banner = document.getElementById('morning-cockpit-briefing');
    const dismissBtn = document.getElementById('btn-dismiss-briefing');
    const audioGreetingBtn = document.getElementById('btn-audio-briefing');

    if (dismissBtn && banner) {
      dismissBtn.addEventListener('click', () => {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-10px)';
        setTimeout(() => banner.style.display = 'none', 300);
      });
    }

    if (audioGreetingBtn) {
      audioGreetingBtn.addEventListener('click', () => {
        this.speakMorningBriefing();
      });
    }
  }

  speakMorningBriefing() {
    const state = window.appState.getState();
    const tasksCount = state.tasks.filter(t => !t.completed).length;
    const wakeTime = state.profile.wakeTime || '07:00';
    const text = `Good day Operator. Your FlowOS Operating System is online. You have ${tasksCount} high priority tasks lined up, a ${state.profile.targetStudyHours} hour focus target, and an active Day Balance of ${state.dayBalanceScore || state.vitalityScore || 82} percent. Let's make today count.`;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
      window.showToast?.('🎙️ FlowOS Morning Voice Briefing Playing...');
    } else {
      if (window.audioFlowOS) window.audioFlowOS.playChime();
      window.showToast?.('🎙️ Morning Briefing Initialized!');
    }
  }

  /* ==========================================================================
     2. IMMERSIVE FULLSCREEN ZEN FOCUS ROOM WITH LIVE AUDIO VISUALIZER
     ========================================================================== */
  setupFocusRoom() {
    const openBtn = document.getElementById('btn-open-focus-room');
    const room = document.getElementById('fullscreen-focus-room');
    const exitBtn = document.getElementById('btn-exit-focus-room');

    if (openBtn && room) {
      openBtn.addEventListener('click', () => {
        room.classList.add('active');
        this.startAudioVisualizer();
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      });
    }

    if (exitBtn && room) {
      exitBtn.addEventListener('click', () => {
        room.classList.remove('active');
        this.stopAudioVisualizer();
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  startAudioVisualizer() {
    const canvas = document.getElementById('focus-visualizer-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = 140;

    let phase = 0;
    this.audioVisualizerRunning = true;

    const render = () => {
      if (!this.audioVisualizerRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isSoundPlaying = !!window.audioZenith?.currentMode;
      const amplitude = isSoundPlaying ? 35 : 12;
      const frequency = isSoundPlaying ? 0.04 : 0.02;

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, '#6366f1');
      grad.addColorStop(0.5, '#a855f7');
      grad.addColorStop(1, '#06b6d4');
      ctx.strokeStyle = grad;

      for (let x = 0; x < canvas.width; x++) {
        const y = (canvas.height / 2) + Math.sin(x * frequency + phase) * amplitude * Math.sin(x / canvas.width * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.05;
      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }

  stopAudioVisualizer() {
    this.audioVisualizerRunning = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
  }

  /* ==========================================================================
     3. EVENING REFLECTION & DAY-DEBRIEF RITUAL
     ========================================================================== */
  setupEveningDebrief() {
    const modal = document.getElementById('evening-debrief-modal');
    const openBtn = document.getElementById('btn-open-debrief');
    const closeBtn = document.getElementById('btn-close-debrief');
    const form = document.getElementById('evening-debrief-form');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.add('open'));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const win = form.debriefWin.value;
        const timeLeak = form.debriefLeak.value;
        const tomorrowPriority = form.tomorrowPriority.value;

        // Reward 50 XP
        this.addXP(50);
        this.triggerConfetti();

        if (tomorrowPriority.trim()) {
          window.TasksHabitsManager.addTask({
            title: `[🔥 Tomorrow's Priority] ${tomorrowPriority.trim()}`,
            priority: 'high',
            estimatedMinutes: 60
          });
        }

        modal.classList.remove('open');
        form.reset();
        window.showToast?.('🎉 Evening reflection completed! +50 Zenith XP awarded & tomorrow primed.');
      });
    }
  }

  /* ==========================================================================
     4. CIRCADIAN ALERTNESS & ENERGY CURVE
     ========================================================================== */
  setupInteractiveEnergyCurve() {
    const slider = document.getElementById('energy-level-slider');
    const statusText = document.getElementById('energy-level-status');

    if (slider && statusText) {
      slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        let msg = '';
        if (val >= 80) msg = '⚡ Peak Alertness: Perfect for hard coding, math & deep study.';
        else if (val >= 50) msg = '🌿 Steady Energy: Ideal for review, communication & writing.';
        else msg = '🌙 Low Energy Slump: Time for a 15m walk, hydration & low-friction tasks.';
        statusText.textContent = msg;
      });
    }
  }

  /* ==========================================================================
     5. GAMIFIED VITALITY LEVELING & XP ENGINE
     ========================================================================== */
  addXP(amount) {
    window.appState.update(s => {
      const currentXP = (s.vitalityXP || 120) + amount;
      return { ...s, vitalityXP: currentXP };
    });
    this.renderLevelAndXP();
  }

  renderLevelAndXP() {
    const state = window.appState.getState();
    const xp = state.vitalityXP || 140;

    const level = Math.floor(xp / 100) + 1;
    const progressInLevel = xp % 100;

    const levelTitles = [
      'Novice Flow',
      'Momentum Builder',
      'Circadian Knight',
      'Deep Work Master',
      'Unstoppable Architect',
      'Zenith Grandmaster'
    ];
    const title = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

    const levelEl = document.getElementById('user-rank-level');
    const titleEl = document.getElementById('user-rank-title');
    const xpBar = document.getElementById('user-xp-bar');

    if (levelEl) levelEl.textContent = `Lvl ${level}`;
    if (titleEl) titleEl.textContent = title;
    if (xpBar) xpBar.style.width = `${progressInLevel}%`;
  }

  /* ==========================================================================
     6. CANVAS CELEBRATION CONFETTI
     ========================================================================== */
  triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#06b6d4'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.rotation += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frame++;
      if (frame < 80) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    animate();
  }
}

window.FlowOSExperienceEngine = FlowOSExperienceEngine;
window.ZenithExperienceEngine = FlowOSExperienceEngine;
window.flowosExperience = new FlowOSExperienceEngine();
window.zenithExperience = window.flowosExperience;
