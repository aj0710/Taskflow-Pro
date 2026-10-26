/* ===================================================================
   TaskFlow Pro — Main Application Orchestrator
   =================================================================== */

import { state } from './state.js';
import { sounds } from './audio.js';
import { modals } from './modal.js';
import { KanbanView } from './views/kanban.js';
import { ListView } from './views/list.js';
import { MatrixView } from './views/matrix.js';
import { CalendarView } from './views/calendar.js';
import { AnalyticsView } from './views/analytics.js';
import { PomodoroView } from './views/pomodoro.js';

class App {
  constructor() {
    this.views = {};
    this.initTheme();
    this.initViews();
    this.bindSidebarNavigation();
    this.bindHeaderActions();
    this.bindKeyboardShortcuts();
    this.bindDataBackupModal();
    this.updateGlobalCounters();

    // Re-render counters on updates
    state.on('tasks:updated', () => this.updateGlobalCounters());
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = state.theme === 'dark' ? '☀️' : '🌙';
    }
  }

  initViews() {
    this.views = {
      kanban: new KanbanView(document.getElementById('view-kanban')),
      list: new ListView(document.getElementById('view-list')),
      matrix: new MatrixView(document.getElementById('view-matrix')),
      calendar: new CalendarView(document.getElementById('view-calendar')),
      analytics: new AnalyticsView(document.getElementById('view-analytics')),
      pomodoro: new PomodoroView(document.getElementById('view-pomodoro'))
    };

    // Render initial view
    this.switchView(state.activeView);

    state.on('view:changed', (viewKey) => {
      this.switchView(viewKey);
    });
  }

  switchView(viewKey) {
    if (!this.views[viewKey]) return;
    state.activeView = viewKey;

    // Toggle content displays
    document.querySelectorAll('.view-content').forEach(el => el.classList.remove('active'));
    const targetEl = document.getElementById(`view-${viewKey}`);
    if (targetEl) {
      targetEl.classList.add('active');
    }

    // Toggle active sidebar button
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      if (btn.dataset.view === viewKey) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    // Render the view
    this.views[viewKey].render();

    // Close mobile drawer if open
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-backdrop')?.classList.remove('active');
  }

  bindSidebarNavigation() {
    // Navigation buttons
    document.querySelectorAll('.nav-item-btn[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playClick();
        this.switchView(btn.dataset.view);
      });
    });

    // Category click filters
    this.renderCategorySidebarList();
    state.on('categories:updated', () => this.renderCategorySidebarList());

    // Mobile sidebar hamburger toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (mobileToggle && sidebar && backdrop) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      });
    }
  }

  renderCategorySidebarList() {
    const container = document.getElementById('category-filter-list');
    if (!container) return;

    const allCount = state.tasks.length;

    container.innerHTML = `
      <div class="category-item ${state.activeCategory === 'all' ? 'active' : ''}" data-cat="all">
        <div class="category-item-left">
          <span class="category-dot" style="background:var(--primary); color:var(--primary);"></span>
          <span>All Projects</span>
        </div>
        <span class="category-count">${allCount}</span>
      </div>
      ${state.categories.map(c => {
        const count = state.tasks.filter(t => t.category === c.id).length;
        return `
          <div class="category-item ${state.activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
            <div class="category-item-left">
              <span class="category-dot" style="background:${c.color}; color:${c.color};"></span>
              <span>${c.name}</span>
            </div>
            <span class="category-count">${count}</span>
          </div>
        `;
      }).join('')}
    `;

    container.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', () => {
        sounds.playClick();
        const cat = item.dataset.cat;
        state.activeCategory = cat;
        this.renderCategorySidebarList();
        this.views[state.activeView].render();
      });
    });
  }

  bindHeaderActions() {
    // Global Quick Add Button
    document.getElementById('btn-header-add-task')?.addEventListener('click', () => {
      modals.openTaskModal();
    });

    // Theme Switch
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextTheme = state.toggleTheme();
        themeBtn.innerHTML = nextTheme === 'dark' ? '☀️' : '🌙';
        sounds.playClick();
      });
    }

    // Audio Mute Toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.innerHTML = sounds.isMuted() ? '🔇' : '🔔';
      soundBtn.addEventListener('click', () => {
        const isMuted = sounds.toggleMute();
        soundBtn.innerHTML = isMuted ? '🔇' : '🔔';
        if (!isMuted) sounds.playTaskComplete();
      });
    }

    // Search Input with Debounce
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.searchQuery = e.target.value.trim();
          this.views[state.activeView].render();
        }, 150);
      });
    }

    // Quick Filter Chips (All, Today, Overdue, Urgent)
    document.querySelectorAll('.filter-chip[data-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        sounds.playClick();
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.quickFilter = chip.dataset.filter;
        this.views[state.activeView].render();
      });
    });

    // Header Pomodoro Widget Click -> navigates to Pomodoro view
    document.getElementById('header-pomo-widget')?.addEventListener('click', () => {
      sounds.playClick();
      this.switchView('pomodoro');
    });

    // Shortcuts modal button
    document.getElementById('btn-shortcuts-modal')?.addEventListener('click', () => {
      modals.openModal('shortcuts-modal');
    });

    // Data export/import modal button
    document.getElementById('btn-export-modal')?.addEventListener('click', () => {
      modals.openModal('export-modal');
    });
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing inside form inputs or textareas
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (['input', 'textarea', 'select'].includes(activeTag)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
          modals.closeModal();
        }
        return;
      }

      if (e.key === 'Escape') {
        modals.closeModal();
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case 'n':
          e.preventDefault();
          modals.openTaskModal();
          break;
        case 'b':
          e.preventDefault();
          this.switchView('kanban');
          break;
        case 'l':
          e.preventDefault();
          this.switchView('list');
          break;
        case 'm':
          e.preventDefault();
          this.switchView('matrix');
          break;
        case 'c':
          e.preventDefault();
          this.switchView('calendar');
          break;
        case 'a':
          e.preventDefault();
          this.switchView('analytics');
          break;
        case 'p':
          e.preventDefault();
          this.switchView('pomodoro');
          break;
        case '/':
          e.preventDefault();
          document.getElementById('global-search-input')?.focus();
          break;
        case '?':
          e.preventDefault();
          modals.openModal('shortcuts-modal');
          break;
      }
    });
  }

  bindDataBackupModal() {
    // Export JSON
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      state.exportToJSON();
      sounds.playClick();
      modals.showToast('JSON backup exported', 'success');
    });

    // Export CSV
    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      state.exportToCSV();
      sounds.playClick();
      modals.showToast('CSV file exported', 'success');
    });

    // Import JSON File
    const fileInput = document.getElementById('import-file-input');
    document.getElementById('btn-trigger-import')?.addEventListener('click', () => {
      fileInput?.click();
    });

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = state.importFromJSON(evt.target.result);
          if (res.success) {
            sounds.playTaskComplete();
            modals.showToast(`Imported ${res.count} tasks successfully!`, 'success');
            modals.closeModal();
            this.views[state.activeView].render();
          } else {
            modals.showToast(`Import failed: ${res.error}`, 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset to Demo Data
    document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
      if (confirm('Reset workspace to sample demo tasks? Your custom tasks will be replaced.')) {
        state.resetToDemo();
        sounds.playClick();
        modals.showToast('Workspace reset to demo tasks', 'info');
        modals.closeModal();
        this.views[state.activeView].render();
      }
    });
  }

  updateGlobalCounters() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.status === 'done').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Sidebar footer progress
    const labelEl = document.getElementById('sidebar-progress-label');
    const barEl = document.getElementById('sidebar-progress-bar');
    if (labelEl) labelEl.textContent = `${completed} / ${total} tasks (${percentage}%)`;
    if (barEl) barEl.style.width = `${percentage}%`;

    // Sidebar navigation badges
    const kanbanBadge = document.getElementById('badge-count-kanban');
    if (kanbanBadge) kanbanBadge.textContent = total - completed;

    this.renderCategorySidebarList();
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
