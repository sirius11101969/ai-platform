const fs = require('fs')
const path = require('path')
const assert = require('assert')

const migrationPath = path.resolve(__dirname, '../migrations/041_ai_enterprise_coordination_layer.sql')
const migrationSql = fs.readFileSync(migrationPath, 'utf8')

const tables = [
  'ai_enterprise_coordination_runs',
  'ai_department_synchronization',
  'ai_initiative_routes',
  'ai_dependency_resolutions',
  'ai_executive_escalations',
  'ai_organizational_conflicts',
  'ai_enterprise_coordination_memory'
]

for (const tableName of tables) {
  const tablePattern = new RegExp(
    `CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+${tableName}[\\s\\S]*?workspace_id\\s+uuid\\s+NOT\\s+NULL\\s+REFERENCES\\s+workspaces\\(id\\)\\s+ON\\s+DELETE\\s+CASCADE`,
    'i'
  )
  assert.match(
    migrationSql,
    tablePattern,
    `Expected ${tableName}.workspace_id to be uuid with FK to workspaces(id)`
  )
}

console.log('Migration 041 workspace_id type checks passed.')
