/**
 * FLOWOS - MASTER UNIFIED STATE STORE (V4)
 * Coordinates Goals, Tasks, Habits, Focus Sessions, Reality Events,
 * What-If Simulations, Personal Flow Profile History, and Mission Status.
 */

const STORAGE_KEY = 'flowos_master_os_state_v4';
const LEGACY_STORAGE_KEY = 'zenith_master_os_state_v3';

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
    name: 'FlowOS Operator',
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
  ],

  // 11. DAILY READINESS & ENERGY CHECK-IN
  readiness: {
    sleepHours: 7.5,
    sleepQuality: 4,      // 1 to 5
    physicalSoreness: 2,  // 1 (fresh) to 5 (sore)
    mentalEnergy: 8,      // 1 to 10
    score: 85,
    status: 'Optimal Flow',
    recommendedBlockMins: 50,
    recommendation: 'Cognitive readiness is peak. Ideal for deep complex problem solving and 50m study blocks.'
  },

  // 12. RPG QUESTS & WEEKLY BOSS BATTLE
  activeBossQuest: {
    bossId: 'boss_procrastination_golem',
    bossName: 'The Procrastination Golem',
    title: 'Slumbering Overlord of Delay',
    maxHp: 2000,
    currentHp: 1350,
    level: 12,
    rewardXp: 500,
    rewardBadge: '🛡️ Golem Slayer',
    quests: [
      { id: 'q1', title: 'Complete 3 Deep Focus Blocks today', progress: 2, target: 3, xp: 150, completed: false },
      { id: 'q2', title: 'Maintain unbroken 7-day habit streak', progress: 5, target: 7, xp: 250, completed: false },
      { id: 'q3', title: 'Drink 8+ glasses of water today', progress: 4, target: 8, xp: 100, completed: false }
    ]
  },

  // 13. PERSONAL FLOW PROFILE (Empirical Behavioral & Planning Patterns)
  personalFlowProfile: {
    maturityLevel: 3,
    maturityTitle: 'Calibrated Flow Profile',
    totalObservations: 46,
    calibrationPercent: 74,
    archetype: 'Deep Sprint Architect',
    dimensions: {
      workHours: {
        id: 'workHours',
        title: 'Preferred Work Hours',
        confidence: 85,
        sampleSize: 28,
        observation: 'Peak cognitive output occurs between 08:30 AM – 11:45 AM. Late evening sessions (>9:30 PM) show a 3.2x higher rate of task abandonment.',
        tag: 'High Confidence',
        basis: 'Historical Observation (28 Focus Sessions)'
      },
      focusPatterns: {
        id: 'focusPatterns',
        title: 'Focus Patterns & Stamina',
        confidence: 90,
        sampleSize: 34,
        observation: 'Optimal focus sprint duration is 48 ± 6 minutes. After 55 minutes without a pause, attention density drops by 42%.',
        tag: 'High Confidence',
        basis: 'Historical Observation (34 Timer Logs)'
      },
      planningAccuracy: {
        id: 'planningAccuracy',
        title: 'Planning Accuracy & Bias',
        confidence: 80,
        sampleSize: 22,
        observation: 'Exhibits an average +45% optimism bias on coding tasks (estimates 60m, takes 85m). Writing & review tasks are accurately calibrated (±8%).',
        tag: 'High Confidence',
        basis: 'Historical Observation (22 Planned vs Actual Tasks)'
      },
      habitConsistency: {
        id: 'habitConsistency',
        title: 'Habit Momentum & Compliance',
        confidence: 75,
        sampleSize: 42,
        observation: 'Morning sunlight & hydration have a 92% adherence rate. Weekend habit completion drops by 24% without an early anchor.',
        tag: 'Calibrated',
        basis: 'Historical Observation (42 Habit Check-ins)'
      },
      recoveryBehavior: {
        id: 'recoveryBehavior',
        title: 'Recovery & Fatigue Response',
        confidence: 68,
        sampleSize: 18,
        observation: 'When eye/posture breaks are taken on schedule, afternoon energy scores remain above 78%. Skipped breaks correlate with 4:00 PM cognitive slump.',
        tag: 'Calibrated',
        basis: 'Historical Observation (18 Screen Breaks)'
      },
      breakDuration: {
        id: 'breakDuration',
        title: 'Preferred Break Duration',
        confidence: 70,
        sampleSize: 19,
        observation: '7-10 minute active walk/stretch breaks yield a 94% full cognitive recovery. Passive screen scrolling breaks fail to restore focus stamina.',
        tag: 'Calibrated',
        basis: 'Historical Observation (19 Rest Periods)'
      },
      productivityRhythms: {
        id: 'productivityRhythms',
        title: 'Ultradian & Circadian Rhythms',
        confidence: 65,
        sampleSize: 15,
        observation: 'Strong 90-minute ultradian rhythm peaks in the morning, followed by a natural circadian slump between 2:15 PM – 3:00 PM.',
        tag: 'Emerging Pattern',
        basis: 'Historical Observation (15 Daily Logs)'
      },
      commonDistractions: {
        id: 'commonDistractions',
        title: 'Distraction Triggers & Friction',
        confidence: 60,
        sampleSize: 12,
        observation: 'Context-switching during code debugging is the #1 cause of schedule overruns. Multi-tab browsing increases focus recovery time by 8 minutes.',
        tag: 'Emerging Pattern',
        basis: 'Historical Observation (12 Tab Blur Events)'
      }
    }
  },

  // 14. MEMORY REPLAY TIMELINE STORE (Living Chronological Journey)
  dailyMemories: {
    activeDayKey: 'today',
    days: {
      today: {
        dateTitle: 'Today — Monday, Aug 10, 2026',
        isLive: true,
        aiSummary: {
          narrative: 'A high-impact execution day anchored by early sunlight and a powerful morning coding sprint. When the Python auth module overran by +45m, FlowOS recommended compressing evening review to safeguard your 10:30 PM bedtime while maintaining 100% habit streak integrity.',
          primaryWin: 'Unbroken habit streak maintained & 150m deep focus logged.',
          frictionPoint: 'Debugging session variance exceeded initial budget by +45m.',
          adaptationTaken: 'Compressed evening review buffer from 60m to 15m to protect workout & circadian sleep window.',
          tomorrowFocus: 'Tackle the FastAPI project build during morning peak (08:30 AM – 11:30 AM).'
        },
        moments: [
          {
            id: 'mem_1',
            time: '07:00 AM',
            title: 'Circadian Day Genesis & Anchor Set',
            type: 'genesis',
            icon: 'sun',
            description: 'Woke up at 7:00 AM. Drank 500ml water and stepped onto the balcony for 12 minutes of direct natural photons.',
            metrics: 'Energy: 8/10 • Vitality: 82%',
            badge: 'Circadian Rhythm Synced'
          },
          {
            id: 'mem_2',
            time: '08:30 AM',
            title: 'Deep Focus Sprint: Master Python & Algorithms',
            type: 'focus',
            icon: 'brain',
            description: 'Initiated 60-minute deep work block with 10Hz Alpha procedural soundscape. Implemented Binary Tree traversal logic.',
            metrics: 'Planned: 60m • Actual: 85m (+25m)',
            badge: 'Flow State Achieved'
          },
          {
            id: 'mem_3',
            time: '09:55 AM',
            title: 'Reality Overrun: Auth Debugging Divergence',
            type: 'overrun',
            icon: 'alert-triangle',
            description: 'Encountered unexpected JWT token expiration edge case. Coding sprint extended by +45 minutes past planned timebox.',
            metrics: 'Variance: +45m • Overrun Flagged',
            badge: 'Reality Disruption'
          },
          {
            id: 'mem_4',
            time: '10:45 AM',
            title: 'AI Recommendation: Schedule Rebalance Applied',
            type: 'ai-decision',
            icon: 'sparkles',
            description: 'FlowOS detected the 45m schedule compression. Recommended Option 1: Compressed low-priority evening review to protect 6:00 PM gym session.',
            metrics: 'Flexible Buffer Consumed: 45m',
            badge: 'Bedtime Protected'
          },
          {
            id: 'mem_5',
            time: '01:30 PM',
            title: 'Brain Fuel Lunch & Screen Comfort Break',
            type: 'habit',
            icon: 'utensils',
            description: 'Logged Mediterranean Quinoa Bowl & 2 glasses of water. Screen Guardian triggered 20-20-20 eye strain relief.',
            metrics: 'Hydration: 6/10 • Eye Rest: Logged',
            badge: 'Recovery Respected'
          },
          {
            id: 'mem_6',
            time: '04:15 PM',
            title: 'RPG Boss Strike: Procrastination Golem',
            type: 'focus',
            icon: 'swords',
            description: 'Completed afternoon focus session on System Design, dealing -150 DMG to the weekly boss.',
            metrics: 'Boss HP: 1,350 / 2,000 HP • +50 XP',
            badge: 'Momentum Multiplier'
          }
        ]
      },
      yesterday: {
        dateTitle: 'Yesterday — Sunday, Aug 9, 2026',
        isLive: false,
        aiSummary: {
          narrative: 'A steady restorative weekend cadence. Maintained unbroken habit consistency with 8 glasses of water and an evening mobility routine.',
          primaryWin: 'Defended weekend habit consistency without burnout.',
          frictionPoint: 'Afternoon fatigue dip at 2:30 PM.',
          adaptationTaken: 'Substituted heavy study block with a 25m gentle recovery walk.',
          tomorrowFocus: 'Prepare for Monday high-output coding sprints.'
        },
        moments: [
          {
            id: 'mem_y1',
            time: '08:00 AM',
            title: 'Restorative Weekend Morning',
            type: 'genesis',
            icon: 'sun',
            description: 'Gentle wake-up. 15 minutes of outdoor mobility and herbal green tea.',
            metrics: 'Sleep: 8.5 hrs • Quality: 5/5',
            badge: 'Full Recovery'
          },
          {
            id: 'mem_y2',
            time: '11:00 AM',
            title: 'Light Reading & Architectural Research',
            type: 'focus',
            icon: 'book-open',
            description: 'Read 20 pages of System Design concepts with Campfire ambient audio.',
            metrics: 'Duration: 45m • No Overrun',
            badge: 'Relaxed Focus'
          },
          {
            id: 'mem_y3',
            time: '06:00 PM',
            title: 'Evening Mobility & Posture Routine',
            type: 'habit',
            icon: 'heart',
            description: 'Completed 30-minute full body stretching and resistance band exercise.',
            metrics: 'Streak: 6 Days • Score: 90%',
            badge: 'Habit Milestone'
          }
        ]
      }
    }
  },

  // 15. AI COPILOT AUTONOMOUS MONITORING STATE
  copilotState: {
    enabled: true,
    silenceUntil: null,
    cooldownMinutes: 15,
    lastInterventionTime: null,
    activeIntervention: {
      id: 'nudge_sample_overrun',
      type: 'overrun',
      severity: 'moderate',
      title: 'Schedule Divergence Detected',
      message: 'Your current coding block has exceeded its planned 60m budget by +25m. Bedtime is at risk of sliding past 10:30 PM if not rebalanced.',
      question: 'Would you like to compress tonight\'s optional 45m evening review to keep your workout and sleep on track?',
      options: [
        { id: 'compress_review', label: '⚡ Yes, Compress Review (-30m)', action: 'compress_evening', style: 'btn-emerald' },
        { id: 'add_15m', label: '⏳ Extend Timer by 15m', action: 'extend_timer', style: 'btn-secondary' },
        { id: 'dismiss', label: 'Dismiss for 15m', action: 'dismiss', style: 'btn-secondary' }
      ]
    },
    stats: {
      interventionsTriggered: 14,
      actionsAccepted: 11,
      hoursProtected: 4.5
    }
  }
};

class StateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Auto-migration from legacy Zenith state
        stored = localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem('zenith_master_os_state_v2');
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = { ...INITIAL_STATE, ...parsed };
        if (!merged.personalFlowProfile && merged.digitalTwin) {
          merged.personalFlowProfile = merged.digitalTwin;
        }
        if (!merged.digitalTwin && merged.personalFlowProfile) {
          merged.digitalTwin = merged.personalFlowProfile;
        }
        return merged;
      }
    } catch (e) {
      console.warn('Could not load stored state:', e);
    }
    const fresh = JSON.parse(JSON.stringify(INITIAL_STATE));
    fresh.digitalTwin = fresh.personalFlowProfile;
    return fresh;
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
    // Sync digitalTwin and personalFlowProfile
    if (this.state.personalFlowProfile && !this.state.digitalTwin) {
      this.state.digitalTwin = this.state.personalFlowProfile;
    } else if (this.state.digitalTwin && !this.state.personalFlowProfile) {
      this.state.personalFlowProfile = this.state.digitalTwin;
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

    const finalScore = Math.max(10, Math.min(100, score));
    this.state.dayBalanceScore = finalScore;
    this.state.vitalityScore = finalScore; // backward compatibility
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
