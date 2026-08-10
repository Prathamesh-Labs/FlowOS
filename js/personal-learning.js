/**
 * ZENITH AI - PERSONAL REALITY LEARNING ENGINE
 * Records category-level planned vs actual duration over time
 * and computes empirical estimation biases with strict data thresholds (no fabricated insights).
 */

class PersonalRealityLearningEngine {
  /**
   * Record a completed focus session or task into historical learning memory
   */
  static recordSession(taskCategory, taskTitle, plannedMinutes, actualMinutes) {
    if (!plannedMinutes || !actualMinutes) return;

    window.appState.update(s => {
      const history = s.learnedReality || [];
      const catKey = (taskCategory || 'general').toLowerCase();

      let existing = history.find(h => h.category === catKey);

      if (existing) {
        const nextPlanned = existing.plannedTotalMinutes + plannedMinutes;
        const nextActual = existing.actualTotalMinutes + actualMinutes;
        const nextCount = existing.sessionCount + 1;
        const variance = Math.round(((nextActual - nextPlanned) / nextPlanned) * 100);

        const updatedHistory = history.map(h => {
          if (h.category === catKey) {
            return {
              ...h,
              plannedTotalMinutes: nextPlanned,
              actualTotalMinutes: nextActual,
              sessionCount: nextCount,
              variancePercentage: variance,
              insight: variance > 15
                ? `You consistently take ~${variance}% longer on ${h.name} than estimated.`
                : `Your estimation accuracy on ${h.name} is well-calibrated (within ±15%).`
            };
          }
          return h;
        });

        return { ...s, learnedReality: updatedHistory };
      } else {
        const variance = Math.round(((actualMinutes - plannedMinutes) / plannedMinutes) * 100);
        const newRecord = {
          category: catKey,
          name: taskTitle.split(' ')[0] + ' Work',
          plannedTotalMinutes: plannedMinutes,
          actualTotalMinutes: actualMinutes,
          sessionCount: 1,
          variancePercentage: variance,
          insight: 'Collecting baseline data (requires 2+ sessions for high confidence).'
        };

        return { ...s, learnedReality: [...history, newRecord] };
      }
    });
  }

  /**
   * Get honest learned insights (only returns categories with >= 2 data points)
   */
  static getValidatedInsights() {
    const state = window.appState.getState();
    const records = state.learnedReality || [];

    // Filter out categories with insufficient history
    const validated = records.filter(r => r.sessionCount >= 2);

    if (validated.length === 0) {
      return {
        hasData: false,
        message: 'Personal Reality Engine is observing your focus sessions. Insights appear after 2 completed sessions.'
      };
    }

    return {
      hasData: true,
      insights: validated
    };
  }
}

window.PersonalRealityLearningEngine = PersonalRealityLearningEngine;
