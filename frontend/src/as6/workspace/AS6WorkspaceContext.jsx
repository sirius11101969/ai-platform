import React, { createContext, useContext, useMemo, useReducer } from 'react';

export const AS6_WORKSPACE_CONTEXT_VERSION = 'EPIC007_PR2';

export const AS6_WORKSPACE_DEFAULT_STATE = {
  activeModule: 'business-home',
  focusContext: {
    mode: 'overview',
    targetId: null,
    reason: 'Default Workspace focus context.',
  },
  rightRail: {
    isOpen: true,
    view: 'workspace-summary',
    reason: 'Default Workspace right rail.',
  },
  actions: [],
  events: [],
};

export const AS6_WORKSPACE_EVENT_TYPES = {
  MODULE_ACTIVATED: 'workspace.module.activated',
  FOCUS_CHANGED: 'workspace.focus.changed',
  RIGHT_RAIL_CHANGED: 'workspace.rightRail.changed',
  ACTION_REGISTERED: 'workspace.action.registered',
  EVENT_PUBLISHED: 'workspace.event.published',
};

export const AS6_WORKSPACE_TRACER_EVENT = 'workspace.runtime.trace';

function createTrace(type, payload = {}) {
  return {
    id: `${Date.now()}-${type}`,
    type: AS6_WORKSPACE_TRACER_EVENT,
    sourceType: type,
    payload,
    createdAt: new Date().toISOString(),
  };
}

function pushEvent(events, event) {
  return [event, ...events].slice(0, 20);
}

function workspaceReducer(state, action) {
  switch (action.type) {
    case AS6_WORKSPACE_EVENT_TYPES.MODULE_ACTIVATED: {
      const trace = createTrace(action.type, { activeModule: action.activeModule });
      return {
        ...state,
        activeModule: action.activeModule,
        events: pushEvent(state.events, trace),
      };
    }

    case AS6_WORKSPACE_EVENT_TYPES.FOCUS_CHANGED: {
      const nextFocus = {
        ...state.focusContext,
        ...action.focusContext,
      };
      const trace = createTrace(action.type, nextFocus);
      return {
        ...state,
        focusContext: nextFocus,
        events: pushEvent(state.events, trace),
      };
    }

    case AS6_WORKSPACE_EVENT_TYPES.RIGHT_RAIL_CHANGED: {
      const nextRightRail = {
        ...state.rightRail,
        ...action.rightRail,
      };
      const trace = createTrace(action.type, nextRightRail);
      return {
        ...state,
        rightRail: nextRightRail,
        events: pushEvent(state.events, trace),
      };
    }

    case AS6_WORKSPACE_EVENT_TYPES.ACTION_REGISTERED: {
      const nextAction = {
        id: action.workspaceAction.id,
        label: action.workspaceAction.label,
        source: action.workspaceAction.source || 'workspace',
        createdAt: new Date().toISOString(),
      };
      const trace = createTrace(action.type, nextAction);
      return {
        ...state,
        actions: [nextAction, ...state.actions].slice(0, 20),
        events: pushEvent(state.events, trace),
      };
    }

    case AS6_WORKSPACE_EVENT_TYPES.EVENT_PUBLISHED: {
      const trace = createTrace(action.type, action.workspaceEvent || {});
      return {
        ...state,
        events: pushEvent(state.events, trace),
      };
    }

    default:
      return state;
  }
}

const AS6WorkspaceContext = createContext(null);

export function AS6WorkspaceProvider({ children, initialState = AS6_WORKSPACE_DEFAULT_STATE }) {
  const [state, dispatch] = useReducer(workspaceReducer, {
    ...AS6_WORKSPACE_DEFAULT_STATE,
    ...initialState,
  });

  const api = useMemo(() => ({
    state,
    activateModule(activeModule) {
      dispatch({ type: AS6_WORKSPACE_EVENT_TYPES.MODULE_ACTIVATED, activeModule });
    },
    setFocusContext(focusContext) {
      dispatch({ type: AS6_WORKSPACE_EVENT_TYPES.FOCUS_CHANGED, focusContext });
    },
    setRightRail(rightRail) {
      dispatch({ type: AS6_WORKSPACE_EVENT_TYPES.RIGHT_RAIL_CHANGED, rightRail });
    },
    registerWorkspaceAction(workspaceAction) {
      dispatch({ type: AS6_WORKSPACE_EVENT_TYPES.ACTION_REGISTERED, workspaceAction });
    },
    publishWorkspaceEvent(workspaceEvent) {
      dispatch({ type: AS6_WORKSPACE_EVENT_TYPES.EVENT_PUBLISHED, workspaceEvent });
    },
  }), [state]);

  return (
    <AS6WorkspaceContext.Provider value={api}>
      {children}
    </AS6WorkspaceContext.Provider>
  );
}

export function useAS6WorkspaceContext() {
  const context = useContext(AS6WorkspaceContext);

  if (!context) {
    throw new Error('useAS6WorkspaceContext must be used inside AS6WorkspaceProvider');
  }

  return context;
}

export function AS6WorkspaceRuntimeTracer() {
  const { state } = useAS6WorkspaceContext();

  return (
    <section className="as6-workspace-runtime-tracer" data-as6-component="workspace-runtime-tracer">
      <span>Runtime Tracer</span>
      <strong>{state.events.length} events</strong>
      <small>runtime-only</small>
    </section>
  );
}
