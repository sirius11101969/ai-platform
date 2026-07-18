import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPaymentStatus } from "../services/api";

const PLAN_NAMES = { starter: "Старт", pro: "Про", business: "Бизнес", enterprise: "Корпоративный" };

export default function PaymentSuccessPage({ isAuthenticated = false }) {
  const [state, setState] = useState(isAuthenticated ? "checking" : "auth");
  const [payment, setPayment] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    let timer = null;
    let attempt = 0;

    async function checkPayment() {
      try {
        const response = await fetchPaymentStatus();
        if (cancelled) return;
        const current = response?.payment || null;
        setPayment(current);
        if (current?.status === "paid") {
          setState("paid");
          return;
        }
        if (["canceled", "cancelled", "failed"].includes(String(current?.status || "").toLowerCase())) {
          setState("failed");
          return;
        }
        attempt += 1;
        if (attempt >= 12) {
          setState("pending");
          return;
        }
        timer = window.setTimeout(checkPayment, 2000);
      } catch (error) {
        if (cancelled) return;
        attempt += 1;
        if (attempt >= 5) {
          setMessage(error?.message || "Не удалось проверить платёж");
          setState("error");
          return;
        }
        timer = window.setTimeout(checkPayment, 2000);
      }
    }

    checkPayment();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [isAuthenticated]);

  const isPaid = state === "paid";
  const icon = isPaid ? "✓" : state === "failed" || state === "error" ? "!" : "…";
  const eyebrow = isPaid ? "Оплата подтверждена" : state === "auth" ? "Нужен вход" : state === "failed" ? "Оплата не завершена" : "Проверяем платёж";
  const title = isPaid
    ? `Тариф ${PLAN_NAMES[payment?.metadata?.plan] || payment?.metadata?.plan || "AS6"} активирован`
    : state === "auth"
      ? "Войдите, чтобы проверить оплату"
      : state === "failed"
        ? "Платёж отменён"
        : state === "pending"
          ? "Подтверждение ещё обрабатывается"
          : state === "error"
            ? "Не удалось проверить статус"
            : "Подтверждаем оплату";
  const copy = isPaid
    ? "Новый тариф и его лимиты уже применены к вашим рабочим пространствам."
    : state === "auth"
      ? "AS6 покажет результат только после входа в аккаунт владельца рабочего пространства."
      : state === "failed"
        ? "Тариф не изменён. Вы можете вернуться к тарифам и повторить оплату."
        : state === "pending"
          ? "Тариф изменится автоматически после подтверждения ЮKassa. Обновите эту страницу через минуту."
          : message || "Обычно это занимает несколько секунд. Не закрывайте страницу.";

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={{ ...styles.icon, background: isPaid ? "linear-gradient(135deg, #34d399, #14b8a6)" : "rgba(255,255,255,.12)" }}>{icon}</div>
        <p style={{ ...styles.eyebrow, color: isPaid ? "#86efac" : "#a9cfe9" }}>{eyebrow}</p>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.copy}>{copy}</p>
        <div style={styles.actions}>
          {state === "auth" ? (
            <Link to={`/login?next=${encodeURIComponent("/payment/success")}`} style={styles.primary}>Войти</Link>
          ) : (
            <Link to="/app" style={styles.primary}>{isPaid ? "Открыть пространство" : "Вернуться в AS6"}</Link>
          )}
          <Link to="/pricing" style={styles.secondary}>Тарифы</Link>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", background: "radial-gradient(circle at top, rgba(47,102,143,.24), transparent 36%), linear-gradient(135deg, #07111f 0%, #0f172a 48%, #111827 100%)", color: "#fff" },
  card: { width: "100%", maxWidth: "620px", textAlign: "center", padding: "48px 36px", borderRadius: "28px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 28px 80px rgba(0,0,0,.35)", backdropFilter: "blur(18px)" },
  icon: { width: "92px", height: "92px", margin: "0 auto 24px", borderRadius: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", boxShadow: "0 18px 40px rgba(20,184,166,.2)" },
  eyebrow: { margin: "0 0 10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", fontSize: "13px" },
  title: { margin: 0, fontSize: "clamp(30px, 5vw, 44px)", lineHeight: 1.08, fontWeight: 700 },
  copy: { margin: "20px auto 0", maxWidth: "470px", color: "rgba(255,255,255,.74)", fontSize: "18px", lineHeight: 1.6 },
  actions: { display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginTop: "34px" },
  primary: { minWidth: "190px", padding: "14px 22px", borderRadius: "999px", background: "linear-gradient(135deg, #7fc2e8, #61a9d4)", color: "#04111d", fontWeight: 800, textDecoration: "none" },
  secondary: { minWidth: "150px", padding: "14px 22px", borderRadius: "999px", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", color: "#fff", fontWeight: 700, textDecoration: "none" },
};
