const engine = require('../services/aiStrategicPlanning/strategicPlanningEngine')
function resolve(req) { return { workspaceId: req.workspace?.id || req.aiControl?.workspaceId || req.workspaceId || null } }
async function run(req,res,next){try{res.json(await engine.runStrategicPlanning(resolve(req)))}catch(e){next(e)}}
async function plans(req,res,next){try{res.json({plans:await engine.listPlans(resolve(req)), strategicMemory:await engine.listStrategicMemory(resolve(req))})}catch(e){next(e)}}
async function okrs(req,res,next){try{res.json({okrs:await engine.getLatestOkrs(resolve(req))})}catch(e){next(e)}}
async function initiatives(req,res,next){try{res.json({initiatives:await engine.getLatestInitiatives(resolve(req))})}catch(e){next(e)}}
async function dependency(req,res,next){try{res.json({dependencyGraph:await engine.getLatestDependencyGraph(resolve(req))})}catch(e){next(e)}}
async function resource(req,res,next){try{res.json({resourceAllocation:await engine.getLatestResourceAllocation(resolve(req))})}catch(e){next(e)}}
module.exports = { run, plans, okrs, initiatives, dependency, resource }
