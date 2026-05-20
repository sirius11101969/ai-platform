const engine=require('../services/aiOrganizationalMemory/organizationalMemoryEngine')
function resolve(req){return{workspaceId:req.workspace?.id||req.aiControl?.workspaceId||req.workspaceId||null}}
async function run(req,res,next){try{res.json(await engine.runOrganizationalMemory(resolve(req)))}catch(e){next(e)}}
async function snapshot(req,res,next){try{res.json({snapshot:await engine.listSnapshots(resolve(req))})}catch(e){next(e)}}
async function lineage(req,res,next){try{res.json({lineage:await engine.listLineage(resolve(req))})}catch(e){next(e)}}
async function timeline(req,res,next){try{res.json({timeline:await engine.listTimeline(resolve(req))})}catch(e){next(e)}}
async function drift(req,res,next){try{res.json({drift:await engine.listDrift(resolve(req))})}catch(e){next(e)}}
async function learning(req,res,next){try{res.json({learning:await engine.listLearning(resolve(req))})}catch(e){next(e)}}
module.exports={run,snapshot,lineage,timeline,drift,learning}
