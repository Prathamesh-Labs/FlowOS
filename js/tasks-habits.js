/**
 * FLOWOS - TASKS & HABITS BIFURCATED MANAGEMENT SYSTEM (V2.0)
 * Features 7-day visual consistency indicators, streak recovery, subtasks, and priority queues.
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
      tasks: [newTask, ...(s.tasks || [])]
    }));

    return newTask;
  }

  static toggleTask(taskId) {
    window.appState.update(s => {
      const updatedTasks = (s.tasks || []).map(task => {
        if (task.id === taskId) {
          const next = !task.completed;
          if (next && window.audioFlowOS) {
            window.audioFlowOS.playChime();
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
      tasks: (s.tasks || []).filter(t => t.id !== taskId)
    }));
  }

  static addSubtask(taskId, subtaskTitle) {
    window.appState.update(s => ({
      ...s,
      tasks: (s.tasks || []).map(t => {
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
      tasks: (s.tasks || []).map(t => {
        if (t.id === taskId) {
          const updatedSub = (t.subtasks || []).map(st => st.id === subtaskId ? { ...st, done: !st.done } : st);
          return { ...t, subtasks: updatedSub };
        }
        return t;
      })
    }));
  }

  /* ==========================================================================
     RECURRING HABIT LOOPS & 7-DAY CONSISTENCY
     ========================================================================== */
  static getPast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }

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
      habits: [...(s.habits || []), newHabit]
    }));

    return newHabit;
  }

  static toggleHabitToday(habitId) {
    const todayStr = new Date().toISOString().split('T')[0];

    window.appState.update(s => {
      const updatedHabits = (s.habits || []).map(habit => {
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
              if (window.audioFlowOS) window.audioFlowOS.playFanfare();
            } else {
              if (window.audioFlowOS) window.audioFlowOS.playChime();
            }
            window.questsEngine?.dealDamage(50, 'Habit Strike');
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
            streak: newStreak,
            bestStreak: newBest,
            completedToday: nextCompleted,
            badge,
            history: newHistory
          };
        }
        return habit;
      });

      return { ...s, habits: updatedHabits };
    });
  }

  static deleteHabit(habitId) {
    window.appState.update(s => ({
      ...s,
      habits: (s.habits || []).filter(h => h.id !== habitId)
    }));
  }

  static recoverStreakWithGrace(habitId) {
    window.appState.update(s => ({
      ...s,
      habits: (s.habits || []).map(h => {
        if (h.id === habitId && (h.graceDaysLeft || 0) > 0) {
          if (window.audioFlowOS) window.audioFlowOS.playChime();
          return {
            ...h,
            graceDaysLeft: h.graceDaysLeft - 1,
            streak: h.streak + 1
          };
        }
        return h;
      })
    }));
  }

  static applyGraceRecovery(habitId) {
    return this.recoverStreakWithGrace(habitId);
  }
}

window.TasksHabitsManager = TasksHabitsManager;
