export const AS6_MARKETPLACE_TRUST_POLICY_VERSION = "P29";

export const AS6_MARKETPLACE_TRUST_POLICY_MODES = {
  ALLOW: "allow",
  WARN: "warn",
  BLOCK: "block",
};

let marketplaceTrustPolicy = {
  mode: AS6_MARKETPLACE_TRUST_POLICY_MODES.WARN,
  requireTrustedPublisher: false,
  requirePackageSha256: false,
  requireSignature: false,
  requireCryptographicVerification: false,
};

const marketplaceTrustAuditLog = [];

export function setAS6MarketplaceTrustPolicy(policy = {}) {
  marketplaceTrustPolicy = {
    ...marketplaceTrustPolicy,
    ...policy,
  };

  return getAS6MarketplaceTrustPolicy();
}

export function getAS6MarketplaceTrustPolicy() {
  return {
    version: AS6_MARKETPLACE_TRUST_POLICY_VERSION,
    ...marketplaceTrustPolicy,
  };
}

export function getAS6MarketplaceTrustAuditLog() {
  return [...marketplaceTrustAuditLog];
}

export function evaluateAS6MarketplaceInstallationPolicy(plugin = {}) {
  const trust = plugin.trust || {};
  const failures = [...(trust.failures || [])];

  if (marketplaceTrustPolicy.requireTrustedPublisher && !trust.trustedPublisher) failures.push("trusted_publisher_required");
  if (marketplaceTrustPolicy.requirePackageSha256 && !plugin.packageSha256) failures.push("package_sha256_required");
  if (marketplaceTrustPolicy.requireSignature && !plugin.signature) failures.push("signature_required");
  if (marketplaceTrustPolicy.requireCryptographicVerification && !trust.signatureVerification?.ok) failures.push("signature_verification_required");

  const blocked = marketplaceTrustPolicy.mode === AS6_MARKETPLACE_TRUST_POLICY_MODES.BLOCK && failures.length > 0;
  const warning = marketplaceTrustPolicy.mode === AS6_MARKETPLACE_TRUST_POLICY_MODES.WARN && failures.length > 0;

  const result = {
    ok: !blocked,
    status: blocked ? "blocked" : warning ? "warning" : "allowed",
    mode: marketplaceTrustPolicy.mode,
    failures,
    pluginId: plugin.id,
    trust,
    checkedAt: new Date().toISOString(),
  };

  marketplaceTrustAuditLog.unshift(result);
  return result;
}

export function getAS6MarketplacePluginTrustSummary(plugin = {}) {
  const trust = plugin.trust || {};
  return {
    pluginId: plugin.id,
    trusted: Boolean(plugin.trusted || trust.ok),
    trustStatus: trust.status || "unknown",
    publisherId: trust.publisherId || plugin.publisherId || plugin.publisher || "unknown",
    trustedKeyCount: trust.trustedKeyCount || 0,
    signatureVerified: Boolean(trust.signatureVerification?.ok),
    failures: trust.failures || [],
  };
}
