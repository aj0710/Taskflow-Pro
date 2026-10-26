/* ===================================================================
   TaskFlow Pro — Central Reactive State Store & Persistence
   =================================================================== */

const STORAGE_KEY_TASKS = 'taskflow_tasks_v2';
const STORAGE_KEY_CATS = 'taskflow_categories_v2';
const STORAGE_KEY_THEME = 'taskflow_theme_v2';

const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Work', color: '#38bdf8' },
  { id: 'dev', name: 'Engineering', color: '#10b981' },
  { id: 'design', name: 'Design', color: '#ec4899' },
  { id: 'personal', name: 'Personal', color: '#a855f7' },
  { id: 'goals', name: 'Goals & Study', color: '#f59e0b' }
];

function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const SEED_TASKS = [
  {
    id: 't-101',
    title: 'Design System Architecture & Tokens',
    description: 'Establish unified CSS variables, typography hierarchy, and glassmorphism styling guide for the client portal.',
    category: 'design',
    priority: 'high',
    status: 'in-progress',
    dueDate: getFormattedDate(1),
    dueTime: '16:00',
    subtasks: [
      { id: 's-1', title: 'Export Figma color swatches & elevation shadows', completed: true },
      { id: 's-2', title: 'Define responsive font scaling tokens', completed: true },
      { id: 's-3', title: 'Document micro-interaction specifications', completed: false }
    ],
    tags: ['UI/UX', 'Tokens', 'Design'],
    estimatedMinutes: 180,
    timeSpentMinutes: 95,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: null
  },
  {
    id: 't-102',
    title: 'Implement OAuth2 & JWT Security Flow',
    description: 'Configure stateless session management, refresh token rotation, and secure HTTP-only cookies in auth gateway.',
    category: 'dev',
    priority: 'urgent',
    status: 'in-progress',
    dueDate: getFormattedDate(0), // Today
    dueTime: '18:00',
    subtasks: [
      { id: 's-4', title: 'Add refresh token endpoint with rate limiting', completed: true },
      { id: 's-5', title: 'Implement CSRF double-submit token pattern', completed: false },
      { id: 's-6', title: 'Write integration test suites for token expiry', completed: false }
    ],
    tags: ['Auth', 'Security', 'Backend'],
    estimatedMinutes: 240,
    timeSpentMinutes: 140,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: null
  },
  {
    id: 't-103',
    title: 'Review Q4 Product Roadmap & Sprint Milestones',
    description: 'Sync with product stakeholders on deliverables, resource allocation, and key OKR targets for next quarter.',
    category: 'work',
    priority: 'high',
    status: 'todo',
    dueDate: getFormattedDate(0), // Today
    dueTime: '14:30',
    subtasks: [
      { id: 's-7', title: 'Collate team velocity metrics', completed: true },
      { id: 's-8', title: 'Prioritize feature requests backlog', completed: false }
    ],
    tags: ['Strategy', 'Planning'],
    estimatedMinutes: 60,
    timeSpentMinutes: 15,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    completedAt: null
  },
  {
    id: 't-104',
    title: 'Optimize Database Query Latency & Indexing',
    description: 'Analyze slow query logs in PostgreSQL, add composite indexes on task filtering columns, and measure performance.',
    category: 'dev',
    priority: 'medium',
    status: 'review',
    dueDate: getFormattedDate(2),
    dueTime: '12:00',
    subtasks: [
      { id: 's-9', title: 'Run EXPLAIN ANALYZE on complex joins', completed: true },
      { id: 's-10', title: 'Add compound index on status and due_date', completed: true }
    ],
    tags: ['Database', 'Perf'],
    estimatedMinutes: 120,
    timeSpentMinutes: 110,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    completedAt: null
  },
  {
    id: 't-105',
    title: 'Conduct Usability Testing with 5 Target Users',
    description: 'Record interactive feedback on checkout onboarding flow and compile friction points into actionable tickets.',
    category: 'design',
    priority: 'low',
    status: 'backlog',
    dueDate: getFormattedDate(5),
    dueTime: '15:00',
    subtasks: [
      { id: 's-11', title: 'Draft testing scenario script', completed: true },
      { id: 's-12', title: 'Schedule Zoom interview slots', completed: false }
    ],
    tags: ['Research', 'UserTesting'],
    estimatedMinutes: 150,
    timeSpentMinutes: 0,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    completedAt: null
  },
  {
    id: 't-106',
    title: 'Audit NPM Dependencies & Fix Vulnerabilities',
    description: 'Update legacy packages, resolve critical CVE reports, and verify build reproducibility across pipeline.',
    category: 'dev',
    priority: 'medium',
    status: 'done',
    dueDate: getFormattedDate(-1), // Yesterday
    dueTime: '17:00',
    subtasks: [
      { id: 's-13', title: 'Run npm audit fix --dry-run', completed: true },
      { id: 's-14', title: 'Verify test suite passes with updated packages', completed: true }
    ],
    tags: ['Security', 'Maintenance'],
    estimatedMinutes: 45,
    timeSpentMinutes: 40,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 't-107',
    title: 'Complete 45-Min Functional Mobility & Strength Session',
    description: 'Daily fitness training: core stability, kettlebell clean & presses, and foam rolling recovery.',
    category: 'personal',
    priority: 'low',
    status: 'done',
    dueDate: getFormattedDate(0),
    dueTime: '08:00',
    subtasks: [
      { id: 's-15', title: 'Dynamic warmup & hip mobility', completed: true },
      { id: 's-16', title: '4 sets of compound lifts', completed: true }
    ],
    tags: ['Health', 'Fitness'],
    estimatedMinutes: 45,
    timeSpentMinutes: 45,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 't-108',
    title: 'Prepare Slide Deck for Investor Demo Day',
    description: 'Craft 10 high-impact slides highlighting customer retention numbers, monthly recurring revenue, and roadmap.',
    category: 'work',
    priority: 'urgent',
    status: 'todo',
    dueDate: getFormattedDate(-1), // Overdue to demonstrate overdue indicator!
    dueTime: '11:00',
    subtasks: [
      { id: 's-17', title: 'Update ARR and churn rate charts', completed: true },
      { id: 's-18', title: 'Record 2-minute product interactive teaser', completed: false }
    ],
    tags: ['Pitch', 'Investors', 'HighPriority'],
    estimatedMinutes: 180,
    timeSpentMinutes: 70,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    completedAt: null
  }
];

