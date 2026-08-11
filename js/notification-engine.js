/**
 * ZENITH AI - DESKTOP & BROWSER NOTIFICATION ENGINE
 * Handles native Web Notifications API, background alerts, hydration nudges,
 * and seamless audio-visual sync across all device states.
 */

class ZenithNotificationEngine {
  constructor() {
    this.storageKey = 'zenith_notif_prefs';
    this.prefs = this.loadPrefs();
    this.timers = {
      water: null,
      habits: null
    };
  }

  loadPrefs() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      enabled: true,
      soundEnabled: true,
      timerComplete: true,
      eyeBreaks: true,
      postureChecks: true,
      waterReminders: true,
      waterIntervalMinutes: 60,
      dailyHabitReminder: true
    };
  }

  savePrefs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.prefs));
    } catch (e) {}
  }

  isSupported() {
    return 'Notification' in window;
  }

  getPermissionState() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission; // 'granted' | 'denied' | 'default'
  }

  async requestPermission() {
    if (!this.isSupported()) {
      window.showToast?.('⚠️ Native notifications are not supported in this browser.');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      this.updateUI();
      if (permission === 'granted') {
        this.sendNotification('🌟 Notifications Activated!', {
          body: 'Zenith AI will now notify you for timers, focus breaks, and health goals even when running in the background.',
          tag: 'zenith-welcome'
        }, 'fanfare');
        this.initBackgroundIntervals();
      } else if (permission === 'denied') {
        window.showToast?.('❌ Notification permission was blocked in your browser settings.');
      }
      return permission;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  sendNotification(title, options = {}, soundType = 'alert') {
    if (!this.prefs.enabled) return false;

    // Trigger procedural audio sound
    if (this.prefs.soundEnabled && window.audioZenith) {
      if (soundType === 'gong') window.audioZenith.playGong();
      else if (soundType === 'fanfare') window.audioZenith.playFanfare();
      else if (soundType === 'water') window.audioZenith.playWaterDrop();
      else if (soundType === 'chime') window.audioZenith.playChime();
      else window.audioZenith.playAlert();
    }

    // In-page fallback toast
    window.showToast?.(title + (options.body ? ` - ${options.body}` : ''));

    // Native browser push notification
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          icon: 'https://cdn-icons-png.flaticon.com/512/3208/3208726.png',
          badge: 'https://cdn-icons-png.flaticon.com/512/3208/3208726.png',
          silent: true, // We handle audio cleanly via Web Audio API
          ...options
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    }
    return false;
  }

  notifyTimerComplete(mode = 'focus') {
    if (!this.prefs.timerComplete) return;

    if (mode === 'focus') {
      this.sendNotification('🎯 Focus Block Complete!', {
        body: 'Fantastic work! Step away, stretch, and let your brain integrate what you learned.',
        tag: 'zenith-timer'
      }, 'gong');
    } else {
      this.sendNotification('⚡ Break Finished!', {
        body: 'Refueled and ready? Dive back into your next flow session.',
        tag: 'zenith-timer'
      }, 'fanfare');
    }
  }

  notifyEyeBreak() {
    if (!this.prefs.eyeBreaks) return;
    this.sendNotification('👀 20-20-20 Eye Strain Relief', {
      body: 'Look at something 20 feet away for 20 seconds to protect your vision and focus!',
      tag: 'zenith-eye'
    }, 'alert');
  }

  notifyPostureCheck() {
    if (!this.prefs.postureChecks) return;
    this.sendNotification('🧘 Posture Alignment Check', {
      body: 'Roll your shoulders back, align your spine, and take a deep diaphragmatic breath.',
      tag: 'zenith-posture'
    }, 'alert');
  }

  notifyHydration() {
    if (!this.prefs.waterReminders) return;
    const glasses = window.appState?.state?.waterGlasses || 0;
    const goal = window.appState?.state?.waterGoal || 10;
    this.sendNotification('💧 Hydration Check-In', {
      body: `You've logged ${glasses}/${goal} glasses today. Drink a glass of water to keep mental stamina peak!`,
      tag: 'zenith-water'
    }, 'water');
  }

  notifyDailyHabits() {
    if (!this.prefs.dailyHabitReminder) return;
    const habits = window.appState?.state?.habits || [];
    const pending = habits.filter(h => !h.completedToday).length;
    if (pending > 0) {
      this.sendNotification('🔥 Daily Habit Streak at Risk!', {
        body: `You have ${pending} habit${pending > 1 ? 's' : ''} left today. Don't break your momentum!`,
        tag: 'zenith-habits'
      }, 'alert');
    }
  }

  initBackgroundIntervals() {
    // 1. Water reminder interval (every X minutes)
    if (this.timers.water) clearInterval(this.timers.water);
    if (this.prefs.waterReminders && this.prefs.waterIntervalMinutes > 0) {
      const ms = this.prefs.waterIntervalMinutes * 60 * 1000;
      this.timers.water = setInterval(() => {
        this.notifyHydration();
      }, ms);
    }

    // 2. Evening habit reminder (runs every 30 minutes to check if it's 8:00 PM+)
    if (this.timers.habits) clearInterval(this.timers.habits);
    if (this.prefs.dailyHabitReminder) {
      let notifiedToday = false;
      this.timers.habits = setInterval(() => {
        const now = new Date();
        if (now.getHours() >= 20 && !notifiedToday) {
          this.notifyDailyHabits();
          notifiedToday = true;
        } else if (now.getHours() < 20) {
          notifiedToday = false;
        }
      }, 30 * 60 * 1000);
    }
  }

  init() {
    this.updateUI();
    this.initBackgroundIntervals();

    // Bind permissions button if exists
    const enableBtn = document.getElementById('btn-enable-notifications');
    if (enableBtn) {
      enableBtn.addEventListener('click', () => this.requestPermission());
    }

    // Bind test notification button
    const testBtn = document.getElementById('btn-test-notification');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.sendNotification('🧪 Zenith Notification Test', {
          body: 'Audio and system desktop notifications are functioning seamlessly!',
          tag: 'zenith-test'
        }, 'fanfare');
      });
    }

    // Bind preference checkboxes
    this.bindPrefCheckbox('notif-pref-timer', 'timerComplete');
    this.bindPrefCheckbox('notif-pref-eye', 'eyeBreaks');
    this.bindPrefCheckbox('notif-pref-posture', 'postureChecks');
    this.bindPrefCheckbox('notif-pref-water', 'waterReminders');
    this.bindPrefCheckbox('notif-pref-sound', 'soundEnabled');
  }

  bindPrefCheckbox(elementId, prefKey) {
    const el = document.getElementById(elementId);
    if (el) {
      el.checked = !!this.prefs[prefKey];
      el.addEventListener('change', (e) => {
        this.prefs[prefKey] = e.target.checked;
        this.savePrefs();
        this.initBackgroundIntervals();
        window.showToast?.('⚙️ Notification preferences updated.');
      });
    }
  }

  updateUI() {
    const statusEl = document.getElementById('notif-permission-status');
    const enableBtn = document.getElementById('btn-enable-notifications');
    const perm = this.getPermissionState();

    if (statusEl) {
      if (perm === 'granted') {
        statusEl.innerHTML = '<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-diet-light); border: 1px solid var(--accent-diet);">✓ Desktop Notifications Active</span>';
        if (enableBtn) enableBtn.style.display = 'none';
      } else if (perm === 'denied') {
        statusEl.innerHTML = '<span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444;">✕ Blocked by Browser</span>';
        if (enableBtn) enableBtn.style.display = 'inline-flex';
      } else {
        statusEl.innerHTML = '<span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b;">! Permissions Not Enabled</span>';
        if (enableBtn) enableBtn.style.display = 'inline-flex';
      }
    }
  }
}

window.notificationEngine = new ZenithNotificationEngine();
