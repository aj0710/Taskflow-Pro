/* ===================================================================
   TaskFlow Pro — Monthly Calendar View & Date Scheduler
   =================================================================== */

import { state } from '../state.js';
import { sounds } from '../audio.js';
import { modals } from '../modal.js';

export class CalendarView {
  constructor(container) {
    this.container = container;
    this.currentDate = new Date();
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    state.on('tasks:updated', () => {
      if (state.activeView === 'calendar') this.render();
    });
  }

  render() {
    if (!this.container) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = this.currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    // Calculate dates
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];

    // Build day cells
    const cells = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({ dayNum, dateStr, isOtherMonth: true });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({ dayNum: i, dateStr, isOtherMonth: false, isToday: dateStr === todayStr });
    }

    // Next month padding to fill grid to 35 or 42
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({ dayNum: i, dateStr, isOtherMonth: true });
    }

    const tasks = state.getFilteredTasks();

    this.container.innerHTML = `
      <div class="view-toolbar">
        <div class="view-heading-group">
          <h2>Calendar Schedule</h2>
          <span class="view-subheading">View upcoming deadlines and plan future task execution</span>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" id="btn-cal-new-task">
            <span>+</span> Schedule Task
          </button>
        </div>
      </div>

      <div class="calendar-container">
        <div class="calendar-header-bar">
          <h3 style="font-size:1.3rem;">${monthName}</h3>
          <div class="calendar-nav">
            <button class="btn btn-secondary btn-sm" id="cal-prev-btn">&larr; Prev</button>
            <button class="btn btn-secondary btn-sm" id="cal-today-btn">Today</button>
            <button class="btn btn-secondary btn-sm" id="cal-next-btn">Next &rarr;</button>
          </div>
        </div>

        <div class="calendar-grid-header">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div class="calendar-grid-body">
          ${cells.map(cell => {
            const dayTasks = tasks.filter(t => t.dueDate === cell.dateStr);
            return `
              <div class="calendar-day-cell ${cell.isOtherMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}" data-date="${cell.dateStr}">
                <div class="calendar-cell-top">
                  <span class="day-number">${cell.dayNum}</span>
                  ${dayTasks.length > 0 ? `<span style="font-size:0.7rem; color:var(--text-muted);">${dayTasks.length}</span>` : ''}
                </div>
                <div class="calendar-tasks-list">
                  ${dayTasks.slice(0, 3).map(t => {
                    const priorityColor = {
                      urgent: 'var(--status-urgent)',
                      high: 'var(--status-high)',
                      medium: 'var(--status-medium)',
                      low: 'var(--status-low)'
                    }[t.priority] || 'var(--primary)';

                    return `
                      <div class="cal-task-chip" style="border-left-color:${priorityColor};" data-id="${t.id}" title="${this.escapeHtml(t.title)}">
                        ${t.status === 'done' ? '✓ ' : ''}${this.escapeHtml(t.title)}
                      </div>
                    `;
                  }).join('')}
                  ${dayTasks.length > 3 ? `
                    <span style="font-size:0.68rem; color:var(--primary); font-weight:600;">
                      +${dayTasks.length - 3} more
                    </span>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.bindCalendarInteractions();
  }

  bindCalendarInteractions() {
    // Navigation
    document.getElementById('cal-prev-btn')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      sounds.playClick();
      this.render();
    });

    document.getElementById('cal-next-btn')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      sounds.playClick();
      this.render();
    });

    document.getElementById('cal-today-btn')?.addEventListener('click', () => {
      this.currentDate = new Date();
      sounds.playClick();
      this.render();
    });

    document.getElementById('btn-cal-new-task')?.addEventListener('click', () => modals.openTaskModal());

    // Click on day cell to create task on that day
    this.container.querySelectorAll('.calendar-day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        if (e.target.closest('.cal-task-chip')) return;
        const dateStr = cell.dataset.date;
        modals.openTaskModal(null, 'todo');
        setTimeout(() => {
          const dateInput = document.getElementById('task-form-due-date');
          if (dateInput) dateInput.value = dateStr;
        }, 80);
      });
    });

    // Click on task chip to open edit modal
    this.container.querySelectorAll('.cal-task-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        modals.openTaskModal(chip.dataset.id);
      });
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
