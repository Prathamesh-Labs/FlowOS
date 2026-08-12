/**
 * FLOWOS - DEVICE PAIRING & DATA TRANSFER ENGINE (V2.0)
 * Generates an on-screen pairing QR code and portable sync links without accounts or external databases.
 */

class FlowOSQrSyncEngine {
  constructor() {
    this.modalEl = null;
  }

  init() {
    this.bindUI();
    this.checkForIncomingSyncPayload();
  }

  bindUI() {
    this.modalEl = document.getElementById('qr-sync-modal');
    const openBtn = document.getElementById('btn-open-qr-sync');
    const closeBtn = document.getElementById('btn-close-qr-sync');
    const copyLinkBtn = document.getElementById('btn-copy-sync-link');
    const importForm = document.getElementById('qr-import-form');

    if (openBtn) {
      openBtn.addEventListener('click', () => this.openSyncModal());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSyncModal());
    }

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const linkInput = document.getElementById('qr-sync-url-input');
        if (linkInput) {
          navigator.clipboard.writeText(linkInput.value);
          window.showToast?.('📋 Instant Device Transfer link copied to clipboard!');
        }
      });
    }

    if (importForm) {
      importForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('qr-import-payload-input');
        if (input && input.value.trim()) {
          this.importPayload(input.value.trim());
        }
      });
    }
  }

  openSyncModal() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('open');
    this.generateQrAndLink();
  }

  closeSyncModal() {
    if (this.modalEl) this.modalEl.classList.remove('open');
  }

  generateCompactPayload() {
    const s = window.appState.getState();
    const payload = {
      v: 2,
      ts: Date.now(),
      profile: s.profile,
      waterGlasses: s.waterGlasses,
      habits: (s.habits || []).map(h => ({ id: h.id, title: h.title, streak: h.streak, completedToday: h.completedToday })),
      goals: (s.goals || []).map(g => ({ id: g.id, title: g.title, progress: g.progress })),
      vitalityXP: s.vitalityXP,
      dayBalanceScore: s.dayBalanceScore || s.vitalityScore
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }

  generateQrAndLink() {
    const base64 = this.generateCompactPayload();
    const syncUrl = `${window.location.origin}${window.location.pathname}#sync=${base64}`;

    const urlInput = document.getElementById('qr-sync-url-input');
    if (urlInput) urlInput.value = syncUrl;

    const qrContainer = document.getElementById('qr-canvas-container');
    if (qrContainer) {
      qrContainer.innerHTML = `
        <div style="background: #fff; padding: 12px; border-radius: 12px; display: inline-block; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(syncUrl)}&color=090d16" 
               alt="FlowOS Device Sync QR" 
               style="display: block; width: 170px; height: 170px; border-radius: 6px;">
        </div>
      `;
    }
  }

  importPayload(rawInput) {
    try {
      let b64 = rawInput;
      if (rawInput.includes('#sync=')) {
        b64 = rawInput.split('#sync=')[1];
      }

      const jsonStr = decodeURIComponent(escape(atob(b64)));
      const data = JSON.parse(jsonStr);

      if (data && (data.habits || data.profile)) {
        window.appState.update(s => ({
          ...s,
          profile: data.profile || s.profile,
          waterGlasses: data.waterGlasses || s.waterGlasses,
          vitalityXP: data.vitalityXP || s.vitalityXP,
          dayBalanceScore: data.dayBalanceScore || s.dayBalanceScore
        }));

        if (window.audioFlowOS) window.audioFlowOS.playFanfare();
        window.showToast?.('🎉 Device state successfully imported & synchronized!');
        this.closeSyncModal();
      }
    } catch (e) {
      console.warn('Import failed:', e);
      window.showToast?.('⚠️ Invalid or corrupted sync code.');
    }
  }

  checkForIncomingSyncPayload() {
    if (window.location.hash.includes('#sync=')) {
      const b64 = window.location.hash.split('#sync=')[1];
      if (b64) {
        setTimeout(() => {
          this.importPayload(b64);
          history.replaceState(null, null, ' ');
        }, 600);
      }
    }
  }
}

window.FlowOSQrSyncEngine = FlowOSQrSyncEngine;
window.ZenithQrSyncEngine = FlowOSQrSyncEngine;
window.qrSyncEngine = new FlowOSQrSyncEngine();
