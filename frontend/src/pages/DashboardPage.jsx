import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { createAiTask, fetchAiApprovalQueue, fetchAiCommandCenter, fetchAiTask, fetchAiTasks, fetchCrmStats, fetchProfile, getRevenueIntelligence, triggerRevenueAnalysis, updateStoredUser } from "../services/api";
import { orders, quickActions, userProfile } from "../data/mockData";
import { buildRecommendationQueue, getForecastWidget, getRevenueCards } from "../utils/revenueIntelligence";

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

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function pipelineHealthLabel(status) {
  return ({ healthy: "Healthy", warning: "Warning", critical: "Critical" }[status] || "Healthy");
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
  const [crmStats, setCrmStats] = useState(null);
  const [aiCommandMetrics, setAiCommandMetrics] = useState(null);
  const [aiApprovalMetrics, setAiApprovalMetrics] = useState(null);
  const [revenueIntelligence, setRevenueIntelligence] = useState(null);
  const [costs, setCosts] = useState({});
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [revenueBusy, setRevenueBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDashboard({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [profileResponse, tasksResponse, crmResponse, commandResponse, approvalResponse, revenueResponse] = await Promise.all([fetchProfile(), fetchAiTasks(), fetchCrmStats(), fetchAiCommandCenter(), fetchAiApprovalQueue(), getRevenueIntelligence()]);
      setProfile(profileResponse.user || null);
      setTasks(tasksResponse.tasks || []);
      setCosts(tasksResponse.costs || {});
      setCrmStats(crmResponse.stats || null);
      setAiCommandMetrics(commandResponse.commandCenter?.metrics || null);
      setAiApprovalMetrics(approvalResponse.metrics || null);
      setRevenueIntelligence(revenueResponse.intelligence || null);
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
  const aiRevenueUnderControl = Number(aiCommandMetrics?.revenueUnderAi || crmStats?.pipelineValue || 0);
  const revenueCards = getRevenueCards(revenueIntelligence || {});
  const forecastWidget = getForecastWidget(revenueIntelligence || {});
  const revenueActions = buildRecommendationQueue(revenueIntelligence || {}).slice(0, 5);

  async function handleRunRevenueAnalysis() {
    setRevenueBusy(true);
    setError("");
    setMessage("");
    try {
      await triggerRevenueAnalysis({ limit: 100 });
      const revenueResponse = await getRevenueIntelligence();
      setRevenueIntelligence(revenueResponse.intelligence || null);
      setMessage("Revenue analysis jobs queued and forecast generated.");
    } catch (requestError) {
      setError(requestError.message || "Не удалось запустить Revenue Analysis");
    } finally {
      setRevenueBusy(false);
    }
  }

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
        <StatCard label="Лидов в CRM" value={loading ? "…" : String(crmStats?.totalLeads || 0)} hint={`Новые ${crmStats?.newLeadsCount || 0} · конверсия ${crmStats?.conversionRate || 0}%`} tone="pink" />
        <StatCard label="Лиды с лендинга сегодня" value={loading ? "…" : String(crmStats?.landingLeadsToday || 0)} hint="Публичные формы → CRM → AI SDR" tone="violet" />
        <StatCard label="Горячие лиды с лендинга" value={loading ? "…" : String(crmStats?.hotLandingLeads || 0)} hint="AI score 75+ или hot temperature" tone="pink" />
        <StatCard label="Заявки с сайта в ожидании" value={loading ? "…" : String(crmStats?.pendingWebsiteLeads || 0)} hint="Новые landing leads ждут обработки" tone="violet" />
        <StatCard label="Воронка CRM" value={loading ? "…" : new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(crmStats?.pipelineValue || 0))} hint={`${crmStats?.wonDeals || 0} успешно · ${crmStats?.lostDeals || 0} потеряно`} />
        <StatCard label="AI действий сегодня" value={loading ? "…" : String(crmStats?.aiMetrics?.sentToday || crmStats?.aiMetrics?.actionsToday || 0)} hint={`${crmStats?.aiMetrics?.pendingApproval || 0} ждут одобрения · ${crmStats?.aiMetrics?.executionSuccessRate || crmStats?.aiMetrics?.efficiency || 0}% success`} tone="violet" />
        <StatCard label="AI‑сделки" value={loading ? "…" : String(crmStats?.aiMetrics?.assistedDeals || 0)} hint={`конверсия ${crmStats?.aiMetrics?.conversionRate || 0}%`} tone="pink" />
        <StatCard label="Priority Leads" value={loading ? "…" : String(crmStats?.aiMetrics?.priorityLeads || 0)} hint="AI score 76+ или priority badge" tone="pink" />
        <StatCard label="At-risk Deals" value={loading ? "…" : String(crmStats?.aiMetrics?.dealsAtRisk || crmStats?.aiMetrics?.atRiskDeals || 0)} hint="ghosting / stalled / inactive risk" tone="violet" />
        <StatCard label="Hot Leads" value={loading ? "…" : String(crmStats?.aiMetrics?.hotLeads || 0)} hint={`средний AI score ${crmStats?.aiMetrics?.averageLeadScore || 0}/100`} tone="pink" />
        <StatCard label="Leads needing follow-up" value={loading ? "…" : String(crmStats?.aiMetrics?.leadsNeedingFollowUp || crmStats?.aiMetrics?.followUpsPending || 0)} hint="риск или нет свежего касания" />
        <StatCard label="Тёплые лиды" value={loading ? "…" : String(crmStats?.aiMetrics?.warmLeads || 0)} hint={`conversion probability ${crmStats?.aiMetrics?.conversionProbability || crmStats?.aiMetrics?.conversionForecast || 0}%`} tone="violet" />
        <StatCard label="AI прогноз выручки" value={loading ? "…" : new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(crmStats?.aiMetrics?.aiForecastedRevenue || crmStats?.aiMetrics?.predictedRevenue || 0))} hint={`forecast ${crmStats?.aiMetrics?.conversionForecast || 0}%`} tone="violet" />
        <StatCard label="Активные AI сотрудники" value={loading ? "…" : String(aiCommandMetrics?.activeWorkers || 0)} hint={`${aiCommandMetrics?.totalWorkers || 0} ролей AI workforce`} />
        <StatCard label="Очередь AI задач" value={loading ? "…" : String(aiCommandMetrics?.queueActive || 0)} hint="Видимые AI рекомендации и очередь исполнения" tone="violet" />
        <StatCard label="AI ждут одобрения" value={loading ? "…" : String(aiApprovalMetrics?.waitingApproval || aiCommandMetrics?.pendingActions || crmStats?.aiMetrics?.pendingApproval || 0)} hint={`${aiApprovalMetrics?.approvedToday || 0} одобрено сегодня · человек утверждает отправку`} tone="pink" />
        <StatCard label="AI выполнено сегодня" value={loading ? "…" : String(aiApprovalMetrics?.executedToday || 0)} hint={`${aiApprovalMetrics?.failedToday || 0} ошибок сегодня · success rate ${aiApprovalMetrics?.successRate || 0}%`} tone="violet" />
        <StatCard label="AI сообщений создано сегодня" value={loading ? "…" : String(crmStats?.aiMetrics?.aiMessagesDraftedToday || crmStats?.aiMetrics?.outreachGeneratedToday || 0)} hint="Черновики Telegram/email и follow-up после AI qualification" tone="violet" />
        <StatCard label="AI сообщений отправлено сегодня" value={loading ? "…" : String(crmStats?.aiMetrics?.aiMessagesSentToday || aiApprovalMetrics?.executedToday || 0)} hint="Только после approval менеджера" tone="pink" />
        <StatCard label="Ответы получены сегодня" value={loading ? "…" : String(crmStats?.aiMetrics?.repliesReceivedToday || 0)} hint="Inbound Telegram replies привязаны к лидам" />
        <StatCard label="Pending approvals" value={loading ? "…" : String(crmStats?.aiMetrics?.pendingApprovals || aiApprovalMetrics?.waitingApproval || 0)} hint="AI черновики и stage suggestions ждут менеджера" tone="pink" />
        <StatCard label="Meetings scheduled by AI" value={loading ? "…" : String(crmStats?.aiMetrics?.meetingsScheduledByAi || aiApprovalMetrics?.meetingsScheduledByAi || 0)} hint="Запланированы после approval" tone="violet" />
        <StatCard label="Pending meeting proposals" value={loading ? "…" : String(crmStats?.aiMetrics?.pendingMeetingProposals || aiApprovalMetrics?.pendingMeetingProposals || 0)} hint="Demo-созвоны ждут решения менеджера" tone="pink" />
        <StatCard label="AI stage recommendations pending" value={loading ? "…" : String(crmStats?.aiMetrics?.stageRecommendationsPending || 0)} hint="stage_change_recommendation ждёт approval" tone="pink" />
        <StatCard label="Revenue At Risk" value={loading ? "…" : formatCurrency(crmStats?.aiMetrics?.revenueAtRisk || 0)} hint="weighted forecast in at-risk/lost-risk deals" tone="pink" />
        <StatCard label="High Probability Deals" value={loading ? "…" : String(crmStats?.aiMetrics?.highProbabilityDeals || 0)} hint="probability ≥ 70%" tone="violet" />
        <StatCard label="Stalled Opportunities" value={loading ? "…" : String(crmStats?.aiMetrics?.stalledOpportunities || crmStats?.aiMetrics?.inactiveOpportunities || 0)} hint="нет активности более 7 дней" tone="pink" />
        <StatCard label="At-risk Deals" value={loading ? "…" : String(crmStats?.aiMetrics?.dealsAtRisk || crmStats?.aiMetrics?.atRiskDeals || 0)} hint="stalled / no engagement / weak qualification" tone="violet" />
        <StatCard label="Avg Probability" value={loading ? "…" : `${crmStats?.aiMetrics?.averageProbability || crmStats?.aiMetrics?.avgProbability || crmStats?.aiMetrics?.conversionForecast || 0}%`} hint="active pipeline average probability" />
        <StatCard label="Inactive opportunities" value={loading ? "…" : String(crmStats?.aiMetrics?.inactiveOpportunities || 0)} hint="нет активности более 3 дней" tone="pink" />
        <StatCard label="Pipeline Health" value={loading ? "…" : pipelineHealthLabel(crmStats?.aiMetrics?.pipelineHealthStatus)} hint={`risk revenue ${crmStats?.aiMetrics?.riskRevenueRatio || 0}% · score ${crmStats?.aiMetrics?.pipelineHealth || 0}%`} />
        <StatCard label="Outreach generated today" value={loading ? "…" : String(crmStats?.aiMetrics?.outreachGeneratedToday || 0)} hint="Telegram/email drafts after AI qualification" tone="violet" />
        <StatCard label="Outreach pending approvals" value={loading ? "…" : String(crmStats?.aiMetrics?.outreachPendingApprovals || 0)} hint="Черновики ждут ручного approval" tone="pink" />
        <StatCard label="AI response readiness" value={loading ? "…" : `${crmStats?.aiMetrics?.aiResponseReadiness || 0}%`} hint="Доля лидов с готовыми AI ответами" />
        <StatCard label="Follow-ups pending" value={loading ? "…" : String(crmStats?.aiMetrics?.autonomousFollowUpsPending || 0)} hint="AI Follow-up Center ждёт решения" tone="pink" />
        <StatCard label="Hot leads without contact" value={loading ? "…" : String(crmStats?.aiMetrics?.hotLeadsWithoutContact || 0)} hint="горячие лиды без свежего касания" tone="violet" />
        <StatCard label="Follow-ups sent today" value={loading ? "…" : String(crmStats?.aiMetrics?.autonomousFollowUpsSentToday || 0)} hint="отправлено после ручного approval" />
        <StatCard label="Stale conversations" value={loading ? "…" : String(crmStats?.aiMetrics?.staleConversations || 0)} hint="последнее касание старше 24 часов, закрытые стадии исключены" tone="pink" />
        <StatCard label="Follow-up conversion" value={`${crmStats?.aiMetrics?.followUpConversionPlaceholder || 0}%`} hint="placeholder до v2 attribution" tone="violet" />
        <StatCard label="AI эффективность" value={loading ? "…" : `${aiCommandMetrics?.efficiency || crmStats?.aiMetrics?.executionSuccessRate || crmStats?.aiMetrics?.efficiency || 0}%`} hint="Успешные запуски AI сотрудников" />
        <StatCard label="Forecast Revenue" value={loading ? "…" : formatCurrency(crmStats?.aiMetrics?.aiForecastedRevenue || crmStats?.aiMetrics?.predictedRevenue || 0)} hint="weighted expected revenue by AI probability" tone="violet" />
        <StatCard label="Выручка под контролем AI" value={loading ? "…" : formatCurrency(aiRevenueUnderControl)} hint="Плейсхолдер revenue impact по открытой воронке" tone="violet" />
        <StatCard label="Revenue Brain forecast" value={loading ? "…" : formatCurrency(revenueIntelligence?.widgets?.forecastedRevenue || revenueIntelligence?.forecast?.projectedRevenue || 0)} hint={`confidence ${revenueIntelligence?.forecast?.confidenceScore || 0}%`} tone="violet" />
        <StatCard label="Revenue Brain hot leads" value={loading ? "…" : String(revenueIntelligence?.widgets?.hotLeadsCount || 0)} hint="AI Revenue Intelligence priority queue" tone="pink" />
        <StatCard label="Revenue Brain health" value={loading ? "…" : `${revenueIntelligence?.widgets?.aiPipelineHealth || 0}/100`} hint={`engagement ${revenueIntelligence?.widgets?.engagementTrend || 0}/100`} />
        <StatCard label="Revenue recommendations" value={loading ? "…" : String(revenueIntelligence?.widgets?.aiRecommendationsQueue || 0)} hint="next best actions from Revenue Brain" tone="violet" />
        <StatCard label="Telegram лиды" value={loading ? "…" : String(crmStats?.telegram?.leads || 0)} hint={`${crmStats?.telegram?.recentMessages || 0} последних сообщений за 24ч · ${crmStats?.telegram?.aiActionsSent || 0} AI Telegram actions sent`} tone="pink" />
      </section>


      <section className="dashboard-revenue-command-center">
        <div className="panel-head revenue-panel-head">
          <div>
            <span className="eyebrow">AI Revenue Intelligence</span>
            <h3>AI Revenue Command Center</h3>
            <p className="modal-copy">Executive revenue view from ai_lead_scores and ai_revenue_forecasts. Prompts, chain of thought, and raw model responses stay hidden.</p>
          </div>
          <button className="btn primary compact" type="button" onClick={handleRunRevenueAnalysis} disabled={revenueBusy}>{revenueBusy ? "Running analysis…" : "Run Revenue Analysis Now"}</button>
        </div>
        <div className="dashboard-stats revenue-widget-row">
          {revenueCards.map((card) => <StatCard key={card.key} label={card.label} value={card.kind === 'money' ? formatCurrency(card.value) : card.kind === 'score' ? `${card.value}/100` : String(card.value)} hint={card.hint} tone={card.key === 'stalledLeads' || card.key === 'highChurnRisk' ? 'pink' : 'violet'} />)}
        </div>
        <div className="dashboard-revenue-bottom">
          <div className="revenue-forecast-widget">
            <div>
              <span className="eyebrow">Revenue Forecast Widget</span>
              <strong>{formatCurrency(forecastWidget.projectedRevenue)}</strong>
              <p>Active pipeline {formatCurrency(forecastWidget.activePipelineValue)} · hot {forecastWidget.hotLeadsCount} · stalled {forecastWidget.stalledLeadsCount}</p>
            </div>
            <div className="forecast-mini-trend" aria-label="Forecast confidence trend">
              <span style={{ height: `${Math.max(10, forecastWidget.confidenceScore)}%` }} />
              <span style={{ height: `${Math.max(10, forecastWidget.hotLeadsCount * 12)}%` }} />
              <span style={{ height: `${Math.max(10, forecastWidget.stalledLeadsCount * 12)}%` }} />
            </div>
            <b>{forecastWidget.confidenceScore}% confidence</b>
          </div>
          <div className="revenue-action-queue dashboard-next-actions">
            <strong>AI Next Best Actions</strong>
            {revenueActions.length === 0 && <p className="empty-state">No AI Revenue recommendations yet. Run analysis to populate the queue.</p>}
            {revenueActions.map((item) => <span key={item.id || item.leadId}>{item.leadName || 'Lead'} · {item.recommendedAction} · {item.recommendedChannel || 'crm'}</span>)}
          </div>
        </div>
      </section>

      <section className="app-grid two-columns">
        <Panel className="forecast-distribution-card">
          <span className="eyebrow">Forecast Distribution</span>
          <h3>AI Pipeline Health by category</h3>
          <div className="forecast-bars">
            {['committed', 'likely', 'possible', 'at_risk', 'lost_risk'].map((category) => {
              const distribution = crmStats?.aiMetrics?.forecastDistribution || {};
              const value = Number(distribution[category] || 0);
              const max = Math.max(1, ...Object.values(distribution).map((item) => Number(item || 0)));
              const label = ({ committed: 'Committed', likely: 'Likely', possible: 'Possible', at_risk: 'At risk', lost_risk: 'Lost risk' })[category];
              return <div className={`forecast-row ${category}`} key={category}><span>{label}</span><i><b style={{ width: `${Math.max(8, (value / max) * 100)}%` }} /></i><strong>{value}</strong></div>;
            })}
          </div>
        </Panel>

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
