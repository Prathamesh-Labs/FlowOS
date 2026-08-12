/**
 * FLOWOS - CALENDAR & DATA PORTABILITY (V2.0)
 * Full iCalendar (.ics) export/import, JSON backup/restore, and formatted Blueprint generator.
 */

class CalendarExporter {
  /**
   * Export to standard iCalendar .ics format
   */
  static exportToICS(schedule) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FlowOS//Day and Goal OS//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    (schedule || []).forEach((item, idx) => {
      const [sh, sm] = (item.timeStart || '00:00').split(':');
      const [eh, em] = (item.timeEnd || '00:00').split(':');
      const dtStart = `${datePrefix}T${sh}${sm}00`;
      const dtEnd = `${datePrefix}T${eh}${em}00`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:flowos_${Date.now()}_${idx}@flowos.local`,
        `DTSTAMP:${datePrefix}T000000Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:[FlowOS] ${item.title || 'Schedule Block'}`,
        `DESCRIPTION:${(item.desc || '').replace(/\n/g, '\\n')}`,
        `CATEGORIES:${(item.category || 'GENERAL').toUpperCase()}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlowOS_DayPlan_${datePrefix}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export Full JSON Backup of Goals, Tasks, Habits, State
   */
  static exportJSONBackup(state) {
    const backupData = JSON.stringify(state, null, 2);
    const blob = new Blob([backupData], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlowOS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import JSON Backup and Restore State
   */
  static importJSONBackup(file, onSuccess, onError) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && (parsed.todaySchedule || parsed.tasks || parsed.habits)) {
          window.appState.update(() => parsed);
          if (onSuccess) onSuccess();
        } else {
          if (onError) onError('Invalid backup format');
        }
      } catch (err) {
        if (onError) onError('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  }

  /**
   * Export Text Blueprint
   */
  static exportTextSummary(schedule) {
    let text = `======================================================\nFLOWOS — DAILY BLUEPRINT & EXECUTION PLAN\n======================================================\nGenerated: ${new Date().toLocaleString()}\n\n`;
    (schedule || []).forEach(item => {
      const check = item.completed ? '[COMPLETED]' : '[PENDING]  ';
      text += `${check} ${item.timeStart} - ${item.timeEnd} | [${(item.category || 'GENERAL').toUpperCase()}]\n`;
      text += `           Title: ${item.title}\n`;
      text += `           Details: ${item.desc || ''}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlowOS_Daily_Blueprint.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

window.CalendarExporter = CalendarExporter;
