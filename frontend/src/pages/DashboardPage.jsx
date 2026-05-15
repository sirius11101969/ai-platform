import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { createAiTask, fetchAiTask, fetchAiTasks, fetchProfile, updateStoredUser } from "../services/api";
import { orders, quickActions, userProfile } from "../data/mockData";

const taskTypeLabels = {
  ai_content_generation: "Генерация текста",
  ai_sales_reply: "Ответ клиенту",
  ai_crm_follow_up: "Follow-up для CRM",
  ai_telegram_outreach: "Telegram-сообщение",
};

const taskTypeDescriptions = {
  ai_content_generation: "Создаёт премиальный текст кампании, продуктовые углы и призывы к действию.",
  ai_sales_reply: "Готовит точный консультативный ответ для тёплой сделки.",
  ai_telegram_outreach: "Собирает короткие Telegram‑цепочки для лидов.",
  ai_crm_follow_up: "Формирует CRM‑заметки, следующие шаги и ритм дожима.",
};

const statusLabels = {
  pending: "Ожидает",
  processing: "В работе",
  completed: "Готово",
  failed: "Ошибка",
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


function translateTaskResultText(value) {
  return String(value)
    .replace('Premium content draft for:', 'Премиальный черновик контента для:')
    .replace('Hook: Open with the highest-impact business outcome.', 'Хук: начните с самого сильного бизнес‑результата.')
    .replace('Angle: Make the promise specific, measurable, and credible.', 'Угол подачи: сделайте обещание конкретным, измеримым и убедительным.')
    .replace('CTA: Invite the reader to launch the next AI workflow.', 'Призыв: предложите запустить следующий AI‑сценарий.')
    .replace('Hi,', 'Здравствуйте,')
    .replace('Thanks for the context:', 'Спасибо за контекст:')
    .replace('The best reply is consultative: acknowledge the need, connect it to a clear ROI outcome, and suggest a short next step.', 'Лучший ответ — консультативный: подтвердите потребность, свяжите её с понятным ROI и предложите короткий следующий шаг.')
    .replace('Recommended CTA:', 'Рекомендуемый призыв:')
    .replace('Can we map the first automation this week?', 'Можем на этой неделе спроектировать первую автоматизацию?')
    .replace('Quick Telegram sequence for:', 'Короткая Telegram‑цепочка для:')
    .replace('1) Personal opener tied to their role/company.', '1) Персональный opener с привязкой к роли или компании.')
    .replace('2) One-line pain point about missed follow-ups or slow CRM work.', '2) Одна строка о боли: пропущенный дожим или медленная работа CRM.')
    .replace('3) Soft CTA: ask if they want a 2-minute workflow audit.', '3) Мягкий призыв: спросите, нужен ли 2‑минутный аудит процесса.')
    .replace('Log context:', 'Зафиксируйте контекст:')
    .replace('Create next action with a clear owner and due date.', 'Создайте следующий шаг с владельцем и сроком.')
    .replace('Send a personalized recap within 2 hours.', 'Отправьте персональное резюме в течение 2 часов.')
    .replace('Schedule the next touch based on lead priority.', 'Запланируйте следующее касание по приоритету лида.')
}

function renderTaskResult(result) {
  if (!result) return "Результат появится после завершения работы AI‑воркера.";
  if (result.error) return `Ошибка выполнения: ${result.error}`;
  if (result.content) return translateTaskResultText(result.content);
  if (result.message) return translateTaskResultText(result.message);
  if (Array.isArray(result.bullets)) return result.bullets.map(translateTaskResultText).join("\n• ");
  if (Array.isArray(result.steps)) return result.steps.map(translateTaskResultText).join("\n• ");
  return JSON.stringify(result, null, 2);
}

function buildActivityFeed(tasks) {
  return tasks.flatMap((task) => {
    const label = taskTypeLabels[task.type] || task.type;
    const events = [
      {
        id: `${task.id}-created`,
        status: "pending",
        title: `${label} создана`,
        detail: `${task.credits_spent} AI‑кредитов зарезервировано, задача поставлена в очередь.`,
        timestamp: task.created_at,
      },
    ];

    if (["processing", "completed", "failed"].includes(task.status)) {
      events.push({
        id: `${task.id}-processing`,
        status: "processing",
        title: `${label} выполняется`,
        detail: "AI‑движок взял задачу в работу.",
        timestamp: task.updated_at || task.created_at,
      });
    }

    if (["completed", "failed"].includes(task.status)) {
      events.push({
        id: `${task.id}-${task.status}`,
        status: task.status,
        title: task.status === "completed" ? `${label} завершено` : `${label} завершилась ошибкой`,
        detail: task.status === "completed" ? "Результат OpenAI доступен в списке последних задач." : (task.error || "Воркер вернул ошибку. Уточните промпт и попробуйте снова."),
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
      setError(requestError.message || "Не удалось загрузить дашборд");
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
      setMessage("AI‑задача создана, AI‑кредиты списаны, выполнение через OpenAI запущено.");
    } catch (requestError) {
      if (requestError.status === 402) {
        setError(`${requestError.message}. Пополните баланс или выберите задачу дешевле.`);
      } else {
        setError(requestError.message || "Не удалось создать AI‑задачу");
      }
    } finally {
      setSaving(false);
    }
  }

  const displayProfile = profile || userProfile;

  return (
    <main className="workspace-page ai-os-page">
      <PageHeading
        eyebrow="Дашборд"
        title="AI‑операционная система продаж"
        copy="Создавайте, оплачивайте AI‑кредитами, запускайте и контролируйте AI‑работу из единого защищённого JWT рабочего пространства."
        action={<button className="btn primary compact pulse-action" type="button" onClick={() => setModalOpen(true)}>Создать AI‑задачу</button>}
      />

      {error && <p className="auth-error dashboard-alert">{error}</p>}
      {message && <p className="success-alert dashboard-alert">{message}</p>}

      <section className="dashboard-stats">
        <StatCard label="Баланс AI‑кредитов" value={loading ? "…" : creditBalance.toLocaleString("ru-RU")} hint="Доступно для новых AI‑запусков" />
        <StatCard label="AI‑задачи" value={loading ? "…" : String(tasks.length)} hint={`${activeTasks} активных · ${completedTasks} завершено`} tone="violet" />
        <StatCard label="Потрачено AI‑кредитов" value={loading ? "…" : creditsSpent.toLocaleString("ru-RU")} hint="Списано через журнал AI‑кредитов" tone="pink" />
      </section>

      <section className="app-grid two-columns">
        <Panel className="profile-card ai-command-card">
          <span className="eyebrow">Центр управления</span>
          <div className="profile-hero">
            <div className="profile-avatar">{String(displayProfile.email || displayProfile.name || "AI").slice(0, 2).toUpperCase()}</div>
            <div>
              <h3>{displayProfile.email || displayProfile.name}</h3>
              <p>{displayProfile.plan || "бесплатный"} · защищённое JWT‑пространство</p>
              <span>{displayProfile.id || displayProfile.company}</span>
            </div>
          </div>
          <div className="task-type-grid">
            {Object.keys(taskTypeLabels).map((type) => (
              <button type="button" key={type} onClick={() => { setTaskForm({ ...initialTaskForm, type }); setModalOpen(true); }}>
                <b>{taskTypeLabels[type]}</b>
                <span>{costs[type] || 0} AI‑кредитов</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="credits-card ai-orb-card">
          <span className="eyebrow">Ресурс выполнения</span>
          <div className="credits-orb"><span>{creditBalance.toLocaleString("ru-RU")}</span></div>
          <p>{activeTasks > 0 ? `${activeTasks} AI‑задач выполняется сейчас` : "Баланс готов к следующей AI‑задаче"}</p>
          <div className="progress-track"><i style={{ width: `${creditsUsedPercent}%` }} /></div>
          <small>{creditsUsedPercent}% выделенных AI‑кредитов использовано</small>
        </Panel>
      </section>

      <section className="app-grid two-columns align-start">
        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Последние задачи</span>
              <h3>Очередь AI‑выполнения</h3>
            </div>
            <button className="ghost-button" type="button" onClick={() => loadDashboard()} disabled={loading}>Обновить</button>
          </div>
          <div className="task-list ai-history-list recent-task-widget">
            {loading && <div className="skeleton-stack"><i /><i /><i /></div>}
            {!loading && recentTasks.length === 0 && <p className="empty-state">AI‑задач пока нет. Запустите первую задачу из модального окна.</p>}
            {recentTasks.map((task) => (
              <article className={`task-card ai-task-row ${task.status}`} key={task.id}>
                <div>
                  <strong>{taskTypeLabels[task.type] || task.type}</strong>
                  <span>{statusLabels[task.status] || task.status} · {task.credits_spent} AI‑кредитов · {formatDate(task.created_at)}</span>
                  <small>{task.prompt}</small>
                  <pre>{renderTaskResult(task.result)}</pre>
                  {task.result?.model && <small>OpenAI · {task.result.model}</small>}
                  {task.error && <small className="task-error">{task.error}</small>}
                </div>
                <b>{statusLabels[task.status] || task.status}</b>
              </article>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Живая активность</span>
              <h3>Лента воркера</h3>
            </div>
            <span className="live-pill"><i />Онлайн</span>
          </div>
          <div className="live-activity-feed">
            {loading && <div className="skeleton-stack"><i /><i /><i /></div>}
            {!loading && activityFeed.length === 0 && <p className="empty-state">Лента активности ждёт первое событие задачи.</p>}
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
            <span className="eyebrow">Оплаты и быстрые действия</span>
            <h3>Оплаты, тариф и быстрые действия</h3>
          </div>
          <Link className="ghost-button" to="/crm">Открыть CRM</Link>
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
                <span className="eyebrow">Создать AI‑задачу</span>
                <h3 id="ai-task-modal-title">Запустить AI‑выполнение</h3>
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
                    <small>{costs[type] || 0} AI‑кредитов</small>
                  </label>
                ))}
              </div>
              <label className="crm-field">
                <span>Промпт выполнения *</span>
                <textarea
                  value={taskForm.prompt}
                  onChange={(event) => setTaskForm({ ...taskForm, prompt: event.target.value })}
                  placeholder="Пример: подготовь CRM‑дожим для SaaS‑лида после демо; подчеркни ROI, следующий шаг и касание в Telegram."
                  required
                />
              </label>
              <div className="modal-actions">
                <span>{selectedCost} AI‑кредитов будет списано сразу</span>
                <button className="btn primary compact" disabled={saving || loading} type="submit">
                  {saving ? <><i className="button-spinner" />Запускаем…</> : "Создать и выполнить"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
