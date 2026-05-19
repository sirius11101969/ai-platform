function assertApprovedApproval(record) {
  if (!record) throw Object.assign(new Error('Execution approval record is required'), { statusCode: 400 })
  if (record.approvalStatus !== 'approved') throw Object.assign(new Error('Execution allowed only for approved approvals'), { statusCode: 403 })
}

module.exports = { assertApprovedApproval }
