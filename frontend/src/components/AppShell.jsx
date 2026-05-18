import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { creditSummary, userProfile } from "../data/mockData";
import { addWorkspaceMember, clearAuthSession, createWorkspace, fetchCurrentWorkspace, fetchProfile, fetchWorkspaces, getActiveWorkspaceId, getStoredUser, setActiveWorkspaceId, updateWorkspace } from "../services/api";

export function BrandMark() {
  return (
    <Link to="/" className="brand app-brand" aria-label="AI‑платформа для продаж">
      <span>AI</span> Платформа продаж
    </Link>
  );
}

export function ProtectedLayout({ children }) {
  const [profile, setProfile] = useState(() => getStoredUser());
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaceError, setWorkspaceError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetchProfile()
      .then((response) => {
        if (active) setProfile(response.user || null);
      })
      .catch((error) => {
        if (!active) return;
        setProfile(null);
        if (error.status === 401) {
          navigate("/login", { replace: true });
        }
      });

    function handleProfileUpdate(event) {
      setProfile((currentProfile) => ({ ...(currentProfile || {}), ...(event.detail || {}) }));
    }

    window.addEventListener("ai-platform-profile-updated", handleProfileUpdate);
    return () => {
      active = false;
      window.removeEventListener("ai-platform-profile-updated", handleProfileUpdate);
    };
  }, [navigate]);


  useEffect(() => {
    let active = true;
    async function loadWorkspaces() {
      try {
        const response = await fetchWorkspaces();
        if (!active) return;
        const items = response.workspaces || [];
        setWorkspaces(items);
        const storedId = getActiveWorkspaceId();
        const selected = items.find((workspace) => workspace.id === storedId) || items[0] || null;
        if (selected) {
          setActiveWorkspaceId(selected.id);
          const current = await fetchCurrentWorkspace();
          if (active) setCurrentWorkspace(current.workspace || selected);
        }
      } catch (error) {
        if (active) setWorkspaceError(error.message);
      }
    }
    loadWorkspaces();

    function handleWorkspaceUpdate() {
      loadWorkspaces();
    }

    window.addEventListener("ai-platform-workspace-updated", handleWorkspaceUpdate);
    return () => {
      active = false;
      window.removeEventListener("ai-platform-workspace-updated", handleWorkspaceUpdate);
    };
  }, []);

  async function handleWorkspaceChange(event) {
    const workspaceId = event.target.value;
    setActiveWorkspaceId(workspaceId);
    const selected = workspaces.find((workspace) => workspace.id === workspaceId) || null;
    setCurrentWorkspace(selected);
    window.location.reload();
  }

  async function refreshCurrentWorkspace() {
    const [listResponse, currentResponse] = await Promise.all([fetchWorkspaces(), fetchCurrentWorkspace()]);
    setWorkspaces(listResponse.workspaces || []);
    setCurrentWorkspace(currentResponse.workspace || null);
  }

  function openCreateLead() {
    window.sessionStorage?.setItem('crm-open-create-lead', '1');
    navigate('/crm');
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('crm-open-create-lead')), 80);
  }

  function openActivityFeed() {
    window.sessionStorage?.setItem('crm-open-activity-feed', '1');
    navigate('/crm');
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('crm-open-activity-feed')), 80);
  }

  function handleLogout(event) {
    event.preventDefault();
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  const displayName = profile?.email || userProfile.name;
  const displayPlan = currentWorkspace?.plan || profile?.plan || userProfile.plan;
  const workspaceName = currentWorkspace?.name || "Моё пространство";
  const roleLabels = { owner: "Владелец", admin: "Администратор", sales: "Продажи", viewer: "Наблюдатель" };

  return (
    <div className="app-shell">
      <aside className="sidebar shell-glow">
        <BrandMark />
        <nav className="side-nav" aria-label="Основная навигация">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>Дашборд</NavLink>
          <NavLink to="/crm" className={({ isActive }) => (isActive ? "active" : "")}>CRM‑воронка</NavLink>
          <NavLink to="/ai-workers" className={({ isActive }) => (isActive ? "active" : "")}>AI сотрудники</NavLink>
          <NavLink to="/ai-revenue-intelligence" className={({ isActive }) => (isActive ? "active" : "")}>AI Revenue Intelligence</NavLink>
          <NavLink to="/ai-voice-outreach" className={({ isActive }) => (isActive ? "active" : "")}>AI Voice Outreach</NavLink>
          <NavLink to="/followups" className={({ isActive }) => (isActive ? "active" : "")}>AI Follow-ups</NavLink>
          <NavLink to="/priority-inbox" className={({ isActive }) => (isActive ? "active" : "")}>AI Priority Inbox</NavLink>
          <NavLink to="/pipeline-copilot" className={({ isActive }) => (isActive ? "active" : "")}>AI Pipeline Copilot</NavLink>
          <NavLink to="/ai-manager-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>AI Manager Dashboard</NavLink>
          <div className="sidebar-crm-actions" aria-label="Действия CRM">
            <button className="sidebar-create-lead" type="button" onClick={openCreateLead}>+ Создать лид</button>
            <button className="sidebar-activity-feed" type="button" onClick={openActivityFeed}>Лента активности</button>
          </div>
          <Link to="/login" onClick={handleLogout}>Выйти</Link>
        </nav>
        <CreditsMiniBlock credits={currentWorkspace?.creditsPool ?? profile?.credits} />
      </aside>
      <div className="workspace">
        <header className="workspace-header shell-glow">
          <div>
            <span className="eyebrow">Защищённое рабочее пространство</span>
            <h1>AI‑ОС выручки</h1>
          </div>
          <div className="workspace-toolbar">
            <div className="workspace-selector">
              <span>Пространство</span>
              <select value={currentWorkspace?.id || ""} onChange={handleWorkspaceChange} aria-label="Выбор рабочего пространства">
                {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
              </select>
              {workspaceError && <small>{workspaceError}</small>}
            </div>
            <button className="workspace-settings-btn" type="button" onClick={() => setSettingsOpen(true)}>Команда и тариф</button>
            <div className="profile-pill">
              <strong>{displayName}</strong>
              <span>{displayPlan} · {roleLabels[currentWorkspace?.role] || "участник"}</span>
            </div>
          </div>
        </header>
        <div className="workspace-current-name">Текущее пространство: <strong>{workspaceName}</strong></div>
        {children}
        {settingsOpen && <WorkspaceSettings workspace={currentWorkspace} roleLabels={roleLabels} onClose={() => setSettingsOpen(false)} onRefresh={refreshCurrentWorkspace} />}
      </div>
    </div>
  );
}

function CreditsMiniBlock({ credits }) {
  const balance = Number.isFinite(Number(credits)) ? Number(credits) : creditSummary.balance;
  return (
    <section className="credits-mini" aria-label="Баланс AI‑кредитов">
      <span>AI‑кредиты</span>
      <strong>{balance.toLocaleString("ru-RU")}</strong>
      <p>{Number.isFinite(Number(credits)) ? "Живой баланс из профиля пользователя" : creditSummary.forecast}</p>
    </section>
  );
}

export function PageHeading({ eyebrow, title, copy, action }) {
  return (
    <div className="app-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      {action}
    </div>
  );
}

export const Panel = React.forwardRef(function Panel({ className = "", children, ...props }, ref) {
  return <section ref={ref} className={`app-panel shell-glow ${className}`} {...props}>{children}</section>;
});

export function StatCard({ label, value, hint, tone = "cyan" }) {
  return (
    <Panel className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </Panel>
  );
}


function WorkspaceSettings({ workspace, roleLabels, onClose, onRefresh }) {
  const [name, setName] = useState(workspace?.name || "");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("sales");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [status, setStatus] = useState("");
  const canManage = ["owner", "admin"].includes(workspace?.role);
  const limits = workspace?.limits || {};
  const usage = workspace?.usage || {};

  async function saveWorkspace(event) {
    event.preventDefault();
    if (!workspace?.id) return;
    try {
      await updateWorkspace(workspace.id, { name });
      setStatus("Настройки пространства сохранены");
      await onRefresh();
    } catch (error) { setStatus(error.message); }
  }

  async function addMember(event) {
    event.preventDefault();
    if (!workspace?.id) return;
    try {
      await addWorkspaceMember(workspace.id, { email: memberEmail, role: memberRole });
      setMemberEmail("");
      setStatus("Участник добавлен или обновлён");
      await onRefresh();
    } catch (error) { setStatus(error.message); }
  }

  async function createNewWorkspace(event) {
    event.preventDefault();
    try {
      const response = await createWorkspace({ name: newWorkspaceName });
      if (response.workspace?.id) setActiveWorkspaceId(response.workspace.id);
      setNewWorkspaceName("");
      setStatus("Новое пространство создано");
      await onRefresh();
    } catch (error) { setStatus(error.message); }
  }

  return (
    <div className="workspace-modal-backdrop" role="dialog" aria-modal="true">
      <section className="workspace-modal shell-glow">
        <button className="modal-close" type="button" onClick={onClose}>Закрыть</button>
        <span className="eyebrow">SaaS workspace</span>
        <h2>Настройки рабочего пространства</h2>
        <div className="workspace-settings-grid">
          <form onSubmit={saveWorkspace} className="workspace-settings-card">
            <h3>Пространство</h3>
            <label>Название
              <input value={name} onChange={(event) => setName(event.target.value)} disabled={!canManage} />
            </label>
            <p>Тариф: <strong>{workspace?.plan}</strong> · роль: <strong>{roleLabels[workspace?.role] || workspace?.role}</strong></p>
            <button type="submit" disabled={!canManage}>Сохранить</button>
          </form>
          <div className="workspace-settings-card">
            <h3>Лимиты и использование</h3>
            <ul className="workspace-limits">
              <li>AI‑кредиты: {usage.aiCreditsUsed || 0} / {limits.monthlyAiCredits || 0}</li>
              <li>Лиды: {usage.leadsCount || 0} / {limits.leadsLimit || 0}</li>
              <li>Команда: {(workspace?.members || []).length} / {limits.teamMembersLimit || 0}</li>
              <li>Telegram‑автоматизация: {limits.telegramAutomation ? "доступна" : "недоступна"}</li>
              <li>Email‑действия: {limits.emailActions ? "доступны" : "недоступны"}</li>
              <li>Email‑действий: {usage.emailActionsCount || 0}</li>
              <li>Telegram‑сообщений: {usage.telegramMessagesCount || 0}</li>
            </ul>
          </div>
        </div>
        <div className="workspace-settings-grid">
          <form onSubmit={addMember} className="workspace-settings-card">
            <h3>Добавить участника</h3>
            <label>Email пользователя
              <input value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="user@company.ru" disabled={!canManage} />
            </label>
            <label>Роль
              <select value={memberRole} onChange={(event) => setMemberRole(event.target.value)} disabled={!canManage}>
                <option value="admin">Администратор</option>
                <option value="sales">Продажи</option>
                <option value="viewer">Наблюдатель</option>
              </select>
            </label>
            <button type="submit" disabled={!canManage}>Добавить</button>
          </form>
          <form onSubmit={createNewWorkspace} className="workspace-settings-card">
            <h3>Новое пространство</h3>
            <label>Название
              <input value={newWorkspaceName} onChange={(event) => setNewWorkspaceName(event.target.value)} placeholder="AS6 Sales Team" />
            </label>
            <button type="submit">Создать пространство</button>
          </form>
        </div>
        <div className="workspace-members-list">
          <h3>Команда</h3>
          {(workspace?.members || []).map((member) => (
            <div key={member.id} className="workspace-member-row">
              <span>{member.email}</span>
              <strong>{roleLabels[member.role] || member.role}</strong>
            </div>
          ))}
        </div>
        {status && <p className="workspace-settings-status">{status}</p>}
      </section>
    </div>
  );
}
