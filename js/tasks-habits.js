/**
 * ZENITH AI - TASKS & HABITS BIFURCATED MANAGEMENT SYSTEM (V2)
 * Features 7-day visual consistency heatmaps, streak recovery, subtasks, and priority queues.
 */

class TasksHabitsManager {
  /* ==========================================================================
     ONE-OFF TASKS OPERATIONS
     ========================================================================== */
  static addTask(taskData) {
    const newTask = {
      id: 't_' + Date.now(),
      title: taskData.title.trim(),
      goalId: taskData.goalId || null,
      priority: taskData.priority || 'medium',
      estimatedMinutes: parseInt(taskData.estimatedMinutes, 10) || 45,
      actualMinutes: 0,
      completed: false,
      subtasks: taskData.subtasks || [],
      dueDate: taskData.dueDate || 'Today'
    };

    window.appState.update(s => ({
      ...s,
      tasks: [newTask, ...s.tasks]
    }));

    return newTask;
  }

  static toggleTask(taskId) {
    window.appState.update(s => {
      const updatedTasks = s.tasks.map(task => {
        if (task.id === taskId) {
          const next = !task.completed;
          if (next && window.audioZenith) {
            window.audioZenith.playChime();
          }
          return { ...task, completed: next };
        }
        return task;
      });
      return { ...s, tasks: updatedTasks };
    });
  }

  static deleteTask(taskId) {
    window.appState.update(s => ({
      ...s,
      tasks: s.tasks.filter(t => t.id !== taskId)
    }));
  }

  static addSubtask(taskId, subtaskTitle) {
    window.appState.update(s => ({
      ...s,
      tasks: s.tasks.map(t => {
        if (t.id === taskId) {
          const newSub = { id: 'st_' + Date.now(), title: subtaskTitle.trim(), done: false };
          return { ...t, subtasks: [...(t.subtasks || []), newSub] };
        }
        return t;
      })
    }));
  }

  static toggleSubtask(taskId, subtaskId) {
    window.appState.update(s => ({
      ...s,
      tasks: s.tasks.map(t => {
        if (t.id === taskId) {
          const updatedSub = (t.subtasks || []).map(st => st.id === subtaskId ? { ...st, done: !st.done } : st);
          return { ...t, subtasks: updatedSub };
        }
        return t;
      })
    }));
  }

  /* ==========================================================================
     RECURRING HABIT LOOPS & 7-DAY HEATMAPS
     ========================================================================== */
  static addHabit(habitData) {
    const newHabit = {
      id: 'h_' + Date.now(),
      title: habitData.title.trim(),
      frequency: habitData.frequency || 'daily',
      category: habitData.category || 'wellness',
      streak: 1,
      bestStreak: 1,
      graceDaysLeft: 2,
      completedToday: false,
      badge: '🌱 Habit Pioneer',
      history: [new Date().toISOString().split('T')[0]]
    };

    window.appState.update(s => ({
      ...s,
      habits: [...s.habits, newHabit]
    }));

    return newHabit;
  }

  static toggleHabitToday(habitId) {
    const todayStr = new Date().toISOString().split('T')[0];

    window.appState.update(s => {
      const updatedHabits = s.habits.map(habit => {
        if (habit.id === habitId) {
          const wasCompleted = habit.completedToday;
          const nextCompleted = !wasCompleted;

          let newStreak = habit.streak;
          let newHistory = [...(habit.history || [])];

          if (nextCompleted) {
            if (!newHistory.includes(todayStr)) {
              newHistory.push(todayStr);
            }
            if (newStreak === 7 || newStreak === 14 || newStreak === 21) {
              if (window.audioZenith) window.audioZenith.playFanfare();
            } else {
              if (window.audioZenith) window.audioZenith.playChime();
            }
          } else {
            newHistory = newHistory.filter(d => d !== todayStr);
            newStreak = Math.max(0, newStreak - 1);
          }

          const newBest = Math.max(newStreak, habit.bestStreak || 0);

          let badge = habit.badge;
          if (newStreak >= 21) badge = '👑 Diamond Consistency';
          else if (newStreak >= 14) badge = '🔥 2-Week Unbreakable';
          else if (newStreak >= 7) badge = '⚡ 7-Day Momentum';

          return {
            ...habit,
            completedToday: nextCompleted,
            streak: newStreak,
            bestStreak: newBest,
            badge,
            history: newHistory
          };
        }
        return habit;
      });

      return { ...s, habits: updatedHabits };
    });
  }

  static applyGraceRecovery(habitId) {
    window.appState.update(s => {
      const updatedHabits = s.habits.map(habit => {
        if (habit.id === habitId) {
          if (habit.graceDaysLeft > 0) {
            return {
              ...habit,
              graceDaysLeft: habit.graceDaysLeft - 1,
              completedToday: true,
              streak: habit.streak + 1
            };
          }
        }
        return habit;
      });
      return { ...s, habits: updatedHabits };
    });
  }

  /**
   * Generates the past 7 days date strings for the heatmap
   */
  static getPast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }
}

window.TasksHabitsManager = TasksHabitsManager;
