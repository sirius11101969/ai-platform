const engine = require('../services/aiCompanySimulation/companySimulationEngine')
const resolve = (req) => ({ workspaceId: req.workspace?.id || req.aiControl?.workspaceId || req.workspaceId || null })
async function run(req,res,next){try{res.json(await engine.runSimulation({ ...resolve(req), payload: req.body || {} }))}catch(e){next(e)}}
async function runs(req,res,next){try{res.json({ runs: await engine.listRuns(resolve(req)) })}catch(e){next(e)}}
async function scenarios(req,res,next){try{res.json({ scenarios: await engine.listScenarios(resolve(req)) })}catch(e){next(e)}}
async function results(req,res,next){try{res.json({ results: await engine.listResults(resolve(req)) })}catch(e){next(e)}}
async function risks(req,res,next){try{res.json({ risks: await engine.listRisks(resolve(req)) })}catch(e){next(e)}}
module.exports = { run, runs, scenarios, results, risks }
