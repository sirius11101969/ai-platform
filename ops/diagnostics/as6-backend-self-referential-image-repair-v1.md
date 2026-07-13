# AS6 Backend Self-Referential Image Repair v1

## Диагностика

Backend deployment остановился с ошибкой:

`failed to solve: mount options is too long`

## Root Cause

`backend/Dockerfile` использовал:

`FROM ai-platform-backend:latest`

То есть образ строился из предыдущей версии самого себя. Каждая сборка
увеличивала рекурсивную цепочку слоёв, пока Docker/overlay mount contract
не превысил допустимый размер.

## Изменение

- self-referential base image удалён;
- базовым образом назначен `node:20-alpine`;
- зависимости устанавливаются через `npm ci --omit=dev`;
- используется существующий `package-lock.json`;
- runtime запускается непривилегированным пользователем `node`;
- старый образ сохранён как локальный rollback image;
- security commit административного AI-ключа сохраняется и развёртывается.

## Failure classes

- `AS6_BACKEND_SELF_REFERENTIAL_BASE_IMAGE`
- `AS6_DOCKER_RECURSIVE_LAYER_CHAIN`
- `AS6_DOCKER_MOUNT_OPTIONS_LENGTH_OVERFLOW`
- `AS6_BACKEND_IMAGE_FOUNDATION_DRIFT`
- `AS6_BACKEND_NON_REPRODUCIBLE_BUILD`
- `AS6_BACKEND_ROOT_RUNTIME_GAP`
- `AS6_BACKEND_DEPLOYMENT_BLOCKED_AFTER_PUSH`
- `AS6_COMMIT_DEPLOYMENT_ATOMICITY_GAP`

## Prevention

Контроль запрещает:

- `FROM ai-platform-backend`;
- использование локального production-образа как base image;
- сборку без lock-файла;
- запуск backend-контейнера от root.

## Package-lock repair

После устранения self-referential Docker image сборка обнаружила второй
независимый блокер:

`npm ci can only install packages when package.json and package-lock.json are in sync`

### Root Cause

`ioredis` был объявлен в `backend/package.json`, но связанный dependency graph
не был полностью зафиксирован в `backend/package-lock.json`.

### Изменение

- lock-файл обновлён через `npm install --package-lock-only`;
- выполнен чистый `npm ci --omit=dev`;
- проверено наличие полного dependency graph `ioredis`;
- проверен runtime-import `ioredis`;
- production Dockerfile продолжает использовать воспроизводимый `npm ci`.

### Additional failure classes

- `AS6_BACKEND_PACKAGE_LOCK_DRIFT`
- `AS6_NPM_CI_REPRODUCIBILITY_BLOCKED`
- `AS6_DECLARED_DEPENDENCY_LOCK_GRAPH_GAP`
- `AS6_BACKEND_LOCKFILE_VALIDATION_GAP`
- `AS6_DEPENDENCY_CHANGE_WITHOUT_LOCK_UPDATE`
- `AS6_DOCKER_BUILD_SECONDARY_BLOCKER`
