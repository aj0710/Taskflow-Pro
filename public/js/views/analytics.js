/* ===================================================================
   TaskFlow Pro — Analytics & Productivity Insights Dashboard (Pure SVG)
   =================================================================== */

import { state } from '../state.js';

export class AnalyticsView {
  constructor(container) {
    this.container = container;
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    state.on('tasks:updated', () => {
      if (state.activeView === 'analytics') this.render();
    });
  }

  render() {
    if (!this.container) return;

    const allTasks = state.tasks;
    const totalCount = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'done');
    const completedCount = completedTasks.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueCount = allTasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length;
    const totalMinutesSpent = allTasks.reduce((acc, t) => acc + (t.timeSpentMinutes || 0), 0);
    const hoursSpent = Math.floor(totalMinutesSpent / 60);
    const minsSpent = totalMinutesSpent % 60;

    // Status Distribution
    const statusCounts = {
      done: completedCount,
      'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
      todo: allTasks.filter(t => t.status === 'todo').length,
      review: allTasks.filter(t => t.status === 'review').length,
      backlog: allTasks.filter(t => t.status === 'backlog').length
    };

    // Priority Counts
    const priorityCounts = {
      urgent: allTasks.filter(t => t.priority === 'urgent').length,
      high: allTasks.filter(t => t.priority === 'high').length,
      medium: allTasks.filter(t => t.priority === 'medium').length,
      low: allTasks.filter(t => t.priority === 'low').length
    };

    // Category Distribution
    const categoryStats = state.categories.map(cat => ({
      name: cat.name,
      color: cat.color,
      count: allTasks.filter(t => t.category === cat.id).length
    }));
    const maxCatCount = Math.max(...categoryStats.map(c => c.count), 1);

    this.container.innerHTML = `
      <div class="view-toolbar">
        <div class="view-heading-group">
          <h2>Productivity Intelligence</h2>
          <span class="view-subheading">Data metrics, velocity tracking, and workload distribution</span>
        </div>
      </div>

      <!-- Top Metric KPI Cards -->
      <div class="analytics-grid">
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Completion Rate</span>
            <span class="stat-value" style="color:var(--status-done);">${completionRate}%</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${completedCount} of ${totalCount} completed</span>
          </div>
          <div class="stat-icon-wrap" style="color:var(--status-done); background:var(--status-done-bg);">🎯</div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Focus Time Logged</span>
            <span class="stat-value">${hoursSpent}h ${minsSpent}m</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">Across active projects</span>
          </div>
          <div class="stat-icon-wrap">⏱️</div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Active Work Items</span>
            <span class="stat-value">${totalCount - completedCount}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${statusCounts['in-progress']} currently in progress</span>
          </div>
          <div class="stat-icon-wrap" style="color:var(--status-medium); background:var(--status-medium-bg);">⚡</div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Overdue Alerts</span>
            <span class="stat-value" style="color: ${overdueCount > 0 ? 'var(--status-urgent)' : 'var(--status-done)'};">${overdueCount}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${overdueCount > 0 ? 'Requires immediate action' : 'All clear!'}</span>
          </div>
          <div class="stat-icon-wrap" style="color:var(--status-urgent); background:var(--status-urgent-bg);">⚠️</div>
        </div>
      </div>

      <!-- Visual Charts Grid -->
      <div class="charts-row">
        <!-- SVG Donut Chart: Workflow Status -->
        <div class="chart-card">
          <div class="chart-card-header">
            <h3>Workflow Status Breakdown</h3>
            <span style="font-size:0.75rem; color:var(--text-muted);">All Tasks</span>
          </div>
          <div class="chart-wrap">
            ${this.renderDonutChart(statusCounts, totalCount)}
          </div>
        </div>

        <!-- SVG Bar Chart: Projects Distribution -->
        <div class="chart-card">
          <div class="chart-card-header">
            <h3>Project Workload Distribution</h3>
            <span style="font-size:0.75rem; color:var(--text-muted);">Volume by category</span>
          </div>
          <div class="chart-wrap" style="flex-direction:column; justify-content:center; gap:0.85rem; width:100%;">
            ${categoryStats.map(cat => {
              const pct = Math.round((cat.count / maxCatCount) * 100);
              return `
                <div style="width:100%;">
                  <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:0.25rem;">
                    <span style="font-weight:600; display:flex; align-items:center; gap:0.4rem;">
                      <span style="width:8px; height:8px; border-radius:50%; background:${cat.color};"></span>
                      ${cat.name}
                    </span>
                    <span style="color:var(--text-muted); font-weight:600;">${cat.count} tasks</span>
                  </div>
                  <div style="height:8px; background:rgba(255,255,255,0.06); border-radius:var(--radius-full); overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:${cat.color}; border-radius:var(--radius-full); transition:width 0.6s ease;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Priority Matrix Snapshot & Recommendations -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-card-header">
            <h3>Priority Distribution</h3>
            <span style="font-size:0.75rem; color:var(--text-muted);">Urgency Levels</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:1rem; padding:0.5rem 0;">
            <div style="background:var(--status-urgent-bg); border:1px solid rgba(244,63,94,0.3); border-radius:var(--radius-md); padding:1rem; text-align:center;">
              <span style="font-size:0.75rem; font-weight:700; color:var(--status-urgent); text-transform:uppercase;">Urgent</span>
              <div style="font-size:2rem; font-weight:800; color:var(--status-urgent);">${priorityCounts.urgent}</div>
            </div>
            <div style="background:var(--status-high-bg); border:1px solid rgba(245,158,11,0.3); border-radius:var(--radius-md); padding:1rem; text-align:center;">
              <span style="font-size:0.75rem; font-weight:700; color:var(--status-high); text-transform:uppercase;">High</span>
              <div style="font-size:2rem; font-weight:800; color:var(--status-high);">${priorityCounts.high}</div>
            </div>
            <div style="background:var(--status-medium-bg); border:1px solid rgba(56,189,248,0.3); border-radius:var(--radius-md); padding:1rem; text-align:center;">
              <span style="font-size:0.75rem; font-weight:700; color:var(--status-medium); text-transform:uppercase;">Medium</span>
              <div style="font-size:2rem; font-weight:800; color:var(--status-medium);">${priorityCounts.medium}</div>
            </div>
            <div style="background:var(--status-low-bg); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-md); padding:1rem; text-align:center;">
              <span style="font-size:0.75rem; font-weight:700; color:var(--status-low); text-transform:uppercase;">Low</span>
              <div style="font-size:2rem; font-weight:800; color:var(--status-low);">${priorityCounts.low}</div>
            </div>
          </div>
        </div>

