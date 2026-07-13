import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveAuthSession, signup } from "../services/api";
import "./AuthPages.css";

function LivingAuthMark() {
  return (
    <span className="living-auth-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function AuthCard({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = isSignup
        ? await signup({ name: name.trim(), email: email.trim(), password })
        : await login({ email: email.trim(), password });

      saveAuthSession(session);
      navigate("/app");
    } catch (apiError) {
      setError(
        apiError?.status === 401
          ? "Электронная почта или пароль не подошли. Проверьте данные."
          : apiError?.message || "Не удалось продолжить. Попробуйте ещё раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="living-auth-page">
      <div className="living-auth-sky" aria-hidden="true" />
      <div className="living-auth-stars" aria-hidden="true" />

      <header className="living-auth-header">
        <Link to="/" className="living-auth-brand" aria-label="AS6 — главная">
          <LivingAuthMark />
          <span>
            <strong>AS6</strong>
            <small>Спокойный бизнес</small>
          </span>
        </Link>

        <Link className="living-auth-back" to="/">
          Вернуться на сайт
        </Link>
      </header>

      <section className="living-auth-space">
        <div className="living-auth-orbit living-auth-orbit--one" aria-hidden="true" />
        <div className="living-auth-orbit living-auth-orbit--two" aria-hidden="true" />

        <span className="living-auth-node living-auth-node--focus">Фокус</span>
        <span className="living-auth-node living-auth-node--crm">CRM</span>
        <span className="living-auth-node living-auth-node--finance">Финансы</span>
        <span className="living-auth-node living-auth-node--docs">Документы</span>

        <section className="living-auth-intro">
          <span className="living-auth-eyebrow">
            {isSignup ? "Первый шаг в живое пространство" : "Возвращение в пространство"}
          </span>

          <h1>
            {isSignup
              ? "Создайте своё пространство AS6."
              : "Продолжите работу там, где остановились."}
          </h1>

          <p>
            AS6 сохраняет контекст бизнеса и спокойно помогает перейти
            от намерения к следующему понятному действию.
          </p>

          <div className="living-auth-principles" aria-label="Принципы AS6">
            <span>Единый контекст</span>
            <span>Спокойные решения</span>
            <span>Человек управляет</span>
          </div>
        </section>

        <form className="living-auth-form" onSubmit={handleSubmit}>
          <div className="living-auth-form__heading">
            <LivingAuthMark />
            <span className="living-auth-eyebrow">
              {isSignup ? "Регистрация" : "Вход"}
            </span>
            <h2>{isSignup ? "Начать работу" : "Добро пожаловать"}</h2>
            <p>
              {isSignup
                ? "Несколько данных — и пространство будет готово."
                : "Введите данные, чтобы открыть ваше пространство."}
            </p>
          </div>

          {isSignup && (
            <label className="living-auth-field">
              <span>Как к вам обращаться?</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Ваше имя"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          )}

          <label className="living-auth-field">
            <span>Электронная почта</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@company.ru"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="living-auth-field">
            <span>Пароль</span>
            <input
              type="password"
              name="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="Не менее 8 символов"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength="8"
              required
            />
          </label>

          {error && (
            <p className="living-auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="living-auth-submit"
            type="submit"
            disabled={isSubmitting}
          >
            <span>
              {isSubmitting
                ? "Открываем пространство..."
                : isSignup
                  ? "Создать пространство"
                  : "Войти в AS6"}
            </span>
            <b aria-hidden="true">→</b>
          </button>

          <p className="living-auth-switch">
            {isSignup ? "Пространство уже создано?" : "Впервые в AS6?"}
            {" "}
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Войти" : "Создать аккаунт"}
            </Link>
          </p>

          <small className="living-auth-trust">
            Ваши данные используются только для работы пространства AS6.
          </small>
        </form>
      </section>
    </main>
  );
}

export function SignupPage() {
  return <AuthCard mode="signup" />;
}

export function LoginPage() {
  return <AuthCard mode="login" />;
}
