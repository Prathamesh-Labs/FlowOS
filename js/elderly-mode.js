/**
 * FLOWOS - ACCESSIBILITY & CARE MODE (V2.0)
 * High-contrast, large-font interface with routine schedule reminders,
 * appointment logs, gentle hydration, and mobility prompts (strictly non-medical).
 */

class ElderlyModeController {
  static toggleAccessibilityMode() {
    const currentState = window.appState.getState();
    const nextMode = !currentState.accessibilityMode;

    window.appState.update(s => ({
      ...s,
      accessibilityMode: nextMode,
      activeArchetype: nextMode ? 'elderly' : s.activeArchetype
    }));

    document.body.classList.toggle('accessibility-mode-active', nextMode);
    window.showToast?.(nextMode ? '👓 Accessibility & Care Mode Enabled' : 'Standard Interface Enabled');
  }

  static toggleMedicineTaken(medId) {
    window.appState.update(s => {
      const updated = (s.medicineReminders || []).map(med => {
        if (med.id === medId) {
          const next = !med.takenToday;
          if (next && window.audioFlowOS) window.audioFlowOS.playChime();
          return { ...med, takenToday: next };
        }
        return med;
      });
      return { ...s, medicineReminders: updated };
    });
  }

  static addMedicineReminder(medData) {
    const newMed = {
      id: 'med_' + Date.now(),
      name: medData.name.trim(),
      time: medData.time,
      instructions: medData.instructions.trim(),
      takenToday: false
    };

    window.appState.update(s => ({
      ...s,
      medicineReminders: [...(s.medicineReminders || []), newMed]
    }));
  }

  static addAppointment(aptData) {
    const newApt = {
      id: 'apt_' + Date.now(),
      title: aptData.title.trim(),
      date: aptData.date,
      time: aptData.time,
      location: aptData.location.trim()
    };

    window.appState.update(s => ({
      ...s,
      appointments: [...(s.appointments || []), newApt]
    }));
  }
}

window.ElderlyModeController = ElderlyModeController;
