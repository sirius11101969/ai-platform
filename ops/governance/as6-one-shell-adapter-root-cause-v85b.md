# AS6 ONE Shell Adapter Root Cause V85B

Root cause: V85 был остановлен защитой clean-worktree, потому что после предыдущих циклов остались untracked governance/root-cause артефакты.

Repair: не удалять артефакты, а зарегистрировать их как диагностическое evidence, затем выполнить AS6 ONE Shell Adapter contract для /as6-one.
