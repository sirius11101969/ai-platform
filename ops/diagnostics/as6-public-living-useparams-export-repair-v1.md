# AS6 Public Living useParams export repair v1

## Диагностика

Production build нового публичного интерфейса был заблокирован:

`useParams is not exported by node_modules/react-router-dom/index.js`

## Root Cause

Проект использует локальный vendor-контракт `react-router-dom`, который не экспортирует
хук `useParams`, но `AS6PublicLivingWebsite.jsx` импортировал и вызывал его.

## Изменение

- удалён импорт `useParams`;
- slug статьи определяется из `window.location.pathname`;
- сохранена работа маршрутов `/blog/:slug`;
- зависимости не обновлялись;
- legacy UI не возвращался.

## Новые диагностические классы

- `AS6_ROUTER_VENDOR_EXPORT_CONTRACT_DRIFT`
- `AS6_PUBLIC_BLOG_ROUTE_BUILD_BLOCKED`
- `AS6_PUBLIC_LIVING_BUILD_VALIDATION_GAP`

## Validation

Обязательные флаги:

- `AS6_USEPARAMS_EXPORT_GAP=FIXED`
- `AS6_PUBLIC_LIVING_BUILD=PASS`
- `AS6_LEGACY_PUBLIC_BUILD_MARKERS=0`
- `BUILD=PASS`
- `PRODUCTION=HEALTHY`
