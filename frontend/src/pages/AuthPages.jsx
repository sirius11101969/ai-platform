import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMark } from "../components/AppShell";

function AuthCard({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const [email, setEmail] = useState("founder@company.ai");

  const handleSubmit = (event) => {
    event.preventDefault();
    window.localStorage.setItem("ai-platform-auth", JSON.stringify({ email, mock: true }));
    navigate("/dashboard");
  };

  return (
    <main className="auth-page">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <section className="auth-copy">
        <BrandMark />
        <span className="hero-badge">Mock auth v1 · готово к backend JWT</span>
        <h1>{isSignup ? "Создайте AI‑workspace для продаж" : "Вернитесь в AI‑workspace"}</h1>
        <p>Единый доступ к dashboard, credits, AI-задачам и CRM pipeline в премиальном dark SaaS интерфейсе.</p>
        <div className="auth-benefits">
          <span>✓ Protected layout</span>
          <span>✓ CRM и AI follow-up</span>
          <span>✓ Production-ready routing</span>
        </div>
      </section>
      <form className="auth-form shell-glow" onSubmit={handleSubmit}>
        <span className="eyebrow">{isSignup ? "Signup" : "Login"}</span>
        <h2>{isSignup ? "Начать работу" : "Войти в аккаунт"}</h2>
        {isSignup && (
          <label>
            <span>Имя</span>
            <input type="text" defaultValue="Анна Орлова" required />
          </label>
        )}
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          <span>Пароль</span>
          <input type="password" defaultValue="mock-password" minLength="8" required />
        </label>
        <button className="btn primary" type="submit">{isSignup ? "Создать workspace" : "Войти"}</button>
        <p className="auth-switch">
          {isSignup ? "Уже есть аккаунт?" : "Нет аккаунта?"} <Link to={isSignup ? "/login" : "/signup"}>{isSignup ? "Войти" : "Зарегистрироваться"}</Link>
        </p>
      </form>
    </main>
  );
}

export function SignupPage() {
  return <AuthCard mode="signup" />;
}

export function LoginPage() {
  return <AuthCard mode="login" />;
}
