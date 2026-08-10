/**
 * ZENITH AI - INTELLIGENT ROUTINE & SCHEDULE SYNTHESIS ENGINE (V2)
 * Synthesizes dynamic 24h schedules pulling directly from active Goals, Tasks & Habits,
 * and executes smart Overrun Schedule Rebalancing.
 */

const AIArchetypes = {
  student: {
    name: 'Academic Scholar & Student',
    focusBlockLength: 90,
    breakLength: 20,
    dailyStudyTarget: 6,
    preferredWorkoutTime: 'late-afternoon',
    description: 'Optimized for high information retention, spaced active recall, and screen-eye relief.'
  },
  professional: {
    name: 'Employee & Working Professional',
    focusBlockLength: 75,
    breakLength: 15,
    dailyStudyTarget: 4,
    preferredWorkoutTime: 'morning',
    description: 'Structured around core work sprints, meeting energy preservation, and clear boundary shutdown.'
  },
  developer: {
    name: 'Software Dev & Desk Engineer',
    focusBlockLength: 120,
    breakLength: 25,
    dailyStudyTarget: 6,
    preferredWorkoutTime: 'evening',
    description: 'Large uninterrupted architecture flow blocks paired with strict 20-20-20 screen relief.'
  },
  examprep: {
    name: 'Intense Exam / Test Sprint',
    focusBlockLength: 110,
    breakLength: 15,
    dailyStudyTarget: 8,
    preferredWorkoutTime: 'morning',
    description: 'Peak cognitive throughput with scheduled brain nutrition and active recall slots.'
  },
  elderly: {
    name: 'Older Adult & Gentle Vitality',
    focusBlockLength: 45,
    breakLength: 30,
    dailyStudyTarget: 2,
    preferredWorkoutTime: 'mid-morning',
    description: 'Gentle routine with medicine schedules, joint mobility, outdoor sunlight, and calm pacing.'
  }
};

class AIScheduleEngine {
  static timeToMins(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  static minsToTime(mins) {
    const norm = (mins + 1440) % 1440;
    const h = Math.floor(norm / 60);
    const m = norm % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /**
   * Main Generator: Synthesizes a fresh tailored daily schedule
   */
  static generateSchedule(params) {
    const state = window.appState ? window.appState.getState() : {};
    const {
      wakeTime = '07:00',
      bedTime = '23:00',
      archetype = 'student',
      studyHours = 6,
      dietGoal = 'clean-energy'
    } = params;

    const wakeMins = this.timeToMins(wakeTime);
    const bedMins = this.timeToMins(bedTime);

    const pendingTasks = (state.tasks || []).filter(t => !t.completed);
    const topTask1 = pendingTasks[0]?.title || 'Core Priority Execution';
    const topTask2 = pendingTasks[1]?.title || 'Active Synthesis & Review';

    const schedule = [];
    let cur = wakeMins;

    // 1. Morning Routine & Sun Hydration
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + 30),
      category: 'movement',
      title: 'Morning Sun & Cellular Hydration',
      desc: 'Drink 500ml water with pinch of sea salt, get 10m natural outdoor sunlight for circadian alignment.',
      completed: false
    });
    cur += 30;

