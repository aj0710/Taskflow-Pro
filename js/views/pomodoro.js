/* ===================================================================
   TaskFlow Pro — Pomodoro Focus Studio & Time Tracking
   =================================================================== */

import { state } from '../state.js';
import { sounds } from '../audio.js';
import { confetti } from '../confetti.js';
import { modals } from '../modal.js';

const MODES = {
  focus: { name: 'Focus Session', duration: 25 * 60, color: 'var(--primary)' },
  shortBreak: { name: 'Short Break', duration: 5 * 60, color: 'var(--status-low)' },
  longBreak: { name: 'Long Break', duration: 15 * 60, color: 'var(--status-medium)' }
};

export class PomodoroView {
  constructor(container) {
    this.container = container;
    this.currentMode = 'focus';
    this.timeLeft = MODES[this.currentMode].duration;
    this.isRunning = false;
    this.timerInterval = null;
    this.sessionsCompleted = 0;

    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    state.on('view:changed', (view) => {
      if (view === 'pomodoro') this.render();
    });

    state.on('tasks:updated', () => {
      if (state.activeView === 'pomodoro') this.updateTaskSelector();
    });
  }

  setMode(modeKey) {
    if (!MODES[modeKey]) return;
    this.pause();
    this.currentMode = modeKey;
    this.timeLeft = MODES[modeKey].duration;
    sounds.playClick();
    this.updateDisplay();
  }

  start() {
    if (this.isRunning) return;
    sounds.playClick();
    this.isRunning = true;

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);

