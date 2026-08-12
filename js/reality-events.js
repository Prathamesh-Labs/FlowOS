/**
 * FLOWOS - REALITY & ADAPTATION ENGINE (V2.0)
 * Handles real-world disruptions with structured decision cycles:
 * WHAT CHANGED -> IMPACT -> OPTIONS -> RECOMMENDATION -> APPLY / MODIFY / IGNORE
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
    const remainingBlocks = (state.todaySchedule || []).filter(b => {
      const [sh, sm] = (b.timeStart || '00:00').split(':').map(Number);
      return (sh * 60 + sm) >= currentMins && !b.completed;
    });

    let flexibleMins = 0;
    let fixedMins = 0;
    remainingBlocks.forEach(b => {
      const [sh, sm] = (b.timeStart || '00:00').split(':').map(Number);
      const [eh, em] = (b.timeEnd || '00:00').split(':').map(Number);
      let dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur < 0) dur += 1440;
      if (b.isFixed) fixedMins += dur;
      else flexibleMins += dur;
    });

    switch (eventType) {
      case 'woke-late':
        title = 'Late Wake-Up Divergence';
        whatChanged = 'Schedule started later than planned due to late wake-up.';
        impactSummary = `Morning flexible buffer compressed. Remaining flexible time: ${flexibleMins}m.`;
        options = [
          {
            id: 'opt_1',
            title: 'Consolidate Afternoon Focus & Keep Bedtime',
            desc: 'Shorten non-critical breaks to 10m and merge focus slots. Preserves 10:30 PM bedtime.',
            action: 'condense-breaks'
          },
          {
            id: 'opt_2',
            title: 'Defer 1 Secondary Task to Tomorrow',
            desc: 'Move lowest-priority task to tomorrow. Keeps normal pacing without rushing.',
            action: 'defer-lowest'
          },
          {
            id: 'opt_3',
            title: 'Shift Evening Blocks 45 Minutes',
            desc: 'Push remaining schedule forward by 45m and adjust sleep window accordingly.',
            action: 'shift-all-forward'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Option 1 preserves core deliverables while safeguarding your circadian sleep window.';
        break;

      case 'task-overrun':
        const overrunMins = customData.overrunMinutes || 35;
        title = `Focus Session Overran by +${overrunMins} Minutes`;
        whatChanged = `Your previous focus block ran ${overrunMins}m longer than planned.`;
        impactSummary = `Afternoon flexible buffer consumed by ${overrunMins}m. Workout and dinner remain protected.`;
        options = [
          {
            id: 'opt_1',
            title: 'Compress Evening Review Buffer',
            desc: `Reduce evening review from 60m to 15m. Preserves dinner and bedtime.`,
            action: 'compress-review'
          },
          {
            id: 'opt_2',
            title: 'Shift Lowest-Priority Task to Tomorrow',
            desc: 'Move lowest-priority secondary task to tomorrow morning.',
            action: 'defer-lowest'
          },
          {
            id: 'opt_3',
            title: 'Shorten Next Break by 15m',
            desc: 'Recover 15m immediately during the next transition block.',
            action: 'condense-breaks'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Compressing flexible review buffer prevents late-night cognitive fatigue and protects sleep.';
        break;

      case 'unexpected-meeting':
        title = 'Unexpected Urgent Meeting (45-60m)';
        whatChanged = 'An unexpected meeting or call was inserted into your work hours.';
        impactSummary = `Displaced one focus block. Available flexible time: ${Math.max(0, flexibleMins - 60)}m.`;
        options = [
          {
            id: 'opt_1',
            title: 'Reschedule Focus Block to Evening Slot',
            desc: 'Move displaced focus session to 7:15 PM - 8:30 PM.',
            action: 'swap-to-evening'
          },
          {
            id: 'opt_2',
            title: 'Convert to 30m Micro-Sprint',
            desc: 'Execute a condensed 30m high-intensity sprint instead of full 90m block.',
            action: 'condense-sprint'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Preserves full depth of work while accommodating the unplanned meeting.';
        break;

      case 'lost-focus':
        title = 'Lost Focus / Attention Drift';
        whatChanged = 'Experienced friction, distraction, or interrupted momentum.';
        impactSummary = 'Attempting to push through high-resistance work risks compounding delays.';
        options = [
          {
            id: 'opt_1',
            title: '10-Minute Reset Walk & Hydration',
            desc: 'Step away from screen, drink 500ml water, and reset cognitive momentum.',
            action: 'reset-walk'
          },
          {
            id: 'opt_2',
            title: 'Deconstruct Blocker into 10-Min Micro-Action',
            desc: 'Break the active task down to the absolute next physical step.',
            action: 'micro-action-deconstruct'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'A brief sensory break clears mental fatigue and restores focus stamina.';
        break;

      case 'need-break':
        title = 'Need Rest / Break Request';
        whatChanged = 'Fatigue reached threshold; physical or mental pause requested.';
        impactSummary = `Taking a 20-30m break will consume buffer before dinner.`;
        options = [
          {
            id: 'opt_1',
            title: 'Insert 20-Min Restorative Pause',
            desc: 'Pause timer, practice 20-20-20 eye relief, and resume at next quarter hour.',
            action: 'insert-nap'
          },
          {
            id: 'opt_2',
            title: 'Take 45-Min Extended Break & Compress Review',
            desc: 'Full recharge break; evening review buffer compressed to compensate.',
            action: 'compress-review'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'A 20-minute restorative pause restores alertness without derailing evening commitments.';
        break;

      case 'urgent-task':
        title = 'New Urgent Task Inserted';
        whatChanged = customData.taskTitle ? `Urgent task "${customData.taskTitle}" added.` : 'A new high-priority deliverable was added to today.';
        impactSummary = 'Requires dedicating a 45m focus block immediately or before evening.';
        options = [
          {
            id: 'opt_1',
            title: 'Schedule Immediate 45m Sprint for Urgent Task',
            desc: 'Insert task into next available slot; push secondary items down.',
            action: 'insert-urgent'
          },
          {
            id: 'opt_2',
            title: 'Slot Urgent Task at 4:30 PM Transition',
            desc: 'Place between afternoon study and evening movement.',
            action: 'slot-transition'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Clearing urgent items immediately prevents anxiety and restores deep focus.';
        break;

      case 'completed-early':
        title = 'Focus Block Completed Early! (+25m Surplus)';
        whatChanged = 'Previous mission deliverable was finished 25 minutes ahead of schedule.';
        impactSummary = 'You have created a 25m surplus time buffer for your afternoon/evening.';
        options = [
          {
            id: 'opt_1',
            title: 'Bank 25m as Relaxation & Early Dinner',
            desc: 'Maintain current schedule and enjoy an extended evening dinner/downtime.',
            action: 'bank-surplus'
          },
          {
            id: 'opt_2',
            title: 'Pull Forward Next Milestone Task',
            desc: 'Start next milestone task early and finish the day ahead of schedule.',
            action: 'pull-forward'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Rewarding early completion with natural recovery builds long-term consistency.';
        break;

      case 'low-energy':
      case 'energy-shift':
        title = 'Low Energy / Cognitive Slump';
        whatChanged = 'Self-reported energy indicates lower focus capacity for analytical work.';
        impactSummary = 'Complex tasks may take longer if forced.';
        options = [
          {
            id: 'opt_1',
            title: 'Switch to Low-Friction Review & 15m Walk',
            desc: 'Replace heavy problem-solving with review or audio materials.',
            action: 'switch-low-friction'
          },
          {
            id: 'opt_2',
            title: 'Take a 20-Min Restorative Nap & Hydrate',
            desc: 'Insert rest block, drink 500ml water, resume at 3:15 PM.',
            action: 'insert-nap'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Gentle execution preserves streak momentum while honoring energy levels.';
        break;

      case 'finish-project-today':
      default:
        title = 'Sprint Commitment: Finish Project Today';
        whatChanged = 'User requested to prioritize and complete core project today.';
        impactSummary = 'Allocating dedicated focus blocks to the primary mission.';
        options = [
          {
            id: 'opt_1',
            title: 'Dedicate Evening Slots to Core Project',
            desc: 'Replace secondary reading with focused project sprint.',
            action: 'dedicate-project-sprint'
          },
          {
            id: 'opt_2',
            title: 'Two 60-Min Focused Blocks with 15m Recovery',
            desc: 'Structured double-sprint protecting dinner and sleep.',
            action: 'double-sprint'
          }
        ];
        recommendedOptionId = 'opt_1';
        recommendationReason = 'Dedicated sprints maximize throughput while protecting circadian health.';
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

    if (window.audioFlowOS) window.audioFlowOS.playChime();
    window.showToast?.(`⚡ Reality Event Detected: ${title}`);
  }

  /**
   * Apply selected adaptation option
   */
  static applyOption(optionId) {
    const state = window.appState.getState();
    const alert = state.activeRealityAlert;
    if (!alert) return;

    const opt = alert.options.find(o => o.id === optionId) || alert.options[0];
    if (!opt) return;

    let updatedSchedule = [...(state.todaySchedule || [])];

    switch (opt.action) {
      case 'compress-review':
        updatedSchedule = updatedSchedule.map(b => {
          if ((b.title || '').toLowerCase().includes('review') || (b.title || '').toLowerCase().includes('debrief')) {
            return { ...b, timeStart: '19:45', timeEnd: '20:15', title: '[Condensed] Evening Review (30m)' };
          }
          return b;
        });
        break;

      case 'defer-lowest':
        const lowestTask = (state.tasks || []).find(t => (t.priority === 'low' || t.priority === 'medium') && !t.completed);
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
            return { ...b, title: '[Gentle Flow] ' + b.title, desc: 'Low-friction review and concept mapping.' };
          }
          return b;
        });
        break;

      case 'dedicate-project-sprint':
        updatedSchedule = updatedSchedule.map(b => {
          if (b.category === 'study' && !b.completed) {
            return { ...b, title: `⚡ [Project Sprint] ${state.currentMission?.title || 'Core Deliverable'}` };
          }
          return b;
        });
        break;

      case 'reset-walk':
      case 'insert-nap':
        window.showToast?.('🌿 20-minute rest block inserted. Screen paused.');
        break;

      case 'micro-action-deconstruct':
        if (window.openObstacleSolver) {
          window.openObstacleSolver(state.currentMission?.title || 'Active Task');
        }
        break;

      default:
        if (window.AIScheduleEngine?.rebalanceAfterOverrun) {
          updatedSchedule = window.AIScheduleEngine.rebalanceAfterOverrun(updatedSchedule, 30);
        }
        break;
    }

    // Dismiss alert and update schedule
    window.appState.update(s => ({
      ...s,
      todaySchedule: updatedSchedule,
      activeRealityAlert: { ...s.activeRealityAlert, active: false }
    }));

    if (window.zenithExperience?.triggerConfetti) window.zenithExperience.triggerConfetti();
    if (window.audioFlowOS) window.audioFlowOS.playFanfare();
    window.showToast?.(`✨ Adaptation applied: "${opt.title}". Live schedule rebalanced!`);
  }

  static dismissAlert() {
    window.appState.update(s => ({
      ...s,
      activeRealityAlert: { ...s.activeRealityAlert, active: false }
    }));
    window.showToast?.('Alert ignored. Schedule unchanged.');
  }

  static modifyAlert() {
    // Open What-If Simulator or Plan schedule
    if (window.openScenarioSimulator) {
      window.openScenarioSimulator('spend-extra-hours-coding');
    } else {
      const planTab = document.querySelector('[data-tab="plan"]') || document.querySelector('[data-tab="adapt"]');
      if (planTab) planTab.click();
    }
  }
}

window.RealityEventEngine = RealityEventEngine;
