/* ===================================================================
   TaskFlow Pro — Kanban Board View with Drag & Drop
   =================================================================== */

import { state } from '../state.js';
import { sounds } from '../audio.js';
import { confetti } from '../confetti.js';
import { modals } from '../modal.js';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#64748b' },
  { id: 'todo', title: 'To Do', color: '#38bdf8' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'review', title: 'In Review', color: '#a855f7' },
  { id: 'done', title: 'Completed', color: '#10b981' }
];

export class KanbanView {
  constructor(container) {
    this.container = container;
    this.draggedTaskId = null;
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    state.on('tasks:updated', () => {
      if (state.activeView === 'kanban') this.render();
    });
  }

  formatDueDate(dateStr) {
    if (!dateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date(today + 'T00:00:00');
    const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, type: 'overdue' };
    if (diffDays === 0) return { label: 'Today', type: 'today' };
    if (diffDays === 1) return { label: 'Tomorrow', type: 'normal' };
    return {
      label: target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      type: 'normal'
    };
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="view-toolbar">
        <div class="view-heading-group">
          <h2>Kanban Workspace</h2>
          <span class="view-subheading">Organize and visualize workflow stages with fluid drag & drop</span>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" id="btn-kanban-new-task">
            <span>+</span> New Task
          </button>
        </div>
      </div>

      <div class="kanban-board-container" id="kanban-board">
        ${COLUMNS.map(col => {
          const colTasks = state.getTasksByColumn(col.id);
          return `
            <div class="kanban-column" data-status="${col.id}">
              <div class="kanban-column-header">
                <div class="column-title-wrap">
                  <span class="column-color-indicator" style="background:${col.color}; color:${col.color}"></span>
                  <span class="column-name">${col.title}</span>
                </div>
                <span class="column-count">${colTasks.length}</span>
              </div>

              <div class="kanban-card-list" data-status="${col.id}">
                ${colTasks.map(task => this.renderTaskCard(task)).join('')}
              </div>

              <div class="kanban-column-footer">
                <button class="quick-add-btn" data-status="${col.id}">
                  <span>+</span> Add Task
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindCardInteractions();
  }

  renderTaskCard(task) {
    const isCompleted = task.status === 'done';
    const cat = state.categories.find(c => c.id === task.category) || { name: task.category, color: '#6366f1' };
    const dateInfo = this.formatDueDate(task.dueDate);

    // Subtasks progress
    let subtaskProgressHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter(s => s.completed).length;
      const pct = Math.round((completedCount / task.subtasks.length) * 100);
      subtaskProgressHtml = `
        <div class="task-card-subtasks">
          <div class="subtask-mini-progress">
            <span>☑ ${completedCount}/${task.subtasks.length}</span>
            <div class="subtask-mini-bar">
              <div class="subtask-mini-fill" style="width:${pct}%"></div>
            </div>
            <span>${pct}%</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="task-card ${isCompleted ? 'completed' : ''}" draggable="true" data-id="${task.id}">
        <div class="task-card-header">
          <span class="badge-cat">
            <span class="category-dot" style="background:${cat.color}; color:${cat.color}"></span>
            ${cat.name}
          </span>
          <span class="badge-priority ${task.priority}">${task.priority}</span>
        </div>

        <div class="task-card-title-row">
          <button class="task-checkbox ${isCompleted ? 'checked' : ''}" data-id="${task.id}" title="Toggle complete">
            ✓
          </button>
          <span class="task-card-title" data-id="${task.id}">${this.escapeHtml(task.title)}</span>
        </div>

        ${task.description ? `<p class="task-card-desc">${this.escapeHtml(task.description)}</p>` : ''}
        ${subtaskProgressHtml}

        <div class="task-card-footer">
          <div class="task-card-tags">
            ${dateInfo ? `<span class="badge-date ${dateInfo.type}">📅 ${dateInfo.label}</span>` : ''}
            ${(task.tags || []).slice(0, 2).map(tag => `<span class="badge-tag">#${this.escapeHtml(tag)}</span>`).join('')}
          </div>

          <div class="task-card-actions">
            <button class="task-btn-action btn-pomo-quick" data-id="${task.id}" title="Focus in Pomodoro">⏱️</button>
            <button class="task-btn-action btn-edit-card" data-id="${task.id}" title="Edit task">✏️</button>
            <button class="task-btn-action btn-delete-card" data-id="${task.id}" title="Delete task">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  bindCardInteractions() {
    const board = document.getElementById('kanban-board');
    if (!board) return;

    // Header new task button
    document.getElementById('btn-kanban-new-task')?.addEventListener('click', () => {
      modals.openTaskModal(null, 'todo');
    });

    // Quick add per column
    board.querySelectorAll('.quick-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const status = e.currentTarget.dataset.status;
        modals.openTaskModal(null, status);
      });
    });

    // Checkbox toggle
    board.querySelectorAll('.task-checkbox').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.id;
        const updated = state.toggleTaskComplete(taskId);
        if (updated && updated.status === 'done') {
          sounds.playTaskComplete();
          const rect = btn.getBoundingClientRect();
          confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
          modals.showToast('Task completed! 🎉', 'success');
        }
      });
    });

    // Card click to edit
    board.querySelectorAll('.task-card-title').forEach(el => {
      el.addEventListener('click', () => {
        modals.openTaskModal(el.dataset.id);
      });
    });

    board.querySelectorAll('.btn-edit-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        modals.openTaskModal(btn.dataset.id);
      });
    });

    // Delete card with undo
    board.querySelectorAll('.btn-delete-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.id;
        const task = state.tasks.find(t => t.id === taskId);
        state.deleteTask(taskId);
        sounds.playClick();
        modals.showToast(`Deleted "${task ? task.title : 'Task'}"`, 'info', () => {
          state.undoLastDelete();
          modals.showToast('Task restored', 'success');
        });
      });
    });

    // Focus in Pomodoro
    board.querySelectorAll('.btn-pomo-quick').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.dataset.id;
        state.activePomodoroTask = state.tasks.find(t => t.id === taskId);
        state.activeView = 'pomodoro';
        state.emit('view:changed', 'pomodoro');
        modals.showToast('Task loaded into Pomodoro Focus Studio', 'info');
      });
    });

    // HTML5 Drag and Drop
    const cards = board.querySelectorAll('.task-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.draggedTaskId = card.dataset.id;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.draggedTaskId = null;
        board.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-over'));
      });
    });

    const columns = board.querySelectorAll('.kanban-column');
    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', (e) => {
        if (!col.contains(e.relatedTarget)) {
          col.classList.remove('drag-over');
        }
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const targetStatus = col.dataset.status;
        const taskId = this.draggedTaskId || e.dataTransfer.getData('text/plain');

        if (taskId && targetStatus) {
          const task = state.tasks.find(t => t.id === taskId);
          if (task && task.status !== targetStatus) {
            state.updateTask(taskId, { status: targetStatus });
            sounds.playClick();
            if (targetStatus === 'done') {
              sounds.playTaskComplete();
              confetti.burst(window.innerWidth / 2, window.innerHeight / 3);
            }
          }
        }
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
