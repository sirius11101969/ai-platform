import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { createAiTask, fetchAiTask, fetchAiTasks, fetchProfile, updateStoredUser } from "../services/api";
import { orders, quickActions, userProfile } from "../data/mockData";

const taskTypeLabels = {
  ai_content_generation: "AI content generation",
  ai_sales_reply: "AI sales reply",
  ai_telegram_outreach: "AI Telegram outreach",
  ai_crm_follow_up: "AI CRM follow-up",
};

const taskTypeDescriptions = {
  ai_content_generation: "Generate premium campaign copy, product angles, and CTAs.",
  ai_sales_reply: "Draft a sharp consultative reply for warm sales conversations.",
  ai_telegram_outreach: "Create concise Telegram outreach sequences for leads.",
  ai_crm_follow_up: "Produce CRM notes, next actions, and follow-up cadence.",
};

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

const initialTaskForm = {
  type: "ai_content_generation",
  prompt: "",
};

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderTaskResult(result) {
  if (!result) return "Result will appear after the AI worker finishes execution.";
  if (result.content) return result.content;
  if (result.message) return result.message;
  if (Array.isArray(result.bullets)) return result.bullets.join("\n• ");
  if (Array.isArray(result.steps)) return result.steps.join("\n• ");
  return JSON.stringify(result, null, 2);
}

