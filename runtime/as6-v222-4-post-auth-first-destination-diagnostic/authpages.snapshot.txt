import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMark } from "../components/AppShell";
import { login, saveAuthSession, signup } from "../services/api";

function AuthCard({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const [email, setEmail] = useState("founder@company.ai");
  const [password, setPassword] = useState("mock-password");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = isSignup
        ? await signup({ email, password })
        : await login({ email, password });

      saveAuthSession(session);
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.status === 401 ? "Неверная эл. почта или пароль. Проверьте данные и попробуйте снова." : apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <section className="auth-copy">
        <BrandMark />
        <span className="hero-badge">JWT‑авторизация v1 · PostgreSQL‑бэкенд</span>
        <h1>{isSignup ? "Создайте AI‑пространство для продаж" : "Вернитесь в AI‑пространство"}</h1>
        <p>Единый доступ к дашборду, AI‑кредитам, AI‑задачам и CRM‑воронке в премиальном тёмном SaaS‑интерфейсе.</p>
        <div className="auth-benefits">
          <span>✓ Защищённый рабочий контур</span>
          <span>✓ CRM и AI‑дожим</span>
          <span>✓ Готовая к продакшену навигация</span>
        </div>
      </section>
      <form className="auth-form shell-glow" onSubmit={handleSubmit}>
        <span className="eyebrow">{isSignup ? "Регистрация" : "Вход"}</span>
        <h2>{isSignup ? "Начать работу" : "Войти в аккаунт"}</h2>
        {isSignup && (
          <label>
            <span>Имя</span>
            <input type="text" defaultValue="Анна Орлова" required />
          </label>
        )}
        <label>
          <span>Эл. почта</span>
          <input type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          <span>Пароль</span>
          <input type="password" name="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Подключаемся..." : isSignup ? "Создать рабочее пространство" : "Войти"}
        </button>
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
