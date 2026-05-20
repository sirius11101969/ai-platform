function snapshot({ payload }) { return { snapshotKey:`snapshot-${Date.now()}`, retainedSections:Object.keys(payload||{}), retentionPolicy:'rolling_180_days', memoryEvolution:'incremental' } }
module.exports={ snapshot }
