const pool = require('../../db/pool')
const executiveMemory = require('./executiveMemoryEngine')
const lineageEngine = require('./decisionLineageEngine')
const initiativeEngine = require('./initiativeHistoryEngine')
const driftEngine = require('./strategicDriftEngine')
const timelineEngine = require('./organizationTimelineEngine')
const graphEngine = require('./memoryGraphEngine')
const learningEngine = require('./institutionalLearningEngine')
const consolidationEngine = require('./knowledgeConsolidationEngine')
const retentionEngine = require('./memoryRetentionEngine')
const governance = { memory_only:true, recommendation_only:true, requires_human_review:true, no_autonomous_execution:true }
async function runOrganizationalMemory({ workspaceId, client = pool }) {
 const executiveDecisions = executiveMemory.generate({ workspaceId })
 const strategicEvolution = [{ planKey:'strategic-plan-q3', change:'increased enterprise focus' }]
 const recommendationOutcomes = [{ recommendationKey:'rec-1', outcome:'improved' }, { recommendationKey:'rec-2', outcome:'monitor' }]
 const initiativeHistory = initiativeEngine.build({ workspaceId })
 const lineage = lineageEngine.build({ executiveDecisions, strategicEvolution, recommendationOutcomes })
 const driftEvents = driftEngine.detect({ strategicEvolution, recommendationOutcomes })
 const timeline = timelineEngine.build({ executiveDecisions, initiativeHistory, recommendationOutcomes })
 const memoryGraph = graphEngine.build({ executiveDecisions, initiativeHistory, lineage })
 const learning = learningEngine.build({ recommendationOutcomes, driftEvents })
 const knowledgeConsolidation = consolidationEngine.consolidate({ executiveDecisions, lineage, learning })
 const snapshot = retentionEngine.snapshot({ payload:{ executiveDecisions, lineage, initiativeHistory, driftEvents, timeline, memoryGraph, learning, knowledgeConsolidation } })
 const insert = (q,p)=>client.query(q,p)
 await insert(`INSERT INTO ai_organizational_memory(workspace_id, memory_payload, memory_only, recommendation_only, requires_human_review, no_autonomous_execution) VALUES($1,$2,true,true,true,true)`,[workspaceId,{ governance, executiveDecisions, strategicEvolution, recommendationOutcomes }])
 for (const item of lineage) await insert(`INSERT INTO ai_decision_lineage(workspace_id, lineage_key, lineage_payload, memory_only, recommendation_only, requires_human_review, no_autonomous_execution) VALUES($1,$2,$3,true,true,true,true)`,[workspaceId,item.lineageKey,item])
 for (const item of initiativeHistory) await insert(`INSERT INTO ai_initiative_history(workspace_id, initiative_key, history_payload, memory_only, recommendation_only, requires_human_review, no_autonomous_execution) VALUES($1,$2,$3,true,true,true,true)`,[workspaceId,item.initiativeKey,item])
 await insert(`INSERT INTO ai_memory_graph(workspace_id, graph_payload, memory_only, recommendation_only, requires_human_review, no_autonomous_execution) VALUES($1,$2,true,true,true,true)`,[workspaceId,memoryGraph])
 for (const item of driftEvents) await insert(`INSERT INTO ai_strategic_drift_events(workspace_id, drift_key, drift_payload, memory_only, recommendation_only, requires_human_review, no_autonomous_execution) VALUES($1,$2,$3,true,true,true,true)`,[workspaceId,item.driftKey,item])
 for (const item of learning) await insert(`INSERT INTO ai_institutional_learning(workspace_id, learning_key, learning_payload, memory_only, recommendation_only, requires_human_review, no_autonomous_execution) VALUES($1,$2,$3,true,true,true,true)`,[workspaceId,item.learningKey,item])
 for (const item of timeline) await insert(`INSERT INTO ai_organization_timeline(workspace_id, event_type, event_payload, occurred_at, memory_only, recommendation_only, requires_human_review, no_autonomous_execution) VALUES($1,$2,$3,$4,true,true,true,true)`,[workspaceId,item.eventType,item.eventPayload,item.occurredAt])
 await insert(`INSERT INTO ai_memory_snapshots(workspace_id, snapshot_payload, memory_only, recommendation_only, requires_human_review, no_autonomous_execution) VALUES($1,$2,true,true,true,true)`,[workspaceId,{ snapshot, knowledgeConsolidation }])
 return { governance, executiveDecisions, strategicEvolution, recommendationOutcomes, initiativeHistory, lineage, driftEvents, timeline, memoryGraph, learning, knowledgeConsolidation, snapshot, events:['organizational_memory_snapshot_created','decision_lineage_updated','initiative_history_recorded','strategic_drift_detected','institutional_learning_updated','memory_graph_rebuilt'] }
}
const listSnapshots = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_memory_snapshots WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 30`, [workspaceId])).rows
const listLineage = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_decision_lineage WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100`, [workspaceId])).rows
const listTimeline = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_organization_timeline WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 200`, [workspaceId])).rows
const listDrift = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_strategic_drift_events WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100`, [workspaceId])).rows
const listLearning = async ({ workspaceId, client = pool }) => (await client.query(`SELECT * FROM ai_institutional_learning WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100`, [workspaceId])).rows
module.exports={ runOrganizationalMemory, listSnapshots, listLineage, listTimeline, listDrift, listLearning, governance }
