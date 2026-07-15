import {
  fetchCrmLeads,
  fetchEmailAttachments,
  fetchProfile,
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
  };
}

export async function loadLivingReadOnlyData() {
  const [profileResult, leadsResult, attachmentsResult] = await Promise.allSettled([
    fetchProfile(),
    fetchCrmLeads(),
    fetchEmailAttachments(),
  ]);

  if (leadsResult.status === "rejected") throw leadsResult.reason;

  const rawLeads = Array.isArray(leadsResult.value?.leads) ? leadsResult.value.leads : [];
  const rawAttachments = attachmentsResult.status === "fulfilled" && Array.isArray(attachmentsResult.value?.attachments)
    ? attachmentsResult.value.attachments
    : [];

  return {
    profile: profileResult.status === "fulfilled"
      ? profileResult.value?.user || profileResult.value?.profile || null
      : null,
    relations: rawLeads.map(normalizeLead),
    documents: rawAttachments.map(normalizeAttachment),
    domainStatus: {
      relations: { available: true, error: "" },
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
      relations: true,
      projects: false,
      documents: attachmentsResult.status === "fulfilled",
      knowledge: false,
    },
    loadedAt: new Date().toISOString(),
    readOnly: true,
  };
}
