const engine=require('../services/aiEnterpriseCoordination/enterpriseCoordinationEngine')
function resolve(req){return{workspaceId:req.workspace?.id||req.aiControl?.workspaceId||req.workspaceId||null}}
async function run(req,res,next){try{res.json(await engine.runEnterpriseCoordination(resolve(req)))}catch(e){next(e)}}
async function runs(req,res,next){try{res.json({runs:await engine.listRuns(resolve(req))})}catch(e){next(e)}}
async function synchronization(req,res,next){try{res.json({synchronization:await engine.listSync(resolve(req))})}catch(e){next(e)}}
async function routes(req,res,next){try{res.json({routes:await engine.listRoutes(resolve(req))})}catch(e){next(e)}}
async function conflicts(req,res,next){try{res.json({conflicts:await engine.listConflicts(resolve(req))})}catch(e){next(e)}}
async function escalations(req,res,next){try{res.json({escalations:await engine.listEscalations(resolve(req))})}catch(e){next(e)}}
module.exports={run,runs,synchronization,routes,conflicts,escalations}
