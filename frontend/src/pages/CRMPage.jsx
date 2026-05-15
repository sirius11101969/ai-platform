import React, { useEffect, useMemo, useState } from "react";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import {
  addCrmLeadNote,
  createCrmFollowUp,
  createCrmLead,
  deleteCrmLead,
  fetchCrmActivity,
  fetchCrmLeads,
  fetchCrmStats,
  updateCrmLead,
} from "../services/api";

const CRM_STAGES = [
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
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
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

export default function CRMPage() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [leadForm, setLeadForm] = useState(initialLeadForm);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState({});
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [error, setError] = useState("");

  async function loadCrm({ silent = false } = {}) {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [leadsResponse, statsResponse, activityResponse] = await Promise.all([fetchCrmLeads(), fetchCrmStats(), fetchCrmActivity()]);
      setLeads(leadsResponse.leads || []);
      setStats(statsResponse.stats || null);
      setActivity(activityResponse.events || statsResponse.stats?.activity || []);
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить CRM");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => { loadCrm(); }, []);

  const leadsByStage = useMemo(() => CRM_STAGES.reduce((acc, stage) => {
    acc[stage.status] = leads.filter((lead) => lead.status === stage.status);
    return acc;
  }, {}), [leads]);

  async function refreshMeta() {
    const [statsResponse, activityResponse] = await Promise.all([fetchCrmStats(), fetchCrmActivity()]);
    setStats(statsResponse.stats || null);
    setActivity(activityResponse.events || []);
  }

  function resetForm() {
    setLeadForm(initialLeadForm);
    setEditingLeadId(null);
  }

  async function handleSaveLead(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...leadForm, value: Number(leadForm.value || 0) };
    try {
      if (editingLeadId) {
        const response = await updateCrmLead(editingLeadId, payload);
        setLeads((current) => current.map((lead) => (lead.id === editingLeadId ? response.lead : lead)));
      } else {
        const response = await createCrmLead(payload);
        setLeads((current) => [response.lead, ...current]);
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
    setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status } : item)));
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
      if (editingLeadId === lead.id) resetForm();
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
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, followUps: [response.followUp, ...(item.followUps || [])], updatedAt: new Date().toISOString() } : item));
      await refreshMeta();
    } catch (requestError) {
      setError(requestError.message || "Не удалось создать AI follow-up");
    } finally {
      setFollowUpLoading((current) => ({ ...current, [lead.id]: false }));
    }
  }

  return (
    <main className="workspace-page">
      <PageHeading
        eyebrow="CRM‑воронка"
        title="AI‑CRM для продаж"
        copy="Лиды, этапы, история, заметки и AI follow-up сохраняются в PostgreSQL и доступны только текущему пользователю через JWT."
        action={<button className="btn primary compact" type="button" onClick={() => { resetForm(); document.getElementById("crm-lead-name")?.focus(); }}>Добавить лид</button>}
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
          {loading ? CRM_STAGES.slice(0, 3).map((stage) => <Panel className="stage-column crm-skeleton" key={stage.status}>Загрузка: {stage.title}…</Panel>) : CRM_STAGES.map((stage) => {
            const stageLeads = leadsByStage[stage.status] || [];
            const stageTotal = stageLeads.reduce((total, lead) => total + Number(lead.value || 0), 0);
            return (
              <Panel
                className={`stage-column drop-stage ${draggedLeadId ? "drag-active" : ""}`}
                key={stage.status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); const lead = leads.find((item) => item.id === event.dataTransfer.getData("text/lead-id")); setDraggedLeadId(null); moveLead(lead, stage.status); }}
              >
                <div className="stage-head">
                  <div><h3>{stage.title}</h3><span>{stageLeads.length} · {formatCurrency(stageTotal)}</span></div>
                  <b>{stageLeads.length}</b>
                </div>
                <div className="lead-list">
                  {stageLeads.length === 0 && <p className="empty-state">Перетащите лид на этот этап</p>}
                  {stageLeads.map((lead) => (
                    <article
                      className="lead-card premium-lead-card"
                      draggable
                      onDragStart={(event) => { event.dataTransfer.setData("text/lead-id", lead.id); setDraggedLeadId(lead.id); }}
                      onDragEnd={() => setDraggedLeadId(null)}
                      key={lead.id}
                    >
                      <div className="lead-topline"><strong>{lead.company || lead.name}</strong><span>{formatCurrency(lead.value)}</span></div>
                      <p>{lead.name} · {lead.telegram || lead.email || "контакт не указан"}</p>
                      <small>Создано {formatDate(lead.createdAt)} · Обновлено {formatDate(lead.updatedAt)}</small>
                      <div className="lead-actions">
                        <button type="button" onClick={() => { setEditingLeadId(lead.id); setLeadForm(toForm(lead)); document.getElementById("crm-lead-name")?.focus(); }}>Изменить</button>
                        <button type="button" onClick={() => handleFollowUp(lead)} disabled={followUpLoading[lead.id]}>{followUpLoading[lead.id] ? "AI думает…" : "AI Follow-up"}</button>
                        <button type="button" className="danger" onClick={() => handleDeleteLead(lead)}>Удалить</button>
                      </div>
                      <label className="crm-field compact-field"><span>Этап</span><select value={lead.status} onChange={(event) => moveLead(lead, event.target.value)}>{CRM_STAGES.map((option) => <option value={option.status} key={option.status}>{option.title}</option>)}</select></label>
                      {lead.notesText && <small className="lead-note-text">{lead.notesText}</small>}
                      <div className="followup-history">
                        {(lead.followUps || []).slice(0, 2).map((item) => <p key={item.id}><b>AI:</b> {item.message}</p>)}
                      </div>
                      <div className="notes-list">{(lead.notes || []).slice(0, 2).map((note) => <p key={note.id}><span />{note.body}</p>)}</div>
                      <form className="note-form" onSubmit={(event) => handleAddNote(event, lead)}>
                        <input value={noteDrafts[lead.id] || ""} onChange={(event) => setNoteDrafts((current) => ({ ...current, [lead.id]: event.target.value }))} placeholder="Добавить заметку" />
                        <button type="submit">+</button>
                      </form>
                    </article>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>

        <aside className="crm-insights">
          <Panel>
            <span className="eyebrow">{editingLeadId ? "Редактировать лид" : "Создать лид"}</span>
            <h3>{editingLeadId ? "Изменить карточку" : "Новый лид"}</h3>
            <form className="lead-form" onSubmit={handleSaveLead}>
              <label className="crm-field"><span>Контактное имя *</span><input id="crm-lead-name" value={leadForm.name} onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })} required /></label>
              <label className="crm-field"><span>Компания</span><input value={leadForm.company} onChange={(event) => setLeadForm({ ...leadForm, company: event.target.value })} /></label>
              <label className="crm-field"><span>Telegram</span><input value={leadForm.telegram} onChange={(event) => setLeadForm({ ...leadForm, telegram: event.target.value })} placeholder="@username" /></label>
              <label className="crm-field"><span>Email</span><input type="email" value={leadForm.email} onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })} /></label>
              <label className="crm-field"><span>Сумма сделки</span><input min="0" type="number" value={leadForm.value} onChange={(event) => setLeadForm({ ...leadForm, value: event.target.value })} /></label>
              <label className="crm-field"><span>Этап</span><select value={leadForm.status} onChange={(event) => setLeadForm({ ...leadForm, status: event.target.value })}>{CRM_STAGES.map((stage) => <option key={stage.status} value={stage.status}>{stage.title}</option>)}</select></label>
              <label className="crm-field"><span>Заметки</span><textarea value={leadForm.notes} onChange={(event) => setLeadForm({ ...leadForm, notes: event.target.value })} placeholder="Контекст сделки, боль, следующий шаг" /></label>
              <div className="form-actions"><button className="btn primary compact" disabled={saving} type="submit">{saving ? "Сохраняем…" : editingLeadId ? "Сохранить" : "Создать лид"}</button>{editingLeadId && <button className="ghost-button" type="button" onClick={resetForm}>Отмена</button>}</div>
            </form>
          </Panel>

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
    </main>
  );
}
