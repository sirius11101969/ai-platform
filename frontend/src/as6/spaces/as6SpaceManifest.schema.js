export const AS6_SPACE_MANIFEST_SCHEMA_VERSION = "P1.2";

export const AS6_SPACE_MANIFEST_REQUIRED_FIELDS = [
  "id",
  "title",
  "version",
  "category",
  "routeBase",
  "status",
  "routes",
  "navigation",
  "widgets",
  "services",
  "commands",
  "permissions",
  "policies",
  "capabilities",
  "aiActions",
  "searchProviders",
  "contextProviders",
  "settings",
];

export function validateAS6SpaceManifest(manifest) {
  const failures = [];

  if (!manifest || typeof manifest !== "object") {
    return {
      ok: false,
      failures: ["manifest_not_object"],
    };
  }

  for (const field of AS6_SPACE_MANIFEST_REQUIRED_FIELDS) {
    if (!(field in manifest)) {
      failures.push(`missing_${field}`);
    }
  }

  const arrayFields = [
    "routes",
    "navigation",
    "widgets",
    "services",
    "commands",
    "permissions",
    "policies",
    "capabilities",
    "aiActions",
    "searchProviders",
    "contextProviders",
  ];

  for (const field of arrayFields) {
    if (field in manifest && !Array.isArray(manifest[field])) {
      failures.push(`${field}_not_array`);
    }
  }

  if ("settings" in manifest && typeof manifest.settings !== "object") {
    failures.push("settings_not_object");
  }

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_SPACE_MANIFEST_SCHEMA_VERSION,
  };
}