    // 2. High-Protein Breakfast
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + 45),
      category: 'diet',
      title: 'High-Protein Clean Fuel Breakfast',
      desc: 'Oatmeal with chia seeds, berries, boiled eggs or tofu scramble with green tea.',
      completed: false
    });
    cur += 45;

    // 3. Morning Deep Focus Block 1 (Associated with Top Task)
    const block1Len = Math.min(120, Math.max(60, Math.round(studyHours * 60 * 0.4)));
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + block1Len),
      category: 'study',
      title: `Deep Work Block 1: ${topTask1}`,
      desc: 'Peak cognition period. Zero distractions, silence notifications.',
      completed: false
    });
    cur += block1Len;

    // 4. Screen Break & Eye Recharge
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + 20),
      category: 'screen',
      title: 'Screen Detox & 20-20-20 Eye Relief',
      desc: 'Step away from screen. Gaze at 20ft horizon, neck rolls, hydrate.',
      completed: false
    });
    cur += 20;

    // 5. Active Recall / Task Execution Block 2
    const block2Len = Math.min(100, Math.max(60, Math.round(studyHours * 60 * 0.35)));
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + block2Len),
      category: 'study',
      title: `Execution Block 2: ${topTask2}`,
      desc: 'Active problem solving, review, or project development.',
      completed: false
    });
    cur += block2Len;

    // 6. Wholesome Lunch & Rest
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + 60),
      category: 'diet',
      title: 'Energizing Brain-Fuel Lunch (Offline)',
      desc: 'Balanced complex carbs, dark leafy greens, quality lean protein.',
      completed: false
    });
    cur += 60;

    // 7. Post-Lunch Digestive Walk
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + 25),
      category: 'movement',
      title: 'Post-Meal Digestive Walk',
      desc: '15-20 min light walk to flatten glucose spike and eliminate afternoon fatigue.',
      completed: false
    });
    cur += 25;

    // 8. Afternoon Work / Study Block 3
    const block3Len = Math.min(90, Math.max(45, Math.round(studyHours * 60 * 0.25)));
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + block3Len),
      category: 'study',
      title: 'Work / Study Block 3: Secondary Action Items',
      desc: 'Communication, minor task resolution, or reading.',
      completed: false
    });
    cur += block3Len;

    // 9. Physical Training / Workout
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + 50),
      category: 'movement',
      title: 'Physical Workout / Cardio / Strength',
      desc: 'Cardiovascular exercise, gym, or vigorous mobility session.',
      completed: false
    });
    cur += 50;

    // 10. Evening Snack & Hydration
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + 30),
      category: 'diet',
      title: 'Smart Snack & Hydration Check',
      desc: 'Walnuts, pumpkin seeds, herbal tea or protein fuel.',
      completed: false
    });
    cur += 30;

    // 11. Evening Light Review / Reading
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + 60),
      category: 'study',
      title: 'Evening Synthesis & Next-Day Planning',
      desc: 'Organize study desk, close open tabs, write top 3 priorities.',
      completed: false
    });
    cur += 60;

    // 12. Light Dinner
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: this.minsToTime(cur),
      timeEnd: this.minsToTime(cur + 45),
      category: 'diet',
      title: 'Light Wholesome Dinner',
      desc: 'Warm soup, steamed vegetables, light protein. Easily digestible.',
      completed: false
    });
    cur += 45;

    // 13. Digital Sunset
    const windDownStart = this.minsToTime(Math.max(cur, bedMins - 60));
    schedule.push({
      id: 'gen_' + Math.random().toString(36).substr(2, 9),
      timeStart: windDownStart,
      timeEnd: bedTime,
      category: 'rest',
      title: 'Digital Sunset & Blue Light Lockout',
      desc: 'Turn off all screens. Read physical book, practice 4-7-8 breathing.',
      completed: false
    });

    return schedule;
  }

  /**
   * PROACTIVE OVERRUN REBALANCER:
   * When a focus session overruns (e.g. planned 1h, actual 4h 52m),
   * intelligently shrinks low-priority afternoon blocks to protect sleep and meals.
   */
  static rebalanceAfterOverrun(currentSchedule, overrunMinutes) {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let updated = JSON.parse(JSON.stringify(currentSchedule));

    // Shift all remaining uncompleted blocks
    let shiftAmount = overrunMinutes;

    updated = updated.map(block => {
      const startM = this.timeToMins(block.timeStart);
      const endM = this.timeToMins(block.timeEnd);

      // Only shift future blocks that are not completed
      if (startM >= currentMins && !block.completed) {
        let newStart = Math.min(1439, startM + shiftAmount);
        let duration = endM - startM;
        if (duration < 0) duration += 1440;

        // Condense study block if day is compressed
        if (block.category === 'study' && shiftAmount > 45) {
          duration = Math.max(30, duration - 30);
        }

        let newEnd = Math.min(1439, newStart + duration);

        return {
          ...block,
          timeStart: this.minsToTime(newStart),
          timeEnd: this.minsToTime(newEnd),
          title: `[Rebalanced] ${block.title}`
        };
      }
      return block;
    });

    return updated;
  }

  static adaptSchedule(currentSchedule, reason) {
    let updated = JSON.parse(JSON.stringify(currentSchedule));

    switch (reason) {
      case 'woke-late':
        updated = updated.map(block => {
          let startM = this.timeToMins(block.timeStart);
          let endM = this.timeToMins(block.timeEnd);
          let dur = endM - startM;
          if (dur < 0) dur += 1440;
          let newStart = Math.min(1439, startM + 120);
          let newEnd = Math.min(1439, newStart + dur);
          return {
            ...block,
            timeStart: this.minsToTime(newStart),
            timeEnd: this.minsToTime(newEnd)
          };
        });
        break;

      case 'exam-cram':
        updated = updated.map(block => {
          if (block.category === 'study') {
            return { ...block, title: '[⚡ INTENSIVE] ' + block.title };
          }
          return block;
        });
        break;

      case 'low-energy':
        updated = updated.map(block => {
          if (block.category === 'study') {
            return {
              ...block,
              title: '[GENTLE] ' + block.title,
              desc: 'Low-friction reading or passive video review without stress.'
            };
          }
          return block;
        });
        break;

      case 'screen-detox':
        updated = updated.map(block => {
          if (block.category === 'screen') {
            return {
              ...block,
              title: '[EXTENDED] Nature & Offline Break',
              desc: 'Double break time. Go outdoors, hydrate, zero phone check.'
            };
          }
          return block;
        });
        break;
    }

    return updated;
  }
}

window.AIScheduleEngine = AIScheduleEngine;
