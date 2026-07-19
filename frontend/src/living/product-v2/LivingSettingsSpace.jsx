import React, { useEffect, useState } from "react";
import { updateProfile, updateWorkspace } from "../../services/api.js";
import "./LivingSettingsSpace.css";
import "./LivingSettingsInteraction.css";
import "./LivingLogoScale.css";

const MAX_IMAGE_BYTES = 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!IMAGE_TYPES.has(file.type)) return reject(new Error("PNG, JPG or WebP required"));
    if (file.size > MAX_IMAGE_BYTES) return reject(new Error("Image must be 1 MB or smaller"));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

export default function LivingSettingsSpace({ snapshot, navigate, onSaved, onWorkspaceChange, onLocaleChange }) {
  const { t, identity, workspace, locale } = snapshot;
  const [displayName, setDisplayName] = useState(identity.displayName);
  const [avatarUrl, setAvatarUrl] = useState(identity.avatarUrl);
  const [avatarScale, setAvatarScale] = useState(identity.avatarScale);
  const [workspaceName, setWorkspaceName] = useState(identity.workspaceEditableName);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(identity.companyLogoUrl);
  const [companyLogoScale, setCompanyLogoScale] = useState(identity.companyLogoScale);
  const [brandingMode, setBrandingMode] = useState(identity.brandingMode);
  const [language, setLanguage] = useState(locale);
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const companyLabel = workspaceName.trim() || identity.workspaceName;
  const isAs6Company = /^as6$/i.test(companyLabel.trim());
  const effectiveBrandingMode = isAs6Company && brandingMode === "co-branded" ? "platform" : brandingMode;
  const identityBrandingMode = isAs6Company && identity.brandingMode === "co-branded" ? "platform" : identity.brandingMode;
  const hasUnsavedChanges = displayName !== identity.displayName
    || avatarUrl !== identity.avatarUrl
    || avatarScale !== identity.avatarScale
    || workspaceName !== identity.workspaceEditableName
    || companyLogoUrl !== identity.companyLogoUrl
    || companyLogoScale !== identity.companyLogoScale
    || effectiveBrandingMode !== identityBrandingMode
    || language !== locale;

  useEffect(() => {
    setDisplayName(identity.displayName);
    setAvatarUrl(identity.avatarUrl);
    setAvatarScale(identity.avatarScale);
    setWorkspaceName(identity.workspaceEditableName);
    setCompanyLogoUrl(identity.companyLogoUrl);
    setCompanyLogoScale(identity.companyLogoScale);
    setBrandingMode(identity.brandingMode);
    setLanguage(locale);
  }, [snapshot.snapshotId]);

  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  async function chooseImage(event, setter) {
    try {
      const next = await readImage(event.target.files?.[0]);
      setter(next);
      setStatus({ kind: "idle", message: "" });
    } catch (error) {
      setStatus({ kind: "error", message: error?.message || t("saveError") });
    } finally {
      event.target.value = "";
    }
  }

  function selectWorkspace(event) {
    const nextWorkspaceId = event.target.value;
    if (!nextWorkspaceId || nextWorkspaceId === workspace?.id) return;
    if (hasUnsavedChanges && !window.confirm(t("discardCompanyChanges"))) return;
    setStatus({ kind: "idle", message: "" });
    onWorkspaceChange?.(nextWorkspaceId);
  }

  function selectLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    onLocaleChange?.(nextLanguage);
  }

  async function submit(event) {
    event.preventDefault();
    setStatus({ kind: "saving", message: t("saving") });
    try {
      const profileResult = await updateProfile({
        displayName: displayName.trim(),
        avatarUrl,
        avatarScale,
        locale: language,
      });
      let workspaceResult = null;
      if (workspace?.id && identity.canManageBranding) {
        workspaceResult = await updateWorkspace(workspace.id, {
          name: workspaceName.trim(),
          companyLogoUrl,
          companyLogoScale,
          brandingMode: effectiveBrandingMode,
        });
      }
      setStatus({ kind: "success", message: t("saved") });
      await onSaved?.({
        locale: language,
        profile: profileResult?.user,
        workspace: workspaceResult?.workspace,
      });
    } catch (error) {
      setStatus({ kind: "error", message: error?.message || t("saveError") });
    }
  }

  return (
    <section className="as6-living-settings" aria-labelledby="as6-settings-title">
      <header>
        <button type="button" className="as6-living-settings__back" onClick={() => navigate("home")}>← {t("backHome")}</button>
        <h1 id="as6-settings-title">{t("settingsTitle")}</h1>
        <p>{t("settingsSubtitle")}</p>
      </header>

      <section className="as6-living-settings__workspace-context" aria-label={t("selectedCompany")}>
        <label>
          <span>{t("selectedCompany")}</span>
          <select value={workspace?.id || ""} onChange={selectWorkspace}>
            {snapshot.workspaces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <div>
          <strong>{t("activePlan", { plan: snapshot.subscription.name })}</strong>
          <button type="button" onClick={() => window.location.assign("/pricing")}>{t("managePlan")}</button>
        </div>
        <p>{t("selectedCompanyHint")}</p>
      </section>

      <form onSubmit={submit}>
        <fieldset>
          <legend>{t("profileSettings")}</legend>
          <label>
            <span>{t("displayName")}</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={120} required />
          </label>
          <label className="as6-living-settings__image">
            <span>{t("avatar")}</span>
            <i style={{ "--as6-avatar-preview-scale": avatarScale / 100 }}>{avatarUrl ? <img src={avatarUrl} alt="" /> : identity.initial}</i>
            <b>{t("chooseImage")}</b>
            <small>{t("imageHint")}</small>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => chooseImage(event, setAvatarUrl)} />
          </label>
          <div className="as6-living-settings__logo-scale as6-living-settings__avatar-scale">
            <label htmlFor="as6-avatar-scale">
              <span>{t("avatarSize")}</span>
              <output htmlFor="as6-avatar-scale">{avatarScale}%</output>
            </label>
            <input
              id="as6-avatar-scale"
              type="range"
              min="70"
              max="150"
              step="1"
              value={avatarScale}
              onChange={(event) => setAvatarScale(Number(event.target.value))}
              disabled={!avatarUrl}
              aria-valuetext={`${avatarScale}%`}
            />
            <div>
              <small>{t("avatarSizeHint")}</small>
              <button type="button" onClick={() => setAvatarScale(100)} disabled={!avatarUrl || avatarScale === 100}>{t("resetAvatarSize")}</button>
            </div>
          </div>
        </fieldset>

        <fieldset disabled={!identity.canManageBranding}>
          <legend>{t("companySettings")}</legend>
          <label>
            <span>{t("workspaceName")}</span>
            <input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} maxLength={120} required />
          </label>
          <label className="as6-living-settings__image">
            <span>{t("companyLogo")}</span>
            <i className="is-logo">{companyLogoUrl ? <img src={companyLogoUrl} alt="" style={{ "--as6-logo-preview-scale": companyLogoScale / 100 }} /> : "AS6"}</i>
            <b>{t("chooseImage")}</b>
            <small>{t("imageHint")}</small>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => chooseImage(event, setCompanyLogoUrl)} />
          </label>
          <div className="as6-living-settings__logo-scale">
            <label htmlFor="as6-company-logo-scale">
              <span>{t("companyLogoSize")}</span>
              <output htmlFor="as6-company-logo-scale">{companyLogoScale}%</output>
            </label>
            <input
              id="as6-company-logo-scale"
              type="range"
              min="70"
              max="150"
              step="1"
              value={companyLogoScale}
              onChange={(event) => setCompanyLogoScale(Number(event.target.value))}
              disabled={!companyLogoUrl}
              aria-valuetext={`${companyLogoScale}%`}
            />
            <div>
              <small>{t("companyLogoSizeHint")}</small>
              <button type="button" onClick={() => setCompanyLogoScale(100)} disabled={!companyLogoUrl || companyLogoScale === 100}>{t("resetLogoSize")}</button>
            </div>
          </div>
          <label>
            <span>{t("brandMode")}</span>
            <select value={effectiveBrandingMode} onChange={(event) => setBrandingMode(event.target.value)}>
              <option value="platform">{t("brandPlatform")}</option>
              {!isAs6Company && <option value="co-branded">{t("brandCoBranded", { company: companyLabel })}</option>}
              <option value="company" disabled={!companyLogoUrl}>{t("brandCompany", { company: companyLabel })}</option>
            </select>
          </label>
          {!identity.canManageBranding && <p className="as6-living-settings__notice">{t("ownerOnly")}</p>}
        </fieldset>

        <fieldset>
          <legend>{t("language")}</legend>
          <div className="as6-living-settings__languages">
            {["ru", "en"].map((item) => (
              <button type="button" key={item} className={language === item ? "is-active" : ""} onClick={() => selectLanguage(item)} aria-pressed={language === item}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </fieldset>

        <footer>
          <button type="submit" disabled={status.kind === "saving"}>{status.kind === "saving" ? t("saving") : t("save")}</button>
          <p className={`is-${status.kind}`} role="status">{status.message}</p>
        </footer>
      </form>
    </section>
  );
}
