# AS6 AI Execution Admin Key Hardening v1

## Диагностика

`AI_EXECUTION_ADMIN_KEY` отсутствовал в серверном environment, а middleware принимал ключ как через защищённый HTTP-заголовок, так и через query parameter URL.

## Root Cause

- секрет не был создан в серверном `.env`;
- Docker Compose использовал необязательную интерполяцию;
- URL query transport создавал риск утечки через историю браузера, reverse-proxy access logs и аналитику.

## Изменение

- ключ генерируется локально на production-сервере;
- ключ не выводится и не добавляется в Git;
- `.env` защищён правами `600`;
- Docker Compose требует непустой ключ;
- middleware принимает ключ только через `x-ai-execution-key`;
- JWT-аутентификация пользователей сохранена.

## Failure classes

- `AS6_AI_EXECUTION_ADMIN_KEY_MISSING`
- `AS6_AI_EXECUTION_ADMIN_KEY_WEAK`
- `AS6_AI_EXECUTION_ADMIN_KEY_QUERY_LEAK`
- `AS6_AI_EXECUTION_ADMIN_KEY_ENV_PERMISSION_GAP`
- `AS6_AI_EXECUTION_ADMIN_KEY_GIT_DISCLOSURE`
- `AS6_AI_EXECUTION_ADMIN_AUTH_FAIL_OPEN`
- `AS6_AI_EXECUTION_ADMIN_RUNTIME_DRIFT`

## Security rule

Административный ключ передаётся только в заголовке `x-ai-execution-key`. Передача через URL запрещена.

## Validation repair

Первичный цикл обнаружил `AS6_BACKEND_TEST_SCRIPT_GAP`:

- общий `npm test` в backend отсутствует;
- middleware имеет отдельный тестовый контракт
  `test:ai-execution-runner-auth`;
- validation исправлена на запуск точечного теста изменённого security-контура.

## Additional failure classes

- `AS6_BACKEND_TEST_SCRIPT_GAP`
- `AS6_SECURITY_CHANGE_TARGETED_TEST_GAP`
- `AS6_VALIDATION_COMMAND_CONTRACT_DRIFT`
