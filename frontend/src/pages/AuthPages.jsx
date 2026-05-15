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
      setError(apiError.status === 401 ? "Неверный email или пароль. Проверьте данные и попробуйте снова." : apiError.message);
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
        <span className="hero-badge">JWT auth v1 · PostgreSQL backend</span>
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
          <input type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          <span>Пароль</span>
          <input type="password" name="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Подключаемся..." : isSignup ? "Создать workspace" : "Войти"}
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
