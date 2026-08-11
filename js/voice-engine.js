/**
 * ZENITH AI - VOICE COMMAND & SPEECH ASSISTANT ENGINE
 * Natural speech-to-action interpretation powered by Web Speech API.
 */

class ZenithVoiceEngine {
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
            ? '⚠️ Microphone access denied.' 
            : '⚠️ Voice error. Tap mic to try again.';
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

    // Keyboard shortcut: Alt + V or Space + V when not typing
    window.addEventListener('keydown', (e) => {
      if ((e.altKey && e.key.toLowerCase() === 'v')) {
        e.preventDefault();
        this.openAssistant();
      }
    });
  }

  openAssistant() {
    if (!this.hasSupport) {
      window.showToast?.('⚠️ Voice commands not supported in this browser.');
      return;
    }
    if (this.modalEl) {
      this.modalEl.classList.add('open');
      if (this.transcriptEl) this.transcriptEl.textContent = 'Listening... Speak your command';
      if (this.statusTextEl) this.statusTextEl.textContent = 'Say "Log 2 glasses of water" or "Start 25m focus"';
      this.start();
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
    const text = rawText.toLowerCase().trim();
    let actionTaken = false;
    let feedback = '';

    // 1. Water / Hydration Intent
    if (text.includes('water') || text.includes('drink') || text.includes('hydrat')) {
      const match = text.match(/\d+/);
      const count = match ? parseInt(match[0], 10) : 1;
      
      window.appState.update(s => ({
        ...s,
        waterGlasses: Math.min(s.waterGoal, s.waterGlasses + count)
      }));

      if (window.audioZenith) window.audioZenith.playWaterDrop();
      feedback = `Logged ${count} glass${count > 1 ? 'es' : ''} of water!`;
      actionTaken = true;
    }

    // 2. Focus Timer Intent ("Start 25 min focus", "Start timer", "Pause timer", "Reset timer")
    else if (text.includes('timer') || text.includes('focus') || text.includes('pomodoro') || text.includes('study')) {
      if (text.includes('pause') || text.includes('stop')) {
        window.focusEngine?.pause();
        feedback = 'Focus timer paused.';
        actionTaken = true;
      } else if (text.includes('reset')) {
        window.focusEngine?.reset();
        feedback = 'Focus timer reset.';
        actionTaken = true;
      } else {
        // Start or set timer
        window.focusEngine?.start();
        feedback = 'Deep flow timer started!';
        actionTaken = true;
      }
    }

    // 3. Complete Habits Intent ("Mark morning sunlight done", "Complete workout", "Read 10 pages done")
    else if (text.includes('habit') || text.includes('done') || text.includes('complete') || text.includes('finish')) {
      const state = window.appState.getState();
      const habit = state.habits.find(h => text.includes(h.title.toLowerCase().split(' ')[0]));
      
      if (habit) {
        window.TasksAndHabitsController?.toggleHabitToday(habit.id);
        feedback = `Marked "${habit.title}" as completed!`;
        actionTaken = true;
      } else {
        // Complete the first uncompleted habit
        const uncompleted = state.habits.find(h => !h.completedToday);
        if (uncompleted) {
          window.TasksAndHabitsController?.toggleHabitToday(uncompleted.id);
          feedback = `Marked "${uncompleted.title}" as completed!`;
          actionTaken = true;
        }
      }
    }

    // 4. Soundscape Intent ("Play rain", "Play campfire", "Play ocean", "Play binaural", "Stop music")
    else if (text.includes('sound') || text.includes('music') || text.includes('rain') || text.includes('campfire') || text.includes('ocean') || text.includes('alpha')) {
      if (text.includes('stop') || text.includes('mute') || text.includes('off')) {
        window.audioZenith?.stopAll();
        feedback = 'Ambient audio stopped.';
        actionTaken = true;
      } else {
        let mode = 'rain';
        if (text.includes('campfire')) mode = 'campfire';
        else if (text.includes('ocean')) mode = 'ocean';
        else if (text.includes('alpha') || text.includes('binaural')) mode = 'binaural';
        else if (text.includes('forest')) mode = 'forest';
        else if (text.includes('gamma')) mode = 'gamma';

        window.audioZenith?.playSound(mode);
        feedback = `Playing ${mode} soundscape.`;
        actionTaken = true;
      }
    }

    // 5. Reality Disruption ("I have a headache", "I feel sick", "feeling exhausted")
    else if (text.includes('headache') || text.includes('exhaust') || text.includes('tired') || text.includes('sick') || text.includes('meeting')) {
      window.RealityEventsController?.triggerRandomEvent();
      feedback = 'Reality event detected! Adaptive schedule rebalancing triggered.';
      actionTaken = true;
    }

    // 6. Navigation Intent ("Go to study", "Open diet", "Show analytics")
    else if (text.includes('go to') || text.includes('open') || text.includes('show')) {
      let tab = 'dashboard';
      if (text.includes('study') || text.includes('focus')) tab = 'study';
      else if (text.includes('diet') || text.includes('food') || text.includes('nutrition')) tab = 'diet';
      else if (text.includes('habit') || text.includes('task')) tab = 'tasks';
      else if (text.includes('analytic') || text.includes('chart')) tab = 'analytics';
      else if (text.includes('scenario') || text.includes('simulat')) tab = 'simulator';
      
      const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
      if (navItem) {
        navItem.click();
        feedback = `Navigated to ${tab} tab.`;
        actionTaken = true;
      }
    }

    if (!actionTaken) {
      feedback = `Heard: "${rawText}". Try asking to log water, start timer, or complete habits.`;
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

window.voiceEngine = new ZenithVoiceEngine();
