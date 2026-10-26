/* ===================================================================
   TaskFlow Pro — Modals & Toast Controller
   =================================================================== */

import { state } from './state.js';
import { sounds } from './audio.js';

class ModalController {
  constructor() {
    this.activeModal = null;
    this.currentEditingTaskId = null;
    this.subtaskBuilderItems = [];
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.overlay = document.getElementById('modal-overlay');
    this.toastContainer = document.getElementById('toast-container');
    this.taskModal = document.getElementById('task-modal');
    this.shortcutsModal = document.getElementById('shortcuts-modal');
    this.exportModal = document.getElementById('export-modal');
  }

  bindEvents() {
    // Close modal on clicking backdrop
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.closeModal();
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    // Task Form Submission
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => this.handleTaskFormSubmit(e));
    }

    // Subtask add button in modal
    const addSubtaskBtn = document.getElementById('btn-add-modal-subtask');
    if (addSubtaskBtn) {
      addSubtaskBtn.addEventListener('click', () => this.addEmptySubtaskItem());
    }

    // Subtask enter key
    const subtaskInput = document.getElementById('modal-subtask-quick-input');
    if (subtaskInput) {
      subtaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = subtaskInput.value.trim();
          if (val) {
            this.subtaskBuilderItems.push({
              id: 's-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 3),
              title: val,
              completed: false
            });
            subtaskInput.value = '';
            this.renderSubtaskBuilderList();
          }
        }
      });
    }
  }

  openModal(modalId) {
    if (!this.overlay) return;
    this.closeModal(false);

    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = 'flex';
    this.overlay.classList.add('active');
    this.activeModal = modal;
    sounds.playClick();
  }

  closeModal(playSound = true) {
    if (!this.overlay) return;
    this.overlay.classList.remove('active');
    if (this.activeModal) {
      this.activeModal.style.display = 'none';
      this.activeModal = null;
    }
    this.currentEditingTaskId = null;
    this.subtaskBuilderItems = [];
    if (playSound) sounds.playClick();
  }

  // Open Task Modal for New or Edit
  openTaskModal(taskId = null, defaultStatus = 'todo') {
    this.currentEditingTaskId = taskId;
    const modalTitle = document.getElementById('task-modal-title');
    const form = document.getElementById('task-form');
    if (!form) return;

    form.reset();
    this.subtaskBuilderItems = [];

    // Populate category dropdown
    const catSelect = document.getElementById('task-form-category');
    if (catSelect) {
      catSelect.innerHTML = state.categories.map(c => 
        `<option value="${c.id}">${c.name}</option>`
      ).join('');
    }

    if (taskId) {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;

      modalTitle.textContent = 'Edit Task';
      document.getElementById('task-form-id').value = task.id;
      document.getElementById('task-form-title').value = task.title;
      document.getElementById('task-form-desc').value = task.description || '';
      document.getElementById('task-form-category').value = task.category;
      document.getElementById('task-form-priority').value = task.priority;
      document.getElementById('task-form-status').value = task.status;
      document.getElementById('task-form-due-date').value = task.dueDate || '';
      document.getElementById('task-form-due-time').value = task.dueTime || '';
      document.getElementById('task-form-tags').value = (task.tags || []).join(', ');
      document.getElementById('task-form-estimate').value = task.estimatedMinutes || 30;

      this.subtaskBuilderItems = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];
    } else {
      modalTitle.textContent = 'Create New Task';
      document.getElementById('task-form-id').value = '';
      document.getElementById('task-form-status').value = defaultStatus;
      document.getElementById('task-form-priority').value = 'medium';
      document.getElementById('task-form-estimate').value = '30';
      
      // Default due date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('task-form-due-date').value = today;
    }

    this.renderSubtaskBuilderList();
    this.openModal('task-modal');

    setTimeout(() => {
      document.getElementById('task-form-title')?.focus();
    }, 100);
  }

  addEmptySubtaskItem() {
    const input = document.getElementById('modal-subtask-quick-input');
    const val = input ? input.value.trim() : '';
    if (val) {
      this.subtaskBuilderItems.push({
        id: 's-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 3),
        title: val,
        completed: false
      });
      if (input) input.value = '';
      this.renderSubtaskBuilderList();
    }
  }

  renderSubtaskBuilderList() {
    const container = document.getElementById('modal-subtasks-container');
    if (!container) return;

    if (this.subtaskBuilderItems.length === 0) {
      container.innerHTML = `<span style="font-size:0.78rem; color:var(--text-muted); font-style:italic;">No subtasks added yet</span>`;
      return;
    }

    container.innerHTML = this.subtaskBuilderItems.map((sub, idx) => `
      <div class="subtask-builder-item">
        <input type="checkbox" ${sub.completed ? 'checked' : ''} data-index="${idx}" class="subtask-builder-check">
        <input type="text" value="${sub.title.replace(/"/g, '&quot;')}" data-index="${idx}" class="subtask-builder-title">
        <span class="subtask-builder-del" data-index="${idx}" title="Delete subtask">&times;</span>
      </div>
    `).join('');

    // Bind subtask builder events
    container.querySelectorAll('.subtask-builder-check').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const idx = Number(e.target.dataset.index);
        this.subtaskBuilderItems[idx].completed = e.target.checked;
      });
    });

    container.querySelectorAll('.subtask-builder-title').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.dataset.index);
        this.subtaskBuilderItems[idx].title = e.target.value;
      });
    });

    container.querySelectorAll('.subtask-builder-del').forEach(delBtn => {
      delBtn.addEventListener('click', (e) => {
        const idx = Number(e.target.dataset.index);
        this.subtaskBuilderItems.splice(idx, 1);
        this.renderSubtaskBuilderList();
      });
    });
  }

  handleTaskFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('task-form-id').value;
    const title = document.getElementById('task-form-title').value.trim();

    if (!title) {
      this.showToast('Please enter a task title', 'error');
      return;
    }

    const tagsRaw = document.getElementById('task-form-tags').value;
    const tags = tagsRaw.split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const taskData = {
      title,
      description: document.getElementById('task-form-desc').value.trim(),
      category: document.getElementById('task-form-category').value,
      priority: document.getElementById('task-form-priority').value,
      status: document.getElementById('task-form-status').value,
      dueDate: document.getElementById('task-form-due-date').value || null,
      dueTime: document.getElementById('task-form-due-time').value || null,
      tags,
      estimatedMinutes: Number(document.getElementById('task-form-estimate').value) || 30,
      subtasks: this.subtaskBuilderItems.filter(s => s.title.trim())
    };

    if (id) {
      state.updateTask(id, taskData);
      this.showToast('Task updated successfully', 'success');
    } else {
      state.addTask(taskData);
      this.showToast('Task created successfully', 'success');
    }

    this.closeModal();
  }

  // Toast Notifications
  showToast(message, type = 'info', undoCallback = null) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span>${icon}</span>
      <span class="toast-message">${message}</span>
      ${undoCallback ? '<span class="toast-undo">Undo</span>' : ''}
    `;

    if (undoCallback) {
      toast.querySelector('.toast-undo').addEventListener('click', () => {
        undoCallback();
        toast.remove();
      });
    }

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  }
}

export const modals = new ModalController();
