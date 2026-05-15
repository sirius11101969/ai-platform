import React, { useEffect, useMemo, useState } from "react";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import {
  addCrmLeadNote,
  createCrmFollowUp,
  createCrmLead,
  deleteCrmLead,
  fetchCrmActivity,
  fetchCrmLeads,
  fetchCrmStages,
  fetchCrmStats,
  updateCrmLead,
  updateCrmStage,
} from "../services/api";

const DEFAULT_CRM_STAGES = [
  { status: "new", title: "Новый" },
  { status: "qualified", title: "Квалификация" },
  { status: "proposal", title: "Предложение" },
  { status: "booked", title: "Встреча" },
  { status: "won", title: "Успешно" },
  { status: "lost", title: "Потеряно" },
];

const initialLeadForm = { name: "", email: "", telegram: "", company: "", value: "", notes: "", source: "ручной ввод", status: "new" };

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function toForm(lead) {
  return {
    name: lead?.name || "",
    email: lead?.email || "",
    telegram: lead?.telegram || "",
    company: lead?.company || "",
    value: lead?.value || "",
    notes: lead?.notesText || "",
    source: lead?.source || "ручной ввод",
    status: lead?.status || "new",
  };
}

function getLeadActivity(lead, activity) {
  return activity.filter((event) => event.leadId === lead?.id);
}

