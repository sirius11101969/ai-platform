import React, { useEffect, useMemo, useState } from "react";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { addCrmLeadNote, createCrmLead, fetchCrmLeads, fetchCrmStats, updateCrmLead } from "../services/api";

const CRM_STAGES = [
  { status: "new", title: "Новые" },
  { status: "qualified", title: "Квалификация" },
  { status: "proposal", title: "Предложение" },
  { status: "booked", title: "Встреча" },
  { status: "won", title: "Выиграно" },
  { status: "lost", title: "Потеряно" },
];

const initialLeadForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  value: "",
  source: "manual",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function CRMPage() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [leadForm, setLeadForm] = useState(initialLeadForm);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCrm() {
    setLoading(true);
    setError("");
    try {
      const [leadsResponse, statsResponse] = await Promise.all([fetchCrmLeads(), fetchCrmStats()]);
      setLeads(leadsResponse.leads || []);
      setStats(statsResponse.stats || null);
    } catch (requestError) {
      setError(requestError.message || "Не удалось загрузить CRM");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCrm();
  }, []);

  const leadsByStage = useMemo(() => {
    return CRM_STAGES.reduce((acc, stage) => {
      acc[stage.status] = leads.filter((lead) => lead.status === stage.status);
      return acc;
    }, {});
  }, [leads]);

  async function handleCreateLead(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await createCrmLead({ ...leadForm, value: Number(leadForm.value || 0) });
      setLeads((current) => [response.lead, ...current]);
      setLeadForm(initialLeadForm);
      const statsResponse = await fetchCrmStats();
      setStats(statsResponse.stats || null);
    } catch (requestError) {
      setError(requestError.message || "Не удалось создать лид");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(lead, status) {
    setError("");
    const previousLeads = leads;
    setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, status } : item)));
    try {
      const response = await updateCrmLead(lead.id, { status });
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, ...response.lead, notes: item.notes } : item)));
      const statsResponse = await fetchCrmStats();
      setStats(statsResponse.stats || null);
    } catch (requestError) {
      setLeads(previousLeads);
      setError(requestError.message || "Не удалось обновить статус");
    }
  }

  async function handleAddNote(event, lead) {
    event.preventDefault();
    const body = (noteDrafts[lead.id] || "").trim();
    if (!body) return;

    setError("");
    try {
      const response = await addCrmLeadNote(lead.id, body);
      setLeads((current) => current.map((item) => (
        item.id === lead.id ? { ...item, notes: [response.note, ...(item.notes || [])], updatedAt: new Date().toISOString() } : item
      )));
      setNoteDrafts((current) => ({ ...current, [lead.id]: "" }));
      const statsResponse = await fetchCrmStats();
      setStats(statsResponse.stats || null);
    } catch (requestError) {
      setError(requestError.message || "Не удалось добавить заметку");
    }
  }

  return (
    <main className="workspace-page">
      <PageHeading
        eyebrow="CRM pipeline"
        title="Реальная CRM воронка"
        copy="Лиды, этапы, заметки и статистика загружаются из защищённого PostgreSQL API только для текущего пользователя."
        action={<button className="btn primary compact" type="button" onClick={() => document.getElementById("crm-lead-name")?.focus()}>Добавить лид</button>}
      />

      {error && <p className="auth-error crm-alert">{error}</p>}

      <section className="dashboard-stats crm-stat-grid">
        <StatCard label="Лидов" value={loading ? "…" : String(stats?.totalLeads || 0)} hint="в вашем pipeline" />
        <StatCard label="Pipeline" value={loading ? "…" : formatCurrency(stats?.pipelineValue)} hint="общая сумма сделок" tone="violet" />
        <StatCard label="Won" value={loading ? "…" : formatCurrency(stats?.wonValue)} hint="выигранные сделки" tone="pink" />
      </section>

      <section className="crm-layout">
        <div className="pipeline-board">
          {loading ? (
            CRM_STAGES.slice(0, 3).map((stage) => <Panel className="stage-column crm-skeleton" key={stage.status}>Загрузка {stage.title.toLowerCase()}…</Panel>)
          ) : (
            CRM_STAGES.map((stage) => {
              const stageLeads = leadsByStage[stage.status] || [];
              const stageTotal = stageLeads.reduce((total, lead) => total + Number(lead.value || 0), 0);
              return (
                <Panel className="stage-column" key={stage.status}>
                  <div className="stage-head">
                    <div>
                      <h3>{stage.title}</h3>
                      <span>{stageLeads.length} лида · {formatCurrency(stageTotal)}</span>
                    </div>
                    <b>{stageLeads.length}</b>
                  </div>
                  <div className="lead-list">
                    {stageLeads.length === 0 && <p className="empty-state">Нет лидов на этапе</p>}
                    {stageLeads.map((lead) => (
                      <article className="lead-card" key={lead.id}>
                        <div className="lead-topline">
                          <strong>{lead.company || lead.name}</strong>
                          <span>{formatCurrency(lead.value)}</span>
                        </div>
                        <p>{lead.name} · {lead.email || lead.phone || "контакт не указан"}</p>
                        <label className="crm-field compact-field">
                          <span>Статус</span>
                          <select value={lead.status} onChange={(event) => handleStatusChange(lead, event.target.value)}>
                            {CRM_STAGES.map((option) => <option value={option.status} key={option.status}>{option.title}</option>)}
                          </select>
                        </label>
                        <small>Источник: {lead.source || "—"} · Обновлено {formatDate(lead.updatedAt)}</small>
                        <div className="notes-list">
                          {(lead.notes || []).slice(0, 2).map((note) => <p key={note.id}><span />{note.body}</p>)}
                        </div>
                        <form className="note-form" onSubmit={(event) => handleAddNote(event, lead)}>
                          <input
                            value={noteDrafts[lead.id] || ""}
                            onChange={(event) => setNoteDrafts((current) => ({ ...current, [lead.id]: event.target.value }))}
                            placeholder="Добавить заметку"
                          />
                          <button type="submit">+</button>
                        </form>
                      </article>
                    ))}
                  </div>
                </Panel>
              );
            })
          )}
        </div>

        <aside className="crm-insights">
          <Panel>
            <span className="eyebrow">Create lead</span>
            <h3>Новый лид</h3>
            <form className="lead-form" onSubmit={handleCreateLead}>
              <label className="crm-field">
                <span>Имя *</span>
                <input id="crm-lead-name" value={leadForm.name} onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })} required />
              </label>
              <label className="crm-field">
                <span>Email</span>
                <input type="email" value={leadForm.email} onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })} />
              </label>
              <label className="crm-field">
                <span>Телефон</span>
                <input value={leadForm.phone} onChange={(event) => setLeadForm({ ...leadForm, phone: event.target.value })} />
              </label>
              <label className="crm-field">
                <span>Компания</span>
                <input value={leadForm.company} onChange={(event) => setLeadForm({ ...leadForm, company: event.target.value })} />
              </label>
              <label className="crm-field">
                <span>Сумма</span>
                <input min="0" type="number" value={leadForm.value} onChange={(event) => setLeadForm({ ...leadForm, value: event.target.value })} />
              </label>
              <label className="crm-field">
                <span>Источник</span>
                <input value={leadForm.source} onChange={(event) => setLeadForm({ ...leadForm, source: event.target.value })} />
              </label>
              <button className="btn primary compact" disabled={saving} type="submit">{saving ? "Сохраняем…" : "Создать лид"}</button>
            </form>
          </Panel>

          <Panel>
            <span className="eyebrow">Notes & activity</span>
            <h3>Последние заметки</h3>
            <div className="activity-preview">
              {(stats?.recentNotes || []).length === 0 && <p><span />Заметок пока нет</p>}
              {(stats?.recentNotes || []).map((note) => <p key={note.id}><span />{note.leadName}: {note.body}</p>)}
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}
