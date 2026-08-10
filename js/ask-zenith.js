/**
 * ZENITH AI - ASK ZENITH CONTEXTUAL DECISION ASSISTANT
 * Performs structured time arithmetic, conflict inspection, and trade-off recommendations
 * directly around the user's Current Mission (NOT a generic chatbot).
 */

class AskZenithEngine {
  /**
   * Process structured user queries regarding the day and mission
   */
  static ask(queryText) {
    const state = window.appState.getState();
    const q = queryText.toLowerCase().trim();

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // 1. Calculate Real Time Math from active schedule
    const remainingBlocks = state.todaySchedule.filter(b => {
      const [sh, sm] = b.timeStart.split(':').map(Number);
      return (sh * 60 + sm) >= currentMins && !b.completed;
    });

    let flexibleMins = 0;
    let fixedMins = 0;
    remainingBlocks.forEach(b => {
      const [sh, sm] = b.timeStart.split(':').map(Number);
      const [eh, em] = b.timeEnd.split(':').map(Number);
      let dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur < 0) dur += 1440;
      if (b.isFixed) fixedMins += dur;
      else flexibleMins += dur;
    });

    const pendingTasks = state.tasks.filter(t => !t.completed);
    let totalWorkRemainingMins = 0;
    pendingTasks.forEach(t => totalWorkRemainingMins += (t.estimatedMinutes || 45));

    // Factor in learned estimation bias
    const learnedVariance = state.learnedReality?.[0]?.variancePercentage || 0;
    const adjustedWorkRemainingMins = Math.round(totalWorkRemainingMins * (1 + (learnedVariance / 100)));

    const diffMins = flexibleMins - adjustedWorkRemainingMins;
    const isDeficit = diffMins < 0;

    let responseTitle = '';
    let analysisBreakdown = '';
    let options = [];
    let recommendation = '';

    if (q.includes('finish') || q.includes('project') || q.includes('tonight') || q.includes('today')) {
      responseTitle = 'Mission Assessment: Finish Project Tonight';
      analysisBreakdown = `
        <div class="decision-math-grid">
          <div class="math-item">
            <span class="math-label">Available Flexible Time</span>
            <span class="math-val">${Math.floor(flexibleMins / 60)}h ${flexibleMins % 60}m</span>
          </div>
          <div class="math-item">
            <span class="math-label">Estimated Remaining Work</span>
            <span class="math-val" style="color: ${isDeficit ? 'var(--accent-screen)' : 'var(--accent-diet)'};">
              ${Math.floor(adjustedWorkRemainingMins / 60)}h ${adjustedWorkRemainingMins % 60}m
              ${learnedVariance > 0 ? `<small style="font-size:0.7rem;">(+${learnedVariance}% learned bias)</small>` : ''}
            </span>
          </div>
          <div class="math-item">
            <span class="math-label">Difference / Margin</span>
            <span class="math-val" style="color: ${isDeficit ? 'var(--accent-screen-light)' : 'var(--accent-diet-light)'};">
              ${isDeficit ? '-' : '+'}${Math.floor(Math.abs(diffMins) / 60)}h ${Math.abs(diffMins) % 60}m
            </span>
          </div>
        </div>
      `;

      if (isDeficit) {
        options = [
          {
            id: 'zen_opt_1',
            title: 'Compress Low-Priority Tasks by 45m',
            desc: 'Compress secondary reading & debrief to unlock enough buffer to finish project without moving bedtime.',
            action: 'compress-secondary'
          },
          {
            id: 'zen_opt_2',
            title: 'Move 1 Subtask to Tomorrow Morning',
            desc: 'Complete the core API endpoint tonight, defer integration tests to tomorrow 8:30 AM.',
            action: 'defer-subtask'
          }
        ];
        recommendation = 'Option 1 is recommended: Compressing secondary tasks gives you 45m buffer to finish clean.';
      } else {
        options = [
          {
            id: 'zen_opt_1',
            title: 'Proceed on Schedule (You have surplus time)',
            desc: 'You have enough flexible buffer. Maintain 75m focus blocks with 15m screen breaks.',
            action: 'keep-schedule'
          }
        ];
        recommendation = 'You have a healthy surplus time buffer. Proceed with planned focus sprints.';
      }
    } else if (q.includes('break') || q.includes('rest') || q.includes('stop')) {
      responseTitle = 'Break Feasibility Analysis';
      analysisBreakdown = `
        <p style="font-size: 0.9rem; color: var(--text-secondary);">
          You have <strong>${Math.floor(flexibleMins / 60)}h ${flexibleMins % 60}m</strong> of flexible time remaining today.
          Taking an extended break now will consume your buffer before dinner.
        </p>
      `;
      options = [
        {
          id: 'zen_opt_1',
          title: 'Take a 20-Min Restorative Walk & Hydrate',
          desc: 'High biological ROI: Clears mental fatigue without derailing your evening schedule.',
          action: 'take-20m-walk'
        },
        {
          id: 'zen_opt_2',
          title: 'Take a Full 60-Min Offline Break (Shift Evening by 30m)',
          desc: 'Restores high energy, pushes dinner to 9:00 PM.',
          action: 'shift-evening-30m'
        }
      ];
      recommendation = 'Taking a 20-minute offline walk preserves full schedule momentum with high mental clarity.';
    } else {
      responseTitle = 'Schedule & Reality Assessment';
      analysisBreakdown = `
        <div class="decision-math-grid">
          <div class="math-item">
            <span class="math-label">Flexible Time</span>
            <span class="math-val">${Math.floor(flexibleMins / 60)}h ${flexibleMins % 60}m</span>
          </div>
          <div class="math-item">
            <span class="math-label">Remaining Tasks</span>
            <span class="math-val">${pendingTasks.length} tasks (${totalWorkRemainingMins}m)</span>
          </div>
          <div class="math-item">
            <span class="math-label">Vitality Status</span>
            <span class="math-val" style="color: var(--accent-diet-light);">${state.vitalityScore}%</span>
          </div>
        </div>
      `;
      options = [
        {
          id: 'zen_opt_1',
          title: 'Optimize Remaining Afternoon Flow',
          desc: 'Group pending tasks into one 90-minute deep work block.',
          action: 'group-sprint'
        }
      ];
      recommendation = 'Executing a structured 90-minute block will clear all high-priority deliverables today.';
    }

    return {
      query: queryText,
      title: responseTitle,
      analysisHtml: analysisBreakdown,
      options,
      recommendation
    };
  }
}

window.AskZenithEngine = AskZenithEngine;
