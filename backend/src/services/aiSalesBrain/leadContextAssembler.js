function summarizeLeadContext({ crmLead = {}, leadScore = null, revenueForecast = {}, activityHistory = [], outreachHistory = [], realtimeMetadata = {} } = {}) {
  return {
    safeSummary: {
      leadName: crmLead.name || 'Unknown lead',
      company: crmLead.company || 'Unknown company',
      stage: crmLead.stage || 'unknown',
      leadScore: leadScore ?? crmLead.leadScore ?? 0,
      forecastBand: revenueForecast.band || 'unavailable',
      recentActivities: activityHistory.slice(0, 5).map((a) => a.type || a.summary).filter(Boolean),
      outreachSignals: outreachHistory.slice(0, 5).map((o) => o.outcome || o.signal).filter(Boolean),
      realtime: {
        sessionId: realtimeMetadata.sessionId || null,
        channel: realtimeMetadata.channel || 'browser',
        locale: realtimeMetadata.locale || 'en-US',
      },
    },
  }
}

module.exports = { summarizeLeadContext }
