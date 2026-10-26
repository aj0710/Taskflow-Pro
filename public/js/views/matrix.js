/* ===================================================================
   TaskFlow Pro — Eisenhower Priority Matrix View (2x2 Grid)
   =================================================================== */

import { state } from '../state.js';
import { sounds } from '../audio.js';
import { confetti } from '../confetti.js';
import { modals } from '../modal.js';

const QUADRANTS = [
  {
    id: 'q1',
    title: 'Urgent & Important',
    subtitle: 'Do First — Critical deadlines and emergencies',
    color: '#f43f5e',
    targetPriority: 'urgent'
  },
  {
    id: 'q2',
    title: 'Not Urgent & Important',
    subtitle: 'Schedule — Strategic planning, deep work & growth',
    color: '#6366f1',
    targetPriority: 'high'
  },
  {
    id: 'q3',
    title: 'Urgent & Not Important',
    subtitle: 'Delegate — Interruptions, quick requests & chores',
    color: '#f59e0b',
    targetPriority: 'medium'
  },
  {
    id: 'q4',
    title: 'Not Urgent & Not Important',
    subtitle: 'Eliminate — Low-impact tasks & distractions',
    color: '#64748b',
    targetPriority: 'low'
  }
];

export class MatrixView {
  constructor(container) {
    this.container = container;
    this.draggedTaskId = null;
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    state.on('tasks:updated', () => {
      if (state.activeView === 'matrix') this.render();
    });
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="view-toolbar">
        <div class="view-heading-group">
          <h2>Eisenhower Decision Matrix</h2>
          <span class="view-subheading">Prioritize tasks by urgency and importance to maximize high-leverage outcomes</span>
        </div>
        <div class="view-actions">
          <button class="btn btn-primary" id="btn-matrix-new-task">
            <span>+</span> New Task
          </button>
        </div>
      </div>

      <div class="matrix-container" id="matrix-board">
        ${QUADRANTS.map(q => {
          const tasks = state.getTasksByQuadrant(q.id);
          return `
            <div class="matrix-quadrant ${q.id}" data-quadrant="${q.id}" data-priority="${q.targetPriority}">
              <div class="matrix-quadrant-header">
                <div class="matrix-header-title">
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span style="width:8px; height:8px; border-radius:50%; background:${q.color}; box-shadow:0 0 8px ${q.color}"></span>
                    <h3 style="font-size:1.05rem;">${q.title}</h3>
                  </div>
                  <span style="font-size:0.75rem; color:var(--text-muted);">${q.subtitle}</span>
                </div>
                <span class="column-count">${tasks.length}</span>
              </div>

              <div class="matrix-quadrant-cards" data-quadrant="${q.id}">
                ${tasks.length === 0 ? `
                  <div style="text-align:center; padding:2rem 1rem; color:var(--text-muted); font-size:0.825rem; font-style:italic;">
                    Drag tasks here or drop to adjust priority
                  </div>
                ` : tasks.map(task => this.renderQuadrantCard(task)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindMatrixInteractions();
  }

  renderQuadrantCard(task) {
    const isCompleted = task.status === 'done';
    const cat = state.categories.find(c => c.id === task.category) || { name: task.category, color: '#6366f1' };

    return `
      <div class="task-card ${isCompleted ? 'completed' : ''}" draggable="true" data-id="${task.id}" style="margin-bottom:0;">
        <div class="task-card-header">
          <span class="badge-cat">
            <span class="category-dot" style="background:${cat.color}"></span>
            ${cat.name}
          </span>
          <span class="badge-priority ${task.priority}">${task.priority}</span>
        </div>

        <div class="task-card-title-row">
          <button class="task-checkbox ${isCompleted ? 'checked' : ''}" data-id="${task.id}">✓</button>
          <span class="task-card-title" data-id="${task.id}">${this.escapeHtml(task.title)}</span>
        </div>

        <div class="task-card-footer">
          <span class="badge-date">${task.dueDate || 'No date'}</span>
          <div class="task-card-actions">
            <button class="task-btn-action btn-matrix-edit" data-id="${task.id}" title="Edit">✏️</button>
            <button class="task-btn-action btn-matrix-del" data-id="${task.id}" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  bindMatrixInteractions() {
    const board = document.getElementById('matrix-board');
    if (!board) return;

    document.getElementById('btn-matrix-new-task')?.addEventListener('click', () => modals.openTaskModal());

    // Checkboxes
    board.querySelectorAll('.task-checkbox').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const updated = state.toggleTaskComplete(id);
        if (updated && updated.status === 'done') {
          sounds.playTaskComplete();
          const rect = btn.getBoundingClientRect();
          confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      });
    });

    // Edit & delete
    board.querySelectorAll('.task-card-title, .btn-matrix-edit').forEach(el => {
      el.addEventListener('click', () => modals.openTaskModal(el.dataset.id));
    });

    board.querySelectorAll('.btn-matrix-del').forEach(btn => {
      btn.addEventListener('click', () => {
        state.deleteTask(btn.dataset.id);
        sounds.playClick();
        modals.showToast('Task removed', 'info', () => state.undoLastDelete());
      });
    });

    // Drag & Drop between quadrants
    const cards = board.querySelectorAll('.task-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.draggedTaskId = card.dataset.id;
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.dataset.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.draggedTaskId = null;
        board.querySelectorAll('.matrix-quadrant').forEach(q => q.classList.remove('drag-over'));
      });
    });

    const quadrants = board.querySelectorAll('.matrix-quadrant');
    quadrants.forEach(q => {
      q.addEventListener('dragover', (e) => {
        e.preventDefault();
        q.classList.add('drag-over');
      });

      q.addEventListener('dragleave', (e) => {
        if (!q.contains(e.relatedTarget)) {
          q.classList.remove('drag-over');
        }
      });

      q.addEventListener('drop', (e) => {
        e.preventDefault();
        q.classList.remove('drag-over');
        const targetPriority = q.dataset.priority;
        const taskId = this.draggedTaskId || e.dataTransfer.getData('text/plain');

        if (taskId && targetPriority) {
          state.updateTask(taskId, { priority: targetPriority });
          sounds.playClick();
          modals.showToast(`Priority adjusted to ${targetPriority}`, 'success');
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
