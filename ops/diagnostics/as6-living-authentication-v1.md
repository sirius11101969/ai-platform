# AS6 Living Authentication v1

## Диагностика

Маршруты `/signup` и `/login` продолжали использовать старый тёмный интерфейс
«AI-платформа продаж», несмотря на переход публичного сайта на Living Space.

## Root Cause

`frontend/src/pages/AuthPages.jsx` оставался отдельным legacy-владельцем визуального
языка авторизации и содержал:

- старую тёмную SaaS-композицию;
- старое позиционирование продукта как платформы продаж;
- тестовые имя, email и пароль;
- переход в legacy-маршрут `/command-center`;
- старые глобальные CSS-классы.

## Изменение

- создан единый AS6 Living Authentication;
- `/login` и `/signup` наследуют свет, фон, геометрию и типографику Living Space;
- удалены тестовые значения полей;
- после авторизации выполняется переход в `/app`;
- сохранены действующие API-контракты `login`, `signup`, `saveAuthSession`;
- добавлена адаптивность и поддержка reduced motion.

## Новые failure classes

- `AS6_LEGACY_AUTH_INTERFACE_PRESENT`
- `AS6_AUTH_BRAND_LANGUAGE_DRIFT`
- `AS6_AUTH_TEST_CREDENTIALS_PRESENT`
- `AS6_AUTH_LEGACY_REDIRECT_PRESENT`
- `AS6_AUTH_LIVING_SPACE_INHERITANCE_GAP`
- `AS6_AUTH_BUILD_VALIDATION_GAP`
- `AS6_AUTH_DEPLOYMENT_DRIFT`

## Prevention

Контроль `ops/bin/as6-control-living-authentication-v1` блокирует возврат
legacy-маркеров и требует переход после авторизации в `/app`.
