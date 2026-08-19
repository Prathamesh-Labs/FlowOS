/**
 * FLOWOS - SECURE AUTH & HYBRID CLOUD SYNC MANAGER (V1.0)
 * Uses native Web Crypto API for secure hashing, and manages local-first
 * state transitions to a simulated secure cloud sync database.
 */

class AuthSyncManager {
  static init() {
    this.logs = [];
    this.addLog('Sync engine initialized. Waiting for connection...');
    
    // Check if session is stored
    const savedSession = localStorage.getItem('flowos_user_session');
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        window.appState.update(s => ({ ...s, currentUser: user }));
        this.addLog(`Welcome back, ${user.email}. Connected to cloud sync.`);
        
        // Initial pull
        this.pullCloudState(user.id);
      } catch (err) {
        this.addLog('Failed to restore active session.');
      }
    }
  }

  static async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async signup(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Email and password are required.');
    }

    const users = JSON.parse(localStorage.getItem('flowos_users') || '[]');
    if (users.find(u => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await this.hashPassword(password);
    const userId = 'u_' + Date.now();
    const newUser = { id: userId, email: cleanEmail, passwordHash };

    users.push(newUser);
    localStorage.setItem('flowos_users', JSON.stringify(users));

    this.addLog(`Account created successfully for ${cleanEmail}.`);
    return this.login(cleanEmail, password);
  }

  static async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error('Email and password are required.');
    }

    const users = JSON.parse(localStorage.getItem('flowos_users') || '[]');
    const user = users.find(u => u.email === cleanEmail);
    if (!user) {
      throw new Error('No account found with this email.');
    }

    const hash = await this.hashPassword(password);
    if (user.passwordHash !== hash) {
      throw new Error('Incorrect password.');
    }

    const sessionUser = { id: user.id, email: user.email };
    localStorage.setItem('flowos_user_session', JSON.stringify(sessionUser));
    
    this.addLog(`Authenticated successfully as ${cleanEmail}. Connecting to database...`);
    
    // Update State
    window.appState.update(s => ({ ...s, currentUser: sessionUser }));
    
    // Pull and sync
    this.pullCloudState(user.id);
    return sessionUser;
  }

  static logout() {
    const state = window.appState.getState();
    const email = state.currentUser?.email || 'User';
    
    localStorage.removeItem('flowos_user_session');
    window.appState.update(s => ({ ...s, currentUser: null }));
    
    this.addLog(`User ${email} signed out. Offline fallback active.`);
    window.showToast?.('👋 Signed out. Local-only mode active.');
  }

  static pullCloudState(userId) {
    const dbKey = `flowos_cloud_db_${userId}`;
    const cloudPayload = localStorage.getItem(dbKey);

    if (cloudPayload) {
      try {
        const decryptedState = JSON.parse(cloudPayload); // Simulated decryption
        this.addLog('State payload successfully synced from cloud database.');
        
        // Merge cloud state back into localState
        window.appState.update(local => {
          return this.mergeStates(local, decryptedState);
        });
      } catch (err) {
        this.addLog('Failed to decode sync payload.');
      }
    } else {
      this.addLog('No cloud payload found. Uploading local baseline state.');
      const currentState = window.appState.getState();
      this.syncStateToCloud(currentState);
    }
  }

  static syncStateToCloud(state) {
    if (!state.currentUser) return;
    
    const userId = state.currentUser.id;
    const dbKey = `flowos_cloud_db_${userId}`;
    
    // Exclude session keys from backup payload
    const payload = { ...state };
    delete payload.currentUser;

    try {
      const serialized = JSON.stringify(payload);
      localStorage.setItem(dbKey, serialized);
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.addLog(`[${time}] Dynamic Sync completed. Encrypted payload uploaded (${serialized.length} bytes).`);
      
      // Update dynamic status in DOM
      this.updateSyncIndicators(time, serialized.length);
    } catch (err) {
      this.addLog('Sync transmission failed.');
    }
  }

  static mergeStates(local, cloud) {
    // Merge algorithm: resolve conflicting one-off tasks and habits
    const mergedTasks = [...(local.tasks || [])];
    (cloud.tasks || []).forEach(ct => {
      const index = mergedTasks.findIndex(lt => lt.id === ct.id);
      if (index === -1) {
        mergedTasks.push(ct);
      } else {
        // Cloud takes precedence if completed, otherwise keep local modifications
        if (ct.completed && !mergedTasks[index].completed) {
          mergedTasks[index] = ct;
        }
      }
    });

    const mergedHabits = [...(local.habits || [])];
    (cloud.habits || []).forEach(ch => {
      const index = mergedHabits.findIndex(lh => lh.id === ch.id);
      if (index === -1) {
        mergedHabits.push(ch);
      } else {
        // Keep habit with higher streak
        if ((ch.streak || 0) > (mergedHabits[index].streak || 0)) {
          mergedHabits[index] = ch;
        }
      }
    });

    // Merge goals
    const mergedGoals = [...(local.goals || [])];
    (cloud.goals || []).forEach(cg => {
      const index = mergedGoals.findIndex(lg => lg.id === cg.id);
      if (index === -1) {
        mergedGoals.push(cg);
      } else {
        if ((cg.progress || 0) > (mergedGoals[index].progress || 0)) {
          mergedGoals[index] = cg;
        }
      }
    });

    return {
      ...local,
      tasks: mergedTasks,
      habits: mergedHabits,
      goals: mergedGoals,
      todaySchedule: cloud.todaySchedule || local.todaySchedule,
      studyMinutesCompleted: Math.max(local.studyMinutesCompleted || 0, cloud.studyMinutesCompleted || 0),
      vitalityXP: Math.max(local.vitalityXP || 120, cloud.vitalityXP || 120)
    };
  }

  static addLog(msg) {
    this.logs.unshift(msg);
    if (this.logs.length > 50) this.logs.pop();
    
    // Render logs
    const logBox = document.getElementById('sync-console-logs');
    if (logBox) {
      logBox.innerHTML = this.logs.map(l => `<div class="sync-log-line">${l}</div>`).join('');
    }
  }

  static updateSyncIndicators(timeString, byteLength) {
    const statusText = document.getElementById('sync-indicator-status-text');
    const pulseDot = document.getElementById('sync-indicator-dot');
    const detailsText = document.getElementById('sync-indicator-details');

    if (statusText) statusText.textContent = 'Synchronized';
    if (pulseDot) {
      pulseDot.className = 'sync-pulse-dot synced';
    }
    if (detailsText) {
      detailsText.textContent = `Auto-saved at ${timeString} (${byteLength} bytes)`;
    }
  }
}

window.AuthSyncManager = AuthSyncManager;
