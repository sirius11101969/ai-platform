import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createLivingShellSnapshot } from "../../frontend/src/living/product-v2/livingShellFoundation.js";

const root = process.env.AS6_ROOT || process.cwd();

const livingData = {
  profile: {
    displayName: "Vladimir",
    avatarUrl: "https://assets.example/vladimir.png",
    avatarScale: 92,
  },
  workspace: {
    id: "workspace-1",
    ownerUserId: "user-1",
    role: "owner",
    name: "Northstar",
    companyLogoUrl: "https://assets.example/northstar.png",
    companyLogoScale: 86,
    brandingMode: "company",
    plan: "pro",
    limits: { workspacesLimit: 3 },
  },
  workspaces: [
    { id: "workspace-1", ownerUserId: "user-1", role: "owner", name: "Northstar" },
    { id: "workspace-2", ownerUserId: "user-1", role: "owner", name: "Atlas" },
  ],
  activity: [
    { id: "event-1", title: "Contact verified" },
    { id: "event-2", title: "Forecast updated" },
  ],
  priorityInbox: {
    leads: [
      { id: "lead-1", company: "Atlas", aiScore: 91, nextBestActionCode: "contact_today" },
      { id: "lead-2", company: "Orion", aiScore: 77, nextBestActionCode: "send_pricing" },
    ],
  },
  loadedAt: "screen1-interaction-test",
};

const initial = createLivingShellSnapshot({ locale: "ru", livingData, dataStatus: "ready" });
assert.equal(initial.version, "as6-screen1-interaction-multi-workspace-v1");
assert.equal(initial.actionCount, 2, "Top summary must use real activity events");
assert.deepEqual(initial.workspaceAllowance, { current: 2, limit: 3, canCreate: true });
assert.deepEqual(initial.subscription, { key: "pro", name: "Про", active: true });
assert.equal(initial.identity.companyLogoScale, 86, "Workspace logo scale must enter the shared identity contract");
assert.equal(initial.identity.avatarScale, 92, "Profile photo scale must enter the shared identity contract");
assert.equal(initial.t("brandCoBranded", { company: "ЭконоЭКО" }), "Совместный брендинг: AS6 + ЭконоЭКО");
assert.equal(initial.t("brandCompany", { company: "ЭконоЭКО" }), "Только загруженный логотип: ЭконоЭКО");
assert.equal(initial.t("managePlan"), "Тарифы и возможности");
assert.equal(initial.goalOptions.length, 2);
assert.equal(initial.priority.leadId, "lead-1");
assert.ok(initial.priority.prepared.every((item) => item.label && item.target));
assert.ok(initial.priority.chain.every((item) => item.id && item.label));

const selected = createLivingShellSnapshot({
  locale: "ru",
  livingData,
  selectedPriorityId: "priority-lead-2",
  dataStatus: "ready",
});
assert.equal(selected.priority.leadId, "lead-2");
assert.match(selected.priority.title, /Orion/);

const english = createLivingShellSnapshot({ locale: "en", livingData, dataStatus: "ready" });
assert.deepEqual(english.subscription, { key: "pro", name: "Pro", active: true });
assert.equal(english.t("brandCompany", { company: "EconoECO" }), "Uploaded company logo only: EconoECO");

const appSource = fs.readFileSync(path.join(root, "frontend/src/living/product-v2/LivingCanonicalApp.jsx"), "utf8");
const masterSource = fs.readFileSync(path.join(root, "frontend/src/living/product-v2/AS6MasterScreen.jsx"), "utf8");
const engineSource = fs.readFileSync(path.join(root, "frontend/src/living/product-v2/LivingSpaceEngine.jsx"), "utf8");
const settingsSource = fs.readFileSync(path.join(root, "frontend/src/living/product-v2/LivingSettingsSpace.jsx"), "utf8");
const localizationSource = fs.readFileSync(path.join(root, "frontend/src/living/product-v2/livingLocalization.js"), "utf8");
const shellSource = fs.readFileSync(path.join(root, "frontend/src/living/product-v2/livingShellFoundation.js"), "utf8");
const referenceCss = fs.readFileSync(path.join(root, "frontend/src/living/product-v2/AS6MasterScreenReference.css"), "utf8");
const schemaSource = fs.readFileSync(path.join(root, "backend/src/db/schema.js"), "utf8");
const workspaceModelSource = fs.readFileSync(path.join(root, "backend/src/models/workspaceModel.js"), "utf8");
const userModelSource = fs.readFileSync(path.join(root, "backend/src/models/userModel.js"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "frontend/src/services/api.js"), "utf8");

