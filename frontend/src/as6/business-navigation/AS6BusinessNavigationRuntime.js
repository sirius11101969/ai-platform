import {
  getAS6BusinessWorkspaceState,
  openAS6BusinessModule,
  favoriteAS6BusinessItem,
  searchAS6BusinessWorkspace,
} from "../business-workspace";
import { getAS6MarketplaceNavigationItem } from "../plugins/marketplace-route";

export const AS6_BUSINESS_NAVIGATION_VERSION = "B2";

const navigationRegistry = new Map();
const navigationSections = new Map();
const navigationAuditLog = [];

function now() {
  return new Date().toISOString();
}

function audit(action, payload = {}) {
  const entry = { action, payload, createdAt: now() };
  navigationAuditLog.unshift(entry);
  return entry;
}

export function registerAS6BusinessNavigationSection(section = {}) {
  if (!section.id) return { ok: false, error: "AS6_BUSINESS_NAVIGATION_SECTION_ID_MISSING" };
  navigationSections.set(section.id, {
    order: 100,
    title: section.id,
    registeredAt: now(),
    ...section,
  });
  audit("navigation.section.registered", { sectionId: section.id });
  return { ok: true, sectionId: section.id };
}

export function registerAS6BusinessNavigationItem(item = {}) {
  if (!item.id) return { ok: false, error: "AS6_BUSINESS_NAVIGATION_ITEM_ID_MISSING" };
  if (!item.path) return { ok: false, error: "AS6_BUSINESS_NAVIGATION_ITEM_PATH_MISSING" };
  navigationRegistry.set(item.id, {
    sectionId: item.sectionId || "main",
    order: item.order || 100,
    status: "registered",
    registeredAt: now(),
    ...item,
  });
  audit("navigation.item.registered", { itemId: item.id });
  return { ok: true, itemId: item.id };
}

export function getAS6BusinessNavigationSections() {
  return [...navigationSections.values()].sort((a, b) => (a.order || 100) - (b.order || 100));
}

export function getAS6BusinessNavigationItems() {
  return [...navigationRegistry.values()].sort((a, b) => (a.order || 100) - (b.order || 100));
}

export function getAS6BusinessNavigationTree() {
  const items = getAS6BusinessNavigationItems();
  return getAS6BusinessNavigationSections().map((section) => ({
    ...section,
    items: items.filter((item) => item.sectionId === section.id),
  }));
}

export function openAS6BusinessNavigationItem(itemId) {
  const item = navigationRegistry.get(itemId);
  if (!item) return { ok: false, error: "AS6_BUSINESS_NAVIGATION_ITEM_NOT_FOUND", itemId };
  const result = openAS6BusinessModule(item.moduleId || item.id, { title: item.title, path: item.path });
  audit("navigation.item.opened", { itemId, result });
  return { ok: result.ok, item, result };
}

export function favoriteAS6BusinessNavigationItem(itemId) {
  const item = navigationRegistry.get(itemId);
  if (!item) return { ok: false, error: "AS6_BUSINESS_NAVIGATION_ITEM_NOT_FOUND", itemId };
  const result = favoriteAS6BusinessItem({ id: item.id, title: item.title, type: "navigation", path: item.path });
  audit("navigation.item.favorited", { itemId, result });
  return result;
}

export function searchAS6BusinessNavigation(query = "") {
  const q = query.trim().toLowerCase();
  const local = getAS6BusinessNavigationItems().filter((item) =>
    [item.id, item.title, item.label, item.path, item.sectionId].filter(Boolean).join(" ").toLowerCase().includes(q)
  );
  const workspace = searchAS6BusinessWorkspace(query);
  return {
    ok: true,
    query,
    results: local,
    workspaceResults: workspace.results || [],
  };
}

export function getAS6BusinessNavigationAuditLog() {
  return [...navigationAuditLog];
}

export function bootstrapAS6BusinessNavigation() {
  registerAS6BusinessNavigationSection({ id: "main", title: "Main", order: 10 });
  registerAS6BusinessNavigationSection({ id: "business", title: "Business", order: 20 });
  registerAS6BusinessNavigationSection({ id: "platform", title: "Platform", order: 90 });

  registerAS6BusinessNavigationItem({ id: "dashboard", title: "Dashboard", path: "/dashboard", icon: "▦", sectionId: "main", order: 10, moduleId: "dashboard" });
  registerAS6BusinessNavigationItem({ id: "crm", title: "CRM", path: "/as6-crm", icon: "▧", sectionId: "business", order: 20, moduleId: "crm" });
  registerAS6BusinessNavigationItem({ id: "ai-workforce", title: "AI Workforce", path: "/ai-workforce-center", icon: "👥", sectionId: "business", order: 30, moduleId: "ai-workforce" });

  const marketplace = getAS6MarketplaceNavigationItem();
  if (marketplace?.id) {
    registerAS6BusinessNavigationItem({
      id: marketplace.id,
      title: marketplace.title,
      path: marketplace.path,
      icon: marketplace.icon,
      sectionId: "platform",
      order: marketplace.order || 900,
      moduleId: "marketplace",
      description: marketplace.description,
    });
  }

  return getAS6BusinessNavigationState();
}

export function getAS6BusinessNavigationState() {
  return {
    version: AS6_BUSINESS_NAVIGATION_VERSION,
    sections: getAS6BusinessNavigationSections(),
    items: getAS6BusinessNavigationItems(),
    tree: getAS6BusinessNavigationTree(),
    workspace: getAS6BusinessWorkspaceState(),
    auditLog: getAS6BusinessNavigationAuditLog(),
  };
}
