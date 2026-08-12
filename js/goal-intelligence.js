/**
 * FLOWOS - GOAL INTELLIGENCE & OBSTACLE SOLVER ENGINE (V2.0)
 * Powers the Goal -> Milestones -> Tasks -> Daily Schedule pipeline
 * and provides obstacle deconstruction when users encounter friction.
 */

const GOAL_TEMPLATES = {
  'python-mastery': {
    title: 'Master Python & Software Engineering',
    category: 'study',
    targetDays: 60,
    milestones: [
      { title: 'Core Syntax, Loops, Data Structures', completed: true },
      { title: 'Object-Oriented & Modular Programming', completed: false },
      { title: 'Algorithms & Problem Solving (50 Practice Sets)', completed: false },
      { title: 'Build Full-Stack Capstone Web App', completed: false }
    ],
    initialTasks: [
      { title: 'Practice 3 List Comprehension problems', priority: 'high', estimatedMinutes: 45 },
      { title: 'Watch 20-min OOP architecture lecture', priority: 'medium', estimatedMinutes: 25 },
      { title: 'Write class diagram for capstone project', priority: 'medium', estimatedMinutes: 40 }
    ]
  },
  'exam-prep': {
    title: 'Ace Comprehensive Semester Exams',
    category: 'study',
    targetDays: 45,
    milestones: [
      { title: 'Syllabus Breakdown & Summary Notes', completed: true },
      { title: 'Active Recall Flashcard Mastery', completed: false },
      { title: 'Past 5 Years Question Papers Timed Mock', completed: false },
      { title: 'Final Weak-Topic Revision Sprint', completed: false }
    ],
    initialTasks: [
      { title: 'Solve 2019 Past Paper Section A', priority: 'high', estimatedMinutes: 60 },
      { title: 'Active Recall Session on Key Theorems', priority: 'high', estimatedMinutes: 45 }
    ]
  },
  'desk-wellness': {
    title: 'Eradicate Desk Fatigue & Posture Strain',
    category: 'wellness',
    targetDays: 30,
    milestones: [
      { title: 'Complete 7 consecutive days of 20-20-20 breaks', completed: false },
      { title: 'Establish 3x weekly core/mobility routine', completed: false },
      { title: 'Zero phone screens 45 mins before bedtime for 2 weeks', completed: false }
    ],
    initialTasks: [
      { title: 'Set up ergonomic desk height & monitor angle', priority: 'medium', estimatedMinutes: 20 },
      { title: 'Complete 10m thoracic spine mobility flow', priority: 'high', estimatedMinutes: 15 }
    ]
  }
};

class GoalIntelligenceEngine {
  /**
   * Deconstruct a broad goal prompt into milestones and actionable tasks
   */
  static synthesizeGoalFromPrompt(promptText, category = 'study') {
    const clean = promptText.trim();
    const id = 'g_' + Date.now();

    // Heuristic milestone & task breakdown
    const milestones = [
      { id: `${id}_m1`, title: `Foundation & Core Fundamentals of ${clean}`, completed: false },
      { id: `${id}_m2`, title: `Structured Practical Application & Practice`, completed: false },
      { id: `${id}_m3`, title: `Advanced Synthesis & Milestone Project`, completed: false },
      { id: `${id}_m4`, title: `Final Mastery Review & Evaluation`, completed: false }
    ];

    const tasks = [
      {
        id: 't_' + Date.now() + '_1',
        title: `Research & set up roadmap for: ${clean}`,
        goalId: id,
        priority: 'high',
        estimatedMinutes: 45,
        actualMinutes: 0,
        completed: false,
        subtasks: [
          { id: 'st_1', title: 'Gather top 2 resources/references', done: false },
          { id: 'st_2', title: 'Block daily focus slots', done: false }
        ],
        dueDate: 'Today'
      },
      {
        id: 't_' + Date.now() + '_2',
        title: `Complete initial foundational session on ${clean}`,
        goalId: id,
        priority: 'high',
        estimatedMinutes: 60,
        actualMinutes: 0,
        completed: false,
        subtasks: [],
        dueDate: 'Tomorrow'
      }
    ];

    const newGoal = {
      id,
      title: clean,
      category,
      targetDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      progress: 0,
      milestones
    };

    return { goal: newGoal, tasks };
  }

  /**
   * AI Obstacle Solver: When the user says "I'm stuck and don't know what to do next"
   */
  static deconstructObstacle(obstacleDescription, activeGoalTitle = 'Current Goal') {
    const desc = (obstacleDescription || '').toLowerCase();

    let immediateMicroStep = '';
    let recoveryStrategy = '';
    let estimatedMinutes = 15;

    if (desc.includes('bug') || desc.includes('code') || desc.includes('error') || desc.includes('syntax')) {
      immediateMicroStep = 'Print / log variable values at the exact failure line, or write a 5-line isolated test case.';
      recoveryStrategy = 'Isolate the failure in an empty file to decouple external system complexity.';
      estimatedMinutes = 15;
    } else if (desc.includes('overwhelm') || desc.includes('too much') || desc.includes('dont know where') || desc.includes('lost')) {
      immediateMicroStep = 'Write down the single smallest 5-minute piece on paper. Ignore everything else for now.';
      recoveryStrategy = 'Shrink scope to a single micro-deliverable to restore momentum.';
      estimatedMinutes = 10;
    } else if (desc.includes('bored') || desc.includes('procrastinat') || desc.includes('distract') || desc.includes('lazy')) {
      immediateMicroStep = 'Put phone in another room, set timer to 10 minutes, and do just one sentence/one problem.';
      recoveryStrategy = 'Use the "Rule of 10 Minutes" — tell yourself you can stop after 10 mins if you want.';
      estimatedMinutes = 10;
    } else if (desc.includes('concept') || desc.includes('understand') || desc.includes('hard') || desc.includes('theory')) {
      immediateMicroStep = 'Explain the concept aloud in plain terms (Feynman Technique) or sketch a diagram.';
      recoveryStrategy = 'Visual mapping converts abstract concepts into intuitive mental models.';
      estimatedMinutes = 20;
    } else {
      immediateMicroStep = `Break "${obstacleDescription}" into a 15-minute micro-exploration action.`;
      recoveryStrategy = 'Lower friction by replacing the big goal with an observational micro-task.';
      estimatedMinutes = 15;
    }

    return {
      obstacle: obstacleDescription,
      immediateMicroStep,
      recoveryStrategy,
      estimatedMinutes,
      suggestedTask: {
        id: 't_unstick_' + Date.now(),
        title: `[⚡ Unstick] ${immediateMicroStep}`,
        priority: 'high',
        estimatedMinutes,
        actualMinutes: 0,
        completed: false,
        subtasks: [],
        dueDate: 'Today'
      }
    };
  }

  /**
   * Recalculate goal progress percentage
   */
  static recalculateGoalProgress(goal) {
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const completedCount = goal.milestones.filter(m => m.completed).length;
    return Math.round((completedCount / goal.milestones.length) * 100);
  }
}

window.GoalIntelligenceEngine = GoalIntelligenceEngine;
