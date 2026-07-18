import assert from "node:assert/strict";
import { createLivingShellSnapshot } from "../../frontend/src/living/product-v2/livingShellFoundation.js";

const livingData = {
  workspace: {
    id: "workspace-1",
    ownerUserId: "user-1",
    role: "owner",
    name: "Northstar",
    plan: "pro",
    limits: { workspacesLimit: 3 },
  },
  workspaces: [
    { id: "workspace-1", ownerUserId: "user-1", role: "owner", name: "Northstar" },
    { id: "workspace-2", ownerUserId: "user-1", role: "owner", name: "Atlas" },
  ],
  activity: [
    { id: "event-1", title: "Contact verified" },
    { id: "event-2", title: "Forecast updated" },
  ],
  priorityInbox: {
    leads: [
      { id: "lead-1", company: "Atlas", aiScore: 91, nextBestActionCode: "contact_today" },
      { id: "lead-2", company: "Orion", aiScore: 77, nextBestActionCode: "send_pricing" },
    ],
  },
  loadedAt: "screen1-interaction-test",
};

const initial = createLivingShellSnapshot({ locale: "ru", livingData, dataStatus: "ready" });
assert.equal(initial.version, "as6-screen1-interaction-multi-workspace-v1");
assert.equal(initial.actionCount, 2, "Top summary must use real activity events");
assert.deepEqual(initial.workspaceAllowance, { current: 2, limit: 3, canCreate: true });
assert.deepEqual(initial.subscription, { key: "pro", name: "Про", active: true });
assert.equal(initial.goalOptions.length, 2);
assert.equal(initial.priority.leadId, "lead-1");
assert.ok(initial.priority.prepared.every((item) => item.label && item.target));
assert.ok(initial.priority.chain.every((item) => item.id && item.label));

const selected = createLivingShellSnapshot({
  locale: "ru",
  livingData,
  selectedPriorityId: "priority-lead-2",
  dataStatus: "ready",
});
assert.equal(selected.priority.leadId, "lead-2");
assert.match(selected.priority.title, /Orion/);

const english = createLivingShellSnapshot({ locale: "en", livingData, dataStatus: "ready" });
assert.deepEqual(english.subscription, { key: "pro", name: "Pro", active: true });

console.log("AS6_SCREEN1_REAL_ACTIVITY=PASS");
console.log("AS6_MULTI_WORKSPACE_ALLOWANCE=PASS");
console.log("AS6_DYNAMIC_GOAL_SELECTION=PASS");
