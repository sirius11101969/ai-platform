import React, { useMemo } from 'react';
import './AS6WorkspacePersonalization.css';
import { useAS6WorkspaceContext } from './AS6WorkspaceContext.jsx';

export const AS6_WORKSPACE_PERSONALIZATION_VERSION = 'EPIC007_PR4';

export const AS6_WORKSPACE_ROLES = [
  { id: 'administrator', label: 'Administrator', intent: 'control', defaultModule: 'business-home' },
  { id: 'executive', label: 'Executive', intent: 'decision', defaultModule: 'executive' },
  { id: 'sales', label: 'Sales', intent: 'revenue', defaultModule: 'crm' },
  { id: 'finance', label: 'Finance', intent: 'visibility', defaultModule: 'dashboard' },
  { id: 'operations', label: 'Operations', intent: 'execution', defaultModule: 'automation' },
];

export const AS6_WORKSPACE_PROFILE = {
  id: 'workspace-profile-runtime',
  name: 'AS6 Workspace User',
  roleId: 'executive',
  density: 'comfortable',
  pinnedPanels: ['right-rail', 'ai-runtime'],
  preferredModules: ['business-home', 'executive', 'automation', 'audit'],
};

export const AS6_WORKSPACE_PREFERENCES = {
  rightRailMode: 'contextual',
  aiRecommendationMode: 'context-aware',
  navigationMode: 'workspace',
  compactMode: false,
  showRuntimeTracer: true,
};

export function getAS6WorkspaceRole(roleId = AS6_WORKSPACE_PROFILE.roleId) {
  return AS6_WORKSPACE_ROLES.find((role) => role.id === roleId) || AS6_WORKSPACE_ROLES[0];
}

export function createAS6PersonalizedWorkspace(profile = AS6_WORKSPACE_PROFILE, preferences = AS6_WORKSPACE_PREFERENCES, state) {
  const role = getAS6WorkspaceRole(profile.roleId);
  const activeModule = state?.activeModule || role.defaultModule;
  const focusMode = state?.focusContext?.mode || 'overview';
  return {
    profile,
    role,
    preferences,
    activeModule,
    focusMode,
    recommendation: 'Для роли ' + role.label + ' AS6 рекомендует работать с модулем ' + activeModule + ' в режиме ' + focusMode + '.',
    aiReason: 'Personalized AI использует Workspace Profile, User Role, Active Module и Focus Context.',
  };
}

export function AS6WorkspaceProfileCard() {
  const { state, publishWorkspaceEvent } = useAS6WorkspaceContext();
  const model = useMemo(() => createAS6PersonalizedWorkspace(AS6_WORKSPACE_PROFILE, AS6_WORKSPACE_PREFERENCES, state), [state]);
  return (
    <section className="as6-workspace-personalization__card" data-as6-component="workspace-profile-card">
      <span>Workspace Profile</span>
      <h3>{model.profile.name}</h3>
      <p><b>Role:</b> {model.role.label}</p>
      <p><b>Intent:</b> {model.role.intent}</p>
      <button type="button" onClick={() => publishWorkspaceEvent({ source: 'workspace-personalization', type: 'profile.viewed', roleId: model.role.id })}>Trace Profile</button>
    </section>
  );
}

export function AS6WorkspacePreferencesCard() {
  const { state, setRightRail, publishWorkspaceEvent } = useAS6WorkspaceContext();
  const model = useMemo(() => createAS6PersonalizedWorkspace(AS6_WORKSPACE_PROFILE, AS6_WORKSPACE_PREFERENCES, state), [state]);
  function applyPreference() {
    setRightRail({ isOpen: true, view: 'personalized-workspace', reason: 'Workspace preferences requested contextual right rail.' });
    publishWorkspaceEvent({ source: 'workspace-personalization', type: 'preferences.applied', mode: model.preferences.rightRailMode });
  }
  return (
    <section className="as6-workspace-personalization__card" data-as6-component="workspace-preferences-card">
      <span>Workspace Preferences</span>
      <h3>{model.preferences.navigationMode}</h3>
      <p><b>Right Rail:</b> {model.preferences.rightRailMode}</p>
      <p><b>Density:</b> {model.profile.density}</p>
      <p><b>Current Rail:</b> {state.rightRail.isOpen ? 'open' : 'closed'}</p>
      <button type="button" onClick={applyPreference}>Apply Runtime Preference</button>
    </section>
  );
}

export function AS6RoleBasedWorkspaceCard() {
  const { state, activateModule, publishWorkspaceEvent } = useAS6WorkspaceContext();
  const model = useMemo(() => createAS6PersonalizedWorkspace(AS6_WORKSPACE_PROFILE, AS6_WORKSPACE_PREFERENCES, state), [state]);
  function activateRoleModule() {
    activateModule(model.role.defaultModule);
    publishWorkspaceEvent({ source: 'workspace-personalization', type: 'role.defaultModule.activated', module: model.role.defaultModule });
  }
  return (
    <section className="as6-workspace-personalization__card" data-as6-component="role-based-workspace-card">
      <span>Role-based Workspace</span>
      <h3>{model.role.label}</h3>
      <p><b>Default Module:</b> {model.role.defaultModule}</p>
      <p><b>Active Module:</b> {state.activeModule}</p>
      <button type="button" onClick={activateRoleModule}>Activate Role Module</button>
    </section>
  );
}

export function AS6PersonalizedAIWorkspaceCard() {
  const { state, registerWorkspaceAction } = useAS6WorkspaceContext();
  const model = useMemo(() => createAS6PersonalizedWorkspace(AS6_WORKSPACE_PROFILE, AS6_WORKSPACE_PREFERENCES, state), [state]);
  return (
    <section className="as6-workspace-personalization__card as6-workspace-personalization__card--wide" data-as6-component="personalized-ai-workspace-card">
      <span>Personalized AI</span>
      <h3>{model.recommendation}</h3>
      <p>{model.aiReason}</p>
      <button type="button" onClick={() => registerWorkspaceAction({ id: 'personalized-ai.next-step', label: model.recommendation, source: 'personalized-ai:' + model.role.id })}>Register Personalized AI Action</button>
    </section>
  );
}

export function AS6WorkspacePersonalizationTracer() {
  const { state } = useAS6WorkspaceContext();
  const model = useMemo(() => createAS6PersonalizedWorkspace(AS6_WORKSPACE_PROFILE, AS6_WORKSPACE_PREFERENCES, state), [state]);
  return (
    <section className="as6-workspace-personalization__tracer" data-as6-component="workspace-personalization-tracer">
      <span>Personalization Runtime Tracer</span>
      <strong>{model.role.id}</strong>
      <small>{model.activeModule} / {model.focusMode} / events: {state.events.length}</small>
    </section>
  );
}

export default function AS6WorkspacePersonalization() {
  return (
    <section className="as6-workspace-personalization" data-as6-component="workspace-personalization">
      <div className="as6-workspace-personalization__header">
        <span>Workspace Personalization</span>
        <h2>Персонализация единого Workspace</h2>
        <p>Профиль, роль, настройки интерфейса и Personalized AI используют Workspace Context без нового storage.</p>
      </div>
      <div className="as6-workspace-personalization__grid">
        <AS6WorkspaceProfileCard />
        <AS6WorkspacePreferencesCard />
        <AS6RoleBasedWorkspaceCard />
        <AS6PersonalizedAIWorkspaceCard />
      </div>
      <AS6WorkspacePersonalizationTracer />
    </section>
  );
}
