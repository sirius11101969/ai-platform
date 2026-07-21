import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./LivingCanonicalApp.css";
import { clearAuthSession, createWorkspace, getStoredUser, isWorkspaceRefreshStorageEvent, setActiveWorkspaceId } from "../../services/api.js";
import { loadLivingReadOnlyData } from "./livingReadOnlyData.js";
import AS6MasterScreen from "./AS6MasterScreen.jsx";
import LivingSpaceEngine from "./LivingSpaceEngine.jsx";
import LivingConductorSpace from "./LivingConductorSpace.jsx";
import LivingDocumentsSpace from "./LivingDocumentsSpace.jsx";
import LivingSettingsSpace from "./LivingSettingsSpace.jsx";
import { livingSpaceRegistry, getLivingSpaceDefinition } from "./livingSpaceRegistry.js";
import { createLivingShellSnapshot } from "./livingShellFoundation.js";
import { getStoredLivingTheme, persistLivingTheme } from "./livingTheme.js";
import {
  createLivingTranslator,
  getStoredLivingLocale,
  livingIntlLocale,
  persistLivingLocale,
} from "./livingLocalization.js";

const CONDUCTOR_CONTEXT_KEY = "as6-conductor-navigation-context-v1";

function resolveSpace(pathname) {
  const exact = livingSpaceRegistry.find((space) => space.path === pathname);
  if (exact) return exact.id;
  const nested = livingSpaceRegistry.find((space) => space.path !== "/app" && pathname.startsWith(space.path));
  return nested?.id || "home";
}

function readNavigationContext() {
  const state = window.history.state;
  if (state && typeof state === "object" && !Array.isArray(state) && Object.keys(state).length) return state;
  if (resolveSpace(window.location.pathname) !== "conductor") return {};
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(CONDUCTOR_CONTEXT_KEY) || "{}");
    return stored && stored.contractVersion === "as6-conductor-context-v1" ? stored : {};
  } catch {
    return {};
  }
}

