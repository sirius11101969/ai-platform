export const AS6_PLUGIN_TRUST_VERSION = "P27";
export const AS6_PLUGIN_SIGNATURE_VERIFICATION_VERSION = "P28";

const trustedPublishers = new Map();
const trustedPublisherKeys = new Map();

function decodeAS6Base64Url(value = "") {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

export function registerAS6TrustedPublisherKey(publisherId, key = {}) {
  if (!publisherId) return { ok: false, error: "AS6_TRUSTED_PUBLISHER_ID_MISSING" };
  if (!key.id) return { ok: false, error: "AS6_TRUSTED_KEY_ID_MISSING" };
  const keys = trustedPublisherKeys.get(publisherId) || [];
  const nextKey = {
    status: "active",
    algorithm: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    registeredAt: new Date().toISOString(),
    ...key,
  };
  trustedPublisherKeys.set(publisherId, [...keys.filter((item) => item.id !== key.id), nextKey]);
  return { ok: true, publisherId, keyId: key.id };
}

export function rotateAS6TrustedPublisherKey(publisherId, key = {}) {
  const keys = trustedPublisherKeys.get(publisherId) || [];
  trustedPublisherKeys.set(publisherId, keys.map((item) => ({ ...item, status: "rotated", rotatedAt: new Date().toISOString() })));
  return registerAS6TrustedPublisherKey(publisherId, key);
}

export function getAS6TrustedPublisherKeys(publisherId) {
  return trustedPublisherKeys.get(publisherId) || [];
}

async function importAS6VerificationKey(key = {}) {
  if (typeof crypto === "undefined" || !crypto.subtle) return { ok: false, error: "AS6_CRYPTO_SUBTLE_UNAVAILABLE" };
  if (!key.jwk) return { ok: false, error: "AS6_TRUSTED_KEY_JWK_MISSING" };
  const cryptoKey = await crypto.subtle.importKey("jwk", key.jwk, { name: key.algorithm || "RSASSA-PKCS1-v1_5", hash: key.hash || "SHA-256" }, false, ["verify"]);
  return { ok: true, cryptoKey };
}

export async function verifyAS6PluginPackageSignature(plugin = {}) {
  if (typeof crypto === "undefined" || !crypto.subtle) return { ok: false, error: "AS6_CRYPTO_SUBTLE_UNAVAILABLE" };
  const publisherId = plugin.publisherId || plugin.publisher;
  if (!publisherId) return { ok: false, error: "AS6_PUBLISHER_ID_MISSING" };
  if (!plugin.signature) return { ok: false, error: "AS6_PLUGIN_SIGNATURE_MISSING" };
  const keys = getAS6TrustedPublisherKeys(publisherId).filter((key) => key.status === "active");
  if (!keys.length) return { ok: false, error: "AS6_TRUSTED_PUBLISHER_KEY_MISSING", publisherId };
  const payload = plugin.signedPayload || JSON.stringify({ id: plugin.id, version: plugin.version, packageSha256: plugin.packageSha256 });
  const encodedPayload = new TextEncoder().encode(payload);
  const signature = decodeAS6Base64Url(plugin.signature);
  for (const key of keys) {
    try {
      const imported = await importAS6VerificationKey(key);
      if (!imported.ok) continue;
      const verified = await crypto.subtle.verify({ name: key.algorithm || "RSASSA-PKCS1-v1_5" }, imported.cryptoKey, signature, encodedPayload);
      if (verified) return { ok: true, publisherId, keyId: key.id, algorithm: key.algorithm || "RSASSA-PKCS1-v1_5" };
    } catch (error) {
      continue;
    }
  }
  return { ok: false, error: "AS6_PLUGIN_SIGNATURE_INVALID", publisherId };
}

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
  const trustedKeys = publisherId ? getAS6TrustedPublisherKeys(publisherId) : [];

  if (!plugin.id) failures.push("plugin_id_missing");
  if (!plugin.version) failures.push("plugin_version_missing");
  if (!publisherId) failures.push("publisher_id_missing");
  if (!trustedPublisher) failures.push("publisher_not_trusted");
  if (!plugin.packageSha256) failures.push("package_sha256_missing");
  if (!plugin.signature) failures.push("signature_missing");
  if (!trustedKeys.length) failures.push("trusted_publisher_key_missing");

  return {
    ok: failures.length === 0,
    status: failures.length === 0 ? "trusted" : "untrusted",
    failures,
    publisherId,
    trustedPublisher,
    trustedKeyCount: trustedKeys.length,
    signatureVerification: plugin.signatureVerification || null,
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
