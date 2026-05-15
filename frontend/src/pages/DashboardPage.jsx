import React from "react";
import { Link } from "react-router-dom";
import { Panel, PageHeading, StatCard } from "../components/AppShell";
import { aiTasks, creditSummary, orders, quickActions, userProfile } from "../data/mockData";

export default function DashboardPage() {
  return (
    <main className="workspace-page">
      <PageHeading
        eyebrow="Dashboard"
        title="Операционная панель AI‑команды"
        copy="Профиль, credits, подписки и AI-задачи собраны в защищённой зоне для ежедневной работы growth-команды."
        action={<Link className="btn primary compact" to="/crm">Открыть CRM</Link>}
      />

      <section className="dashboard-stats">
        <StatCard label="Pipeline revenue" value="9.3M ₽" hint="+18% за 7 дней" />
        <StatCard label="AI tasks" value="186" hint="43 ждут ревью" tone="violet" />
        <StatCard label="Conversion lift" value="+31%" hint="после follow-up" tone="pink" />
      </section>

      <section className="app-grid two-columns">
        <Panel className="profile-card">
          <span className="eyebrow">User profile</span>
          <div className="profile-hero">
            <div className="profile-avatar">АО</div>
            <div>
              <h3>{userProfile.name}</h3>
              <p>{userProfile.role} · {userProfile.company}</p>
              <span>{userProfile.email}</span>
            </div>
          </div>
        </Panel>

        <Panel className="credits-card">
          <span className="eyebrow">Credits block</span>
          <div className="credits-number">{creditSummary.balance.toLocaleString("ru-RU")}</div>
          <p>{creditSummary.forecast}</p>
          <div className="progress-track"><i style={{ width: `${creditSummary.used}%` }} /></div>
          <small>Использовано {creditSummary.used}% · обновление {creditSummary.renews}</small>
        </Panel>
      </section>

      <section className="app-grid two-columns align-start">
        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">AI tasks cards</span>
              <h3>Автоматизации сегодня</h3>
            </div>
            <button className="ghost-button" type="button">+ задача</button>
          </div>
          <div className="task-list">
            {aiTasks.map((task) => (
              <article className={`task-card ${task.accent}`} key={task.title}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.status}</span>
                </div>
                <b>{task.value}</b>
              </article>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="panel-head">
            <div>
              <span className="eyebrow">Orders & subscription</span>
              <h3>Оплаты и тариф</h3>
            </div>
          </div>
          <div className="order-list">
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
        </Panel>
      </section>

      <Panel>
        <div className="panel-head">
          <div>
            <span className="eyebrow">Quick actions</span>
            <h3>Быстрые действия</h3>
          </div>
        </div>
        <div className="quick-actions">
          {quickActions.map((action) => <button type="button" key={action}>{action}</button>)}
        </div>
      </Panel>
    </main>
  );
}
