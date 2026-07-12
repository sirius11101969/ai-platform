# AS6 Public Russian-Only Cutover v1

## Диагностика

Обнаружен конфликт публичного бренда: старый тёмный англоязычный лендинг оставался в репозитории как параллельная реализация и мог быть повторно подключён, импортирован или ошибочно развёрнут.

## Root Cause

Переход на Public Living Website выполнялся с сохранением legacy-компонентов как rollback. После прямого решения владельца проекта старый интерфейс больше не является допустимым rollback-источником. Канонический публичный интерфейс теперь только `AS6PublicLivingWebsite.jsx`.

## Изменение

- удалён `frontend/src/pages/AS6PublicWebsite.jsx`;
- удалён `frontend/src/pages/AS6PublicWebsite.css`;
- публичный HTML переведён на русский язык и светлую критическую тему;
- обновлены title и description;
- английская локализация отложена до отдельного зарегистрированного этапа i18n;
- rollback должен выполняться только через Git commit/deployment artifact, а не через живой legacy-код.

## Failure Classes

- `AS6_PUBLIC_LEGACY_INTERFACE_PRESENT`
- `AS6_PUBLIC_PARALLEL_BRAND_IMPLEMENTATION_DRIFT`
- `AS6_PUBLIC_DEFAULT_LANGUAGE_DRIFT`
- `AS6_PUBLIC_DARK_CRITICAL_BACKGROUND_DRIFT`
- `AS6_PUBLIC_I18N_PREMATURE_ENABLEMENT`
- `AS6_PUBLIC_ROLLBACK_SOURCE_AMBIGUITY`

## Обязательные проверки

- legacy-файлы отсутствуют;
- `App.jsx` импортирует только Public Living Website;
- `frontend/index.html` содержит `lang="ru"`;
- title и description русскоязычные;
- критический фон светлый;
- production build не содержит старые классы `.as6-public-site`;
- `/`, `/blog`, `/about`, `/docs`, `/pricing`, `/contact` работают на русском языке;
- английский язык не активируется до появления отдельного language registry и полного перевода.

## Ожидаемые PASS-флаги

- `AS6_PUBLIC_LEGACY_INTERFACE_REMOVED=PASS`
- `AS6_PUBLIC_SINGLE_BRAND_OWNER=PASS`
- `AS6_PUBLIC_RUSSIAN_DEFAULT=PASS`
- `AS6_PUBLIC_LIGHT_CRITICAL_SHELL=PASS`
- `AS6_PUBLIC_ROLLBACK_VIA_GIT_ARTIFACT=PASS`
