const fs=require('fs'); const path=require('path'); const assert=require('assert');
const sql=fs.readFileSync(path.resolve(__dirname,'../migrations/042_ai_organizational_memory.sql'),'utf8')
for(const t of ['ai_organizational_memory','ai_decision_lineage','ai_initiative_history','ai_memory_graph','ai_strategic_drift_events','ai_institutional_learning','ai_organization_timeline','ai_memory_snapshots']){assert.match(sql,new RegExp(`CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+${t}[\\s\\S]*workspace_id\\s+UUID\\s+NOT\\s+NULL\\s+REFERENCES\\s+workspaces\\(id\\)\\s+ON\\s+DELETE\\s+CASCADE`,'i'))}
console.log('aiOrganizationalMemoryMigration passed')
