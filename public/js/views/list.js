/* ===================================================================
   TaskFlow Pro — List & Table View with Bulk Operations
   =================================================================== */

import { state } from '../state.js';
import { sounds } from '../audio.js';
import { confetti } from '../confetti.js';
import { modals } from '../modal.js';

export class ListView {
  constructor(container) {
    this.container = container;
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    state.on('tasks:updated', () => {
      if (state.activeView === 'list') this.render();
    });
  }

  render() {
    if (!this.container) return;

    const filtered = state.getFilteredTasks();
    const hasSelection = state.selectedTaskIds.size > 0;

    this.container.innerHTML = `
      <div class="view-toolbar">
        <div class="view-heading-group">
          <h2>Task Directory & Table</h2>
          <span class="view-subheading">Manage, sort, and apply bulk operations across your task inventory</span>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" id="btn-list-new-task">
            <span>+</span> New Task
          </button>
        </div>
      </div>

      <div class="list-view-container">
        ${hasSelection ? `
          <div class="list-bulk-toolbar">
            <span style="font-size:0.85rem; font-weight:600; color:var(--primary);">
              ${state.selectedTaskIds.size} task(s) selected
            </span>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-sm btn-secondary" id="btn-bulk-done">Mark Complete</button>
              <button class="btn btn-sm btn-secondary" id="btn-bulk-todo">Move to To Do</button>
              <button class="btn btn-sm btn-danger" id="btn-bulk-delete">Delete Selected</button>
              <button class="btn btn-sm btn-ghost" id="btn-bulk-clear">Clear</button>
            </div>
          </div>
        ` : ''}

        <div class="list-table-header">
          <input type="checkbox" id="select-all-tasks" ${hasSelection && state.selectedTaskIds.size === filtered.length ? 'checked' : ''} style="cursor:pointer;">
          <div class="list-table-header-col" data-sort="title">
            Task Name ${state.sortField === 'title' ? (state.sortOrder === 'asc' ? '↑' : '↓') : ''}
          </div>
          <div class="list-table-header-col" data-sort="priority">
            Priority ${state.sortField === 'priority' ? (state.sortOrder === 'asc' ? '↑' : '↓') : ''}
          </div>
          <div class="list-table-header-col list-col-date" data-sort="dueDate">
            Due Date ${state.sortField === 'dueDate' ? (state.sortOrder === 'asc' ? '↑' : '↓') : ''}
          </div>
          <div class="list-table-header-col list-col-project">
            Project
          </div>
          <div style="text-align:right;">Actions</div>
        </div>

        <div class="list-table-body">
          ${filtered.length === 0 ? `
            <div class="list-empty-state">
              <span style="font-size:2.5rem;">📋</span>
              <p style="font-size:1.05rem; font-weight:600;">No tasks found</p>
              <p style="font-size:0.85rem;">Try adjusting your filters or search query</p>
              <button class="btn btn-primary" id="btn-empty-add-task">+ Create a Task</button>
            </div>
          ` : filtered.map(task => this.renderTableRow(task)).join('')}
        </div>
      </div>
    `;

    this.bindRowInteractions();
  }

  renderTableRow(task) {
    const isCompleted = task.status === 'done';
    const isSelected = state.selectedTaskIds.has(task.id);
    const cat = state.categories.find(c => c.id === task.category) || { name: task.category, color: '#6366f1' };

    let dateLabel = 'No date';
    let dateClass = '';
    if (task.dueDate) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (task.dueDate < todayStr && !isCompleted) {
        dateLabel = `⚠️ ${task.dueDate}`;
        dateClass = 'overdue';
      } else if (task.dueDate === todayStr) {
        dateLabel = `🔥 Today`;
        dateClass = 'today';
      } else {
        dateLabel = task.dueDate;
      }
    }

