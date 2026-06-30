import { getAS6MarketplaceProductionState, bootstrapAS6MarketplaceProductionServices } from "./AS6MarketplaceProductionServices";
import { getAS6MarketplaceAdministrationState } from "./AS6MarketplaceAdministration";
import { getAS6DeveloperPortalState } from "./AS6DeveloperPortal";
import { getAS6PublicMarketplaceState } from "./AS6PublicMarketplace";
import { getAS6LocalPluginPackages } from "./AS6PluginPackageManager";
import { getAS6MarketplaceTrustPolicy } from "./AS6MarketplaceTrustPolicy";

export const AS6_MARKETPLACE_GA_VERSION = "P35";
export const AS6_MARKETPLACE_GA_STATUS = "AS6_MARKETPLACE_1_0_GA";

export function getAS6MarketplaceGALifecycleChecklist() {
  return [
    "plugin_sdk_ready",
    "plugin_registry_ready",
    "marketplace_runtime_ready",
    "generated_plugin_auto_discovery_ready",
    "install_persistence_ready",
    "version_update_manager_ready",
    "remote_catalog_ready",
    "trust_validation_ready",
    "cryptographic_signature_verification_ready",
    "trust_ui_policy_ready",
    "signed_package_manager_ready",
    "public_marketplace_ready",
    "developer_portal_ready",
    "marketplace_administration_ready",
    "production_services_ready",
  ];
}

export function validateAS6MarketplaceGAReadiness() {
  const production = getAS6MarketplaceProductionState();
  const administration = getAS6MarketplaceAdministrationState();
  const developer = getAS6DeveloperPortalState();
  const publicMarketplace = getAS6PublicMarketplaceState();
  const trustPolicy = getAS6MarketplaceTrustPolicy();
  const packages = getAS6LocalPluginPackages();

  const failures = [];

  if (!production?.health?.ok) failures.push("production_health_not_ok");
  if (!production.services?.length) failures.push("production_services_missing");
  if (!publicMarketplace.sources?.length) failures.push("public_marketplace_sources_missing");
  if (!Array.isArray(publicMarketplace.categories)) failures.push("public_marketplace_categories_missing");
  if (!trustPolicy?.mode) failures.push("trust_policy_missing");
  if (!Array.isArray(administration.auditLog)) failures.push("admin_audit_log_missing");
  if (!Array.isArray(developer.releases)) failures.push("developer_release_log_missing");
  if (!Array.isArray(packages)) failures.push("local_package_repository_missing");

  return {
    ok: failures.length === 0,
    status: failures.length === 0 ? AS6_MARKETPLACE_GA_STATUS : "AS6_MARKETPLACE_GA_BLOCKED",
    version: AS6_MARKETPLACE_GA_VERSION,
    failures,
    lifecycle: getAS6MarketplaceGALifecycleChecklist(),
    production,
    administration,
    developer,
    publicMarketplace,
    trustPolicy,
    packageCount: packages.length,
    checkedAt: new Date().toISOString(),
  };
}

export function bootstrapAS6MarketplaceGA() {
  bootstrapAS6MarketplaceProductionServices();
  return validateAS6MarketplaceGAReadiness();
}

export function getAS6MarketplaceGAState() {
  return validateAS6MarketplaceGAReadiness();
}
