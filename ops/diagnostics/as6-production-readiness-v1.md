# AS6 Production Readiness v1

## Диагностика

Production был доступен и работоспособен, но отсутствовал единый автоматизированный контур резервирования, restore-verification и постоянного health-monitoring.

## Root Cause

- PostgreSQL backup выполнялся без зарегистрированного расписания;
- не было автоматической проверки структуры backup через `pg_restore --list`;
- не было retention-контроля;
- состояние сайта, API и контейнеров не проверялось системным таймером;
- monitoring failure не попадал в system journal;
- отсутствовал единый production-readiness control.

## Изменение

- добавлен ежедневный PostgreSQL backup в custom format;
- добавлена SHA-256 проверка;
- добавлена безопасная restore-structure verification без изменения production БД;
- добавлен retention 7 дней;
- добавлен мониторинг сайта, auth-маршрутов, `/app`, API и контейнеров;
- failure события регистрируются через system logger;
- добавлены systemd timers;
- добавлен единый prevention control.

## Failure classes

- `AS6_PRODUCTION_BACKUP_MISSING`
- `AS6_BACKUP_RESTORE_VERIFICATION_GAP`
- `AS6_BACKUP_CHECKSUM_GAP`
- `AS6_BACKUP_RETENTION_GAP`
- `AS6_DATABASE_RECOVERY_READINESS_GAP`
- `AS6_PRODUCTION_MONITORING_GAP`
- `AS6_CONTAINER_HEALTH_VISIBILITY_GAP`
- `AS6_PUBLIC_ROUTE_MONITORING_GAP`
- `AS6_API_HEALTH_BODY_VALIDATION_GAP`
- `AS6_ALERT_DELIVERY_LOCAL_ONLY`
- `AS6_MONITORING_TIMER_GAP`
- `AS6_ROLLBACK_EVIDENCE_GAP`

## Alerting limitation

Текущая версия регистрирует ошибки в systemd journal и `/var/log/as6/production-monitor.log`. Внешние уведомления требуют отдельного канала: Telegram, email или webhook.