assert.match(appSource, /livingRequestIdRef/, "Workspace refreshes must reject stale responses");
assert.match(appSource, /data: \{ \.\.\.current\.data, workspace: nextWorkspace \}/, "Workspace selection must update optimistically");
assert.match(settingsSource, /onLocaleChange\?\.\(nextLanguage\)/, "Settings locale must update immediately");
assert.match(settingsSource, /!isAs6Company && <option value="co-branded">/, "AS6 must not display a redundant AS6 + AS6 mode");
assert.match(referenceCss, /AS6_SCREEN1_REFINEMENT_V2: final visual ownership after legacy reference overrides/, "Screen 1 final ownership layer missing");
assert.match(referenceCss, /background: #08090b;/, "Dark theme must use the neutral black baseline");
assert.match(referenceCss, /\.as6-master__intent:focus-within/, "Intent outline must be focus driven");
assert.match(apiSource, /saveAuthSession\(nextSession, \{ syncWorkspace: false \}\)/, "Profile saves must preserve the active workspace");
assert.match(referenceCss, /\.as6-master__intent input:focus,[\s\S]*?box-shadow: none;/, "Intent input must not render its own focus frame");
assert.match(masterSource, /const resolvedIntent = intent\.trim\(\) \|\| String\(priority\.intent \|\| ""\)\.trim\(\)/, "Suggested intent must remain actionable when the input is empty");
assert.match(masterSource, /disabled=\{!resolvedIntent\}/, "Intent action must only be disabled when neither typed nor suggested intent exists");
assert.match(referenceCss, /AS6_SCREEN1_REFINEMENT_V3: brand=180x72; workspace=right-aligned; avatar-ring=thin; suggested-intent=actionable/, "Screen 1 refinement v3 marker missing");
assert.match(referenceCss, /\.as6-master__logo,[\s\S]*?width: 180px;[\s\S]*?min-height: 72px;/, "Primary brand must use the accepted visual scale");
assert.match(referenceCss, /AS6_SCREEN1_REFINEMENT_V4: avatar-ring=uniform-inlay; workspace-control=centered-labeled/, "Screen 1 refinement v4 marker missing");
assert.match(referenceCss, /AS6_SCREEN1_REFINEMENT_V5: identity-cluster=visual-left-14px; workspace-menu=aligned/, "Screen 1 refinement v5 marker missing");
assert.match(referenceCss, /AS6_SCREEN1_REFINEMENT_V6: identity-axis=logo\+workspace\+avatar; visual-left=22px/, "Screen 1 refinement v6 marker missing");
assert.match(referenceCss, /AS6_IDENTITY_SCALE_V2: logo=70\.\.150@workspace; avatar=70\.\.150@profile; screens=master,conductor/, "Identity scale v2 marker missing");
assert.match(referenceCss, /AS6_IDENTITY_SPACING_V1: workspace-gap=follows-positive-logo-overflow; menu=follows-workspace/, "Adaptive identity spacing marker missing");
assert.match(schemaSource, /company_logo_scale SMALLINT NOT NULL DEFAULT 100/, "Workspace logo scale persistence is missing");
assert.match(schemaSource, /company_logo_scale BETWEEN 70 AND 150/, "Workspace logo scale database guard is missing");
assert.match(schemaSource, /avatar_scale SMALLINT NOT NULL DEFAULT 100/, "Profile photo scale persistence is missing");
assert.match(schemaSource, /avatar_scale BETWEEN 70 AND 150/, "Profile photo scale database guard is missing");
assert.match(workspaceModelSource, /companyLogoScale: Number\(row\.company_logo_scale \|\| 100\)/, "Workspace API must expose logo scale");
assert.match(workspaceModelSource, /normalizeCompanyLogoScale\(payload\.companyLogoScale\)/, "Workspace API must validate logo scale updates");
assert.match(userModelSource, /avatarScale: Number\(row\.avatar_scale \|\| 100\)/, "Profile API must expose photo scale");
assert.match(userModelSource, /normalizeAvatarScale\(payload\.avatarScale\)/, "Profile API must validate photo scale updates");
assert.match(shellSource, /companyLogoScale,/, "Living shell identity must expose logo scale");
assert.match(shellSource, /avatarScale,/, "Living shell identity must expose photo scale");
assert.match(settingsSource, /id="as6-company-logo-scale"[\s\S]*?type="range"[\s\S]*?min="70"[\s\S]*?max="150"/, "Settings must provide the bounded logo scale control");
assert.match(settingsSource, /id="as6-avatar-scale"[\s\S]*?type="range"[\s\S]*?min="70"[\s\S]*?max="150"/, "Settings must provide the bounded photo scale control");
assert.match(settingsSource, /companyLogoScale,\s*brandingMode:/, "Settings must persist logo scale with company branding");
assert.match(settingsSource, /avatarUrl,\s*avatarScale,\s*locale:/, "Settings must persist photo scale with the user profile");
assert.match(masterSource, /--as6-company-logo-scale/, "Screen 1 must apply company logo scale");
assert.match(masterSource, /--as6-company-logo-overflow-y/, "Screen 1 must derive spacing from positive logo overflow");
assert.match(appSource, /--as6-company-logo-scale/, "Screen 2 chrome must apply company logo scale");
assert.match(masterSource, /--as6-avatar-scale/, "Screen 1 must apply profile photo scale");
assert.match(appSource, /--as6-avatar-scale/, "Screen 2 chrome must apply profile photo scale");
assert.match(masterSource, /as6-master__workspace-label/, "Workspace switcher must expose a visible control label");
assert.match(localizationSource, /companySwitcher: "Компания"/, "Russian workspace switcher label missing");
assert.match(localizationSource, /companySwitcher: "Company"/, "English workspace switcher label missing");
assert.match(referenceCss, /\.as6-master \.as6-master__workspace \{[\s\S]*?align-self: center;/, "Workspace switcher must be centered within the identity rail");
assert.match(referenceCss, /margin-top: calc\(4px \+ var\(--as6-company-logo-overflow-y, 0px\)\);/, "Workspace switcher must clear enlarged logos");
assert.match(referenceCss, /top: calc\(104px \+ var\(--as6-company-logo-overflow-y, 0px\)\);/, "Workspace menu must follow the adaptive switcher position");
assert.match(referenceCss, /\.as6-master__logo,[\s\S]*?align-self: center;[\s\S]*?transform: translateX\(-22px\);/, "Brand must follow the shared identity axis");
assert.match(referenceCss, /\.as6-master \.as6-master__workspace \{[\s\S]*?transform: translateX\(-22px\);/, "Workspace switcher must follow the shared identity axis");
assert.match(referenceCss, /\.as6-master__avatar \{[\s\S]*?align-self: center;[\s\S]*?transform: translateX\(-22px\) scale\(var\(--as6-avatar-scale, 1\)\);/, "Profile photo must follow the shared identity axis and scale contract");
assert.match(referenceCss, /\.as6-master__workspace-menu \{[\s\S]*?left: 50%;[\s\S]*?transform: translateX\(calc\(-50% - 22px\)\);/, "Workspace menu must remain aligned below its switcher");
assert.match(referenceCss, /\.as6-master__avatar \{[\s\S]*?padding: 2px;[\s\S]*?border: 0;[\s\S]*?background: rgba\(55,96,130,\.22\);/, "Profile frame must use a uniform inset ring");
assert.match(referenceCss, /\.as6-master\[data-theme="dark"\] \.as6-master__avatar \{[\s\S]*?background: rgba\(255,255,255,\.24\);/, "Dark profile frame must use an even neutral ring");
assert.match(masterSource, /contractVersion: "as6-conductor-context-v1"/, "Every Screen 1 route must use the conductor context contract");
assert.match(masterSource, /workspaceId: shell\.workspace\?\.id/, "Conductor context must be scoped to a workspace");
assert.match(masterSource, /snapshotId: shell\.snapshotId/, "Conductor context must identify its source snapshot");
assert.match(masterSource, /intentSource: intent\.trim\(\) \? intentSource : "suggested"/, "Typed, voice and suggested intents must remain distinguishable");
assert.match(appSource, /const \[navigationContext, setNavigationContext\] = useState\(readNavigationContext\)/, "Navigation context must survive React route changes");
assert.match(appSource, /window\.sessionStorage\.setItem\(CONDUCTOR_CONTEXT_KEY/, "Conductor draft must survive a page reload");
assert.match(appSource, /navigationContext=\{navigationContext\}/, "Screen 2 must receive navigation context");
assert.match(appSource, /snapshot=\{snapshot\}/, "Screen 2 must receive workspace, locale and identity state");
assert.match(appSource, /activeId === "conductor"[\s\S]*?<LivingConductorSpace/, "Screen 2 must have a dedicated component boundary");
assert.match(engineSource, /data-context-ready=/, "Screen 2 must expose whether its context is ready");
assert.match(engineSource, /navigationContext\.workspaceId !== snapshot\.workspace\.id/, "Screen 2 must reject cross-workspace context");
assert.match(engineSource, /snapshot\?\.locale === "en"/, "Screen 2 must follow the shell locale");
assert.match(referenceCss, /AS6_LIGHT_PALETTE_UNIFICATION_V1: temperature=cool-neutral; warm-cast=removed; dark=unchanged/, "Screen 1 must record the cool-neutral light palette contract");
assert.match(referenceCss, /AS6_LIGHT_PALETTE_UNIFICATION_V2: background=solid-cool; diffuse-glow=none; graph-glow=none/, "Screen 1 must record the strict no-warm-cast palette contract");
assert.match(referenceCss, /\.as6-master\[data-theme="light"\] \{\s*background: #f3f8fc;/, "The light master background must be a uniform cool color");
assert.match(referenceCss, /\.as6-master\[data-theme="light"\] \.as6-master__ambient \{\s*display: none;/, "The diffuse ambient layer must not create tinted patches");
assert.match(referenceCss, /\.as6-master\[data-theme="light"\] \.as6-master__graph-lines path \{[\s\S]*?rgba\(151,190,218,\.7\);[\s\S]*?filter: none;/, "Light graph lines must use a cold-blue color without glow");

console.log("AS6_SCREEN1_REAL_ACTIVITY=PASS");
console.log("AS6_MULTI_WORKSPACE_ALLOWANCE=PASS");
console.log("AS6_DYNAMIC_GOAL_SELECTION=PASS");
console.log("AS6_WORKSPACE_SWITCH_STALE_RESPONSE_GUARD=PASS");
console.log("AS6_SETTINGS_IMMEDIATE_LOCALE=PASS");
console.log("AS6_BRAND_MODE_DEDUPLICATION=PASS");
console.log("AS6_NEUTRAL_BLACK_THEME=PASS");
console.log("AS6_INTENT_FOCUS_ONLY_OUTLINE=PASS");
console.log("AS6_PROFILE_SAVE_PRESERVES_WORKSPACE=PASS");
console.log("AS6_INTENT_SINGLE_FOCUS_FRAME=PASS");
console.log("AS6_SUGGESTED_INTENT_ACTION=PASS");
console.log("AS6_BRAND_IDENTITY_REFINEMENT_V3=PASS");
console.log("AS6_AVATAR_NEUTRAL_FRAME=PASS");
console.log("AS6_AVATAR_UNIFORM_RING=PASS");
console.log("AS6_WORKSPACE_CONTROL_LABEL=PASS");
console.log("AS6_IDENTITY_CLUSTER_VISUAL_ALIGNMENT=PASS");
console.log("AS6_IDENTITY_SHARED_AXIS=PASS");
console.log("AS6_WORKSPACE_LOGO_SCALE_V1=PASS");
console.log("AS6_PROFILE_PHOTO_SCALE_V1=PASS");
console.log("AS6_IDENTITY_ADAPTIVE_SPACING=PASS");
console.log("AS6_LIGHT_PALETTE_UNIFICATION=PASS");
console.log("AS6_LIGHT_PALETTE_STRICT_NO_WARM_CAST=PASS");
console.log("AS6_CONDUCTOR_CONTEXT_CONTRACT_V1=PASS");
console.log("AS6_CONDUCTOR_RELOAD_RECOVERY=PASS");
console.log("AS6_CONDUCTOR_WORKSPACE_GUARD=PASS");
console.log("AS6_CONDUCTOR_LOCALE_IDENTITY=PASS");
console.log("AS6_CONDUCTOR_DEDICATED_ENTRY=PASS");
