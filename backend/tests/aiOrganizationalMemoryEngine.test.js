const assert=require('assert');
const poolPath=require.resolve('../src/db/pool'); const old=require.cache[poolPath]; require.cache[poolPath]={id:poolPath,filename:poolPath,loaded:true,exports:{query:async()=>({rows:[{}]})}};
const { runOrganizationalMemory, governance } = require('../src/services/aiOrganizationalMemory/organizationalMemoryEngine')
async function run(){const sql=[];const client={query:async(q)=>{sql.push(q);return{rows:[{}]}}}; const out=await runOrganizationalMemory({workspaceId:'w1',client}); assert.ok(out.lineage.length>0); assert.ok(out.driftEvents.length>0); assert.strictEqual(governance.no_autonomous_execution,true); assert.ok(sql.some((q)=>q.includes('ai_organizational_memory'))); console.log('aiOrganizationalMemoryEngine passed')}
run().then(()=>{if(old) require.cache[poolPath]=old; else delete require.cache[poolPath]}).catch((e)=>{console.error(e);process.exit(1)})
