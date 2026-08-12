/**
 * FLOWOS - VOICE COMMAND & ACTION ENGINE (V2.0)
 * Structured action interface converting speech or text commands into concrete system actions.
 * Fast one-step execution for low-risk actions; confirmation dialog for major schedule alterations.
 */

class FlowOSVoiceEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.hasSupport = ('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window);
    this.voiceFeedback = true;
    this.modalEl = null;
    this.statusTextEl = null;
    this.transcriptEl = null;
  }

  init() {
    if (this.hasSupport) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateModalListening(true);
      };

      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        if (this.transcriptEl) {
          this.transcriptEl.textContent = `"${transcript}"`;
        }

        if (event.results[0].isFinal) {
          this.processCommand(transcript);
        }
      };

      this.recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        this.isListening = false;
        this.updateModalListening(false);
        if (this.statusTextEl) {
          this.statusTextEl.textContent = e.error === 'not-allowed' 
            ? '⚠️ Microphone access denied. You can type commands below.' 
            : '⚠️ Tap microphone or use text command box below.';
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateModalListening(false);
      };
    }

    this.bindUI();
  }

  bindUI() {
    this.modalEl = document.getElementById('voice-assistant-modal');
    this.statusTextEl = document.getElementById('voice-status-text');
    this.transcriptEl = document.getElementById('voice-transcript-text');

    const triggerBtn = document.getElementById('btn-header-voice-mic');
    const closeBtn = document.getElementById('btn-close-voice-modal');
    const modalMicBtn = document.getElementById('voice-modal-mic-btn');
    const textCommandForm = document.getElementById('voice-text-command-form');
    const textCommandInput = document.getElementById('voice-text-command-input');

    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => this.openAssistant());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeAssistant());
    }

    if (modalMicBtn) {
      modalMicBtn.addEventListener('click', () => {
        if (this.isListening) {
          this.stop();
        } else {
          this.start();
        }
      });
    }

    if (textCommandForm && textCommandInput) {
      textCommandForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cmd = textCommandInput.value.trim();
        if (cmd) {
          this.processCommand(cmd);
          textCommandInput.value = '';
        }
      });
    }

    // Keyboard shortcut: Alt + V
    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        this.openAssistant();
      }
    });
  }

  openAssistant() {
    if (this.modalEl) {
      this.modalEl.classList.add('open');
      if (this.transcriptEl) this.transcriptEl.textContent = this.hasSupport ? 'Listening... Speak your command' : 'Type a command below';
      if (this.statusTextEl) this.statusTextEl.textContent = 'Examples: "Start 45m of Python", "Log 2 glasses of water", "My task took longer", "Rebalance evening"';
      if (this.hasSupport) {
        this.start();
      }
    }
  }

  closeAssistant() {
    this.stop();
    if (this.modalEl) this.modalEl.classList.remove('open');
  }

  start() {
    if (!this.recognition || this.isListening) return;
    try {
      this.recognition.start();
    } catch (e) {}
  }

  stop() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
    } catch (e) {}
  }

  updateModalListening(listening) {
    const pulseRing = document.getElementById('voice-pulse-ring');
    const micIcon = document.getElementById('voice-modal-mic-icon');
    if (pulseRing) pulseRing.classList.toggle('active', listening);
    if (micIcon) {
      micIcon.style.color = listening ? '#34d399' : 'var(--accent-study-light)';
    }
  }

  speakResponse(text) {
    if (!this.voiceFeedback || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  /**
   * Natural Language Intent Resolution
   */
  processCommand(rawText) {
    const text = (rawText || '').toLowerCase().trim();
    let actionTaken = false;
    let feedback = '';

    // 1. Water / Hydration Intent ("Log two glasses of water", "Drank 500ml water")
    if (text.includes('water') || text.includes('drink') || text.includes('hydrat')) {
      const match = text.match(/\d+/);
      let count = 1;
      if (match) count = parseInt(match[0], 10);
      else if (text.includes('two')) count = 2;
      else if (text.includes('three')) count = 3;
      else if (text.includes('four')) count = 4;
      
      window.appState.update(s => ({
        ...s,
        waterGlasses: Math.min(s.waterGoal || 8, (s.waterGlasses || 0) + count)
      }));

      if (window.audioFlowOS) window.audioFlowOS.playWaterDrop();
      feedback = `Logged ${count} glass${count > 1 ? 'es' : ''} of water!`;
      actionTaken = true;
    }

    // 2. Focus Timer Intent ("Start 45 minutes of Python", "Start focus timer", "Pause timer")
    else if (text.includes('timer') || text.includes('focus') || text.includes('pomodoro') || text.includes('study') || text.includes('sprint')) {
      if (text.includes('pause') || text.includes('stop')) {
        window.focusEngine?.pause();
        feedback = 'Focus timer paused.';
        actionTaken = true;
      } else if (text.includes('reset')) {
        window.focusEngine?.reset();
        feedback = 'Focus timer reset.';
        actionTaken = true;
      } else {
        const match = text.match(/\d+/);
        let mins = 45;
        if (match) mins = parseInt(match[0], 10);
        else if (text.includes('hour')) mins = 60;
        else if (text.includes('25')) mins = 25;

        window.appState.update(s => ({
          ...s,
          activeFocus: {
            ...s.activeFocus,
            plannedSeconds: mins * 60,
            elapsedSeconds: 0,
            status: 'running'
          }
        }));

        window.focusEngine?.start();
        feedback = `Started ${mins}-minute focus sprint!`;
        actionTaken = true;
      }
    }

    // 3. Complete Habits Intent ("Mark workout complete", "Morning sunlight done", "Read 10 pages done")
    else if (text.includes('habit') || text.includes('done') || text.includes('complete') || text.includes('finish workout') || text.includes('mark')) {
      const state = window.appState.getState();
      const habit = (state.habits || []).find(h => text.includes(h.title.toLowerCase().split(' ')[0]));
      
      if (habit) {
        window.TasksAndHabitsController?.toggleHabitToday(habit.id);
        feedback = `Marked "${habit.title}" as completed!`;
        actionTaken = true;
      } else {
        const uncompleted = (state.habits || []).find(h => !h.completedToday);
        if (uncompleted) {
          window.TasksAndHabitsController?.toggleHabitToday(uncompleted.id);
          feedback = `Marked "${uncompleted.title}" as completed!`;
          actionTaken = true;
        }
      }
    }

    // 4. Reality Events Intent ("Task took longer", "Unexpected meeting", "Woke up late", "Rebalance evening")
    else if (text.includes('took longer') || text.includes('overran') || text.includes('overrun')) {
      const match = text.match(/\d+/);
      const mins = match ? parseInt(match[0], 10) : 35;
      window.RealityEventEngine?.triggerEvent('task-overrun', { overrunMinutes: mins });
      feedback = `Triggered +${mins}m overrun recalculation.`;
      actionTaken = true;
    }
    else if (text.includes('meeting') || text.includes('call')) {
      window.RealityEventEngine?.triggerEvent('unexpected-meeting');
      feedback = 'Unexpected meeting detected! Schedule rebalancing ready.';
      actionTaken = true;
    }
    else if (text.includes('woke up late') || text.includes('late wake')) {
      window.RealityEventEngine?.triggerEvent('woke-late');
      feedback = 'Late wake-up logged. Adaptation calculated.';
      actionTaken = true;
    }
    else if (text.includes('rebalance') || text.includes('adapt schedule') || text.includes('fix day')) {
      window.RealityEventEngine?.triggerEvent('task-overrun', { overrunMinutes: 30 });
      feedback = 'Calculated optimal schedule rebalancing.';
      actionTaken = true;
    }

    // 5. Soundscape Intent ("Play rain", "Play ambient", "Play ocean", "Stop sound")
    else if (text.includes('sound') || text.includes('music') || text.includes('rain') || text.includes('ocean') || text.includes('alpha') || text.includes('ambient')) {
      if (text.includes('stop') || text.includes('mute') || text.includes('off')) {
        window.audioFlowOS?.stopAll();
        feedback = 'Focus soundscapes stopped.';
        actionTaken = true;
      } else {
        let mode = 'rain';
        if (text.includes('ocean')) mode = 'ocean';
        else if (text.includes('alpha') || text.includes('binaural')) mode = 'binaural';
        else if (text.includes('ambient') || text.includes('forest')) mode = 'forest';
        else if (text.includes('gamma')) mode = 'gamma';

        window.audioFlowOS?.playSound(mode);
        feedback = `Playing ${mode} focus soundscape.`;
        actionTaken = true;
      }
    }

    // 6. Navigation Intent ("Go to plan", "Go to understand", "Go to wellness", "Show analytics")
    else if (text.includes('go to') || text.includes('open') || text.includes('show')) {
      let tab = 'today';
      if (text.includes('plan') || text.includes('goal') || text.includes('task')) tab = 'plan';
      else if (text.includes('adapt') || text.includes('reality')) tab = 'adapt';
      else if (text.includes('understand') || text.includes('analytic') || text.includes('replay') || text.includes('heatmap')) tab = 'understand';
      else if (text.includes('wellness') || text.includes('diet') || text.includes('screen')) tab = 'wellness';
      else if (text.includes('study') || text.includes('focus')) tab = 'study';
      
      const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`) || document.querySelector(`[data-tab="${tab}"]`);
      if (navItem) {
        navItem.click();
        feedback = `Navigated to ${tab.toUpperCase()}.`;
        actionTaken = true;
      }
    }

    if (!actionTaken) {
      feedback = `Heard: "${rawText}". Try "Start 45m focus", "Log 2 glasses of water", or "Rebalance evening".`;
    }

    if (this.statusTextEl) {
      this.statusTextEl.innerHTML = `<span style="color: var(--accent-study-light); font-weight: 600;">✓ ${feedback}</span>`;
    }

    window.showToast?.(`🎙️ ${feedback}`);
    this.speakResponse(feedback);

    setTimeout(() => {
      this.closeAssistant();
    }, 2200);
  }
}

window.FlowOSVoiceEngine = FlowOSVoiceEngine;
window.ZenithVoiceEngine = FlowOSVoiceEngine; // Backward compatibility
window.voiceEngine = new FlowOSVoiceEngine();
