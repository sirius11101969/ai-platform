import React, { useMemo } from 'react';
import './AS6WorkspaceModuleIntegration.css';
import { useAS6WorkspaceContext } from './AS6WorkspaceContext.jsx';
import {
  AS6_WORKSPACE_MODULE_REGISTRY,
  getAS6WorkspaceModule,
  validateAS6WorkspaceModuleRegistry,
} from './AS6WorkspaceModuleRegistry.js';

export const AS6_WORKSPACE_MODULE_INTEGRATION_VERSION = 'EPIC007_PR5';

export function AS6WorkspaceModuleCard({ module }) {
  const { activateModule, publishWorkspaceEvent } = useAS6WorkspaceContext();

  function activateWorkspaceModule() {
    activateModule(module.id);
    publishWorkspaceEvent({
      source: 'workspace-module-integration',
      type: 'workspace.module.activated',
      moduleId: module.id,
      route: module.route,
    });
  }

  return (
    <article className="as6-workspace-module-card" data-module-status={module.status}>
      <div className="as6-workspace-module-card__topline">
        <span>{module.id}</span>
        <strong>{module.status}</strong>
      </div>
      <h3>{module.label}</h3>
      <p>{module.description}</p>
      <dl>
        <dt>Route</dt>
        <dd>{module.route}</dd>
        <dt>Legacy Entry</dt>
        <dd>{module.legacyEntryPoint}</dd>
        <dt>Slot</dt>
        <dd>{module.slot}</dd>
      </dl>
      <button type="button" onClick={activateWorkspaceModule}>Activate in Workspace</button>
    </article>
  );
}

export function AS6WorkspaceModuleSlotBinding() {
  const { state } = useAS6WorkspaceContext();
  const activeModule = getAS6WorkspaceModule(state.activeModule);
  const validation = useMemo(() => validateAS6WorkspaceModuleRegistry(), []);

  return (
    <section className="as6-workspace-module-slot" data-as6-component="workspace-module-slot-binding">
      <div>
        <span>Workspace Slot Binding</span>
        <h3>{activeModule.label}</h3>
        <p>{activeModule.description}</p>
      </div>
      <div className="as6-workspace-module-slot__meta">
        <strong>{validation.valid ? 'Registry PASS' : 'Registry FAIL'}</strong>
        <small>{validation.moduleCount} modules registered</small>
      </div>
    </section>
  );
}

export function AS6WorkspaceRouteCompatibilityPanel() {
  const validation = useMemo(() => validateAS6WorkspaceModuleRegistry(), []);

  return (
    <section className="as6-workspace-route-compatibility" data-as6-component="workspace-route-compatibility">
      <span>Route Compatibility</span>
      <h3>Старые маршруты сохраняются</h3>
      <p>Workspace регистрирует существующие entry points и не ломает текущие маршруты.</p>
      <dl>
        <dt>Duplicate IDs</dt>
        <dd>{validation.duplicateIds.length ? validation.duplicateIds.join(', ') : 'None'}</dd>
        <dt>Missing bindings</dt>
        <dd>{validation.missingRoutes.length ? validation.missingRoutes.join(', ') : 'None'}</dd>
      </dl>
    </section>
  );
}

export function AS6WorkspaceModuleIntegrationTracer() {
  const { state } = useAS6WorkspaceContext();

  return (
    <section className="as6-workspace-module-tracer" data-as6-component="workspace-module-integration-tracer">
      <span>Module Integration Runtime Tracer</span>
      <strong>{state.activeModule}</strong>
      <small>{state.events.length} workspace events</small>
    </section>
  );
}

export default function AS6WorkspaceModuleIntegration() {
  return (
    <section className="as6-workspace-module-integration" data-as6-component="workspace-module-integration">
      <div className="as6-workspace-module-integration__header">
        <span>Module Integration</span>
        <h2>Модули единого Workspace</h2>
        <p>CRM, Dashboard, Executive, Automation, Audit и Business Home подключаются через реестр и Workspace Slot без переноса маршрутов.</p>
      </div>

      <AS6WorkspaceModuleSlotBinding />

      <div className="as6-workspace-module-integration__grid">
        {AS6_WORKSPACE_MODULE_REGISTRY.map((module) => (
          <AS6WorkspaceModuleCard key={module.id} module={module} />
        ))}
      </div>

      <AS6WorkspaceRouteCompatibilityPanel />
      <AS6WorkspaceModuleIntegrationTracer />
    </section>
  );
}
