export const AS6_PLUGIN_TRUST_VERSION = "P27";

const trustedPublishers = new Map();

export function registerAS6TrustedPublisher(publisher = {}) {
  if (!publisher.id) return { ok: false, error: "AS6_TRUSTED_PUBLISHER_ID_MISSING" };
  trustedPublishers.set(publisher.id, {
    status: "trusted",
    registeredAt: new Date().toISOString(),
    ...publisher,
  });
  return { ok: true, publisherId: publisher.id };
}

export function getAS6TrustedPublishers() {
  return [...trustedPublishers.values()];
}

export function getAS6TrustedPublisherById(publisherId) {
  return trustedPublishers.get(publisherId) || null;
}

export async function calculateAS6PluginPackageSHA256(payload = "") {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return { ok: false, error: "AS6_CRYPTO_SUBTLE_UNAVAILABLE" };
  }
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return { ok: true, sha256: hash };
}

export function validateAS6PluginPackageTrust(plugin = {}) {
  const failures = [];
  const publisherId = plugin.publisherId || plugin.publisher;
  const trustedPublisher = publisherId ? getAS6TrustedPublisherById(publisherId) : null;

  if (!plugin.id) failures.push("plugin_id_missing");
  if (!plugin.version) failures.push("plugin_version_missing");
  if (!publisherId) failures.push("publisher_id_missing");
  if (!trustedPublisher) failures.push("publisher_not_trusted");
  if (!plugin.packageSha256) failures.push("package_sha256_missing");
  if (!plugin.signature) failures.push("signature_missing");

  return {
    ok: failures.length === 0,
    status: failures.length === 0 ? "trusted" : "untrusted",
    failures,
    publisherId,
    trustedPublisher,
    version: AS6_PLUGIN_TRUST_VERSION,
  };
}

export function annotateAS6PluginTrust(plugin = {}) {
  const trust = validateAS6PluginPackageTrust(plugin);
  return {
    ...plugin,
    trust,
    trusted: trust.ok,
  };
}

export function filterAS6TrustedPlugins(plugins = []) {
  return plugins.map(annotateAS6PluginTrust);
}
