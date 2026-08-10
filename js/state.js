/**
 * ZENITH AI - MASTER UNIFIED STATE STORE (V3)
 * Coordinates Goals, Tasks, Habits, Focus Sessions, Reality Events,
 * What-If Simulations, Learned Estimation History, and Mission Status.
 */

const STORAGE_KEY = 'zenith_master_os_state_v3';

const INITIAL_STATE = {
  activeArchetype: 'developer',
  accessibilityMode: false,

  // 1. CURRENT MISSION (The #1 Anchor for Today)
  currentMission: {
    title: 'Ship Modern Python Async API & Complete Tree Problems',
    goalId: 'g1',
    taskId: 't2',
    targetCompletion: 'Today at 08:30 PM',
    status: 'in-progress' // 'in-progress' | 'completed' | 'diverged'
  },

  profile: {
    name: 'Zenith Operator',
    wakeTime: '07:00',
    bedTime: '23:00',
    targetStudyHours: 6,
    screenLimitHours: 7,
    dietGoal: 'clean-energy'
  },

  // 2. ACTIVE REALITY EVENT & IMPACT
  activeRealityAlert: {
    active: true,
    eventType: 'task-overrun',
    title: 'Focus Session Overran by +45 Minutes',
    whatChanged: 'Your morning coding block ran 1h 45m instead of the planned 1h 00m.',
    impactSummary: 'Afternoon schedule compressed by 45m. Workout and dinner at risk of shifting past 9:00 PM.',
    flexibleTimeAvailable: 160, // minutes
    estimatedRemainingWork: 200, // minutes
    options: [
      {
        id: 'opt_1',
        title: 'Compress Low-Priority Review & Keep Workout',
        desc: 'Reduce evening review from 60m to 15m. Preserves gym & 10:30 PM bedtime.',
        action: 'compress-review'
      },
      {
        id: 'opt_2',
        title: 'Shift 1 Secondary Task to Tomorrow',
        desc: 'Move "Read 20 pages System Design" to tomorrow. Keeps full workout & relaxation.',
        action: 'defer-secondary'
      },
      {
        id: 'opt_3',
        title: 'Extend Work & Shift Bedtime by 30m',
        desc: 'Finish all tasks today, push sleep to 11:30 PM.',
        action: 'extend-bedtime'
      }
    ],
    recommendedOptionId: 'opt_1',
    recommendationReason: 'Option 1 preserves circadian sleep hygiene while ensuring primary mission completion.'
  },

  // 3. GOAL INTELLIGENCE
  goals: [
    {
      id: 'g1',
      title: 'Master Modern Python & Algorithms',
      category: 'study',
      targetDate: '2026-10-15',
      progress: 45,
      milestones: [
        { id: 'm1_1', title: 'Core Syntax & Data Structures', completed: true },
        { id: 'm1_2', title: 'OOP & Async Programming', completed: true },
        { id: 'm1_3', title: 'LeetCode Medium Algorithms (50 solved)', completed: false },
        { id: 'm1_4', title: 'Build Full-Stack FastAPI Project', completed: false }
      ]
    },
    {
      id: 'g2',
      title: 'Consistent Physical Mobility & Posture',
      category: 'wellness',
      targetDate: '2026-12-31',
      progress: 65,
      milestones: [
        { id: 'm2_1', title: 'Daily 10-minute morning mobility', completed: true },
        { id: 'm2_2', title: 'Complete 30 days of 20-20-20 screen breaks', completed: false },
        { id: 'm2_3', title: '3x weekly resistance workout sessions', completed: true }
      ]
    }
  ],

  // 4. ONE-OFF TASKS
  tasks: [
    {
      id: 't1',
      title: 'Finish Python Assignment Chapter 4',
      goalId: 'g1',
      category: 'python',
      priority: 'high',
      estimatedMinutes: 60,
      actualMinutes: 85,
      completed: true,
      subtasks: [
        { id: 'st1', title: 'Review lecture slides', done: true },
        { id: 'st2', title: 'Implement Binary Tree traversal', done: true }
      ],
      dueDate: 'Today'
    },
    {
      id: 't2',
      title: 'Debug User Auth Flow in Web App',
      goalId: 'g1',
      category: 'python',
      priority: 'high',
      estimatedMinutes: 60,
      actualMinutes: 45,
      completed: false,
      subtasks: [
        { id: 'st3', title: 'Check JWT token expiration', done: false },
        { id: 'st4', title: 'Add error boundary fallback', done: false }
      ],
      dueDate: 'Today'
    },
    {
      id: 't3',
      title: 'Read 20 pages of System Design Book',
      goalId: 'g1',
      category: 'reading',
      priority: 'medium',
      estimatedMinutes: 30,
      actualMinutes: 0,
      completed: false,
      subtasks: [],
      dueDate: 'Tomorrow'
    }
  ],

  // 5. RECURRING HABITS
  habits: [
    {
      id: 'h1',
      title: 'Morning Sunlight & Hydration',
      frequency: 'daily',
      streak: 7,
      bestStreak: 14,
      graceDaysLeft: 1,
      completedToday: true,
      category: 'wellness',
      badge: '☀️ Circadian Master',
      history: ['2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10']
    },
    {
      id: 'h2',
      title: 'Deep Coding / Study Session (90m)',
      frequency: 'daily',
      streak: 4,
      bestStreak: 9,
      graceDaysLeft: 2,
      completedToday: false,
      category: 'study',
      badge: '⚡ Deep Flow',
      history: ['2026-08-07', '2026-08-08', '2026-08-09']
    },
    {
      id: 'h3',
      title: 'Digital Sunset (No screens after 10 PM)',
      frequency: 'daily',
      streak: 3,
      bestStreak: 5,
      graceDaysLeft: 1,
      completedToday: false,
      category: 'screen',
      badge: '🌙 Night Guardian',
      history: ['2026-08-08', '2026-08-09']
    }
  ],

  // 6. ACTIVE FOCUS STATE
  activeFocus: {
    isRunning: false,
    taskId: 't2',
    taskTitle: 'Debug User Auth Flow in Web App',
    plannedSeconds: 60 * 60,
    elapsedSeconds: 45 * 60,
    isOverrun: false,
    overrunPromptActive: false
  },

  focusHistory: [
    {
      date: '2026-08-09',
      taskId: 't1',
      taskTitle: 'Finish Python Assignment Chapter 4',
      category: 'python',
      plannedMinutes: 60,
      actualMinutes: 85,
      overrunMinutes: 25
    },
    {
      date: '2026-08-08',
      taskId: 'past_1',
      taskTitle: 'Data Structure LeetCode Sprint',
      category: 'python',
      plannedMinutes: 60,
      actualMinutes: 90,
      overrunMinutes: 30
    }
  ],

  // 7. TODAY'S STRUCTURED SCHEDULE
  todaySchedule: [
    {
      id: 'b1',
      timeStart: '07:00',
      timeEnd: '07:30',
      category: 'movement',
      title: 'Morning Sun & Cellular Hydration',
      desc: 'Drink 500ml water, get 10-15m direct sunlight for circadian alignment.',
      completed: true,
      isFixed: true
    },
    {
      id: 'b2',
      timeStart: '07:30',
      timeEnd: '08:15',
      category: 'diet',
      title: 'High-Protein Clean Fuel Breakfast',
      desc: 'Oatmeal, chia seeds, berries, boiled eggs or tofu scramble with green tea.',
      completed: true,
      isFixed: true
    },
    {
      id: 'b3',
      timeStart: '08:30',
      timeEnd: '10:15',
      category: 'study',
      title: 'Deep Focus Block 1: Master Python & Tree Problems',
      desc: 'Core Mission execution: Debug User Auth Flow in Web App.',
      completed: true,
      isFixed: false
    },
    {
      id: 'b4',
      timeStart: '10:15',
      timeEnd: '10:35',
      category: 'screen',
      title: 'Screen Detox & 20-20-20 Eye Relief',
      desc: 'Step away from screen. Gaze at 20ft horizon, neck rolls, hydrate.',
      completed: true,
      isFixed: false
    },
    {
      id: 'b5',
      timeStart: '10:45',
      timeEnd: '12:45',
      category: 'study',
      title: 'Execution Block 2: Algorithm Problem Sets',
      desc: 'Active problem solving, review, or project development.',
      completed: false,
      isFixed: false
    },
    {
      id: 'b6',
      timeStart: '13:00',
      timeEnd: '14:00',
      category: 'diet',
      title: 'Energizing Brain-Fuel Lunch (Offline)',
      desc: 'Balanced complex carbs, dark leafy greens, quality lean protein.',
      completed: false,
      isFixed: true
    },
    {
      id: 'b7',
      timeStart: '14:00',
      timeEnd: '14:25',
      category: 'movement',
      title: 'Post-Meal Digestive Walk',
      desc: '15-20 min light walk to flatten afternoon glucose slump.',
      completed: false,
      isFixed: false
    },
    {
      id: 'b8',
      timeStart: '14:30',
      timeEnd: '16:30',
      category: 'study',
      title: 'Work / Study Block 3: Secondary Projects',
      desc: 'Assignments, documentation, team collaboration.',
      completed: false,
      isFixed: false
    },
    {
      id: 'b9',
      timeStart: '16:30',
      timeEnd: '17:30',
      category: 'movement',
      title: 'Physical Workout / Cardio / Strength',
      desc: 'Workout to rejuvenate cardiovascular energy.',
      completed: false,
      isFixed: true
    },
    {
      id: 'b10',
      timeStart: '18:00',
      timeEnd: '18:30',
      category: 'diet',
      title: 'Smart Snack & Hydration Check',
      desc: 'Walnuts, pumpkin seeds, herbal tea or protein fuel.',
      completed: false,
      isFixed: false
    },
    {
      id: 'b11',
      timeStart: '19:00',
      timeEnd: '20:30',
      category: 'study',
      title: 'Light Review & Day Debrief',
      desc: 'Organize notes for tomorrow, close open tabs.',
      completed: false,
      isFixed: false
    },
    {
      id: 'b12',
      timeStart: '20:30',
      timeEnd: '21:30',
      category: 'diet',
      title: 'Light Wholesome Dinner',
      desc: 'Warm soup, steamed vegetables, light protein. Easily digestible.',
      completed: false,
      isFixed: true
    },
    {
      id: 'b13',
      timeStart: '22:00',
      timeEnd: '23:00',
      category: 'rest',
      title: 'Digital Sunset & Blue Light Lockout',
      desc: 'Turn off all screens. Read physical book, practice 4-7-8 breathing.',
      completed: false,
      isFixed: true
    }
  ],

  // 8. PERSONAL REALITY LEARNED PATTERNS
  learnedReality: [
    {
      category: 'python',
      name: 'Python & Algorithm Engineering',
      plannedTotalMinutes: 120,
      actualTotalMinutes: 175,
      sessionCount: 2,
      variancePercentage: 45, // +45% overrun tendency
      insight: 'You consistently take ~45% longer on Python sessions than initially estimated.'
    }
  ],

  // 9. ACTIVE SIMULATION SANDBOX
  activeSimulation: null,

  // 10. HEALTH & ACCESSIBILITY DATA
  waterGlasses: 4,
  waterGoal: 10,
  screenTimeMinutes: 185,
  screenBreaksTaken: 3,
  studyMinutesCompleted: 150,
  vitalityScore: 82,
  vitalityXP: 140,

  medicineReminders: [
    {
      id: 'med_1',
      name: 'Blood Pressure Maintenance (Prescribed)',
      time: '08:00 AM',
      instructions: 'Take 1 tablet with warm water after breakfast',
      takenToday: true
    },
    {
      id: 'med_2',
      name: 'Vitamin D3 & Calcium (Prescribed)',
      time: '01:30 PM',
      instructions: 'Take 1 capsule with lunch',
      takenToday: false
    }
  ],

  appointments: [
    {
      id: 'apt_1',
      title: 'Routine Health Checkup with Dr. Sharma',
      date: 'Aug 14, 2026',
      time: '10:30 AM',
      location: 'City Wellness Clinic, Room 302'
    }
  ]
};

class StateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load stored state:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  getState() {
    return this.state;
  }

  update(updater) {
    if (typeof updater === 'function') {
      this.state = updater(this.state);
    } else {
      this.state = { ...this.state, ...updater };
    }
    this.calculateVitality();
    this.saveState();
    this.notify();
  }

  calculateVitality() {
    const totalBlocks = this.state.todaySchedule.length || 1;
    const completedBlocks = this.state.todaySchedule.filter(b => b.completed).length;
    const scheduleRatio = completedBlocks / totalBlocks;

    const waterRatio = Math.min(this.state.waterGlasses / (this.state.waterGoal || 1), 1);
    const studyRatio = Math.min(this.state.studyMinutesCompleted / (this.state.profile.targetStudyHours * 60 || 1), 1);
    const screenBreakRatio = Math.min(this.state.screenBreaksTaken / 5, 1);

    const completedHabits = this.state.habits.filter(h => h.completedToday).length;
    const habitsRatio = this.state.habits.length > 0 ? (completedHabits / this.state.habits.length) : 1;

    const score = Math.round(
      scheduleRatio * 25 +
      studyRatio * 25 +
      habitsRatio * 20 +
      waterRatio * 15 +
      screenBreakRatio * 15
    );

    this.state.vitalityScore = Math.max(10, Math.min(100, score));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }
}

window.appState = new StateManager();