    this.updateControls();
    this.updateMiniHeaderWidget();
  }

  pause() {
    if (!this.isRunning) return;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.isRunning = false;
    this.updateControls();
    this.updateMiniHeaderWidget();
  }

  reset() {
    this.pause();
    this.timeLeft = MODES[this.currentMode].duration;
    this.updateDisplay();
  }

  tick() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.updateDisplay();
    } else {
      this.handleSessionComplete();
    }
  }

  handleSessionComplete() {
    this.pause();
    sounds.playTimerEnd();
    confetti.burst(window.innerWidth / 2, window.innerHeight / 2);

    if (this.currentMode === 'focus') {
      this.sessionsCompleted++;
      const activeTask = state.activePomodoroTask;

      if (activeTask) {
        const addedMinutes = Math.round(MODES.focus.duration / 60);
        state.updateTask(activeTask.id, {
          timeSpentMinutes: (activeTask.timeSpentMinutes || 0) + addedMinutes
        });
        modals.showToast(`Logged ${addedMinutes}m focus to "${activeTask.title}"! 🏆`, 'success');
      } else {
        modals.showToast(`Focus session complete! Take a well-earned break. ☕`, 'success');
      }

      // Auto advance to break
      if (this.sessionsCompleted % 4 === 0) {
        this.setMode('longBreak');
      } else {
        this.setMode('shortBreak');
      }
    } else {
      modals.showToast(`Break finished! Ready to resume deep focus? 🚀`, 'info');
      this.setMode('focus');
    }
  }

  render() {
    if (!this.container) return;

    const activeTask = state.activePomodoroTask;

    this.container.innerHTML = `
      <div class="view-toolbar">
        <div class="view-heading-group">
          <h2>Pomodoro Focus Studio</h2>
          <span class="view-subheading">Harness the Pomodoro Technique to maintain peak concentration and track work duration</span>
        </div>
      </div>

      <div class="pomodoro-wrapper">
        <div class="pomodoro-card">
          <!-- Modes Pill Bar -->
          <div class="pomodoro-modes">
            <button class="pomo-mode-btn ${this.currentMode === 'focus' ? 'active' : ''}" data-mode="focus">Deep Focus (25m)</button>
            <button class="pomo-mode-btn ${this.currentMode === 'shortBreak' ? 'active' : ''}" data-mode="shortBreak">Short Break (5m)</button>
            <button class="pomo-mode-btn ${this.currentMode === 'longBreak' ? 'active' : ''}" data-mode="longBreak">Long Break (15m)</button>
          </div>

          <!-- Circular Ring SVG Countdown -->
          <div class="timer-circle-wrap">
            <svg class="timer-svg" viewBox="0 0 280 280">
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#6366f1" />
                  <stop offset="50%" stop-color="#8b5cf6" />
                  <stop offset="100%" stop-color="#ec4899" />
                </linearGradient>
              </defs>
              <circle class="timer-circle-bg" cx="140" cy="140" r="120" />
              <circle class="timer-circle-progress" id="timer-progress-ring" cx="140" cy="140" r="120" />
            </svg>

            <div class="timer-center-text">
              <div class="timer-digits" id="timer-digits-display">25:00</div>
              <span class="timer-label" id="timer-label-display">${MODES[this.currentMode].name}</span>
            </div>
          </div>

          <!-- Play/Pause/Reset Controls -->
          <div class="pomodoro-controls">
            <button class="btn btn-secondary btn-icon" id="btn-pomo-reset" title="Reset Timer">🔄</button>
            <button class="btn btn-primary btn-pomo-main" id="btn-pomo-toggle">
              ${this.isRunning ? '⏸ Pause' : '▶ Start Focus'}
            </button>
            <button class="btn btn-secondary btn-icon" id="btn-pomo-skip" title="Skip Session">⏭</button>
          </div>

          <!-- Active Task Link Selector -->
          <div class="pomo-active-task-box">
            <div style="display:flex; flex-direction:column; gap:0.25rem; flex:1; min-width:0;">
              <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted); font-weight:700;">Target Work Item</span>
              <select id="pomo-task-select" class="form-select" style="padding:0.45rem 0.65rem; font-size:0.85rem; max-width:380px;">
                <option value="">-- No specific task linked --</option>
                ${state.tasks.filter(t => t.status !== 'done').map(t => `
                  <option value="${t.id}" ${activeTask && activeTask.id === t.id ? 'selected' : ''}>
                    [${t.category.toUpperCase()}] ${t.title}
                  </option>
                `).join('')}
              </select>
            </div>
            ${activeTask ? `
              <div style="font-size:0.75rem; text-align:right; color:var(--text-muted);">
                Logged: <strong style="color:var(--text-primary);">${activeTask.timeSpentMinutes || 0}m</strong>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Session streak & tips -->
        <div style="display:flex; align-items:center; gap:2rem; color:var(--text-muted); font-size:0.85rem;">
          <span>🔥 Sessions Completed Today: <strong style="color:var(--text-primary);">${this.sessionsCompleted}</strong></span>
          <span>⚡ 1 Pomodoro = 25m Deep Uninterrupted Work</span>
        </div>
      </div>
    `;

    this.bindTimerControls();
    this.updateDisplay();
  }

  bindTimerControls() {
    // Mode buttons
    this.container.querySelectorAll('.pomo-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setMode(btn.dataset.mode);
        this.container.querySelectorAll('.pomo-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Start/Pause toggle
    document.getElementById('btn-pomo-toggle')?.addEventListener('click', () => {
      if (this.isRunning) this.pause();
      else this.start();
    });

    // Reset
    document.getElementById('btn-pomo-reset')?.addEventListener('click', () => {
      this.reset();
      sounds.playClick();
    });

    // Skip
    document.getElementById('btn-pomo-skip')?.addEventListener('click', () => {
      this.handleSessionComplete();
    });

    // Task select dropdown
    const select = document.getElementById('pomo-task-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const taskId = e.target.value;
        state.activePomodoroTask = state.tasks.find(t => t.id === taskId) || null;
      });
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update digits
    const digitsEl = document.getElementById('timer-digits-display');
    if (digitsEl) digitsEl.textContent = timeFormatted;

    // Update SVG stroke-dashoffset
    const ringEl = document.getElementById('timer-progress-ring');
    if (ringEl) {
      const radius = 120;
      const circumference = 2 * Math.PI * radius;
      const totalDuration = MODES[this.currentMode].duration;
      const progressFraction = this.timeLeft / totalDuration;
      const offset = circumference * (1 - progressFraction);

      ringEl.style.strokeDasharray = `${circumference}`;
      ringEl.style.strokeDashoffset = `${offset}`;
    }

    // Update tab title with running countdown
    if (this.isRunning) {
      document.title = `(${timeFormatted}) TaskFlow Pro`;
    } else {
      document.title = 'TaskFlow Pro — Modern Task Manager';
    }

    this.updateMiniHeaderWidget();
  }

  updateControls() {
    const toggleBtn = document.getElementById('btn-pomo-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = this.isRunning ? '⏸ Pause' : '▶ Start Focus';
    }
  }

  updateMiniHeaderWidget() {
    const miniWidget = document.getElementById('header-pomo-widget');
    if (!miniWidget) return;

    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    miniWidget.innerHTML = `
      <span style="font-size:0.8rem; font-family:var(--font-mono); font-weight:700; color:${this.isRunning ? 'var(--primary)' : 'var(--text-muted)'};">
        ${this.isRunning ? '⏱️ ' : ''}${timeFormatted}
      </span>
    `;
  }

  updateTaskSelector() {
    const select = document.getElementById('pomo-task-select');
    if (!select) return;
    const activeTask = state.activePomodoroTask;

    select.innerHTML = `
      <option value="">-- No specific task linked --</option>
      ${state.tasks.filter(t => t.status !== 'done').map(t => `
        <option value="${t.id}" ${activeTask && activeTask.id === t.id ? 'selected' : ''}>
          [${t.category.toUpperCase()}] ${t.title}
        </option>
      `).join('')}
    `;
  }
}
