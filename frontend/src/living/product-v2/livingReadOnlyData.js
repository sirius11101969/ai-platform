import { fetchCrmLeads, fetchProfile } from "../../services/api";

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

export async function loadLivingReadOnlyData() {
  const [profileResult, leadsResult] = await Promise.allSettled([
    fetchProfile(),
    fetchCrmLeads(),
  ]);

  if (leadsResult.status === "rejected") {
    throw leadsResult.reason;
  }

  const rawLeads = Array.isArray(leadsResult.value?.leads)
    ? leadsResult.value.leads
    : [];

  return {
    profile:
      profileResult.status === "fulfilled"
        ? profileResult.value?.user || profileResult.value?.profile || null
        : null,

    relations: rawLeads.map(normalizeLead),

    availability: {
      relations: true,
      projects: false,
      documents: false,
      knowledge: false,
    },

    loadedAt: new Date().toISOString(),
    readOnly: true,
  };
}
