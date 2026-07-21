import {
  fetchAiPriorityInbox,
  fetchCrmActivity,
  fetchCrmLeads,
  fetchCurrentWorkspace,
  fetchEmailAttachments,
  fetchProfile,
  fetchWorkspaces,
} from "../../services/api";

function normalizeLead(lead) {
  return {
    id: String(lead?.id || ""),
    name: String(lead?.name || lead?.company || "Без названия"),
    company: String(lead?.company || ""),
    status: String(lead?.status || lead?.stage || "new"),
    email: String(lead?.email || ""),
    phone: String(lead?.phone || lead?.contact || ""),
    updatedAt: lead?.updated_at || lead?.created_at || null,
  };
}

function normalizeAttachment(attachment) {
  return {
    id: String(attachment?.id || ""),
    leadId: String(attachment?.leadId || attachment?.lead_id || ""),
    fileName: String(attachment?.fileName || attachment?.file_name || "Файл без названия"),
    mimeType: String(attachment?.mimeType || attachment?.mime_type || "application/octet-stream"),
    sizeBytes: Number(attachment?.sizeBytes || attachment?.size_bytes || 0),
    createdAt: attachment?.createdAt || attachment?.created_at || null,
    downloadUrl: String(attachment?.downloadUrl || attachment?.download_url || attachment?.url || attachment?.fileUrl || attachment?.file_url || ""),
  };
}

function normalizeActivity(event) {
  return {
    id: String(event?.id || ""),
    leadId: String(event?.leadId || event?.lead_id || ""),
    type: String(event?.type || "activity"),
    title: String(event?.title || "Событие"),
    body: String(event?.body || ""),
    leadName: String(event?.leadName || event?.lead_name || ""),
    createdAt: event?.createdAt || event?.created_at || null,
  };
}

export async function loadLivingReadOnlyData() {
  const [profileResult, leadsResult, attachmentsResult, workspaceResult, workspacesResult, priorityResult, activityResult] = await Promise.allSettled([
    fetchProfile(),
    fetchCrmLeads(),
    fetchEmailAttachments(),
    fetchCurrentWorkspace(),
    fetchWorkspaces(),
    fetchAiPriorityInbox({ mode: "focus" }),
    fetchCrmActivity({ from: "today", limit: 200 }),
  ]);

  const rawLeads = leadsResult.status === "fulfilled" && Array.isArray(leadsResult.value?.leads)
    ? leadsResult.value.leads
    : [];
  const rawAttachments = attachmentsResult.status === "fulfilled" && Array.isArray(attachmentsResult.value?.attachments)
    ? attachmentsResult.value.attachments
    : [];
  const workspace = workspaceResult.status === "fulfilled"
    ? workspaceResult.value?.workspace || null
    : null;
  const workspaces = workspacesResult.status === "fulfilled" && Array.isArray(workspacesResult.value?.workspaces)
    ? workspacesResult.value.workspaces
    : workspace ? [workspace] : [];
  const rawActivity = activityResult.status === "fulfilled" && Array.isArray(activityResult.value?.events)
    ? activityResult.value.events
    : [];

  return {
    profile: profileResult.status === "fulfilled"
      ? profileResult.value?.user || profileResult.value?.profile || null
      : null,
    workspace,
    workspaces,
    priorityInbox: priorityResult.status === "fulfilled" ? priorityResult.value : null,
    activity: rawActivity.map(normalizeActivity),
    relations: rawLeads.map(normalizeLead),
    documents: rawAttachments.map(normalizeAttachment),
    domainStatus: {
      relations: {
        available: leadsResult.status === "fulfilled",
        error: leadsResult.status === "rejected"
          ? leadsResult.reason?.message || "Не удалось загрузить CRM"
          : "",
      },
      priority: {
        available: priorityResult.status === "fulfilled",
        error: priorityResult.status === "rejected"
          ? priorityResult.reason?.message || "Не удалось загрузить главный приоритет"
          : "",
      },
      workspace: {
        available: workspaceResult.status === "fulfilled",
        error: workspaceResult.status === "rejected"
          ? workspaceResult.reason?.message || "Не удалось загрузить рабочее пространство"
          : "",
      },
      activity: {
        available: activityResult.status === "fulfilled",
        error: activityResult.status === "rejected"
          ? activityResult.reason?.message || "Не удалось загрузить журнал событий"
          : "",
      },
      documents: {
        available: attachmentsResult.status === "fulfilled",
        error: attachmentsResult.status === "rejected"
          ? attachmentsResult.reason?.message || "Не удалось загрузить материалы"
          : "",
      },
      projects: { available: false, reason: "Каноническая модель проектов ещё не создана" },
      knowledge: { available: false, reason: "Безопасный адаптер знаний ещё не подключён" },
    },
    availability: {
      relations: leadsResult.status === "fulfilled",
      priority: priorityResult.status === "fulfilled",
      workspace: workspaceResult.status === "fulfilled",
      activity: activityResult.status === "fulfilled",
      projects: false,
      documents: attachmentsResult.status === "fulfilled",
      knowledge: false,
    },
    loadedAt: new Date().toISOString(),
    readOnly: true,
  };
}
