const REQUIRED_RULES = ['requires_approval', 'requires_workspace_match', 'requires_valid_approval_status', 'deny_expired_approvals', 'deny_revoked_approvals']

function validatePolicy({ workspaceId, approval, now = new Date() }) {
  const reasons = []
  if (!approval) reasons.push('missing_approval')
  if (approval && approval.workspaceId !== workspaceId) reasons.push('workspace_mismatch')
  if (approval && approval.status !== 'approved') reasons.push('approval_status_not_approved')
  if (approval?.expiresAt && new Date(approval.expiresAt) < now) reasons.push('approval_expired')
  if (approval?.revokedAt) reasons.push('approval_revoked')
  return { allowed: reasons.length === 0, reasons, rules: REQUIRED_RULES }
}

module.exports = { REQUIRED_RULES, validatePolicy }
