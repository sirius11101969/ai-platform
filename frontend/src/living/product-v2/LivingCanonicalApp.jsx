import React, { useEffect, useMemo, useRef, useState } from "react";
import "./LivingCanonicalApp.css";
import { clearAuthSession, getStoredUser } from "../../services/api.js";
import { loadLivingReadOnlyData } from "./livingReadOnlyData.js";
import LivingSpaceEngine from "./LivingSpaceEngine.jsx";
import LivingDocumentsSpace from "./LivingDocumentsSpace.jsx";
import { livingSpaceRegistry, getLivingSpaceDefinition } from "./livingSpaceRegistry.js";

function resolveSpace(pathname) {
  const exact = livingSpaceRegistry.find((space) => space.path === pathname);
  if (exact) return exact.id;
  const nested = livingSpaceRegistry.find((space) => space.path !== "/app" && pathname.startsWith(space.path));
  return nested?.id || "home";
}

function currentTime() {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function currentDate() {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date());
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
  const [activeId, setActiveId] = useState(() => resolveSpace(window.location.pathname));
  const [livingData, setLivingData] = useState({ status: "loading", data: null, error: "" });
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const user = getStoredUser();
  const profileName = user?.name || user?.fullName || user?.email?.split("@")[0] || "Владимир";
  const profileInitial = String(profileName).trim().charAt(0).toUpperCase() || "В";
  const profileEmail = user?.email || "";
  const definition = useMemo(() => normalizeDefinition(activeId), [activeId]);

  function navigate(target) {
    const space = livingSpaceRegistry.find((item) => item.id === target);
    const path = space?.path || (target === "home" ? "/app" : `/app/${target}`);
    window.history.pushState({}, "", path);
    setActiveId(resolveSpace(path));
  }

  function logout() {
    clearAuthSession();
    window.localStorage.removeItem("ai-platform-workspace-id");
    window.location.replace("/login");
  }

  useEffect(() => {
    let cancelled = false;
    loadLivingReadOnlyData().then((data) => { if (!cancelled) setLivingData({ status: "ready", data, error: "" }); }).catch((error) => { if (!cancelled) setLivingData({ status: "error", data: null, error: error?.message || "Не удалось загрузить данные пространства" }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onPop = () => setActiveId(resolveSpace(window.location.pathname));
    const onPointer = (event) => { if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false); };
    window.addEventListener("popstate", onPop);
    window.addEventListener("pointerdown", onPointer);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("pointerdown", onPointer); };
  }, []);

  return (
    <div className="as6-reference-root" data-as6-runtime="canonical-reference-v1" data-active-space={activeId}>
      <div className="as6-reference-clouds" aria-hidden="true" />
      <div className="as6-reference-stars" aria-hidden="true" />
      <header className="as6-reference-chrome">
        <button type="button" className="as6-reference-brand" onClick={() => navigate("home")}><strong>AS6</strong><small>Calm Business</small></button>
        <div className="as6-reference-controls" aria-label="Управление пространством">
          <span>RU</span><span>EN</span><i />
          <button type="button" aria-label="Светлая тема">☼</button>
          <button type="button" aria-label="Спокойный режим">☾</button>
          <button type="button" aria-label="Состояние AS6">◉</button>
          <time><strong>{currentTime()}</strong><small>{currentDate()}</small></time>
          <span className="as6-reference-weather">☼ <b>24°</b></span>
          <div className="as6-reference-profile-wrap" ref={profileRef}>
            <button type="button" className="as6-reference-profile" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>{profileInitial}</button>
            {profileOpen && <section className="as6-reference-profile-menu"><strong>{profileName}</strong><small>{profileEmail}</small><button type="button" onClick={logout}>Выйти из AS6 →</button></section>}
          </div>
        </div>
      </header>
      <main className="as6-reference-stage">
        {activeId === "documents" ? <LivingDocumentsSpace livingData={livingData} navigate={navigate} /> : <LivingSpaceEngine definition={definition} navigate={navigate} />}
      </main>
    </div>
  );
}
