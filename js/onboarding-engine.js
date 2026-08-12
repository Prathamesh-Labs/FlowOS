/**
 * ZENITH AI - ONBOARDING & PWA INSTALLATION ENGINE (V1.0)
 * Manages 1-click personal archetypes and native desktop/mobile app installation.
 */

class ZenithOnboardingEngine {
  constructor() {
    this.deferredPrompt = null;
    this.archetypes = {
      student: {
        title: 'Academic & Exam Sprint',
        badge: '🎓 Student Archetype',
        mission: 'Master Python & Binary Tree Data Structures',
        targetTime: 'Today at 08:30 PM',
        soundscape: 'alpha',
        timerBlock: 50,
        tasks: [
          { id: 't_s1', title: 'Solve 3 Tree Traversal LeetCode Problems', priority: 'high', estimatedMinutes: 60, completed: false },
          { id: 't_s2', title: 'Review Python Async & Concurrency Notes', priority: 'medium', estimatedMinutes: 45, completed: false },
          { id: 't_s3', title: 'Active Recall Flashcard Session (30 cards)', priority: 'low', estimatedMinutes: 20, completed: false }
        ]
      },
      engineer: {
        title: 'Software Engineer & Deep Flow',
        badge: '💻 Engineer Archetype',
        mission: 'Ship Modern Python Async API & Complete User Auth Flow',
        targetTime: 'Today at 08:30 PM',
        soundscape: 'gamma',
        timerBlock: 60,
        tasks: [
          { id: 't_e1', title: 'Debug JWT User Auth Expiration Edge Case', priority: 'high', estimatedMinutes: 60, completed: false },
          { id: 't_e2', title: 'Implement FastAPI Redis Session Cache', priority: 'high', estimatedMinutes: 45, completed: false },
          { id: 't_e3', title: 'Write Integration Unit Tests for Endpoints', priority: 'medium', estimatedMinutes: 30, completed: false }
        ]
      },
      executive: {
        title: 'Founder & High-Performance Leader',
        badge: '⚡ Executive Archetype',
        mission: 'Decompose Q3 Growth Milestones & Review Product Architecture',
        targetTime: 'Today at 06:00 PM',
        soundscape: 'zen',
        timerBlock: 45,
        tasks: [
          { id: 't_x1', title: 'Synthesize Q3 Strategic OKRs with AI Deconstructor', priority: 'high', estimatedMinutes: 45, completed: false },
          { id: 't_x2', title: 'High-Leverage Team Execution Unblocking', priority: 'high', estimatedMinutes: 30, completed: false },
          { id: 't_x3', title: 'Audit Weekly Focus Realism & Time Leaks', priority: 'medium', estimatedMinutes: 25, completed: false }
        ]
      },
      wellness: {
        title: 'Holistic Longevity & Habit Mastery',
        badge: '🧘 Wellness Archetype',
        mission: 'Hit 8 Glasses Hydration, 100% Habit Streak & Digital Sunset',
        targetTime: 'Today at 10:30 PM',
        soundscape: 'rain',
        timerBlock: 25,
        tasks: [
          { id: 't_w1', title: '15-min Morning Natural Balcony Photons & 500ml Water', priority: 'high', estimatedMinutes: 15, completed: true },
          { id: 't_w2', title: 'Midday Posture Ergonomics & 20-20-20 Eye Rest', priority: 'medium', estimatedMinutes: 15, completed: false },
          { id: 't_w3', title: 'Full Body Mobility Stretch & Magnesium Sunset Routine', priority: 'high', estimatedMinutes: 25, completed: false }
        ]
      }
    };
  }

  init() {
    this.bindUI();
    this.setupPWA();
  }

  bindUI() {
    // 1. Archetype selection cards on landing page
    const archetypeCards = document.querySelectorAll('.archetype-select-card');
    archetypeCards.forEach(card => {
      card.addEventListener('click', () => {
        const archetypeKey = card.dataset.archetype;
        this.applyArchetype(archetypeKey);
      });
    });

    // 2. Direct Launch CTA button
    const launchBtn = document.getElementById('btn-welcome-launch');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        this.navigateToTab('today');
      });
    }

    // 3. PWA Install Header & Landing Buttons
    const installBtns = document.querySelectorAll('.btn-pwa-install');
    installBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.promptPWAInstall();
      });
    });
  }

  setupPWA() {
    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('✅ Zenith Service Worker registered successfully:', reg.scope))
          .catch((err) => console.log('Service Worker registration note:', err));
      });
    }

    // Capture PWA installation prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const installBtns = document.querySelectorAll('.btn-pwa-install');
      installBtns.forEach(btn => {
        btn.style.display = 'inline-flex';
      });
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      window.showToast?.('🎉 Zenith AI installed successfully as a standalone app!');
      const installBtns = document.querySelectorAll('.btn-pwa-install');
      installBtns.forEach(btn => {
        btn.style.display = 'none';
      });
    });
  }

  promptPWAInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the Zenith PWA install prompt');
        }
        this.deferredPrompt = null;
      });
    } else {
      window.showToast?.('📲 To install: Click (⋮) or Share in your browser and select "Add to Home screen" or "Install Zenith AI"');
    }
  }

  applyArchetype(key) {
    const arch = this.archetypes[key];
    if (!arch) return;

    window.appState.update(s => ({
      ...s,
      currentMission: {
        title: arch.mission,
        targetCompletion: arch.targetTime,
        category: key
      },
      tasks: [...arch.tasks, ...s.tasks.filter(t => !arch.tasks.some(at => at.id === t.id))],
      activeFocus: {
        ...s.activeFocus,
        plannedSeconds: arch.timerBlock * 60,
        elapsedSeconds: 0
      }
    }));

    // Start soundscape preset
    if (window.audioZenith && arch.soundscape) {
      window.audioZenith.startSoundscape(arch.soundscape);
    }

    if (window.audioZenith) window.audioZenith.playFanfare();
    window.showToast?.(`✨ Loaded ${arch.badge}! Schedule and tasks calibrated.`);

    // Switch to Command Center
    this.navigateToTab('today');
  }

  navigateToTab(tabName) {
    const navItem = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (navItem) {
      navItem.click();
    }
  }
}

window.onboardingEngine = new ZenithOnboardingEngine();
