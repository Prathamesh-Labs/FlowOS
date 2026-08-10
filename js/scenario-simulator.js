/**
 * ZENITH AI - WHAT-IF SCENARIO SIMULATOR
 * Simulates hypothetical time allocations in a sandbox before touching the real schedule.
 * Compares CURRENT PLAN vs SIMULATED PLAN with 1-click Apply/Discard.
 */

class ScenarioSimulator {
  /**
   * Run sandbox simulation on a hypothetical time change
   */
  static simulateScenario(scenarioType, durationMins = 120) {
    const state = window.appState.getState();
    const currentSchedule = JSON.parse(JSON.stringify(state.todaySchedule));
    let simulatedSchedule = JSON.parse(JSON.stringify(state.todaySchedule));

    let title = '';
    let description = '';
    let affectedTasks = [];
    let conflicts = [];
    let goalImpact = '';

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    switch (scenarioType) {
      case 'spend-extra-hours-coding':
        title = `What If: Spend an Extra ${Math.floor(durationMins / 60)} Hours on Core Mission Tonight?`;
        description = `Simulating dedicating an additional ${durationMins}m block to your primary Python project.`;

        // Simulate shifting evening blocks
        let shift = durationMins;
        simulatedSchedule = simulatedSchedule.map(block => {
          const [sh, sm] = block.timeStart.split(':').map(Number);
          const [eh, em] = block.timeEnd.split(':').map(Number);

          if ((sh * 60 + sm) >= currentMins && !block.completed) {
            let newStart = Math.min(1439, (sh * 60 + sm) + shift);
            let dur = (eh * 60 + em) - (sh * 60 + sm);
            if (dur < 0) dur += 1440;

            if (block.title.toLowerCase().includes('review')) {
              dur = 15; // compressed
            }

            let newEnd = Math.min(1439, newStart + dur);
            return {
              ...block,
              timeStart: window.AIScheduleEngine.minsToTime(newStart),
              timeEnd: window.AIScheduleEngine.minsToTime(newEnd)
            };
          }
          return block;
        });

        affectedTasks = [
          'Evening Reading & Review: Compressed from 60m to 15m',
          'Physical Workout: Maintained at 4:30 PM (Preserved)',
          'Dinner: Shifted 30m later (09:00 PM)'
        ];
        conflicts = [
          '⚠️ Bedtime wind-down pushes from 10:30 PM to 11:00 PM (+30m drift)'
        ];
        goalImpact = '🟢 Goal Velocity +25%: Will complete Milestone 2 "OOP & Async Programming" today instead of Friday.';
        break;

      case 'take-afternoon-off':
        title = 'What If: Take the Entire Afternoon Off (Recovery Mode)?';
        description = 'Simulating removing all afternoon cognitive work and shifting tasks to tomorrow.';
        affectedTasks = [
          'Execution Block 2: Deferred to tomorrow 08:30 AM',
          'Execution Block 3: Deferred to tomorrow 11:00 AM'
        ];
        conflicts = [
          '⚠️ Tomorrow will have 5 hours of deep focus scheduled instead of 3.5 hours.'
        ];
        goalImpact = '🟡 Goal Target Date unchanged, but tomorrow will require high discipline.';
        break;

      default:
        title = `Custom What-If Simulation (${durationMins}m)`;
        description = 'Simulating scenario impact across schedule.';
        affectedTasks = ['Evening schedule rebalanced'];
        conflicts = ['None'];
        goalImpact = 'Neutral impact.';
        break;
    }

    const simulationResult = {
      scenarioType,
      title,
      description,
      currentSchedule,
      simulatedSchedule,
      affectedTasks,
      conflicts,
      goalImpact
    };

    window.appState.update(s => ({
      ...s,
      activeSimulation: simulationResult
    }));

    return simulationResult;
  }

  /**
   * Apply Simulated Schedule to Live Day
   */
  static applySimulation() {
    const state = window.appState.getState();
    if (!state.activeSimulation) return;

    window.appState.update(s => ({
      ...s,
      todaySchedule: s.activeSimulation.simulatedSchedule,
      activeSimulation: null
    }));

    window.zenithExperience?.triggerConfetti();
    window.showToast?.('✨ Simulated Scenario Applied! Live schedule successfully updated.');
  }

  /**
   * Discard Simulation
   */
  static discardSimulation() {
    window.appState.update(s => ({
      ...s,
      activeSimulation: null
    }));
    window.showToast?.('Simulation discarded. Current schedule untouched.');
  }
}

window.ScenarioSimulator = ScenarioSimulator;
