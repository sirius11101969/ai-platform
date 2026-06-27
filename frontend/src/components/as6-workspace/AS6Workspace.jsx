import React from 'react';

export function AS6Workspace({ children, className = '', dataRoute = 'app', mode = 'app' }) {
  return <div className={className} data-route={dataRoute} data-as6-workspace="v224" data-as6-workspace-mode={mode}>{children}</div>;
}

export function AS6Sidebar({ children, className = '' }) {
  return <aside className={className} data-as6-sidebar="v224">{children}</aside>;
}

export function AS6Header({ children, className = '' }) {
  return <header className={className} data-as6-header="v224">{children}</header>;
}

export function AS6RightRail({ children, className = '' }) {
  return <aside className={className} data-as6-right-rail="v224">{children}</aside>;
}

export function AS6Core({ children, className = '' }) {
  return <section className={className} data-as6-core="v224">{children}</section>;
}

export function AS6Assistant({ children, className = '' }) {
  return <section className={className} data-as6-assistant="v224" aria-label="AS6 Assistant">{children || 'Спросить AS6'}</section>;
}

export function AS6Focus({ children, className = '' }) {
  return <section className={className} data-as6-focus="v224" aria-label="AS6 Focus">{children}</section>;
}

export { AS6SidebarShell, AS6SidebarNav, AS6SidebarSection, AS6SidebarProfile, AS6SidebarAction, AS6_NAVIGATION_PRIMARY, AS6_NAVIGATION_FAVORITES } from './AS6Sidebar.jsx';

export { AS6HeaderShell, AS6HeaderTitle, AS6HeaderToolbar, AS6WorkspaceSelector, AS6ProfilePill, AS6HeaderAction } from './AS6Header.jsx';

export { AS6RightRailShell, AS6RightRailSection, AS6RightRailCard, AS6RightRailMetric, AS6RightRailAction } from './AS6RightRail.jsx';

export { AS6CoreShell, AS6CoreMark, AS6CorePromise, AS6CoreAction, AS6CoreSignal, AS6_CORE_PROMISE, AS6_CORE_ACTION } from './AS6Core.jsx';

export { AS6AssistantShell, AS6AssistantHeader, AS6AssistantMessage, AS6AssistantAction, AS6AssistantStatus, AS6AssistantComposer, AS6_ASSISTANT_NAME, AS6_ASSISTANT_PRIMARY_ACTION, AS6_ASSISTANT_PROMISE } from './AS6Assistant.jsx';

export { AS6FocusShell, AS6FocusHeader, AS6FocusStep, AS6FocusAction, AS6FocusSignal, AS6FocusEmpty, AS6_FOCUS_TITLE, AS6_FOCUS_PROMISE } from './AS6Focus.jsx';
