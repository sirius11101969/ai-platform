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
    mock(dbPoolPath,{query:async(sql,args)=>{calls.push({sql,args}); if(sql.includes('FROM workspaces')) return {rows:[{id:'11111111-1111-1111-1111-111111111111',owner_user_id:'u1'}]}; if(sql.includes('INSERT INTO ai_command_center_actions')) return {rows:[{id:'a1',workspace_id:args[0],action_type:args[1],reason:args[2],status:'requested',governance:JSON.parse(args[3])}]}; if(sql.includes('FROM ai_command_center_actions')) return {rows:[{id:'a1',workspace_id:args[0],action_type:'revenue_review',status:'requested',governance:{humanApprovalRequired:true}}]}; return {rows:[]}}}),
  ]
  clear(); const {app}=require('../src/index'); const s=await new Promise(r=>{const x=app.listen(0,'127.0.0.1',()=>r(x))})
  try{
    const base=`http://127.0.0.1:${s.address().port}`
    let r=await req(base,'/api/ai/command-center/actions/request',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer x','x-workspace-id':'ws-ok'},body:JSON.stringify({workspaceId:'ws-ok',actionType:'revenue_review',reason:'quarter check'})})
    assert.strictEqual(r.status,201)
    assert.strictEqual(r.body.action.action_type,'revenue_review')
    assert.strictEqual(r.body.action.governance.humanApprovalRequired,true)

    r=await req(base,'/api/ai/command-center/actions/request',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer x','x-workspace-id':'ws-ok'},body:JSON.stringify({workspaceId:'ws-ok',actionType:'hack'})})
    assert.strictEqual(r.status,400)

    r=await req(base,'/api/ai/command-center/actions',{headers:{authorization:'Bearer x','x-workspace-id':'ws-ok'}})
    assert.strictEqual(r.status,200)

    r=await req(base,'/api/ai/command-center/actions',{headers:{'x-ai-execution-key':'health-admin-key','x-workspace-id':'bad-ws'}})
    assert.strictEqual(r.status,404)

    r=await req(base,'/api/ai/command-center/actions',{headers:{'x-ai-execution-key':'health-admin-key','x-workspace-id':'11111111-1111-1111-1111-111111111111'}})
    assert.strictEqual(r.status,200)

    assert.ok(!calls.some((x)=>String(x.sql).includes('ai_execution_queue')))
  } finally {await new Promise(r=>s.close(r)); restore.reverse().forEach((f)=>f()); clear(); if(old===undefined) delete process.env.AI_EXECUTION_ADMIN_KEY; else process.env.AI_EXECUTION_ADMIN_KEY=old }
}

run().then(()=>console.log('ok')).catch((e)=>{console.error(e);process.exitCode=1})