        <div class="chart-card" style="background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.06)); border-color: rgba(99,102,241,0.25);">
          <div class="chart-card-header">
            <h3>Productivity Insights</h3>
            <span>💡</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.95rem; font-size:0.875rem;">
            <div style="display:flex; gap:0.75rem;">
              <span>🚀</span>
              <div>
                <strong>Strong Momentum:</strong> You have completed <strong>${completedCount}</strong> tasks so far.
              </div>
            </div>
            <div style="display:flex; gap:0.75rem;">
              <span>⏳</span>
              <div>
                <strong>Focus Recommendation:</strong> Schedule 2 Pomodoro sessions for <em>${priorityCounts.urgent > 0 ? 'Urgent tasks' : 'In-progress projects'}</em> to prevent bottlenecks.
              </div>
            </div>
            <div style="display:flex; gap:0.75rem;">
              <span>🗓️</span>
              <div>
                <strong>Deadline Alert:</strong> ${overdueCount > 0 ? `${overdueCount} task(s) missed their estimated delivery date.` : 'Zero overdue tasks! Your schedule is fully on track.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderDonutChart(counts, total) {
    if (total === 0) return `<span style="color:var(--text-muted)">No data</span>`;

    const segments = [
      { label: 'Completed', count: counts.done, color: '#10b981' },
      { label: 'In Progress', count: counts['in-progress'], color: '#f59e0b' },
      { label: 'To Do', count: counts.todo, color: '#38bdf8' },
      { label: 'In Review', count: counts.review, color: '#a855f7' },
      { label: 'Backlog', count: counts.backlog, color: '#64748b' }
    ].filter(s => s.count > 0);

    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    const circles = segments.map(seg => {
      const strokeLength = (seg.count / total) * circumference;
      const strokeOffset = circumference - strokeLength;
      const rotation = (accumulatedAngle / total) * 360 - 90;
      accumulatedAngle += seg.count;

      return `
        <circle cx="100" cy="100" r="${radius}"
          fill="none"
          stroke="${seg.color}"
          stroke-width="20"
          stroke-dasharray="${strokeLength} ${circumference}"
          transform="rotate(${rotation} 100 100)"
          stroke-linecap="round"
          style="transition: stroke-dasharray 0.8s ease;"
        />
      `;
    }).join('');

    return `
      <div style="display:flex; align-items:center; gap:2rem; width:100%; justify-content:center; flex-wrap:wrap;">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="${radius}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="20" />
          ${circles}
          <text x="100" y="96" text-anchor="middle" fill="var(--text-primary)" font-size="22" font-weight="800" font-family="var(--font-heading)">${total}</text>
          <text x="100" y="114" text-anchor="middle" fill="var(--text-muted)" font-size="11" font-weight="600" text-transform="uppercase">Tasks</text>
        </svg>

        <div style="display:flex; flex-direction:column; gap:0.45rem;">
          ${segments.map(s => `
            <div style="display:flex; align-items:center; gap:0.6rem; font-size:0.82rem;">
              <span style="width:10px; height:10px; border-radius:50%; background:${s.color};"></span>
              <span style="color:var(--text-secondary); width:85px;">${s.label}</span>
              <strong style="color:var(--text-primary);">${s.count}</strong>
              <span style="color:var(--text-muted); font-size:0.75rem;">(${Math.round((s.count/total)*100)}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}