    return `
      <div class="list-table-row ${isCompleted ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" class="row-select-check" data-id="${task.id}" ${isSelected ? 'checked' : ''} style="cursor:pointer;">
        
        <div class="list-row-title-wrap">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button class="task-checkbox ${isCompleted ? 'checked' : ''}" data-id="${task.id}" title="Toggle complete">✓</button>
            <span class="list-row-title" data-id="${task.id}">${this.escapeHtml(task.title)}</span>
          </div>
          ${task.description ? `<span class="list-row-desc">${this.escapeHtml(task.description)}</span>` : ''}
        </div>

        <div>
          <span class="badge-priority ${task.priority}">${task.priority}</span>
        </div>

        <div class="list-col-date">
          <span class="badge-date ${dateClass}">${dateLabel}</span>
        </div>

        <div class="list-col-project">
          <span class="badge-cat">
            <span class="category-dot" style="background:${cat.color}; color:${cat.color}"></span>
            ${cat.name}
          </span>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.35rem;">
          <button class="task-btn-action btn-list-pomo" data-id="${task.id}" title="Pomodoro Focus">⏱️</button>
          <button class="task-btn-action btn-list-edit" data-id="${task.id}" title="Edit">✏️</button>
          <button class="task-btn-action btn-list-delete" data-id="${task.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }

  bindRowInteractions() {
    // New Task buttons
    document.getElementById('btn-list-new-task')?.addEventListener('click', () => modals.openTaskModal());
    document.getElementById('btn-empty-add-task')?.addEventListener('click', () => modals.openTaskModal());

    // Sorting headers
    this.container.querySelectorAll('.list-table-header-col[data-sort]').forEach(col => {
      col.addEventListener('click', () => {
        const field = col.dataset.sort;
        if (state.sortField === field) {
          state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortField = field;
          state.sortOrder = 'asc';
        }
        sounds.playClick();
        this.render();
      });
    });

    // Select all checkbox
    const selectAll = document.getElementById('select-all-tasks');
    if (selectAll) {
      selectAll.addEventListener('change', (e) => {
        const filtered = state.getFilteredTasks();
        if (e.target.checked) {
          filtered.forEach(t => state.selectedTaskIds.add(t.id));
        } else {
          state.selectedTaskIds.clear();
        }
        this.render();
      });
    }

    // Row selection checkboxes
    this.container.querySelectorAll('.row-select-check').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        if (e.target.checked) state.selectedTaskIds.add(id);
        else state.selectedTaskIds.delete(id);
        this.render();
      });
    });

    // Checkbox completion toggle
    this.container.querySelectorAll('.task-checkbox').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const updated = state.toggleTaskComplete(id);
        if (updated && updated.status === 'done') {
          sounds.playTaskComplete();
          const rect = btn.getBoundingClientRect();
          confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
          modals.showToast('Task completed! 🎉', 'success');
        }
      });
    });

    // Edit task
    this.container.querySelectorAll('.list-row-title, .btn-list-edit').forEach(el => {
      el.addEventListener('click', () => {
        modals.openTaskModal(el.dataset.id);
      });
    });

    // Delete task
    this.container.querySelectorAll('.btn-list-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const task = state.tasks.find(t => t.id === id);
        state.deleteTask(id);
        sounds.playClick();
        modals.showToast(`Deleted "${task ? task.title : 'Task'}"`, 'info', () => {
          state.undoLastDelete();
        });
      });
    });

    // Focus in Pomodoro
    this.container.querySelectorAll('.btn-list-pomo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        state.activePomodoroTask = state.tasks.find(t => t.id === id);
        state.activeView = 'pomodoro';
        state.emit('view:changed', 'pomodoro');
      });
    });

    // Bulk action toolbar handlers
    document.getElementById('btn-bulk-done')?.addEventListener('click', () => {
      state.bulkUpdateStatus('done');
      sounds.playTaskComplete();
      confetti.burst(window.innerWidth / 2, window.innerHeight / 3);
      modals.showToast('Selected tasks marked as completed', 'success');
      this.render();
    });

    document.getElementById('btn-bulk-todo')?.addEventListener('click', () => {
      state.bulkUpdateStatus('todo');
      sounds.playClick();
      modals.showToast('Selected tasks moved to To Do', 'info');
      this.render();
    });

    document.getElementById('btn-bulk-delete')?.addEventListener('click', () => {
      const count = state.selectedTaskIds.size;
      state.bulkDelete();
      sounds.playClick();
      modals.showToast(`Deleted ${count} tasks`, 'info');
      this.render();
    });

    document.getElementById('btn-bulk-clear')?.addEventListener('click', () => {
      state.selectedTaskIds.clear();
      this.render();
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
