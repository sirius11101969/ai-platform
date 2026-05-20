const pool = require('../../db/pool')
const departmentSync = require('./departmentSynchronizationEngine')
const initiativeRouting = require('./initiativeRoutingEngine')
const dependencyResolution = require('./dependencyResolutionEngine')
const strategicArbitration = require('./strategicArbitrationEngine')
const conflictEngine = require('./organizationalConflictEngine')
const escalationEngine = require('./executiveEscalationEngine')
const scalingEngine = require('./scalingCoordinationEngine')
const crossTeamEngine = require('./crossTeamOrchestrationEngine')
const memoryEngine = require('./coordinationMemoryEngine')
const governance = { coordination_only:true, no_autonomous_execution:true, no_customer_contact:true, no_pricing_changes:true, requires_human_approval:true }
async function runEnterpriseCoordination({ workspaceId, client = pool }) { const departments = departmentSync.generate({ workspaceId }); const routes = initiativeRouting.generate({ departments }); const dependencies = dependencyResolution.generate({ routes }); const strategy = strategicArbitration.generate({ routes, dependencies }); const conflicts = conflictEngine.detect({ departments, dependencies }); const escalations = escalationEngine.generate({ conflicts, dependencies }); const scaling = scalingEngine.generate({ strategy, dependencies }); const orchestration = crossTeamEngine.generate({ departments, routes, conflicts }); const coordinationPayload = { governance, departments, routes, dependencies, strategy, conflicts, escalations, scaling, orchestration }
const run = await client.query(`INSERT INTO ai_enterprise_coordination_runs(workspace_id, coordination_payload, coordination_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_approval) VALUES($1,$2,true,true,true,true,true) RETURNING *`, [workspaceId, coordinationPayload]);
for (const item of departments) await client.query(`INSERT INTO ai_department_synchronization(workspace_id, department_name, synchronization_payload, coordination_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_approval) VALUES($1,$2,$3,true,true,true,true,true)`, [workspaceId, item.department, item]);
for (const item of routes) await client.query(`INSERT INTO ai_initiative_routes(workspace_id, initiative_key, route_payload, coordination_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_approval) VALUES($1,$2,$3,true,true,true,true,true)`, [workspaceId, item.initiativeKey, item]);
for (const item of dependencies) await client.query(`INSERT INTO ai_dependency_resolutions(workspace_id, dependency_key, resolution_payload, coordination_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_approval) VALUES($1,$2,$3,true,true,true,true,true)`, [workspaceId, item.dependencyKey, item]);
for (const item of conflicts) await client.query(`INSERT INTO ai_organizational_conflicts(workspace_id, conflict_key, severity, conflict_payload, coordination_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_approval) VALUES($1,$2,$3,$4,true,true,true,true,true)`, [workspaceId, item.conflictKey, item.severity, item]);
for (const item of escalations) await client.query(`INSERT INTO ai_executive_escalations(workspace_id, escalation_key, escalation_level, escalation_payload, coordination_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_approval) VALUES($1,$2,$3,$4,true,true,true,true,true)`, [workspaceId, item.escalationKey, item.escalationLevel, item]);
await memoryEngine.store({ workspaceId, key: 'latest_enterprise_coordination', value: coordinationPayload, client });
return { run: run.rows[0], ...coordinationPayload, events: ['enterprise_coordination_started','department_synchronization_generated','initiative_route_generated','dependency_resolution_generated','organizational_conflict_detected','executive_escalation_generated','enterprise_coordination_completed'] } }
const listRuns = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_enterprise_coordination_runs WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 30`, [workspaceId])).rows
const listSync = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_department_synchronization WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100`, [workspaceId])).rows
const listRoutes = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_initiative_routes WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100`, [workspaceId])).rows
const listConflicts = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_organizational_conflicts WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100`, [workspaceId])).rows
const listEscalations = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_executive_escalations WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100`, [workspaceId])).rows
module.exports = { runEnterpriseCoordination, listRuns, listSync, listRoutes, listConflicts, listEscalations, governance }