class StateStore {
  constructor() {
    this.events = {};
    this.tasks = this.loadTasks();
    this.categories = this.loadCategories();
    this.theme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';

    this.activeView = 'kanban'; // 'kanban', 'list', 'matrix', 'calendar', 'analytics', 'pomodoro'
    this.searchQuery = '';
    this.activeCategory = 'all';
    this.quickFilter = 'all'; // 'all', 'today', 'overdue', 'urgent'
    this.sortField = 'dueDate';
    this.sortOrder = 'asc';
    this.selectedTaskIds = new Set();
    this.lastDeletedTask = null;
    this.activePomodoroTask = null;
  }

  // Pub/Sub
  on(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(data));
    }
  }

  // Persistence
  loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TASKS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed loading tasks from localStorage', e);
    }
    return JSON.parse(JSON.stringify(SEED_TASKS));
  }

  saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(this.tasks));
    } catch (e) {
      console.error('Failed saving tasks', e);
    }
    this.emit('tasks:updated', this.tasks);
  }

  loadCategories() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  }

  saveCategories() {
    try {
      localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(this.categories));
    } catch {}
    this.emit('categories:updated', this.categories);
  }

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    this.emit('theme:changed', theme);
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
    return nextTheme;
  }

  // Task CRUD
  addTask(taskData) {
    const newTask = {
      id: 't-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      category: taskData.category || 'work',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo',
      dueDate: taskData.dueDate || null,
      dueTime: taskData.dueTime || null,
      subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
      tags: Array.isArray(taskData.tags) ? taskData.tags : [],
      estimatedMinutes: Number(taskData.estimatedMinutes) || 30,
      timeSpentMinutes: Number(taskData.timeSpentMinutes) || 0,
      createdAt: new Date().toISOString(),
      completedAt: taskData.status === 'done' ? new Date().toISOString() : null
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    return newTask;
  }

  updateTask(id, updates) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    if (updates.status) {
      if (updates.status === 'done' && this.tasks[index].status !== 'done') {
        updates.completedAt = new Date().toISOString();
      } else if (updates.status !== 'done') {
        updates.completedAt = null;
      }
    }

    this.tasks[index] = { ...this.tasks[index], ...updates };
    this.saveTasks();
    return this.tasks[index];
  }

  toggleTaskComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updated = this.updateTask(id, {
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : null
    });
    return updated;
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (sub) {
      sub.completed = !sub.completed;
      this.saveTasks();
    }
  }

  deleteTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return false;

    this.lastDeletedTask = { ...task };
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.selectedTaskIds.delete(id);
    this.saveTasks();
    return true;
  }

  undoLastDelete() {
    if (!this.lastDeletedTask) return null;
    this.tasks.unshift(this.lastDeletedTask);
    const restored = this.lastDeletedTask;
    this.lastDeletedTask = null;
    this.saveTasks();
    return restored;
  }

  bulkUpdateStatus(status) {
    if (this.selectedTaskIds.size === 0) return;
    this.tasks.forEach(task => {
      if (this.selectedTaskIds.has(task.id)) {
        task.status = status;
        task.completedAt = status === 'done' ? new Date().toISOString() : null;
      }
    });
    this.selectedTaskIds.clear();
    this.saveTasks();
  }

  bulkDelete() {
    if (this.selectedTaskIds.size === 0) return;
    this.tasks = this.tasks.filter(task => !this.selectedTaskIds.has(task.id));
    this.selectedTaskIds.clear();
    this.saveTasks();
  }

  // Filtering & Sorting
  getFilteredTasks() {
    let result = [...this.tasks];
    const todayStr = getFormattedDate(0);

    // Search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (this.activeCategory !== 'all') {
      result = result.filter(t => t.category === this.activeCategory);
    }

    // Quick filter chips
    if (this.quickFilter === 'today') {
      result = result.filter(t => t.dueDate === todayStr);
    } else if (this.quickFilter === 'overdue') {
      result = result.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done');
    } else if (this.quickFilter === 'urgent') {
      result = result.filter(t => t.priority === 'urgent');
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (this.sortField === 'dueDate') {
        const da = a.dueDate || '9999-99-99';
        const db = b.dueDate || '9999-99-99';
        comparison = da.localeCompare(db);
      } else if (this.sortField === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = (order[b.priority] || 0) - (order[a.priority] || 0);
      } else if (this.sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (this.sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }

  getTasksByColumn(status) {
    return this.getFilteredTasks().filter(t => t.status === status);
  }

  getTasksByQuadrant(quadrant) {
    const filtered = this.getFilteredTasks();
    const todayStr = getFormattedDate(0);

    return filtered.filter(t => {
      const isUrgent = t.priority === 'urgent' || (t.dueDate && t.dueDate <= todayStr && t.status !== 'done');
      const isImportant = t.priority === 'urgent' || t.priority === 'high';

      switch (quadrant) {
        case 'q1': // Urgent & Important
          return isUrgent && isImportant;
        case 'q2': // Not Urgent & Important
          return !isUrgent && isImportant;
        case 'q3': // Urgent & Not Important
          return isUrgent && !isImportant;
        case 'q4': // Not Urgent & Not Important
        default:
          return !isUrgent && !isImportant;
      }
    });
  }

  // Backup & Import
  exportToJSON() {
    const exportData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      tasks: this.tasks,
      categories: this.categories
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${getFormattedDate(0)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportToCSV() {
    const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'DueDate', 'SubtasksTotal', 'SubtasksDone'];
    const rows = this.tasks.map(t => [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.category || ''}"`,
      `"${t.priority || ''}"`,
      `"${t.status || ''}"`,
      `"${t.dueDate || ''}"`,
      t.subtasks ? t.subtasks.length : 0,
      t.subtasks ? t.subtasks.filter(s => s.completed).length : 0
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-tasks-${getFormattedDate(0)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.tasks)) {
        this.tasks = data.tasks;
        if (Array.isArray(data.categories)) this.categories = data.categories;
        this.saveTasks();
        this.saveCategories();
        return { success: true, count: data.tasks.length };
      }
      return { success: false, error: 'Invalid file format: missing tasks array' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetToDemo() {
    this.tasks = JSON.parse(JSON.stringify(SEED_TASKS));
    this.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    this.saveTasks();
    this.saveCategories();
  }
}

export const state = new StateStore();