export default function CRMPage() {
  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState(DEFAULT_CRM_STAGES);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [leadForm, setLeadForm] = useState(initialLeadForm);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stageSaving, setStageSaving] = useState({});
  const [followUpLoading, setFollowUpLoading] = useState({});
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dropTargetStage, setDropTargetStage] = useState(null);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);

  const selectedLead = useMemo(() => leads.find((lead) => lead.id === selectedLeadId) || null, [leads, selectedLeadId]);
  const stageMap = useMemo(() => stages.reduce((acc, stage) => ({ ...acc, [stage.status]: stage.title }), {}), [stages]);

  async function loadCrm({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [leadsResponse, stagesResponse, statsResponse, activityResponse] = await Promise.all([
        fetchCrmLeads(),
        fetchCrmStages(),
        fetchCrmStats(),
        fetchCrmActivity(),
      ]);
      setLeads(leadsResponse.leads || []);
      setStages((stagesResponse.stages?.length ? stagesResponse.stages : DEFAULT_CRM_STAGES));
      setStats(statsResponse.stats || null);
      setActivity(activityResponse.events || statsResponse.stats?.activity || []);
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить CRM");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadCrm(); }, []);

  useEffect(() => {
    function handleOpenCreate() {
      window.sessionStorage?.removeItem('crm-open-create-lead');
      resetForm();
      setIsCreateOpen(true);
    }
    if (window.sessionStorage?.getItem('crm-open-create-lead') === '1') handleOpenCreate();
    window.addEventListener("crm-open-create-lead", handleOpenCreate);
    return () => window.removeEventListener("crm-open-create-lead", handleOpenCreate);
  }, []);

  const leadsByStage = useMemo(() => stages.reduce((acc, stage) => {
    acc[stage.status] = leads.filter((lead) => lead.status === stage.status);
    return acc;
  }, {}), [leads, stages]);

  async function refreshMeta() {
    const [statsResponse, activityResponse] = await Promise.all([fetchCrmStats(), fetchCrmActivity()]);
    setStats(statsResponse.stats || null);
    setActivity(activityResponse.events || []);
  }

  function resetForm() {
    setLeadForm(initialLeadForm);
    setIsEditingDetail(false);
  }

  async function handleSaveLead(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...leadForm, value: Number(leadForm.value || 0) };
    try {
      if (isEditingDetail && selectedLead) {
        const response = await updateCrmLead(selectedLead.id, payload);
        setLeads((current) => current.map((lead) => (lead.id === selectedLead.id ? response.lead : lead)));
        setSelectedLeadId(response.lead.id);
        setIsEditingDetail(false);
      } else {
        const response = await createCrmLead(payload);
        setLeads((current) => [response.lead, ...current]);
        setIsCreateOpen(false);
      }
      resetForm();
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || "Не удалось сохранить лид");
    } finally {
      setSaving(false);
    }
  }

  async function moveLead(lead, status) {
    if (!lead || lead.status === status) return;
    setError("");
    const previousLeads = leads;
    setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status, statusLabel: stageMap[status] || status } : item)));
    try {
      const response = await updateCrmLead(lead.id, { status });
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...response.lead, notes: item.notes, followUps: item.followUps } : item)));
      await refreshMeta();
    } catch (requestError) {
      setLeads(previousLeads);
      setError(requestError.message || "Не удалось переместить лид");
    }
  }

  async function handleDeleteLead(lead) {
    if (!window.confirm(`Удалить лид «${lead.company || lead.name}»?`)) return;
    setError("");
    try {
      await deleteCrmLead(lead.id);
      setLeads((current) => current.filter((item) => item.id !== lead.id));
      if (selectedLeadId === lead.id) setSelectedLeadId(null);
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || "Не удалось удалить лид");
    }
  }

  async function handleAddNote(event, lead) {
    event.preventDefault();
    const body = (noteDrafts[lead.id] || "").trim();
    if (!body) return;
    setError("");
    try {
      const response = await addCrmLeadNote(lead.id, body);
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, notes: [response.note, ...(item.notes || [])], notesText: [item.notesText, body].filter(Boolean).join("\n"), updatedAt: new Date().toISOString() } : item));
      setNoteDrafts((current) => ({ ...current, [lead.id]: "" }));
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || "Не удалось добавить заметку");
    }
  }

  async function handleFollowUp(lead) {
    setError("");
    setFollowUpLoading((current) => ({ ...current, [lead.id]: true }));
    try {
      const response = await createCrmFollowUp(lead.id);
      const noteBody = response.note?.body || (response.followUp?.message ? `AI follow-up: ${response.followUp.message}` : "");
      setLeads((current) => current.map((item) => item.id === lead.id ? {
        ...item,
        followUps: [response.followUp, ...(item.followUps || [])].filter(Boolean),
        notes: [response.note, ...(item.notes || [])].filter(Boolean),
        notesText: [item.notesText, noteBody].filter(Boolean).join("\\n"),
        updatedAt: new Date().toISOString(),
      } : item));
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || "Не удалось создать AI‑дожим");
    } finally {
      setFollowUpLoading((current) => ({ ...current, [lead.id]: false }));
    }
  }

  async function handleRenameStage(stage, title) {
    const nextTitle = title.trim();
    if (!nextTitle || nextTitle === stage.title) return;
    setStageSaving((current) => ({ ...current, [stage.status]: true }));
    setError("");
    const previousStages = stages;
    setStages((current) => current.map((item) => item.status === stage.status ? { ...item, title: nextTitle } : item));
    try {
      const response = await updateCrmStage(stage.status, { title: nextTitle });
      setStages((current) => current.map((item) => item.status === stage.status ? response.stage : item));
    } catch (requestError) {
      setStages(previousStages);
      setError(requestError.message || "Не удалось переименовать этап");
    } finally {
      setStageSaving((current) => ({ ...current, [stage.status]: false }));
    }
  }

  function handleLeadDragStart(event, lead) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", lead.id);
    event.dataTransfer.setData("text/lead-id", lead.id);
    setDraggedLeadId(lead.id);
  }

  function handleStageDragOver(event, stageStatus) {
    if (!draggedLeadId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetStage(stageStatus);
  }

  function handleStageDrop(event, stageStatus) {
    event.preventDefault();
    const droppedLeadId = event.dataTransfer.getData("text/lead-id") || event.dataTransfer.getData("text/plain") || draggedLeadId;
    const lead = leads.find((item) => item.id === droppedLeadId);
    setDraggedLeadId(null);
    setDropTargetStage(null);
    moveLead(lead, stageStatus);
  }

  function handleLeadDragEnd() {
    setDraggedLeadId(null);
    setDropTargetStage(null);
  }

  function openDetail(lead) {
    if (draggedLeadId) return;
    setSelectedLeadId(lead.id);
    setIsEditingDetail(false);
  }

  function startDetailEdit(lead) {
    setLeadForm(toForm(lead));
    setIsEditingDetail(true);
  }

  return (
    <main className="workspace-page crm-workspace-page">
      <PageHeading
        eyebrow="CRM‑воронка"
        title="AI‑CRM для продаж"
        copy="Компактная production‑воронка: лиды, этапы, история, заметки и AI‑дожим сохраняются в PostgreSQL и доступны только текущему пользователю через JWT."
      />

      {error && <p className="auth-error crm-alert">{error}</p>}

      <section className="dashboard-stats crm-stat-grid">
        <StatCard label="Лидов" value={loading ? "…" : String(stats?.totalLeads || 0)} hint="в вашей базе" />
        <StatCard label="Воронка" value={loading ? "…" : formatCurrency(stats?.pipelineValue)} hint="активная сумма" tone="violet" />
        <StatCard label="Успешно" value={loading ? "…" : String(stats?.wonDeals || 0)} hint={`${formatCurrency(stats?.wonValue)} выиграно`} tone="pink" />
        <StatCard label="Потеряно" value={loading ? "…" : String(stats?.lostDeals || 0)} hint={`${formatCurrency(stats?.lostValue)} потеряно`} />
        <StatCard label="Конверсия" value={loading ? "…" : `${stats?.conversionRate || 0}%`} hint="успешные сделки от всех лидов" tone="violet" />
      </section>

      <section className="crm-layout production-crm-layout">
        <div className="pipeline-board production-pipeline">
          {loading ? DEFAULT_CRM_STAGES.slice(0, 3).map((stage) => <Panel className="stage-column crm-skeleton" key={stage.status}>Загрузка: {stage.title}…</Panel>) : stages.map((stage) => {
            const stageLeads = leadsByStage[stage.status] || [];
            const stageTotal = stageLeads.reduce((total, lead) => total + Number(lead.value || 0), 0);
            return (
              <Panel
                className={`stage-column drop-stage ${draggedLeadId ? "drag-active" : ""} ${dropTargetStage === stage.status ? "drop-hover" : ""}`}
                key={stage.status}
                onDragEnter={() => draggedLeadId && setDropTargetStage(stage.status)}
                onDragOver={(event) => handleStageDragOver(event, stage.status)}
                onDragLeave={() => setDropTargetStage((current) => (current === stage.status ? null : current))}
                onDrop={(event) => handleStageDrop(event, stage.status)}
              >
                <div className="stage-head editable-stage-head">
                  <div>
                    <input
                      aria-label={`Название этапа ${stage.title}`}
                      className="stage-title-input"
                      defaultValue={stage.title}
                      disabled={stageSaving[stage.status]}
                      onBlur={(event) => handleRenameStage(stage, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                        if (event.key === "Escape") { event.currentTarget.value = stage.title; event.currentTarget.blur(); }
                      }}
                    />
                    <span>{stageLeads.length} · {formatCurrency(stageTotal)}</span>
                  </div>
                  <b>{stageLeads.length}</b>
                </div>
                <div className="lead-list compact-lead-list">
                  {stageLeads.length === 0 && <p className="empty-state">Перетащите лид на этот этап</p>}
                  {stageLeads.map((lead) => (
                    <article
                      className={`lead-card premium-lead-card compact-pipeline-card ${draggedLeadId === lead.id ? "is-dragging" : ""}`}
                      draggable
                      onClick={() => openDetail(lead)}
                      onDragStart={(event) => handleLeadDragStart(event, lead)}
                      onDragEnd={handleLeadDragEnd}
                      key={lead.id}
                    >
                      <div className="lead-topline"><strong>{lead.name}</strong><span>{formatCurrency(lead.value)}</span></div>
                      <p>{lead.company || "Компания не указана"}</p>
                      <small><i />{stageMap[lead.status] || lead.status}</small>
                    </article>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>

        <aside className="crm-insights compact-crm-insights">
          <Panel>
            <span className="eyebrow">Лента активности</span>
            <h3>История CRM</h3>
            <div className="activity-preview crm-activity-feed">
              {activity.length === 0 && <p><span />Событий пока нет</p>}
              {activity.map((event) => <p key={event.id}><span />{event.title}{event.leadName ? ` · ${event.leadName}` : ""}<small>{event.body}</small></p>)}
            </div>
          </Panel>
        </aside>
      </section>

      {isCreateOpen && (
        <LeadFormModal
          title="Создать лид"
          subtitle="Новая сделка сразу попадёт в выбранный этап воронки."
          stages={stages}
          leadForm={leadForm}
          setLeadForm={setLeadForm}
          saving={saving}
          submitLabel="Создать лид"
          onSubmit={handleSaveLead}
          onClose={() => { setIsCreateOpen(false); resetForm(); }}
        />
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          stages={stages}
          stageMap={stageMap}
          activity={getLeadActivity(selectedLead, activity)}
          noteDraft={noteDrafts[selectedLead.id] || ""}
          onNoteDraftChange={(value) => setNoteDrafts((current) => ({ ...current, [selectedLead.id]: value }))}
          onAddNote={(event) => handleAddNote(event, selectedLead)}
          onFollowUp={() => handleFollowUp(selectedLead)}
          followUpLoading={followUpLoading[selectedLead.id]}
          onDelete={() => handleDeleteLead(selectedLead)}
          onEdit={() => startDetailEdit(selectedLead)}
          onMove={(status) => moveLead(selectedLead, status)}
          onClose={() => { setSelectedLeadId(null); setIsEditingDetail(false); }}
        />
      )}

      {isEditingDetail && selectedLead && (
        <LeadFormModal
          title="Редактировать лид"
          subtitle="Обновите контактные данные, сумму сделки, этап и заметки."
          stages={stages}
          leadForm={leadForm}
          setLeadForm={setLeadForm}
          saving={saving}
          submitLabel="Сохранить"
          onSubmit={handleSaveLead}
          onClose={() => { setIsEditingDetail(false); resetForm(); }}
        />
      )}
    </main>
  );
}

function LeadFormModal({ title, subtitle, stages, leadForm, setLeadForm, saving, submitLabel, onSubmit, onClose }) {
  return (
    <div className="modal-backdrop crm-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section className="ai-task-modal crm-lead-modal" role="dialog" aria-modal="true" aria-labelledby="crm-lead-modal-title">
        <div className="modal-glow" />
        <div className="panel-head">
          <div>
            <span className="eyebrow">CRM</span>
            <h3 id="crm-lead-modal-title">{title}</h3>
            <p className="modal-copy">{subtitle}</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} disabled={saving} aria-label="Закрыть">×</button>
        </div>
        <form className="lead-form modal-lead-form" onSubmit={onSubmit}>
          <label className="crm-field"><span>Контактное имя *</span><input autoFocus id="crm-lead-name" value={leadForm.name} onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })} required /></label>
          <label className="crm-field"><span>Компания</span><input value={leadForm.company} onChange={(event) => setLeadForm({ ...leadForm, company: event.target.value })} /></label>
          <label className="crm-field"><span>Telegram</span><input value={leadForm.telegram} onChange={(event) => setLeadForm({ ...leadForm, telegram: event.target.value })} placeholder="@username" /></label>
          <label className="crm-field"><span>Email</span><input type="email" value={leadForm.email} onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })} /></label>
          <label className="crm-field"><span>Сумма сделки</span><input min="0" type="number" value={leadForm.value} onChange={(event) => setLeadForm({ ...leadForm, value: event.target.value })} /></label>
          <label className="crm-field"><span>Этап</span><select value={leadForm.status} onChange={(event) => setLeadForm({ ...leadForm, status: event.target.value })}>{stages.map((stage) => <option key={stage.status} value={stage.status}>{stage.title}</option>)}</select></label>
          <label className="crm-field modal-notes"><span>Заметки</span><textarea value={leadForm.notes} onChange={(event) => setLeadForm({ ...leadForm, notes: event.target.value })} placeholder="Контекст сделки, боль, следующий шаг" /></label>
          <div className="form-actions modal-actions"><span>{saving ? "Сохраняем данные…" : "JWT + PostgreSQL"}</span><button className="btn primary compact" disabled={saving} type="submit">{saving && <i className="button-spinner" />}{saving ? "Сохраняем…" : submitLabel}</button></div>
        </form>
      </section>
    </div>
  );
}

