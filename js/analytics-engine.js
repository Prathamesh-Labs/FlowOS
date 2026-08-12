/**
 * FLOWOS - INTELLIGENCE & UNDERSTANDING ANALYTICS (V2.0)
 * Evaluates time leakage, habit resilience, planning realism, goal velocity, and behavioral patterns.
 */

class AnalyticsEngine {
  /**
   * Diagnostic 1: "Where am I losing time?"
   */
  static analyzeTimeLeakage(state) {
    const history = state.focusHistory || [];
    if (history.length === 0) {
      return {
        totalOverrunMinutes: 0,
        averageOverrunPercentage: 0,
        topOverrunTasks: [],
        insight: 'Not enough history yet. Complete focus blocks to analyze time trends.'
      };
    }

    let totalOverrun = 0;
    let totalPlanned = 0;
    let totalActual = 0;

    history.forEach(session => {
      totalOverrun += (session.overrunMinutes || 0);
      totalPlanned += (session.plannedMinutes || 0);
      totalActual += (session.actualMinutes || 0);
    });

    const averageOverrunPercent = totalPlanned > 0 ? Math.round(((totalActual - totalPlanned) / totalPlanned) * 100) : 0;

    return {
      totalOverrunMinutes: totalOverrun,
      averageOverrunPercentage: averageOverrunPercent,
      topOverrunTasks: history.slice(0, 3),
      insight: averageOverrunPercent > 20
        ? `Observed pattern: Tasks take ~${averageOverrunPercent}% longer than initial estimates. FlowOS recommends scheduling 15m buffer blocks.`
        : 'Your time estimation is balanced and within realistic margins.'
    };
  }

  /**
   * Diagnostic 2: "Which habits am I most consistent with?"
   */
  static analyzeHabitConsistency(state) {
    const habits = state.habits || [];
    if (habits.length === 0) return { bestHabit: 'None', insight: 'Not enough habit logs yet.' };

    const sorted = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0));
    const best = sorted[0];

    return {
      bestHabit: best ? `${best.title} (${best.streak} days)` : 'None',
      bestHabitBadge: best ? best.badge : '',
      consistencyScore: Math.round((habits.filter(h => h.completedToday).length / habits.length) * 100),
      insight: `Your strongest anchor habit is "${best?.title || 'None'}". Leverage it as a starting anchor for your day.`
    };
  }

  /**
   * Diagnostic 3: "Goal Velocity & Bottleneck Analysis"
   */
  static analyzeGoalVelocity(state) {
    const goals = state.goals || [];
    if (goals.length === 0) return { velocityScore: 0, insight: 'Not enough goal history yet.' };

    let totalProgress = 0;
    goals.forEach(g => totalProgress += (g.progress || 0));
    const avgProgress = Math.round(totalProgress / goals.length);

    return {
      averageProgress: avgProgress,
      activeGoalCount: goals.length,
      insight: avgProgress >= 50
        ? `🟢 Strong Goal Velocity: You are advancing through milestones with steady progress.`
        : `🟡 Velocity Bottleneck: Some milestones are waiting for task completion. Use the Obstacle Deconstructor to break them down.`
    };
  }

  /**
   * Diagnostic 4: "Planning Realism & Behavioral Patterns"
   */
  static analyzePlanExecutionRealism(state) {
    const tasks = state.tasks || [];
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskRatio = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const schedule = state.todaySchedule || [];
    const completedBlocks = schedule.filter(b => b.completed).length;
    const scheduleRatio = schedule.length > 0 ? Math.round((completedBlocks / schedule.length) * 100) : 0;

    const combinedRealism = Math.round((taskRatio * 0.5) + (scheduleRatio * 0.5));

    let verdict = '';
    if (combinedRealism >= 80) verdict = '🟢 High Realism: Daily plans match actual execution time well.';
    else if (combinedRealism >= 50) verdict = '🟡 Moderate Realism: Slight over-scheduling during afternoon slots.';
    else verdict = '🔴 Over-Optimistic: More tasks are scheduled than typically completed. Try scheduling 20% fewer items or adding transition buffers.';

    return {
      taskCompletionRate: taskRatio,
      scheduleExecutionRate: scheduleRatio,
      combinedScore: combinedRealism,
      verdict
    };
  }
}

window.AnalyticsEngine = AnalyticsEngine;
