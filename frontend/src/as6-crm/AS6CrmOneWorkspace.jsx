import { useEffect, useMemo, useState } from "react";
import {
  AS6Workspace,
  AS6SidebarShell,
  AS6SidebarNav,
  AS6SidebarSection,
  AS6HeaderShell,
  AS6HeaderTitle,
  AS6HeaderToolbar,
} from "../components/as6-workspace/AS6Workspace.jsx";
import { createAS6CrmLiveSnapshot } from "../data/as6CrmLiveData";
import { fetchCrmActivity, fetchCrmLeads, fetchCrmStages, fetchCrmStats } from "../services/api";
import { useAS6CrmRuntimeBridge } from "../as6/spaces/crm/AS6CrmRuntimeBridge";
import "./AS6CrmOneWorkspace.css";

const FALLBACK_STAGES = [
  { status: "new", title: "Новый" },
  { status: "qualified", title: "Квалификация" },
  { status: "proposal", title: "Предложение" },
  { status: "booked", title: "Встреча" },
  { status: "won", title: "Успешно" },
];

const FALLBACK_LEADS = [
  { id: "demo-1", name: "ООО Альфа", company: "Альфа", status: "new", value: 45000, aiScore: 86, source: "telegram" },
  { id: "demo-2", name: "ООО Бета", company: "Бета", status: "qualified", value: 120000, aiScore: 78, source: "email" },
  { id: "demo-3", name: "ООО Гамма", company: "Гамма", status: "proposal", value: 240000, aiScore: 91, source: "crm" },
  { id: "demo-4", name: "ООО Дельта", company: "Дельта", status: "booked", value: 180000, aiScore: 73, source: "voice" },
  { id: "demo-5", name: "ООО Омега", company: "Омега", status: "won", value: 315000, aiScore: 94, source: "referral" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeApiList(payload, key) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function leadValue(lead) {
  return Number(lead?.value || lead?.amount || lead?.dealValue || 0);
}

export default function AS6CrmOneWorkspace() {
  const crmRuntimeContext = useMemo(() => ({ currentView: "as6-crm-one-workspace" }), []);
  const crmRuntime = useAS6CrmRuntimeBridge(crmRuntimeContext);
  const [state, setState] = useState({
    loading: true,
    leads: FALLBACK_LEADS,
    stages: FALLBACK_STAGES,
    stats: null,
    activity: [],
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([fetchCrmLeads(), fetchCrmStages(), fetchCrmStats(), fetchCrmActivity()])
      .then(([leadsResult, stagesResult, statsResult, activityResult]) => {
        if (cancelled) return;

        const leads = normalizeApiList(leadsResult.value, "leads");
        const stages = normalizeApiList(stagesResult.value, "stages");
        const activity = normalizeApiList(activityResult.value, "activity");
        const failed = [leadsResult, stagesResult, statsResult, activityResult].some((result) => result.status === "rejected");

        setState({
          loading: false,
          leads: leads.length ? leads : FALLBACK_LEADS,
          stages: stages.length ? stages : FALLBACK_STAGES,
          stats: statsResult.status === "fulfilled" ? statsResult.value : null,
          activity,
          error: failed ? "CRM API fallback active" : "",
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState((current) => ({ ...current, loading: false, error: error?.message || "CRM API fallback active" }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const liveSnapshot = useMemo(() => createAS6CrmLiveSnapshot(), []);
  const totalPipeline = useMemo(() => state.leads.reduce((sum, lead) => sum + leadValue(lead), 0), [state.leads]);
  const hotLeads = useMemo(() => state.leads.filter((lead) => Number(lead?.aiScore || lead?.score || 0) >= 80).length, [state.leads]);
  const groupedLeads = useMemo(() => {
    const groups = new Map(state.stages.map((stage) => [stage.status, []]));
    state.leads.forEach((lead) => {
      const status = lead.status || "new";
      if (!groups.has(status)) groups.set(status, []);
      groups.get(status).push(lead);
    });
    return groups;
  }, [state.leads, state.stages]);

  const kpis = [
    { label: "Pipeline", value: formatCurrency(state.stats?.pipelineValue || state.stats?.totalValue || totalPipeline), meta: `${state.leads.length} leads` },
    { label: "Hot leads", value: String(state.stats?.hotLeads || hotLeads), meta: "AI score 80+" },
    { label: "Open deals", value: String(state.stats?.openDeals || state.leads.filter((lead) => lead.status !== "won" && lead.status !== "lost").length), meta: "active CRM flow" },
    { label: "Live widgets", value: String(liveSnapshot.connectorHealth?.length || 6), meta: liveSnapshot.freshness },
  ];

  return (
    <AS6Workspace className="as6-crm-one-workspace" dataRoute="as6-crm" mode="crm-one">
      <AS6SidebarShell className="as6-crm-one-sidebar">
        <div className="as6-crm-one-brand">
          <span>AS6</span>
          <strong>CRM ONE</strong>
        </div>
        <AS6SidebarNav className="as6-crm-one-nav" label="AS6 CRM Workspace">
          {["Pipeline", "Leads", "Deals", "Activities", "Analytics", "Rollback"].map((item) => (
            <a key={item} href={item === "Rollback" ? "/as6-sales" : `#${item.toLowerCase()}`}>{item}</a>
          ))}
        </AS6SidebarNav>
        <AS6SidebarSection title="Modules" className="as6-crm-one-modules">
          <span>contacts</span>
          <span>companies</span>
          <span>deals</span>
          <span>activities</span>
          <span>followups</span>
          <span>analytics</span>
          <span>filters</span>
          <span>kanban</span>
        </AS6SidebarSection>
      </AS6SidebarShell>

      <main className="as6-crm-one-main">
        <AS6HeaderShell className="as6-crm-one-header">
          <AS6HeaderTitle eyebrow="AS6 ONE Workspace" title="CRM" className="as6-crm-one-title">
            <p>Новый основной CRM-интерфейс внутри AS6 ONE. Старый CRM UI сохранён только для rollback и логики.</p>
          </AS6HeaderTitle>
          <label className="as6-crm-one-command">
            <span>⌕</span>
            <input placeholder="Найти лид, сделку, компанию или команду" aria-label="CRM command search" />
            <kbd>Ctrl K</kbd>
          </label>
          <AS6HeaderToolbar className="as6-crm-one-toolbar">
            <a href="/crm-workspace">Legacy workspace</a>
            <a href="/as6-sales">Rollback</a>
          </AS6HeaderToolbar>
        </AS6HeaderShell>

        <section className="as6-crm-one-kpis">
          {kpis.map((kpi) => (
            <article key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <small>{kpi.meta}</small>
            </article>
          ))}
        </section>

        <section className="as6-crm-one-body">
          <section className="as6-crm-one-pipeline" id="pipeline">
            <div className="as6-crm-one-section-title">
              <span>CRM Pipeline</span>
              <strong>{state.loading ? "Syncing..." : state.error || "Live business data"}</strong>
            </div>
            <div className="as6-crm-one-kanban">
              {state.stages.slice(0, 6).map((stage) => {
                const leads = groupedLeads.get(stage.status) || [];
                const stageValue = leads.reduce((sum, lead) => sum + leadValue(lead), 0);

                return (
                  <article className="as6-crm-one-column" key={stage.status}>
                    <header>
                      <strong>{stage.title}</strong>
                      <span>{leads.length} · {formatCurrency(stageValue)}</span>
                    </header>
                    {leads.slice(0, 3).map((lead) => (
                      <div className="as6-crm-one-card" key={lead.id || lead.name}>
                        <strong>{lead.company || lead.name || "CRM Lead"}</strong>
                        <span>{formatCurrency(leadValue(lead))}</span>
                        <small>AI {lead.aiScore || lead.score || 72} · {lead.source || "crm"}</small>
                      </div>
                    ))}
                    {!leads.length ? <p>No active cards</p> : null}
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="as6-crm-one-rail">
            <article>
              <span>AS6 Assistant</span>
              <strong>Next best action</strong>
              <p>Сфокусироваться на {hotLeads || 1} горячих лидах и обновить follow-up queue.</p>
              <button type="button">Open AI queue</button>
            </article>
            <article>
              <span>Runtime</span>
              <strong>{crmRuntime.runtime?.status || "registered"}</strong>
              <p>{crmRuntime.context?.values?.currentView || "as6-crm-one-workspace"}</p>
            </article>
            <article>
              <span>System status</span>
              {["CRM API", "Operational store", "AI context", "Legacy rollback"].map((item) => (
                <p className="as6-crm-one-status" key={item}>
                  {item}<b>{item === "Legacy rollback" ? "/as6-sales" : "online"}</b>
                </p>
              ))}
            </article>
            <article>
              <span>Activity</span>
              {(state.activity.length ? state.activity : [{ id: "fallback", title: "CRM workspace opened", type: "workspace" }]).slice(0, 4).map((event, index) => (
                <p className="as6-crm-one-event" key={event.id || index}>{event.title || event.type || "CRM event"}</p>
              ))}
            </article>
          </aside>
        </section>
      </main>
    </AS6Workspace>
  );
}