function buildActivityFeed(tasks) {
  return tasks.flatMap((task) => {
    const label = taskTypeLabels[task.type] || task.type;
    const events = [
      {
        id: `${task.id}-created`,
        status: "pending",
        title: `${label} created`,
        detail: `${task.credits_spent} credits reserved and worker queued.`,
        timestamp: task.created_at,
      },
    ];

    if (["processing", "completed", "failed"].includes(task.status)) {
      events.push({
        id: `${task.id}-processing`,
        status: "processing",
        title: `${label} processing`,
        detail: "AI execution engine picked up the task.",
        timestamp: task.updated_at || task.created_at,
      });
    }

    if (["completed", "failed"].includes(task.status)) {
      events.push({
        id: `${task.id}-${task.status}`,
        status: task.status,
        title: task.status === "completed" ? `${label} completed` : `${label} failed`,
        detail: task.status === "completed" ? "Result artifacts are ready in recent tasks." : "Worker returned an error. Try again with a refined prompt.",
        timestamp: task.updated_at || task.created_at,
      });
    }

    return events;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8);
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [costs, setCosts] = useState({});
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDashboard({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [profileResponse, tasksResponse] = await Promise.all([fetchProfile(), fetchAiTasks()]);
      setProfile(profileResponse.user || null);
      setTasks(tasksResponse.tasks || []);
      setCosts(tasksResponse.costs || {});
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить dashboard");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const activeTasks = tasks.filter((task) => ["pending", "processing"].includes(task.status));
    if (activeTasks.length === 0) return undefined;

    const interval = window.setInterval(async () => {
      try {
        const updates = await Promise.all(activeTasks.map((task) => fetchAiTask(task.id)));
        setTasks((currentTasks) => currentTasks.map((task) => {
          const updated = updates.find((response) => response.task?.id === task.id)?.task;
          return updated || task;
        }));
      } catch (_error) {
        // Keep the current task list visible; the next manual refresh can recover.
      }
    }, 1400);

    return () => window.clearInterval(interval);
  }, [tasks]);

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const activeTasks = tasks.filter((task) => ["pending", "processing"].includes(task.status)).length;
  const creditsSpent = tasks.reduce((sum, task) => sum + Number(task.credits_spent || 0), 0);
  const creditBalance = Number(profile?.credits || 0);
  const creditsUsedPercent = Math.min(100, Math.round((creditsSpent / Math.max(creditBalance + creditsSpent, 1)) * 100));

  const sortedTasks = useMemo(() => tasks.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [tasks]);
  const recentTasks = sortedTasks.slice(0, 5);
  const activityFeed = useMemo(() => buildActivityFeed(sortedTasks), [sortedTasks]);
  const selectedCost = costs[taskForm.type] || 0;

  async function handleCreateTask(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await createAiTask(taskForm);
      setTasks((currentTasks) => [response.task, ...currentTasks]);
      setProfile((currentProfile) => currentProfile ? { ...currentProfile, credits: response.remainingCredits } : currentProfile);
      updateStoredUser({ credits: response.remainingCredits });
      setTaskForm(initialTaskForm);
      setModalOpen(false);
      setMessage("AI task created, credits deducted, and execution worker started.");
    } catch (requestError) {
      if (requestError.status === 402) {
        setError(`${requestError.message}. Пополните баланс или выберите задачу дешевле.`);
      } else {
        setError(requestError.message || "Не удалось создать AI-задачу");
      }
    } finally {
      setSaving(false);
    }
  }

  const displayProfile = profile || userProfile;

  return (
    <main className="workspace-page ai-os-page">
      <PageHeading
        eyebrow="Dashboard"
        title="AI operating system"
        copy="Create, fund, execute, and monitor AI work from one premium JWT-protected workspace."
        action={<button className="btn primary compact pulse-action" type="button" onClick={() => setModalOpen(true)}>Create AI task</button>}
      />

      {error && <p className="auth-error dashboard-alert">{error}</p>}
      {message && <p className="success-alert dashboard-alert">{message}</p>}

      <section className="dashboard-stats">
        <StatCard label="Credits balance" value={loading ? "…" : creditBalance.toLocaleString("ru-RU")} hint="Available for new AI execution" />
        <StatCard label="AI tasks" value={loading ? "…" : String(tasks.length)} hint={`${activeTasks} active · ${completedTasks} completed`} tone="violet" />
        <StatCard label="Credits spent" value={loading ? "…" : creditsSpent.toLocaleString("ru-RU")} hint="Deducted through credits ledger" tone="pink" />
      </section>

      <section className="app-grid two-columns">
        <Panel className="profile-card ai-command-card">
          <span className="eyebrow">Command center</span>
          <div className="profile-hero">
            <div className="profile-avatar">{String(displayProfile.email || displayProfile.name || "AI").slice(0, 2).toUpperCase()}</div>
            <div>
              <h3>{displayProfile.email || displayProfile.name}</h3>
              <p>{displayProfile.plan || "free"} · JWT protected workspace</p>
              <span>{displayProfile.id || displayProfile.company}</span>
            </div>
          </div>
          <div className="task-type-grid">
            {Object.keys(taskTypeLabels).map((type) => (
              <button type="button" key={type} onClick={() => { setTaskForm({ ...initialTaskForm, type }); setModalOpen(true); }}>
                <b>{taskTypeLabels[type]}</b>
                <span>{costs[type] || 0} credits</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="credits-card ai-orb-card">
          <span className="eyebrow">Execution capacity</span>
          <div className="credits-orb"><span>{creditBalance.toLocaleString("ru-RU")}</span></div>
          <p>{activeTasks > 0 ? `${activeTasks} AI tasks are executing right now` : "Balance is ready for the next AI task"}</p>
          <div className="progress-track"><i style={{ width: `${creditsUsedPercent}%` }} /></div>
          <small>{creditsUsedPercent}% of total allocated credits used</small>
        </Panel>
      </section>

      <section className="app-grid two-columns align-start">
        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Recent tasks</span>
              <h3>AI execution queue</h3>
            </div>
            <button className="ghost-button" type="button" onClick={() => loadDashboard()} disabled={loading}>Refresh</button>
          </div>
          <div className="task-list ai-history-list recent-task-widget">
            {loading && <div className="skeleton-stack"><i /><i /><i /></div>}
            {!loading && recentTasks.length === 0 && <p className="empty-state">No AI tasks yet. Launch the first task from the modal.</p>}
            {recentTasks.map((task) => (
              <article className={`task-card ai-task-row ${task.status}`} key={task.id}>
                <div>
                  <strong>{taskTypeLabels[task.type] || task.type}</strong>
                  <span>{statusLabels[task.status] || task.status} · {task.credits_spent} credits · {formatDate(task.created_at)}</span>
                  <small>{task.prompt}</small>
                  <pre>{renderTaskResult(task.result)}</pre>
                </div>
                <b>{statusLabels[task.status] || task.status}</b>
              </article>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Live activity</span>
              <h3>Worker feed</h3>
            </div>
            <span className="live-pill"><i />Live</span>
          </div>
          <div className="live-activity-feed">
            {loading && <div className="skeleton-stack"><i /><i /><i /></div>}
            {!loading && activityFeed.length === 0 && <p className="empty-state">Activity feed is waiting for the first task event.</p>}
            {activityFeed.map((event) => (
              <article className={`activity-event ${event.status}`} key={event.id}>
                <span />
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.detail}</p>
                  <small>{formatDate(event.timestamp)}</small>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <Panel>
        <div className="panel-head">
          <div>
            <span className="eyebrow">Orders & quick actions</span>
            <h3>Оплаты, тариф и быстрые действия</h3>
          </div>
          <Link className="ghost-button" to="/crm">Open CRM</Link>
        </div>
        <div className="order-list dashboard-orders">
          {orders.map((order) => (
            <article key={order.title}>
              <div>
                <strong>{order.title}</strong>
                <span>{order.meta}</span>
              </div>
              <b>{order.amount}</b>
            </article>
          ))}
        </div>
        <div className="quick-actions dashboard-quick-actions">
          {quickActions.map((action) => <button type="button" key={action}>{action}</button>)}
        </div>
      </Panel>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModalOpen(false); }}>
          <section className="ai-task-modal" role="dialog" aria-modal="true" aria-labelledby="ai-task-modal-title">
            <div className="modal-glow" />
            <div className="panel-head">
              <div>
                <span className="eyebrow">Create AI task</span>
                <h3 id="ai-task-modal-title">Launch AI execution</h3>
              </div>
              <button className="modal-close" type="button" onClick={() => setModalOpen(false)} disabled={saving}>×</button>
            </div>
            <form className="ai-task-form" onSubmit={handleCreateTask}>
              <div className="modal-task-types">
                {Object.keys(taskTypeLabels).map((type) => (
                  <label className={taskForm.type === type ? "selected" : ""} key={type}>
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={taskForm.type === type}
                      onChange={(event) => setTaskForm({ ...taskForm, type: event.target.value })}
                    />
                    <b>{taskTypeLabels[type]}</b>
                    <span>{taskTypeDescriptions[type]}</span>
                    <small>{costs[type] || 0} credits</small>
                  </label>
                ))}
              </div>
              <label className="crm-field">
                <span>Execution prompt *</span>
                <textarea
                  value={taskForm.prompt}
                  onChange={(event) => setTaskForm({ ...taskForm, prompt: event.target.value })}
                  placeholder="Example: prepare a CRM follow-up for a SaaS lead after a demo; highlight ROI, next action, and Telegram touchpoint."
                  required
                />
              </label>
              <div className="modal-actions">
                <span>{selectedCost} credits will be deducted immediately</span>
                <button className="btn primary compact" disabled={saving || loading} type="submit">
                  {saving ? <><i className="button-spinner" />Launching…</> : "Create and execute"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
