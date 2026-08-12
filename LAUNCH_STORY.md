# 🚀 FlowOS — Product Story & Architecture Overview

Use this document when presenting **FlowOS** on GitHub, portfolios, and product showcases.

---

## 📌 1. The Core Product Thesis

Traditional planners and habit trackers fail because of the **Reality Divergence Gap**:
- You plan your day with good intentions.
- Then reality happens: a deep coding session overruns by 45 minutes, an unexpected meeting appears, or fatigue sets in.
- Static checklists break down, leading to abandoned plans and guilt.

**FlowOS** is designed around a single adaptive loop:

**GOAL ➔ PLAN ➔ EXECUTE ➔ OBSERVE REALITY ➔ DETECT DEVIATION ➔ REASON ➔ ADAPT ➔ LEARN**

Complexity lives inside FlowOS. The user experiences calm clarity.

---

## 🧭 2. The Five-Layer UX Hierarchy

1. **NOW (Command Center)**:
   Answers "What should I be doing right now?". Displays current mission, active timer, next event, single primary **Day Balance** indicator, active reality alert, and quick actions.

2. **PLAN**:
   Unified pipeline from high-level Goals and Milestones down to bifurcated Tasks & Habits, 24-Hour Day-Forge timeline, and Calendar commitments.

3. **ADAPT**:
   Central reality and adaptation system with structured decision cycles: What Changed ➔ Impact ➔ Recommendation ([Apply], [Modify], [Ignore]) and safe What-If simulations.

4. **UNDERSTAND**:
   365-Day Activity Heatmap linked to Day Replay timeline, Analytics, and the **Personal Flow Profile** (empirical planning patterns tagged as `OBSERVED`, `INFERRED`, or `USER-PROVIDED`).

5. **WELLNESS & CONTROL**:
   Integrated Wellness Suite (Hydration, Nutrition, Screen Guardian 20-20-20), Focus Room with Picture-in-Picture & Procedural Soundscapes, Motivation Quests, Accessibility & Care Mode, and zero-server Device Sync.

---

## 🛠️ 3. Architecture & Tech Stack

- **Core**: Vanilla ES6+ Modular Engine Architecture (29 specialized modules)
- **Styling**: Vanilla CSS with Design Tokens & Modern Dark Mode Glassmorphism
- **Audio Engine**: Pure Web Audio API procedural synthesis (Alpha binaural beats, Gamma, Rain, Ocean waves)
- **Data & Portability**: Centralized Reactive State Manager with LocalStorage persistence, iCal (.ics) export, and offline JSON backup/restore
- **Offline & PWA**: Service Worker caching, installable PWA manifest
