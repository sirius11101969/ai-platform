# AS6 Payment Configuration Hardening v1

## Диагностика

Docker Compose выводил предупреждения при каждой сборке, поскольку платёжные
переменные были объявлены без безопасных значений по умолчанию.

## Root Cause

Платёжный environment contract смешивал:

- обязательные production-секреты;
- необязательную отключённую конфигурацию;
- frontend-only deployment;
- backend runtime-конфигурацию.

В результате Docker Compose требовал переменные даже тогда, когда платёжный
провайдер ещё не подключён.

## Изменение

Установлены безопасные значения:

- `APP_URL=https://www.as6.ru`;
- `PAYMENT_MODE=disabled`;
- `YOOKASSA_MODE=disabled`;
- `STRIPE_MODE=disabled`;
- секреты и идентификаторы остаются пустыми, пока провайдер отключён.

Секреты не добавляются в Git и не выводятся диагностикой.

## Fail-closed

Backend принимает только поддерживаемые платёжные режимы. Значение `disabled`
не запускает mock или production-платёж, а возвращает контролируемую ошибку.

## Новые failure classes

- `AS6_PAYMENT_COMPOSE_INTERPOLATION_WARNING`
- `AS6_PAYMENT_PROVIDER_PARTIAL_CONFIG`
- `AS6_PAYMENT_DISABLED_MODE_LEAK`
- `AS6_PAYMENT_PRODUCTION_SECRET_GAP`
- `AS6_PAYMENT_WEBHOOK_SECRET_GAP`
- `AS6_PAYMENT_PROVIDER_FAIL_OPEN`
- `AS6_PAYMENT_ENV_SECRET_DISCLOSURE`
- `AS6_PAYMENT_CONFIGURATION_DEPLOYMENT_DRIFT`

## Production activation rule

Для включения реальных платежей требуется отдельный цикл:

1. выбрать одного провайдера;
2. получить production или sandbox credentials;
3. сохранить секреты только в серверном `.env`;
4. проверить webhook signature;
5. провести тестовый платёж;
6. включить provider mode;
7. выполнить повторную диагностику.
