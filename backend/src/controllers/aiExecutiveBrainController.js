const engine = require('../services/aiExecutiveBrain/executiveBrainEngine')
function resolve(req) { return { workspaceId: req.workspace?.id || req.aiControl?.workspaceId || req.workspaceId || null } }
async function getSnapshot(req,res,next){try{const c=resolve(req);res.json({snapshot:await engine.getLatestSnapshot(c)})}catch(e){next(e)}}
async function getRecommendations(req,res,next){try{const c=resolve(req);res.json({recommendations:await engine.getRecommendations(c)})}catch(e){next(e)}}
async function getRisks(req,res,next){try{const c=resolve(req);res.json({risks:await engine.getRisks(c)})}catch(e){next(e)}}
async function getOrganizationalHealth(req,res,next){try{const c=resolve(req);res.json({organizationalHealth:await engine.getOrganizationalHealth(c),memory:await engine.listMemory(c)})}catch(e){next(e)}}
async function runAnalysis(req,res,next){try{const c=resolve(req);res.json(await engine.runAnalysis(c))}catch(e){next(e)}}
module.exports={getSnapshot,getRecommendations,getRisks,getOrganizationalHealth,runAnalysis}
