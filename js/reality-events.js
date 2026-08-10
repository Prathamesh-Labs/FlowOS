/**
 * ZENITH AI - REALITY EVENT ENGINE
 * Handles real-world disruptions with structured decision cycles:
 * WHAT CHANGED -> IMPACT -> OPTIONS -> RECOMMENDATION -> APPLY
 */

class RealityEventEngine {
  /**
   * Process a reality trigger and compute structured options
   */
  static triggerEvent(eventType, customData = {}) {
    const state = window.appState.getState();
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let title = '';
    let whatChanged = '';
    let impactSummary = '';
    let options = [];
    let recommendedOptionId = 'opt_1';
    let recommendationReason = '';

    // Calculate remaining flexible time vs fixed commitments
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

    switch (eventType) {
      case 'woke-late':
        title = 'Late Wake-Up Divergence (+120m)';
        whatChanged = 'Morning schedule started 2 hours later than initial plan.';
        impactSummary = `Remaining flexible time compressed to ${flexibleMins}m. Morning focus block was missed or shortened.`;
        options = [
          {
            id: 'opt_1',
            title: 'Compress Afternoon Breaks & Merge Study Blocks',
            desc: `Shorten afternoon break to 10m and execute a 2-hour consolidated deep work block. Protects 10:30 PM sleep.`,
            action: 'condense-breaks'
          },
          {
            id: 'opt_2',
            title: 'Defer 1 Secondary Task to Tomorrow',
            desc: `Shift lowest-priority task to tomorrow. Restores normal schedule flow without rushing.`,
            action: 'defer-lowest'
          },
          {
            id: 'opt_3',
            title: 'Shift Schedule 90 Minutes Later',
            desc: `Shift all remaining blocks 90m forward. Extends bedtime to midnight.`,
            action: 'shift-all-forward'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Preserves the core daily mission while protecting circadian sleep timing.';
        break;

      case 'task-overrun':
        const overrunMins = customData.overrunMinutes || 45;
        title = `Focus Session Overran by +${overrunMins} Minutes`;
        whatChanged = `Current deep work task required +${overrunMins}m more cognitive time than planned estimate.`;
        impactSummary = `Evening buffer consumed. Remaining flexible work slots compressed by ${overrunMins}m.`;
        options = [
          {
            id: 'opt_1',
            title: 'Compress Evening Review & Protect Workout/Dinner',
            desc: `Shorten evening review from 60m to 15m. Keeps workout at 4:30 PM and dinner at 8:30 PM.`,
            action: 'compress-review'
          },
          {
            id: 'opt_2',
            title: 'Shift 1 Secondary Task to Tomorrow',
            desc: `Move lowest-priority task to tomorrow morning to keep normal evening relaxation.`,
            action: 'defer-lowest'
          },
          {
            id: 'opt_3',
            title: 'Compress Dinner & Workout Times',
            desc: `Shorten workout to 30m and dinner to 30m to complete all scheduled tasks.`,
            action: 'compress-wellness'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Protecting physical movement and dinner prevents late-night cognitive burnout.';
        break;

      case 'unexpected-meeting':
        title = 'Unexpected Urgent Meeting (60m)';
        whatChanged = 'A 60-minute unplanned meeting or call was inserted into your work hours.';
        impactSummary = `Displaced afternoon focus slot. ${flexibleMins - 60}m flexible time remains.`;
        options = [
          {
            id: 'opt_1',
            title: 'Reschedule Study Block to Evening Slot',
            desc: 'Move displaced focus block to 7:00 PM - 8:30 PM.',
            action: 'swap-to-evening'
          },
          {
            id: 'opt_2',
            title: 'Convert Study Session to 30m Sprint',
            desc: 'Execute a condensed 30m high-intensity sprint instead of 90m block.',
            action: 'condense-sprint'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Moving the focus session preserves full depth without sacrificing output quality.';
        break;

      case 'low-energy':
        title = 'Low Energy / Cognitive Slump';
        whatChanged = 'Current energy level is low. High-cognition analytical work has high friction.';
        impactSummary = 'Difficult tasks will take 2x longer if forced. High risk of procrastination.';
        options = [
          {
            id: 'opt_1',
            title: 'Switch to Low-Friction Review & 15m Walk',
            desc: 'Replace heavy problem-solving with video lectures/reading and take a brisk walk.',
            action: 'switch-low-friction'
          },
          {
            id: 'opt_2',
            title: 'Take a 25-Min Power Nap & Hydrate',
            desc: 'Insert a 25m restorative rest block, drink 500ml water, restart focus at 3:00 PM.',
            action: 'insert-nap'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Active recovery and light movement restores dopamine without guilt.';
        break;

      case 'finish-project-today':
        title = 'Sprint Commitment: Finish Project Today';
        whatChanged = 'User requested to prioritize and complete entire active project before bedtime.';
        impactSummary = 'Requires dedicating all remaining flexible time (180m+) to Project tasks.';
        options = [
          {
            id: 'opt_1',
            title: 'Dedicate All Afternoon/Evening to Project Sprint',
            desc: 'Replace secondary tasks & reading with dedicated Project focus blocks.',
            action: 'dedicate-project-sprint'
          },
          {
            id: 'opt_2',
            title: 'Execute Two 75-Min Blocks with 20m Break',
            desc: 'Structured double-sprint protecting dinner and screen eye relief.',
            action: 'double-sprint'
          }
        ];
        recommendedOptionId = 'opt_2';
        recommendationReason = 'Structured double sprints with hydration breaks maximize code quality and prevent late-night errors.';
        break;
    }

    const realityAlert = {
      active: true,
      eventType,
      title,
      whatChanged,
      impactSummary,
      flexibleTimeAvailable: flexibleMins,
      estimatedRemainingWork: 180,
      options,
      recommendedOptionId,
      recommendationReason
    };

    window.appState.update(s => ({
      ...s,
      activeRealityAlert: realityAlert
    }));

    if (window.audioZenith) window.audioZenith.playChime();
    window.showToast?.(`⚡ Reality Event Detected: ${title}`);
  }

  /**
   * Apply selected concrete option
   */
  static applyOption(optionId) {
    const state = window.appState.getState();
    const alert = state.activeRealityAlert;
    if (!alert) return;

    const opt = alert.options.find(o => o.id === optionId);
    if (!opt) return;

    let updatedSchedule = [...state.todaySchedule];

    switch (opt.action) {
      case 'compress-review':
        updatedSchedule = updatedSchedule.map(b => {
          if (b.title.toLowerCase().includes('review') || b.title.toLowerCase().includes('debrief')) {
            return { ...b, timeStart: '19:45', timeEnd: '20:15', title: '[Condensed] Evening Review (30m)' };
          }
          return b;
        });
        break;

      case 'defer-lowest':
        const lowestTask = state.tasks.find(t => t.priority === 'low' || t.priority === 'medium' && !t.completed);
        if (lowestTask) {
          window.appState.update(s => ({
            ...s,
            tasks: s.tasks.map(t => t.id === lowestTask.id ? { ...t, dueDate: 'Tomorrow' } : t)
          }));
        }
        break;

      case 'condense-breaks':
        updatedSchedule = updatedSchedule.map(b => {
          if (b.category === 'screen') {
            return { ...b, title: '[Quick 10m] ' + b.title };
          }
          return b;
        });
        break;

      case 'switch-low-friction':
        updatedSchedule = updatedSchedule.map(b => {
          if (b.category === 'study' && !b.completed) {
            return { ...b, title: '[Gentle Flow] ' + b.title, desc: 'Low-friction reading, video lectures, or mind mapping.' };
          }
          return b;
        });
        break;

      case 'dedicate-project-sprint':
        updatedSchedule = updatedSchedule.map(b => {
          if (b.category === 'study' && !b.completed) {
            return { ...b, title: `⚡ [Project Sprint] ${state.currentMission.title}` };
          }
          return b;
        });
        break;

      default:
        updatedSchedule = window.AIScheduleEngine.rebalanceAfterOverrun(updatedSchedule, 30);
        break;
    }

    // Dismiss alert and update schedule
    window.appState.update(s => ({
      ...s,
      todaySchedule: updatedSchedule,
      activeRealityAlert: { ...s.activeRealityAlert, active: false }
    }));

    window.zenithExperience?.triggerConfetti();
    window.showToast?.(`✨ Applied: "${opt.title}". Remaining schedule rebalanced!`);
  }

  static dismissAlert() {
    window.appState.update(s => ({
      ...s,
      activeRealityAlert: { ...s.activeRealityAlert, active: false }
    }));
  }
}

window.RealityEventEngine = RealityEventEngine;