function currentTime(locale) {
  return new Intl.DateTimeFormat(livingIntlLocale(locale), { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function currentDate(locale) {
  return new Intl.DateTimeFormat(livingIntlLocale(locale), { day: "numeric", month: "short" }).format(new Date());
}

function normalizeProfileName(value) {
  const name = String(value || "").trim().replace(/\s+/g, " ");
  if (!name || name.includes("@")) return "";
  if (/^[a-z0-9._-]+$/.test(name)) return "";
  return name;
}

function resolveProfileDisplayName(user, locale = "ru") {
  const fullNameFromParts = [
    user?.firstName || user?.first_name,
    user?.lastName || user?.last_name,
  ].filter(Boolean).join(" ");

  const candidates = [
    user?.displayName,
    user?.display_name,
    user?.fullName,
    user?.full_name,
    fullNameFromParts,
    user?.name,
  ];

  const resolved = candidates.map(normalizeProfileName).find(Boolean);
  if (locale === "en") return resolved || "Vladimir";
  return resolved || "Владимир";
}

function normalizeDefinition(id) {
  const source = getLivingSpaceDefinition(id) || getLivingSpaceDefinition("home") || {};
  return {
    ...source,
    id,
    label: source.label || "AS6",
    spaceTitle: source.spaceTitle || source.short || "Живое пространство",
    center: source.center || source.label || "Ваше рабочее пространство",
    coreLabel: source.coreLabel || "Центр понимания",
    coreText: source.coreText || source.subtitle || "AS6 собирает подтверждённый контекст и показывает следующий понятный шаг.",
    greeting: source.greeting || "Доброе утро, Владимир.",
    context: source.context || source.subtitle || "Пространство спокойно изучает контекст и готовит полезные действия.",
    confidence: Number(source.confidence || 70),
    nodes: source.nodes || [],
    events: source.events || [],
    insights: source.insights || [],
    recommendation: source.recommendation || "Сформулируйте результат, который хотите получить.",
    recommendationText: source.recommendationText || "AS6 сначала соберёт контекст и покажет безопасный план.",
  };
}

export default function LivingCanonicalApp() {
  const storedUser = getStoredUser();
  const [activeId, setActiveId] = useState(() => resolveSpace(window.location.pathname));
  const [navigationContext, setNavigationContext] = useState(readNavigationContext);
  const [livingData, setLivingData] = useState({ status: "loading", data: null, error: "" });
  const [online, setOnline] = useState(() => navigator.onLine);
  const [locale, setLocale] = useState(() => getStoredLivingLocale(storedUser?.locale));
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => getStoredLivingTheme());
  const [selectedPriorityId, setSelectedPriorityId] = useState(() => String(readNavigationContext().priorityId || ""));
  const profileRef = useRef(null);
  const livingRequestIdRef = useRef(0);
  const user = livingData.data?.profile || storedUser;
  const profileName = locale === "ru" ? resolveProfileDisplayName(user) : resolveProfileDisplayName(user, locale);
  const profileEmail = user?.email || "";
  const definition = useMemo(() => normalizeDefinition(activeId), [activeId]);
  const snapshot = useMemo(() => createLivingShellSnapshot({
    locale,
    user,
    fallbackProfileName: profileName,
    livingData: livingData.data,
    selectedPriorityId,
    dataStatus: online ? livingData.status : "offline",
    dataError: livingData.error,
  }), [locale, user, profileName, livingData, online, selectedPriorityId]);
  const t = useMemo(() => createLivingTranslator(locale), [locale]);

  const refreshLivingData = useCallback(async () => {
    const requestId = ++livingRequestIdRef.current;
    setLivingData((current) => ({ status: "loading", data: current.data, error: "" }));
    try {
      const data = await loadLivingReadOnlyData();
      if (requestId !== livingRequestIdRef.current) return null;
      setLivingData({ status: "ready", data, error: "" });
      return data;
    } catch (error) {
      if (requestId !== livingRequestIdRef.current) return null;
      setLivingData((current) => ({
        status: current.data ? "stale" : "error",
        data: current.data,
        error: error?.message || "Не удалось загрузить данные пространства",
      }));
      return null;
    }
  }, []);

  function navigate(target, navigationState = {}) {
    const space = livingSpaceRegistry.find((item) => item.id === target);
    const path = space?.path || (target === "home" ? "/app" : `/app/${target}`);
    const nextContext = {
      ...navigationState,
      fromSpace: activeId,
      workspaceId: snapshot.workspace?.id || navigationState.workspaceId || "",
      locale,
    };
    window.history.pushState(nextContext, "", path);
    if (target === "conductor" && nextContext.contractVersion === "as6-conductor-context-v1") {
      try {
        window.sessionStorage.setItem(CONDUCTOR_CONTEXT_KEY, JSON.stringify(nextContext));
      } catch {
        // History state remains the source of truth when session storage is unavailable.
      }
    }
    setNavigationContext(nextContext);
    if (nextContext.priorityId) setSelectedPriorityId(String(nextContext.priorityId));
    setActiveId(resolveSpace(path));
    setProfileOpen(false);
  }

  function changeLocale(nextLocale) {
    const normalized = persistLivingLocale(nextLocale);
    setLocale(normalized);
  }

  function changeWorkspace(workspaceId) {
    if (!workspaceId || workspaceId === snapshot.workspace?.id) return;
    const nextWorkspace = snapshot.workspaces.find((item) => item.id === workspaceId);
    setSelectedPriorityId("");
    if (nextWorkspace) {
      setLivingData((current) => current.data ? {
        ...current,
        data: { ...current.data, workspace: nextWorkspace },
      } : current);
    }
    setActiveWorkspaceId(workspaceId);
  }

  function changeTheme(nextTheme) {
    setTheme(persistLivingTheme(nextTheme));
  }

  async function handleCreateWorkspace(name) {
    const response = await createWorkspace({ name });
    const created = response?.workspace;
    if (!created?.id) throw new Error(t("saveError"));
    setActiveWorkspaceId(created.id);
    setSelectedPriorityId("");
    await refreshLivingData();
    return created;
  }

  async function handleSettingsSaved(result = {}) {
    if (result.locale) changeLocale(result.locale);
    await refreshLivingData();
  }

  function logout() {
    clearAuthSession();
    window.localStorage.removeItem("ai-platform-workspace-id");
    window.location.replace("/login");
  }

  useEffect(() => {
    refreshLivingData();
  }, [refreshLivingData]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = activeId === "home" ? "AS6 — Living Space" : `AS6 — ${definition.label}`;
  }, [locale, activeId, definition.label]);

  useEffect(() => {
    const onPop = () => {
      const nextContext = readNavigationContext();
      setNavigationContext(nextContext);
      if (nextContext.priorityId) setSelectedPriorityId(String(nextContext.priorityId));
      setActiveId(resolveSpace(window.location.pathname));
    };
    const onPointer = (event) => { if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false); };
    const onWorkspace = () => refreshLivingData();
    const onStorage = (event) => { if (isWorkspaceRefreshStorageEvent(event)) refreshLivingData(); };
    const onPageShow = () => refreshLivingData();
    const onFocus = () => refreshLivingData();
    const onVisibility = () => { if (document.visibilityState === "visible") refreshLivingData(); };
    const onOnline = () => { setOnline(true); refreshLivingData(); };
    const onOffline = () => setOnline(false);
    window.addEventListener("popstate", onPop);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("ai-platform-workspace-updated", onWorkspace);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("ai-platform-workspace-updated", onWorkspace);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshLivingData]);

  if (activeId === "home") {
    return (
      <AS6MasterScreen
        navigate={navigate}
        profileName={profileName}
        snapshot={snapshot}
        onLocaleChange={changeLocale}
        onWorkspaceChange={changeWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
        onPriorityChange={setSelectedPriorityId}
        theme={theme}
        onThemeChange={changeTheme}
      />
    );
  }

  return (
    <div
      className="as6-reference-root"
      data-as6-runtime="living-shell-foundation-v1"
      data-active-space={activeId}
      data-data-state={livingData.status}
      data-theme={theme}
    >
      <div className="as6-reference-clouds" aria-hidden="true" />
      <div className="as6-reference-stars" aria-hidden="true" />
      <header className="as6-reference-chrome">
        <button type="button" className={`as6-reference-brand${snapshot.identity.showCompanyLogo ? " is-company" : ""}`} onClick={() => navigate("home")}>
          {snapshot.identity.showCompanyLogo
            ? <img src={snapshot.identity.companyLogoUrl} alt={snapshot.identity.workspaceName} style={{ "--as6-company-logo-scale": snapshot.identity.companyLogoScale / 100 }} />
            : <><strong>AS6</strong><small>{snapshot.identity.brandingMode === "co-branded" ? snapshot.identity.workspaceName : "Calm Business"}</small></>}
        </button>
        <div className="as6-reference-controls" aria-label={t("utilities")}>
          {["ru", "en"].map((item) => (
            <button
              type="button"
              key={item}
              className={`as6-reference-locale${locale === item ? " is-active" : ""}`}
              onClick={() => changeLocale(item)}
              aria-pressed={locale === item}
            >
              {item.toUpperCase()}
            </button>
          ))}
          <i />
          <button type="button" className={theme === "light" ? "is-active" : ""} aria-label={t("lightTheme")} aria-pressed={theme === "light"} onClick={() => changeTheme("light")}>☼</button>
          <button type="button" className={theme === "dark" ? "is-active" : ""} aria-label={t("darkTheme")} aria-pressed={theme === "dark"} onClick={() => changeTheme("dark")}>☾</button>
          <button type="button" aria-label={t("settings")} onClick={() => navigate("settings")}>◉</button>
          <time><strong>{currentTime(locale)}</strong><small>{currentDate(locale)}</small></time>
          <span className="as6-reference-weather">☼ <b>24°</b></span>
          <div className="as6-reference-profile-wrap" ref={profileRef}>
            <button type="button" className="as6-reference-profile" style={{ "--as6-avatar-scale": snapshot.identity.avatarScale / 100 }} onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
              {snapshot.identity.avatarUrl ? <img src={snapshot.identity.avatarUrl} alt="" /> : snapshot.identity.initial}
            </button>
            {profileOpen && (
              <section className="as6-reference-profile-menu">
                <strong>{profileName}</strong>
                <small>{profileEmail}</small>
                <button type="button" onClick={() => navigate("settings")}>{t("settings")}</button>
                <button type="button" onClick={logout}>{t("signOut")}</button>
              </section>
            )}
          </div>
        </div>
      </header>
      <p className="as6-master__sr-only" role="status">{snapshot.dataState.message}</p>
      <main className="as6-reference-stage">
        {activeId === "settings"
          ? <LivingSettingsSpace snapshot={snapshot} navigate={navigate} onSaved={handleSettingsSaved} onWorkspaceChange={changeWorkspace} onLocaleChange={changeLocale} />
          : activeId === "documents"
            ? <LivingDocumentsSpace livingData={livingData} navigate={navigate} />
            : activeId === "conductor"
              ? <LivingConductorSpace
                  key={`${activeId}:${navigationContext.priorityId || "none"}:${navigationContext.intent || "none"}`}
                  definition={definition}
                  navigate={navigate}
                  navigationContext={navigationContext}
                  snapshot={snapshot}
                />
              : <LivingSpaceEngine definition={definition} navigate={navigate} snapshot={snapshot} />}
      </main>
    </div>
  );
}
