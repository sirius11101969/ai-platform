const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const workspaceModelPath = require.resolve('../src/models/workspaceModel')
const dbPoolPath = require.resolve('../src/db/pool')
const indexPath = require.resolve('../src/index')

function mock(modulePath, exports){const old=require.cache[modulePath];require.cache[modulePath]={id:modulePath,filename:modulePath,loaded:true,exports};return ()=>old?(require.cache[modulePath]=old):delete require.cache[modulePath]}
function clear(){for(const p of [indexPath,require.resolve('../src/routes/aiCommandCenterRoutes'),require.resolve('../src/controllers/aiCommandCenterController'),require.resolve('../src/services/aiCommandCenterService')]) delete require.cache[p]}
async function req(base,path,opts={}){const r=await fetch(base+path,opts); return {status:r.status,body:await r.json()}}

async function run(){
  const old=process.env.AI_EXECUTION_ADMIN_KEY;process.env.AI_EXECUTION_ADMIN_KEY='health-admin-key'
  const calls=[]
  const restore=[
    mock(authServicePath,{verifyToken:async()=>({id:'u1'})}),
    mock(workspaceModelPath,{getWorkspaceForUser:async(_u,w)=>w==='ws-ok'?{id:w,userId:'u1'}:null}),
    mock(dbPoolPath,{query:async(sql,args)=>{calls.push({sql,args}); if(sql.includes('FROM workspaces')) return {rows:[{id:'11111111-1111-1111-1111-111111111111',owner_user_id:'u1'}]}; if(sql.includes('INSERT INTO ai_command_center_actions')) return {rows:[{id:'a1',workspace_id:args[0],action_type:args[1],reason:args[2],status:'requested',governance:JSON.parse(args[3]),created_at:new Date().toISOString()}]}; if(sql.includes('UPDATE ai_command_center_actions')) return String(args[0])==='bad-id'?{rows:[]}:{rows:[{id:args[0],workspace_id:args[1],status:args[2],approved_at:args[2]==='approved'?new Date().toISOString():null,rejected_at:args[2]==='rejected'?new Date().toISOString():null}]}; if(sql.includes('SELECT id FROM ai_command_center_actions')) return String(args[0])==='bad-id'?{rows:[]}:{rows:[{id:args[0]}]}; if(sql.includes('FROM ai_command_center_action_audit_log')) return {rows:[{id:'l1',action_id:args[1],event_type:'approved'}]}; if(sql.includes('FROM ai_command_center_actions')) return {rows:[{id:'a1',workspace_id:args[0],action_type:'revenue_review',reason:'r',status:'requested',governance:{humanApprovalRequired:true,noAutonomousExecution:true,noCustomerActions:true,noPricingChanges:true},created_at:new Date().toISOString()}]}; return {rows:[]}}}),
  ]
  clear(); const {app}=require('../src/index'); const s=await new Promise(r=>{const x=app.listen(0,'127.0.0.1',()=>r(x))})
  try{
    const base=`http://127.0.0.1:${s.address().port}`
    let r=await req(base,'/api/ai/command-center/inbox',{headers:{authorization:'Bearer x','x-workspace-id':'ws-ok'}})
    assert.strictEqual(r.status,200)
    assert.strictEqual(r.body.actions[0].status,'requested')

    r=await req(base,'/api/ai/command-center/actions/a1/approve',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer x','x-workspace-id':'ws-ok'},body:JSON.stringify({reviewNote:'ok'})})
    assert.strictEqual(r.status,200)
    assert.strictEqual(r.body.action.status,'approved')

    r=await req(base,'/api/ai/command-center/actions/a1/reject',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer x','x-workspace-id':'ws-ok'},body:JSON.stringify({reviewNote:'no'})})
    assert.strictEqual(r.status,200)
    assert.strictEqual(r.body.action.status,'rejected')

    r=await req(base,'/api/ai/command-center/actions/a1/audit',{headers:{authorization:'Bearer x','x-workspace-id':'ws-ok'}})
    assert.strictEqual(r.status,200)
    assert.strictEqual(r.body.audit[0].event_type,'approved')

    r=await req(base,'/api/ai/command-center/actions/bad-id/approve',{method:'POST',headers:{authorization:'Bearer x','x-workspace-id':'ws-ok'}})
    assert.strictEqual(r.status,404)

    r=await req(base,'/api/ai/command-center/inbox',{headers:{'x-ai-execution-key':'health-admin-key','x-workspace-id':'bad-ws'}})
    assert.strictEqual(r.status,404)

    assert.ok(calls.some((x)=>String(x.sql).includes('ai_command_center_action_audit_log')))
    assert.ok(!calls.some((x)=>String(x.sql).includes('ai_execution_queue')))
  } finally {await new Promise(r=>s.close(r)); restore.reverse().forEach((f)=>f()); clear(); if(old===undefined) delete process.env.AI_EXECUTION_ADMIN_KEY; else process.env.AI_EXECUTION_ADMIN_KEY=old }
}

run().then(()=>console.log('ok')).catch((e)=>{console.error(e);process.exitCode=1})
