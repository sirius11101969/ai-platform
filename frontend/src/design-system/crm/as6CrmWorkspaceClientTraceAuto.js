(function as6CrmWorkspaceClientTraceAuto() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function collect() {
    const surface = document.querySelector('[data-as6-crm-workspace-client="v231"]');
    const evidence = {
      stage: 'V233_CRM_WORKSPACE_CLIENT_RUNTIME_TRACER',
      route: window.location.pathname,
      crmWorkspaceClient: Boolean(surface),
      as6Core: Boolean(document.querySelector('[data-as6-core="v228"]')),
      as6Assistant: Boolean(document.querySelector('[data-as6-assistant="v229"]')),
      as6Focus: Boolean(document.querySelector('[data-as6-focus="v230"]')),
      as6RightRail: Boolean(document.querySelector('[data-as6-right-rail="v227"]')),
      timestamp: new Date().toISOString(),
    };

    window.__AS6_CRM_WORKSPACE_CLIENT_TRACE__ = evidence;
    window.dispatchEvent(new CustomEvent('as6-crm-workspace-client-trace', { detail: evidence }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', collect, { once: true });
  } else {
    window.requestAnimationFrame(collect);
  }
})();
