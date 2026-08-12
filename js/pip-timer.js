/**
 * FLOWOS - ALWAYS-ON-TOP PICTURE-IN-PICTURE FOCUS WIDGET (V2.0)
 * Renders a persistent floating mini-timer window over other desktop applications.
 * Uses Document Picture-in-Picture where supported, with canvas stream fallback.
 */

class FlowOSPipTimerController {
  constructor() {
    this.pipWindow = null;
    this.canvas = null;
    this.video = null;
    this.ctx = null;
    this.animFrameId = null;
    this.isDocumentPipSupported = 'documentPictureInPicture' in window;
  }

  init() {
    const popOutBtn = document.getElementById('btn-pip-popout') || document.getElementById('btn-open-pip-timer');
    if (popOutBtn) {
      popOutBtn.addEventListener('click', () => this.togglePip());
    }
    const openPipBtn = document.getElementById('btn-open-pip-timer');
    if (openPipBtn && openPipBtn !== popOutBtn) {
      openPipBtn.addEventListener('click', () => this.togglePip());
    }
  }

  async togglePip() {
    if (this.pipWindow || (document.pictureInPictureElement)) {
      this.closePip();
    } else {
      await this.openPip();
    }
  }

  async openPip() {
    // 1. Try Document Picture-in-Picture API (Chrome 116+)
    if (this.isDocumentPipSupported) {
      try {
        this.pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 340,
          height: 220
        });

        // Copy styles
        Array.from(document.styleSheets).forEach(sheet => {
          try {
            const style = document.createElement('style');
            style.textContent = Array.from(sheet.cssRules).map(rule => rule.cssText).join('');
            this.pipWindow.document.head.appendChild(style);
          } catch (e) {}
        });

        this.renderDocumentPipContent();

        this.pipWindow.addEventListener('pagehide', () => {
          this.pipWindow = null;
          this.updateButtonState(false);
        });

        this.updateButtonState(true);
        window.showToast?.('🪟 Floating Focus Timer Activated!');
        return;
      } catch (e) {
        console.warn('Document PIP failed, falling back to Canvas stream:', e);
      }
    }

    // 2. Fallback to Canvas Stream Video PiP (Universal across all modern browsers)
    this.openCanvasStreamPip();
  }

  renderDocumentPipContent() {
    if (!this.pipWindow) return;

    this.pipWindow.document.body.innerHTML = `
      <div style="background: #090d16; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 1.2rem; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 700; color: #818cf8; letter-spacing: 0.05em;">FLOWOS FOCUS</span>
          <span id="pip-water-badge" style="font-size: 0.75rem; background: rgba(16,185,129,0.2); color: #34d399; padding: 0.2rem 0.5rem; border-radius: 12px;">💧 Hydrated</span>
        </div>

        <div style="text-align: center; margin: 0.6rem 0;">
          <div id="pip-task-title" style="font-size: 0.85rem; color: #94a3b8; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; margin-bottom: 0.3rem;">Focusing on Task</div>
          <div id="pip-time-display" style="font-size: 2.4rem; font-weight: 800; font-family: monospace; letter-spacing: 0.04em; background: linear-gradient(135deg, #fff, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">25:00</div>
        </div>

        <div style="display: flex; gap: 0.5rem; justify-content: center;">
          <button id="pip-play-btn" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; border: 0; padding: 0.45rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.82rem; cursor: pointer;">Pause</button>
          <button id="pip-reset-btn" style="background: rgba(255,255,255,0.1); color: #fff; border: 0; padding: 0.45rem 0.8rem; border-radius: 8px; font-weight: 600; font-size: 0.82rem; cursor: pointer;">Reset</button>
          <button id="pip-water-btn" style="background: rgba(56,189,248,0.15); color: #38bdf8; border: 0; padding: 0.45rem 0.8rem; border-radius: 8px; font-weight: 600; font-size: 0.82rem; cursor: pointer;">+1 💧</button>
        </div>
      </div>
    `;

    // Bind PiP window button events
    const playBtn = this.pipWindow.document.getElementById('pip-play-btn');
    const resetBtn = this.pipWindow.document.getElementById('pip-reset-btn');
    const waterBtn = this.pipWindow.document.getElementById('pip-water-btn');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        window.focusEngine?.toggle();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        window.focusEngine?.reset();
      });
    }

    if (waterBtn) {
      waterBtn.addEventListener('click', () => {
        window.appState.update(s => ({
          ...s,
          waterGlasses: Math.min(s.waterGoal || 8, (s.waterGlasses || 0) + 1)
        }));
        if (window.audioFlowOS) window.audioFlowOS.playWaterDrop();
      });
    }

    // Subscribe to state changes to update PiP window
    this.updateDocumentPip();
  }

  updateDocumentPip() {
    if (!this.pipWindow) return;
    const timeEl = this.pipWindow.document.getElementById('pip-time-display');
    const taskEl = this.pipWindow.document.getElementById('pip-task-title');
    const playBtn = this.pipWindow.document.getElementById('pip-play-btn');
    const waterBadge = this.pipWindow.document.getElementById('pip-water-badge');

    const state = window.appState.getState();
    const mainTimeEl = document.getElementById('timer-time-display');

    if (timeEl && mainTimeEl) timeEl.textContent = mainTimeEl.textContent;
    if (taskEl) taskEl.textContent = state.activeFocus?.taskTitle || 'Open Focus Flow';
    if (playBtn) playBtn.textContent = state.activeFocus?.isRunning ? 'Pause' : 'Start';
    if (waterBadge) waterBadge.textContent = `💧 ${state.waterGlasses || 0}/${state.waterGoal || 8}`;
  }

  openCanvasStreamPip() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 400;
      this.canvas.height = 240;
      this.ctx = this.canvas.getContext('2d');
    }

    if (!this.video) {
      this.video = document.createElement('video');
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.srcObject = this.canvas.captureStream(30);
    }

    this.video.play().then(() => {
      this.video.requestPictureInPicture()
        .then(() => {
          this.startCanvasRenderLoop();
          this.updateButtonState(true);
          window.showToast?.('🪟 Canvas PiP Focus Timer Activated!');
        })
        .catch(e => {
          console.warn('Canvas PiP failed:', e);
          window.showToast?.('⚠️ Picture-in-Picture could not be opened.');
        });
    });

    this.video.addEventListener('leavepictureinpicture', () => {
      this.stopCanvasRenderLoop();
      this.updateButtonState(false);
    });
  }

  startCanvasRenderLoop() {
    const render = () => {
      if (!this.ctx) return;
      const state = window.appState.getState();
      const mainTime = document.getElementById('timer-time-display')?.textContent || '25:00';
      const taskTitle = state.activeFocus?.taskTitle || 'Deep Focus Session';

      // Background
      this.ctx.fillStyle = '#090d16';
      this.ctx.fillRect(0, 0, 400, 240);

      // Header
      this.ctx.fillStyle = '#818cf8';
      this.ctx.font = 'bold 16px sans-serif';
      this.ctx.fillText('FLOWOS FOCUS', 24, 36);

      // Task Title
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '14px sans-serif';
      this.ctx.fillText(taskTitle.slice(0, 32), 24, 70);

      // Timer Digits
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 56px monospace';
      this.ctx.fillText(mainTime, 24, 140);

      // Sub-stats (Hydration & Day Balance)
      this.ctx.fillStyle = '#34d399';
      this.ctx.font = 'bold 15px sans-serif';
      this.ctx.fillText(`💧 ${state.waterGlasses || 0}/${state.waterGoal || 8} Glasses`, 24, 195);

      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillText(`⚡ Day Balance: ${state.dayBalanceScore || state.vitalityScore || 82}%`, 180, 195);

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }

  stopCanvasRenderLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  closePip() {
    if (this.pipWindow) {
      this.pipWindow.close();
      this.pipWindow = null;
    }
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }
    this.stopCanvasRenderLoop();
    this.updateButtonState(false);
  }

  updateButtonState(isOpen) {
    const btn = document.getElementById('btn-pip-popout');
    if (btn) {
      btn.innerHTML = isOpen 
        ? '<i data-lucide="minimize-2"></i> Close Mini Widget'
        : '<i data-lucide="external-link"></i> Floating Mini-Timer';
      if (window.lucide) lucide.createIcons();
    }
  }
}

window.FlowOSPipTimerController = FlowOSPipTimerController;
window.ZenithPipTimerController = FlowOSPipTimerController;
window.pipTimerController = new FlowOSPipTimerController();
