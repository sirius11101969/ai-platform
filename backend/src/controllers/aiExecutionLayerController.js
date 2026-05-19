const pool = require('../db/pool')
const { listQueue } = require('../services/aiExecution/executionQueueManager')
const { executeQueueItem } = require('../services/aiExecution/aiExecutionEngine')

async function getQueue(req, res, next) { try { res.json({ items: await listQueue(req.workspace.id) }) } catch (e) { next(e) } }
async function execute(req, res, next) { try { res.json(await executeQueueItem({ workspaceId: req.workspace.id, executionId: req.params.id, actorUserId: req.user.id })) } catch (e) { next(e) } }
async function cancel(req, res, next) { try { await pool.query('UPDATE ai_execution_queue SET status=$2, updated_at=NOW() WHERE id=$1 AND workspace_id=$3', [req.params.id, 'failed', req.workspace.id]); res.json({ ok: true }) } catch (e) { next(e) } }
async function getRuns(req, res, next) { try { const { rows } = await pool.query('SELECT * FROM ai_execution_runs WHERE workspace_id=$1 ORDER BY created_at DESC', [req.workspace.id]); res.json({ runs: rows }) } catch (e) { next(e) } }

module.exports = { getQueue, execute, cancel, getRuns }
