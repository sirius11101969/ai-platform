import React from "react";
import { crmContactPanels } from "../crmContactPanels";
import { getCrmContactHealthSnapshot } from "../crmContactHealthSnapshot";
import "./crmContactsUiFoundation.css";

const SAMPLE_CONTACTS = Object.freeze([
  Object.freeze({ id: "contact-001", displayName: "Иван Петров", email: "ivan@example.com", phone: "+7 000 000-00-01", company: "AS6 Client", status: "active" }),
  Object.freeze({ id: "contact-002", displayName: "Мария Соколова", email: "maria@example.com", phone: "+7 000 000-00-02", company: "AS6 Partner", status: "lead" }),
]);

export function CrmContactRow({ contact }) {
  return (
    <article className="as6-crm-contact-row" data-as6-contact-row="true">
      <div>
        <strong>{contact.displayName}</strong>
        <span>{contact.company}</span>
      </div>
      <div>
        <span>{contact.email}</span>
        <span>{contact.phone}</span>
      </div>
      <mark>{contact.status}</mark>
    </article>
  );
}

export function CrmContactsEmptyState() {
  return (
    <section className="as6-crm-contacts-empty" data-as6-contacts-empty="true">
      <h3>Контакты пока не подключены</h3>
      <p>Slice 05 создаёт UI-фундамент без storage, API и бизнес-процессов.</p>
    </section>
  );
}

export function CrmContactsUiFoundation({ contacts = SAMPLE_CONTACTS }) {
  const health = getCrmContactHealthSnapshot();
  const hasContacts = contacts.length > 0;
  return (
    <section className="as6-crm-contacts-ui" data-as6-contacts-ui="foundation">
      <header className="as6-crm-contacts-ui__header">
        <div>
          <p>CRM Contacts</p>
          <h2>Фундамент интерфейса контактов</h2>
        </div>
        <span>{health.diagnostic.status}</span>
      </header>
      <div className="as6-crm-contacts-ui__grid">
        <main className="as6-crm-contacts-ui__list" data-as6-contacts-list="true">
          {hasContacts ? contacts.map((contact) => <CrmContactRow key={contact.id} contact={contact} />) : <CrmContactsEmptyState />}
        </main>
        <aside className="as6-crm-contacts-ui__panel" data-as6-contacts-panel="true">
          <h3>UI Diagnostics</h3>
          {crmContactPanels.map((panel) => <span key={panel.id}>{panel.title}</span>)}
        </aside>
      </div>
    </section>
  );
}
