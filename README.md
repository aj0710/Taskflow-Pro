# ⚡ TaskFlow Pro — Modern Task & Productivity Management Suite

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20Vanilla)-success?style=for-the-badge)
[![Made with ❤️ by aj0710](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F%20by-aj0710-8b5cf6?style=for-the-badge&logo=github&logoColor=white)](https://github.com/aj0710)

**TaskFlow Pro** is an executive-grade, hyper-performant personal productivity and task management suite. Designed with a glassmorphism dark-mode aesthetic and built entirely with standard web APIs, it delivers a zero-bloat, instantaneous experience without external UI frameworks, heavy npm runtimes, or database configuration.

---

## 📑 Table of Contents

- [🌟 Core Philosophy & Architecture](#-core-philosophy--architecture)
- [🖥️ Workspaces & Visualizations](#️-workspaces--visualizations)
  - [1. Kanban Board](#1-kanban-board)
  - [2. Interactive List & Table](#2-interactive-list--table)
  - [3. Eisenhower Decision Matrix](#3-eisenhower-decision-matrix)
  - [4. Monthly Calendar Scheduler](#4-monthly-calendar-scheduler)
  - [5. Analytics & Velocity Intelligence](#5-analytics--velocity-intelligence)
  - [6. Pomodoro Focus Studio](#6-pomodoro-focus-studio)
- [⚡ Productivity Features](#-productivity-features)
  - [Subtasks & Milestones](#subtasks--milestones)
  - [Native Web Audio Synthesizer](#native-web-audio-synthesizer)
  - [Particle Confetti Celebration](#particle-confetti-celebration)
  - [Undo Toast Engine](#undo-toast-engine)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [Option 1: Built-in Node Static Server (Recommended)](#option-1-built-in-node-static-server-recommended)
  - [Option 2: Standalone Browser Opening](#option-2-standalone-browser-opening)
- [📂 File Structure & Code Organization](#-file-structure--code-organization)
- [💾 Data Model & Storage Schema](#-data-model--storage-schema)
  - [Task Object](#task-object)
  - [Category Object](#category-object)
  - [Exporting & Importing Data](#exporting--importing-data)
- [🎨 Customization & Theming](#-customization--theming)
- [🔒 Offline First & Data Privacy](#-offline-first--data-privacy)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)

---

## 🌟 Core Philosophy & Architecture

1. **Zero External Runtime Bloat**: Built using standard HTML5, CSS3 Custom Properties (Design Tokens), and vanilla ES6+ Modules. No webpack, vite, react, or bulky node_modules required to run.
2. **Offline-First & Sovereign Data**: All tasks, subtasks, tags, focus logs, and preferences persist in the browser's `localStorage`. No network latency, no tracking, and no external accounts required.
3. **Multi-Perspective Task Management**: A single unified reactive state model rendered across 6 distinct productivity views: Kanban, Table, Matrix, Calendar, Analytics, and Pomodoro.
4. **Delightful Micro-Interactions**: Features custom synthesizers (Web Audio API), particle physics confetti, smooth glassmorphic hover elevations, and responsive drawer navigation.

---

## 🖥️ Workspaces & Visualizations

### 1. Kanban Board
- **5 Workflow Stages**: `Backlog` ➔ `To Do` ➔ `In Progress` ➔ `In Review` ➔ `Completed`.
- **Native HTML5 Drag-and-Drop**: Smooth drag interactions with drop targets, column highlights, and automatic status updates.
- **Visual Cards**: Shows category badges, glowing priority pills, dynamic subtask progress bars, due dates, tags, and inline action buttons.
- **Column-Specific Quick Add**: Inline "+ Add Task" button at the bottom of each column pre-selects the column's status.

### 2. Interactive List & Table
- **Sortable Columns**: Clickable table headers sort ascending or descending by:
  - Task Title
  - Priority Level (`Urgent` ➔ `High` ➔ `Medium` ➔ `Low`)
  - Due Date (with overdue flags)
- **Batch Selection & Bulk Operations**: Checkboxes allow multi-selecting tasks to:
  - Batch mark as completed (with celebration chime)
  - Batch move to `To Do`
  - Bulk delete selected tasks
- **Instant Completion Checkbox**: Single-click checkbox directly on the table row with celebration chime and particle burst.

### 3. Eisenhower Decision Matrix
Implements the 4-quadrant prioritization framework popularized by Dwight D. Eisenhower:
- **Quadrant 1 (Urgent & Important)**: *Do First* — Critical crises, immediate blockers, and overdue items (Crimson theme).
- **Quadrant 2 (Not Urgent & Important)**: *Schedule* — Strategic planning, architecture, long-term learning, and deep work (Indigo theme).
- **Quadrant 3 (Urgent & Not Important)**: *Delegate* — Interruptions, quick operational queries, and administrative chores (Amber theme).
- **Quadrant 4 (Not Urgent & Not Important)**: *Eliminate* — Low-impact distractions, trivial tasks, or parked items (Slate theme).
- **Interactive Drag-and-Drop**: Dragging a task into any quadrant immediately recalculates and updates its priority level.

### 4. Monthly Calendar Scheduler
- **Full Monthly Grid**: Clean calendar view with previous and next month date padding.
- **Date Navigation**: "Prev", "Today", and "Next" controls with dynamic month/year heading.
- **Task Scheduling Chips**: Color-coded task chips rendered on due dates with priority indicators and "+X more" overflow badges.
- **Direct Date Creation**: Clicking on any date cell opens the task creation modal with that date pre-filled.

### 5. Analytics & Velocity Intelligence
- **Executive KPI Cards**:
  - Task Completion Rate (%)
  - Focus Time Logged (Hours & Minutes)
  - Total Active Work Items
  - Overdue Task Alerts
- **SVG Donut Chart**: Proportional breakdown of task statuses (`Completed`, `In Progress`, `To Do`, `Review`, `Backlog`).
- **Project Workload Volume Bars**: Comparative distribution showing which project stream (Engineering, Design, Work, Personal, etc.) has the most active items.
- **Priority Urgency Breakdown**: Visual grid displaying counts of Urgent, High, Medium, and Low tasks.
- **Smart Recommendations**: Dynamic tips analyzing current deadlines and focus opportunities.

### 6. Pomodoro Focus Studio
- **Timer Modes**:
  - 🎯 **Deep Focus**: 25 Minutes
  - ☕ **Short Break**: 5 Minutes
  - 🌴 **Long Break**: 15 Minutes
- **Circular SVG Progress Ring**: Smooth animated stroke offset ticking down every second.
- **Task Linking**: Select an active task from your backlog to attach focus time to. When the timer finishes, time spent is automatically credited to the task's `timeSpentMinutes`.
- **Top Header Mini Widget**: Mini persistent countdown display in the header keeps you aware of running sessions across all views.
- **Audio Gong / Chime**: Native resonant chime signals when intervals conclude.

---

## ⚡ Productivity Features

### Subtasks & Milestones
- Break complex goals into manageable steps.
- Add and remove subtasks inside the task modal or inline.
- Visual mini progress bar shows completion ratio (e.g. `2/3 (67%)`) directly on Kanban cards.

### Native Web Audio Synthesizer
Uses the browser's built-in `AudioContext` to synthesize sounds on the fly (no `.mp3` or `.wav` files required):
- **Completion Chime**: Ascending 4-note pentatonic major chord (C5, E5, G5, C6).
- **Click Feedback**: Soft acoustic pop on button clicks.
- **Pomodoro Bell**: Warm triad gong (A4, C#5, E5) with smooth exponential decay.
- **Mute Toggle**: Easily toggle sound FX on or off using the bell button in the header.

### Particle Confetti Celebration
Custom lightweight canvas physics engine triggers an explosion of colorful particles from the button coordinates whenever a task is checked off.

### Undo Toast Engine
Deleting a task triggers a non-intrusive floating toast notification with an interactive **"Undo"** button that immediately restores the task if clicked.

---

## ⌨️ Keyboard Shortcuts

Speed up your daily workflow with built-in hotkeys:

| Shortcut | Description |
|---|---|
| <kbd>N</kbd> | Open New Task modal |
| <kbd>/</kbd> | Focus the global search input |
| <kbd>B</kbd> | Switch to Kanban Board workspace |
| <kbd>L</kbd> | Switch to List & Table workspace |
| <kbd>M</kbd> | Switch to Eisenhower Priority Matrix |
| <kbd>C</kbd> | Switch to Calendar workspace |
| <kbd>A</kbd> | Switch to Analytics & Insights |
| <kbd>P</kbd> | Switch to Pomodoro Focus Studio |
| <kbd>?</kbd> | Open Keyboard Shortcuts Cheat Sheet modal |
| <kbd>Esc</kbd> | Close any active modal or clear search |

*(Note: Shortcuts are intelligently disabled when typing in inputs or textareas).*

---

## 🚀 Quick Start & Installation

### Option 1: Built-in Node Static Server (Recommended)
Node.js comes with a zero-dependency static server included in this repository:

```bash
# Clone or navigate to directory
cd "d:\Task Manager-project"

# Start server
npm start
# or
node server.js
```

Open your browser at:  taskflow-pro-red.vercel.app/


### Option 2: Standalone Browser Opening
Double-click `index.html` or open it with your favorite browser:
```powershell
Start-Process "d:\Task Manager-project\index.html"
```

---

## 📂 File Structure & Code Organization

```
d:/Task Manager-project/
├── index.html            # Main semantic HTML5 application shell & modal dialogs
├── package.json          # Node project manifest (scripts: start, dev)
├── server.js             # Zero-dependency HTTP static server with auto-port fallback
├── README.md             # Comprehensive documentation and architecture reference
├── css/
│   ├── variables.css     # CSS design tokens, HSL colors, dark/light themes & glassmorphism
│   ├── base.css          # CSS reset, typography, app layout shell, scrollbars
│   ├── components.css    # Buttons, search input, task cards, badges, modals, toasts
│   ├── views.css         # Kanban columns, list table, matrix quadrants, calendar, pomodoro
│   └── responsive.css    # Responsive media queries, tablet rules & mobile off-canvas drawer
└── js/
    ├── app.js            # App orchestrator: view routing, shortcuts, search & event wiring
    ├── state.js          # Reactive store, Pub/Sub events, localStorage, seed data & CRUD
    ├── audio.js          # Web Audio API procedural sound synthesizer
    ├── confetti.js       # Dynamic canvas particle celebration system
    ├── modal.js          # Modal dialog manager, subtask builder, and toast notifications
    └── views/
        ├── kanban.js     # Kanban board layout, HTML5 drag-and-drop, and card rendering
        ├── list.js       # Table sorting, selection management, and bulk operations
        ├── matrix.js     # Eisenhower 2x2 grid with drag-and-drop priority assignment
        ├── calendar.js   # Monthly calendar generator, day cells, and schedule chips
        ├── analytics.js  # Pure SVG donut chart, volume bars, and KPI metrics
        └── pomodoro.js   # Pomodoro circular countdown timer and task time tracking
```

---

## 💾 Data Model & Storage Schema

All application state is saved under the localStorage keys:
- `taskflow_tasks_v2`: Array of task objects.
- `taskflow_categories_v2`: Array of category objects.
- `taskflow_theme_v2`: Active theme string (`"dark"` or `"light"`).
- `taskflow_sound_muted`: Boolean sound preference.

### Task Object
```json
{
  "id": "t-101",
  "title": "Design System Architecture & Tokens",
  "description": "Establish unified CSS variables and glassmorphism styling guide.",
  "category": "design",
  "priority": "high",
  "status": "in-progress",
  "dueDate": "2026-10-27",
  "dueTime": "16:00",
  "subtasks": [
    { "id": "s-1", "title": "Export Figma color swatches", "completed": true },
    { "id": "s-2", "title": "Define font scaling tokens", "completed": true },
    { "id": "s-3", "title": "Document micro-interactions", "completed": false }
  ],
  "tags": ["UI/UX", "Tokens", "Design"],
  "estimatedMinutes": 180,
  "timeSpentMinutes": 95,
  "createdAt": "2026-10-24T12:00:00.000Z",
  "completedAt": null
}
```

### Category Object
```json
{
  "id": "dev",
  "name": "Engineering",
  "color": "#10b981"
}
```

### Exporting & Importing Data
Click the **💾 (Backup & Export)** button in the top header:
1. **JSON Export**: Downloads `taskflow-backup-YYYY-MM-DD.json` containing complete state for backups or moving to another computer.
2. **CSV Export**: Downloads `taskflow-tasks-YYYY-MM-DD.csv` formatted for Microsoft Excel, Apple Numbers, or Google Sheets.
3. **JSON Import**: Upload any previous JSON backup file with automatic schema validation and live re-render.
4. **Reset to Demo**: Restores the default pre-populated engineering and design demo tasks.

---

## 🎨 Customization & Theming

TaskFlow Pro supports instant switching between Dark and Light mode:
- **Dark Mode (Default)**: Deep obsidian background (`#090d16`), elevated slate cards (`#1e293b`), semi-transparent glass borders, and radiant violet accents.
- **Light Mode**: Crisp alabaster background (`#f8fafc`), clean white cards (`#ffffff`), slate borders (`#e2e8f0`), and deep indigo accents.

To adjust colors or typography, simply edit [css/variables.css](css/variables.css).

---

## 🔒 Offline First & Data Privacy

- **100% Client-Side**: No user data is sent to external servers or cloud services.
- **No Third-Party Trackers**: No analytics scripts, cookies, or external beaconing.
- **Zero Lock-In**: Complete data sovereignty with instant JSON and CSV exports.

---

## 📄 License

This project is licensed under the **MIT License**. You are free to modify, distribute, and integrate it into your personal or commercial workflows.

---

## 👨‍💻 Author

Made with ❤️ by [**@aj0710**](https://github.com/aj0710)

[![GitHub](https://img.shields.io/badge/GitHub-aj0710-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/aj0710)

