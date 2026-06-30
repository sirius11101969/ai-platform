import React from 'react';

export const AS6_NAVIGATION_PRIMARY = [
  { to: '/command-center', label: 'Command Center', icon: '🚀', commandOnly: true },
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/marketplace', label: 'Marketplace', icon: '🧩', meta: 'P21', as6: 'AS6_MARKETPLACE_MENU_VISIBLE_P21' },
  { to: '/crm', label: 'CRM', icon: '▧' },
  { to: '/dashboard/revenue', label: 'Revenue', icon: '↗' },
  { to: '/ai-workforce-center', label: 'AI сотрудники', icon: '👥' },
  { to: '/followups', label: 'AI задачи', icon: '☑', badge: '12' },
  { to: '/ai-revenue-intelligence', label: 'AI аналитика', icon: '⌁' },
  { to: '/priority-inbox', label: 'AI коммуникации', icon: '✉', badge: '3' },
  { to: '/ai-system-health-center', label: 'AI DevOps Center', icon: '◇' },
  { to: '/ai-enterprise-coordination', label: 'AI настройки', icon: '⚙' },
];

export const AS6_NAVIGATION_FAVORITES = [
  { to: '/pipeline-copilot', label: 'Pipeline Copilot', icon: '▣' },
  { to: '/ai-approval-center', label: 'Approval Queue', icon: '▢', meta: '7' },
  { to: '/ai-workforce-center', label: 'AI SDR Agents', icon: '⌘' },
  { to: '/ai-executive-brain', label: 'Executive Brain', icon: '✧' },
];

export function AS6SidebarShell({ children, className = '', command = false }) {
  return (
    <aside className={className} data-as6-sidebar="v225" data-as6-sidebar-mode={command ? 'command' : 'app'}>
      {children}
    </aside>
  );
}

export function AS6SidebarNav({ children, className = '', label = 'AS6 navigation' }) {
  return (
    <nav className={className} aria-label={label} data-as6-sidebar-nav="v225">
      {children}
    </nav>
  );
}

export function AS6SidebarSection({ title, children, className = '' }) {
  return (
    <div className={className} data-as6-sidebar-section="v225">
      {title && <span>{title}</span>}
      {children}
    </div>
  );
}

export function AS6SidebarProfile({ children, className = '' }) {
  return (
    <div className={className} data-as6-sidebar-profile="v225">
      {children}
    </div>
  );
}

export function AS6SidebarAction({ children, className = '', onClick, type = 'button' }) {
  return (
    <button className={className} type={type} onClick={onClick} data-as6-sidebar-action="v225">
      {children}
    </button>
  );
}

export default AS6SidebarShell;
