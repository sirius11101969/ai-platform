import React from "react";
import { Link } from "react-router-dom";

export default function PaymentSuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        background:
          "radial-gradient(circle at top, rgba(16,185,129,0.18), transparent 34%), linear-gradient(135deg, #07111f 0%, #0f172a 48%, #111827 100%)",
        color: "#fff",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          textAlign: "center",
          padding: "44px 36px",
          borderRadius: "28px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            width: "92px",
            height: "92px",
            margin: "0 auto 24px",
            borderRadius: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            background: "linear-gradient(135deg, #34d399, #14b8a6)",
            boxShadow: "0 18px 40px rgba(20,184,166,0.35)",
          }}
        >
          ✓
        </div>

        <p
          style={{
            margin: "0 0 10px",
            color: "#86efac",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: "13px",
          }}
        >
          Платёж принят
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(32px, 5vw, 46px)",
            lineHeight: 1.05,
            fontWeight: 800,
          }}
        >
          Оплата получена
        </h1>

        <p
          style={{
            margin: "20px auto 0",
            maxWidth: "420px",
            color: "rgba(255,255,255,0.74)",
            fontSize: "18px",
            lineHeight: 1.6,
          }}
        >
          Тариф активируется автоматически. AI-кредиты начисляются в течение нескольких секунд.
        </p>

        <div
          style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "34px",
          }}
        >
          <Link
            to="/dashboard?payment=success"
            style={{
              minWidth: "190px",
              padding: "14px 22px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #22c55e, #14b8a6)",
              color: "#04111d",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 14px 32px rgba(20,184,166,0.28)",
            }}
          >
            Перейти в кабинет
          </Link>

          <Link
            to="/"
            style={{
              minWidth: "150px",
              padding: "14px 22px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            На главную
          </Link>
        </div>
      </section>
    </main>
  );
}
