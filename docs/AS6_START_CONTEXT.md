# AS6 START CONTEXT

Проект: AI Platform / AS6

Репозиторий:
github.com/sirius11101969/ai-platform

Продакшн:

- Ubuntu 24.04 LTS
- VPS Beget
- /var/www/ai-platform
- Docker Compose
- nginx
- backend
- postgres
- redis
- https://www.as6.ru

Текущее подтвержденное состояние:

- AS6_DIAGNOSE_ALL_RESULT=OK
- PROJECT_HEALTH_SCORE=100
- GIT_MAIN_SYNC=OK
- ROOT_CAUSE=none
- SAFE_TO_CHANGE=YES
- PRODUCTION_READINESS=OK
- SECURITY_READINESS=OK
- MONITORING_READINESS=OK

Внедренные контуры:

- Root Cause Governance
- Coverage Registry
- Diagnostic Registry
- Secret Scan Gate
- Git Main Sync Gate
- Deployment Safety Gate
- VPS Baseline Diagnostics
- Provider Control Plane Diagnostics
- Autonomous Coverage Gate
- Change Pipeline Controller
- Autonomous Repair Controller
- Autonomous Validation Controller

Подтвержденный инцидент:

PROVIDER_HYPERVISOR_REBOOT

Доказательство:

System is rebooting (hypervisor initiated shutdown)

Провайдер:

Beget Cloud

Дополнительная проверка показала:

- перезагрузки отражались в панели Beget
- API не использовался
- вход выполнялся с IP 117.2.165.24
- 2FA включена
- пароль панели изменен
- белый список IP настроен

Методология работы:

1. Diagnostics First
2. Root Cause
3. Structure
4. Change
5. Post-Change Diagnostics
6. Governance Registration
7. Coverage Registration
8. Root Cause Registration
9. AEC Registration
10. Git Sync Validation
11. Production Validation

Обязательная автоматизация:

Всегда автоматически:

- добавлять новые диагностики
- добавлять новые проверки
- добавлять новые контроли
- добавлять новые root cause классы
- добавлять новые AEC правила
- регистрировать diagnostics в registry
- регистрировать coverage
- регистрировать governance
- добавлять prevention mapping
- добавлять rollback mapping
- выполнять повторную диагностику после изменений

Правила генерации команд:

- одна большая команда
- один внешний quoted heredoc
- без вложенных heredoc
- без base64
- без длинного python
- без показа секретов
- всегда сначала диагностика
- потом изменение
- потом повторная диагностика

Работа с секретами:

Никогда не выводить значения:

- API keys
- tokens
- passwords
- private keys
- webhook secrets

Всегда явно показывать место вставки секрета:

<INSERT_SECRET_HERE>

Текущий уровень автономности:

L6

Следующая цель:

L7

Целевая цепочка:

Root Cause
→ Repair Plan
→ Change Pipeline
→ Validation
→ Evidence
→ Production Confirmation
→ Autonomous Deployment
→ Autonomous Incident Control

Инструкция для нового чата:

Считать этот документ источником истины по проекту и продолжать работу с последнего подтвержденного зеленого состояния системы.
