import { emitAS6BusEvent } from "../bus";
import { getAS6Widgets } from "../widgets";
import { validateAS6TenantPolicy } from "../tenant";

export const AS6_WORKSPACE_RUNTIME_VERSION = "P8";

const workspaceRegistry = new Map();

export function registerAS6Workspace(workspace) {
  if (!workspace?.id) return { ok:false,error:"AS6_WORKSPACE_ID_MISSING" };
  if (!workspace?.title) return { ok:false,error:"AS6_WORKSPACE_TITLE_MISSING" };

  workspaceRegistry.set(workspace.id,{
    widgets:[],
    layout:{},
    status:"registered",
    version:AS6_WORKSPACE_RUNTIME_VERSION,
    ...workspace
  });

  emitAS6BusEvent("workspace.registered",{workspaceId:workspace.id});

  return {ok:true,workspaceId:workspace.id};
}

export function attachWidgetToWorkspace(workspaceId,widgetId,position={}){
  const workspaceTenantPolicy = validateAS6TenantPolicy({ workspaceId, widgetId });
  if (!workspaceTenantPolicy.ok) return { ok:false, error:"AS6_WORKSPACE_TENANT_MISMATCH", failures: workspaceTenantPolicy.failures };
  const ws=workspaceRegistry.get(workspaceId);
  if(!ws) return {ok:false,error:"WORKSPACE_NOT_FOUND"};

  ws.widgets=[...new Set([...ws.widgets,widgetId])];
  ws.layout[widgetId]=position;

  emitAS6BusEvent("workspace.widget.attached",{workspaceId,widgetId});

  return {ok:true};
}

export function detachWidgetFromWorkspace(workspaceId,widgetId){
  const ws=workspaceRegistry.get(workspaceId);
  if(!ws) return {ok:false,error:"WORKSPACE_NOT_FOUND"};

  ws.widgets=ws.widgets.filter(id=>id!==widgetId);
  delete ws.layout[widgetId];

  emitAS6BusEvent("workspace.widget.detached",{workspaceId,widgetId});

  return {ok:true};
}

export function saveWorkspaceLayout(workspaceId){
  const ws=workspaceRegistry.get(workspaceId);
  if(!ws) return {ok:false,error:"WORKSPACE_NOT_FOUND"};

  emitAS6BusEvent("workspace.saved",{workspaceId});

  return {
    ok:true,
    snapshot:{
      workspaceId,
      widgets:ws.widgets,
      layout:ws.layout
    }
  };
}

export function loadWorkspaceLayout(snapshot){
  workspaceRegistry.set(snapshot.workspaceId,{
    id:snapshot.workspaceId,
    title:snapshot.workspaceId,
    widgets:snapshot.widgets,
    layout:snapshot.layout,
    status:"active",
    version:AS6_WORKSPACE_RUNTIME_VERSION
  });

  emitAS6BusEvent("workspace.loaded",{workspaceId:snapshot.workspaceId});

  return {ok:true};
}

export function createWorkspaceFromCurrentWidgets(id,title){
  const widgets=getAS6Widgets();

  registerAS6Workspace({id,title});

  widgets.forEach((w,index)=>{
    attachWidgetToWorkspace(id,w.id,{
      column:index%2,
      row:Math.floor(index/2)
    });
  });

  return workspaceRegistry.get(id);
}

export function getAS6WorkspaceState(){
  return{
    version:AS6_WORKSPACE_RUNTIME_VERSION,
    workspaceCount:workspaceRegistry.size,
    workspaces:[...workspaceRegistry.values()]
  };
}