function LeadDetailModal({ lead, stages, stageMap, activity, noteDraft, onNoteDraftChange, onAddNote, onFollowUp, followUpLoading, onDelete, onEdit, onMove, onClose }) {
  return (
    <div className="modal-backdrop crm-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="ai-task-modal lead-detail-modal" role="dialog" aria-modal="true" aria-labelledby="lead-detail-title">
        <div className="modal-glow" />
        <div className="panel-head lead-detail-head">
          <div>
            <span className="eyebrow">Карточка лида</span>
            <h3 id="lead-detail-title">{lead.name}</h3>
            <p className="modal-copy">{lead.company || "Компания не указана"} · {formatCurrency(lead.value)}</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="lead-detail-grid">
          <section className="lead-detail-main">
            <div className="detail-kpi-row">
              <div><span>Сумма сделки</span><strong>{formatCurrency(lead.value)}</strong></div>
              <label className="crm-field"><span>Текущий этап</span><select value={lead.status} onChange={(event) => onMove(event.target.value)}>{stages.map((stage) => <option key={stage.status} value={stage.status}>{stage.title}</option>)}</select></label>
            </div>

            <div className="detail-section">
              <h4>Контактные данные</h4>
              <dl className="lead-data-list">
                <div><dt>Контакт</dt><dd>{lead.name}</dd></div>
                <div><dt>Компания</dt><dd>{lead.company || "—"}</dd></div>
                <div><dt>Telegram</dt><dd>{lead.telegram || "—"}</dd></div>
                <div><dt>Email</dt><dd>{lead.email || "—"}</dd></div>
                <div><dt>Этап</dt><dd>{stageMap[lead.status] || lead.status}</dd></div>
                <div><dt>Создано</dt><dd>{formatDate(lead.createdAt)}</dd></div>
                <div><dt>Обновлено</dt><dd>{formatDate(lead.updatedAt)}</dd></div>
              </dl>
            </div>

            <div className="detail-section">
              <h4>Заметки</h4>
              {lead.notesText ? <p className="detail-notes-text">{lead.notesText}</p> : <p className="empty-state">Заметок пока нет</p>}
              <form className="detail-note-form" onSubmit={onAddNote}>
                <textarea value={noteDraft} onChange={(event) => onNoteDraftChange(event.target.value)} placeholder="Добавить новую заметку по сделке" />
                <button className="btn primary compact" type="submit">Добавить заметку</button>
              </form>
            </div>

            <div className="detail-actions">
              <button className="btn primary compact" type="button" onClick={onFollowUp} disabled={followUpLoading}>{followUpLoading ? "AI думает…" : "Сгенерировать AI‑дожим"}</button>
              <button className="ghost-button" type="button" onClick={onEdit}>Редактировать</button>
              <button className="ghost-button danger-action" type="button" onClick={onDelete}>Удалить</button>
            </div>
          </section>

          <aside className="lead-detail-side">
            <div className="detail-section">
              <h4>AI follow‑up</h4>
              <div className="followup-history detail-followups">
                {(lead.followUps || []).length === 0 && <p>AI‑дожим ещё не генерировался.</p>}
                {(lead.followUps || []).map((item) => <p key={item.id}><b>AI:</b> {item.message}<small>{formatDate(item.createdAt)}</small></p>)}
              </div>
            </div>

            <div className="detail-section">
              <h4>Activity history</h4>
              <div className="activity-preview crm-activity-feed detail-activity-feed">
                {activity.length === 0 && <p><span />Событий для лида пока нет</p>}
                {activity.map((event) => <p key={event.id}><span />{event.title}<small>{event.body}<br />{formatDate(event.createdAt)}</small></p>)}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
