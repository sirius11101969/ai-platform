# AS6 UI Restore Policy

Любой AS6 UI-патч считается незавершённым, если после него нельзя восстановить интерфейс по точной Git-метке.

Обязательные элементы:
- ops/bin/as6-create-restore-point
- ops/bin/as6-restore-to-tag
- Git tag AS6_RESTORE_<short_commit>
- ops/restore-points/*.md
- запись в Diagnostic Registry
- запись в Coverage Registry
- запись в Project State

Правило:
После каждого ops/bin/as6-finish создаётся restore tag и restore manifest.

Безопасный локальный откат:
ops/bin/as6-restore-to-tag AS6_RESTORE_<short_commit>

Удалённый откат main разрешён только явно:
CONFIRM_AS6_RESTORE=YES ops/bin/as6-restore-to-tag AS6_RESTORE_<short_commit> --push
