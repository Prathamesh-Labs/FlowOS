/**
 * ZENITH AI - RPG QUESTS & WEEKLY BOSS BATTLE ENGINE
 * Transforms habit consistency and focus sessions into an engaging RPG battle.
 */

class ZenithQuestsEngine {
  constructor() {
    this.bosses = [
      { id: 'b1', name: 'The Procrastination Golem', title: 'Slumbering Overlord of Delay', maxHp: 2000, level: 12, rewardXp: 500, badge: '🛡️ Golem Slayer' },
      { id: 'b2', name: 'The Distraction Hydra', title: 'Multithreaded Chaos Beast', maxHp: 2500, level: 15, rewardXp: 750, badge: '⚔️ Hydra Severer' },
      { id: 'b3', name: 'The Burnout Phoenix', title: 'Scorching Avatar of Fatigue', maxHp: 3000, level: 18, rewardXp: 1000, badge: '👑 Phoenix Reborn' }
    ];
  }

  init() {
    this.bindUI();
    this.render();
  }

  dealDamage(amount, sourceLabel = 'Action') {
    const state = window.appState.getState();
    const boss = state.activeBossQuest;
    if (!boss) return;

    const newHp = Math.max(0, boss.currentHp - amount);
    const isDefeated = newHp === 0 && boss.currentHp > 0;

    window.appState.update(s => ({
      ...s,
      activeBossQuest: {
        ...s.activeBossQuest,
        currentHp: newHp
      },
      vitalityXP: isDefeated ? s.vitalityXP + boss.rewardXp : s.vitalityXP + Math.round(amount / 5)
    }));

    this.spawnDamageFloater(amount, sourceLabel);

    if (isDefeated) {
      this.onBossDefeated(boss);
    } else {
      this.render();
    }
  }

  spawnDamageFloater(amount, label) {
    const container = document.getElementById('boss-damage-container');
    if (!container) return;

    const floater = document.createElement('div');
    floater.className = 'damage-floater';
    floater.innerHTML = `-${amount} DMG 💥 <span style="font-size: 0.72rem; color: #fff;">(${label})</span>`;
    container.appendChild(floater);

    setTimeout(() => {
      floater.remove();
    }, 1400);
  }

  onBossDefeated(boss) {
    if (window.audioZenith) window.audioZenith.playFanfare();
    window.showToast?.(`🏆 BOSS DEFEATED! You vanquished "${boss.bossName}"! (+${boss.rewardXp} XP, Unlocked "${boss.rewardBadge}")`);

    setTimeout(() => {
      // Spawn next boss
      const nextBoss = this.bosses[1];
      window.appState.update(s => ({
        ...s,
        activeBossQuest: {
          ...nextBoss,
          bossId: nextBoss.id,
          bossName: nextBoss.name,
          currentHp: nextBoss.maxHp,
          rewardBadge: nextBoss.badge,
          quests: [
            { id: 'q1', title: 'Complete 3 Deep Focus Blocks today', progress: 0, target: 3, xp: 150, completed: false },
            { id: 'q2', title: 'Maintain unbroken 7-day habit streak', progress: 6, target: 7, xp: 250, completed: false },
            { id: 'q3', title: 'Drink 8+ glasses of water today', progress: 0, target: 8, xp: 100, completed: false }
          ]
        }
      }));
      this.render();
    }, 2500);
  }

  bindUI() {
    const attackTestBtn = document.getElementById('btn-test-boss-attack');
    if (attackTestBtn) {
      attackTestBtn.addEventListener('click', () => {
        this.dealDamage(150, 'Manual Strike');
      });
    }
  }

  render() {
    const state = window.appState.getState();
    const boss = state.activeBossQuest;
    if (!boss) return;

    const nameEl = document.getElementById('boss-name-display');
    const titleEl = document.getElementById('boss-title-display');
    const hpTextEl = document.getElementById('boss-hp-text');
    const hpBarEl = document.getElementById('boss-hp-bar-fill');
    const questListEl = document.getElementById('rpg-quest-items-list');

    const hpPercent = Math.max(0, Math.min(100, (boss.currentHp / boss.maxHp) * 100));

    if (nameEl) nameEl.textContent = boss.bossName;
    if (titleEl) titleEl.textContent = `Lvl ${boss.level} • ${boss.title}`;
    if (hpTextEl) hpTextEl.textContent = `${boss.currentHp.toLocaleString()} / ${boss.maxHp.toLocaleString()} HP (${Math.round(hpPercent)}%)`;
    if (hpBarEl) {
      hpBarEl.style.width = `${hpPercent}%`;
      hpBarEl.style.background = hpPercent < 30 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #f59e0b, #ef4444)';
    }

    if (questListEl && boss.quests) {
      questListEl.innerHTML = boss.quests.map(q => {
        const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
        return `
          <div class="rpg-quest-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">${q.title}</span>
              <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: var(--accent-study-light);">+${q.xp} XP</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.45rem;">
              <div style="flex: 1; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 4px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: var(--grad-zenith); border-radius: 4px;"></div>
              </div>
              <span style="font-size: 0.74rem; color: var(--text-muted);">${q.progress}/${q.target}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

window.questsEngine = new ZenithQuestsEngine();
