import assert from "node:assert/strict";
import { createLivingShellSnapshot } from "../../frontend/src/living/product-v2/livingShellFoundation.js";

const fallback = createLivingShellSnapshot({
  locale: "ru",
  user: { displayName: "Владимир" },
  livingData: {
    workspace: { id: "workspace-1", name: "owner workspace", role: "owner" },
    loadedAt: "reference",
  },
  dataStatus: "ready",
});

assert.equal(fallback.identity.displayName, "Владимир");
assert.equal(fallback.identity.workspaceName, "AS6");
assert.equal(fallback.priority.metricValue, "92%");
assert.equal(fallback.priority.prepared.length, 4);
assert.equal(fallback.spaces.length, 6);
assert.equal(fallback.locale, "ru");

const dynamic = createLivingShellSnapshot({
  locale: "en",
  user: { displayName: "Vladimir", avatarUrl: "https://assets.example/avatar.png" },
  livingData: {
    workspace: {
      id: "workspace-1",
      name: "Northstar",
      role: "owner",
      brandingMode: "company",
      companyLogoUrl: "https://assets.example/logo.png",
    },
    priorityInbox: {
      leads: [{
        id: "lead-1",
        company: "Atlas",
        aiScore: 84,
        aiRiskLevel: "high",
        nextBestActionCode: "prepare_meeting",
        hasMeeting: true,
      }],
      metrics: { focusLeads: 1 },
      totalLeads: 1,
    },
    activity: [{ id: "event-1", title: "Verified event" }],
    loadedAt: "dynamic",
  },
  dataStatus: "ready",
});

assert.match(dynamic.priority.title, /Atlas/);
assert.equal(dynamic.identity.showCompanyLogo, true);
assert.equal(dynamic.priority.prepared.length, 4);
assert.equal(dynamic.actionCount, 1);
assert.equal(dynamic.locale, "en");

console.log("AS6_LIVING_SHELL_MODEL=PASS");
console.log("AS6_ATOMIC_PRIORITY_CONTEXT=PASS");
console.log("AS6_IDENTITY_AND_LOCALE_CONTRACT=PASS");
