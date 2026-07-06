# AGENTS.md

# AS6 Development Rules

## Local Codex Skills

For AS6 tasks, use local Codex instructions from `.codex/skills/*` and `.codex/prompts/*`.

Created skills:
- `.codex/skills/as6-diagnostics-first.md`
- `.codex/skills/as6-design-system.md`
- `.codex/skills/as6-crm-module.md`
- `.codex/skills/as6-validation.md`
- `.codex/skills/as6-release.md`
- `.codex/skills/as6-autonomous-engineer.md`

Primary AS6 skill:
- Use `.codex/skills/as6-autonomous-engineer.md` as the main skill for commands like `делай`, `продолжи`, and `следующий этап`.

## Daily Workflow

For daily development use:

`.codex/prompts/continue.md`

This is the default entry point for AS6 development.

Created prompts:
- `.codex/prompts/continue.md`
- `.codex/prompts/continue-next-stage.md`
- `.codex/prompts/repair-cycle.md`
- `.codex/prompts/ui-migration.md`

## Repository State

Before every task automatically determine:
- current HEAD;
- current restore tag;
- current project readiness;
- current active EPIC;
- current NEXT_STAGE.

Use current HEAD as BASE_EXPECTED unless explicitly overridden.

## Git

Never commit:
- `runtime/**`;
- `*.log`;
- cache;
- temp files.

Before commit:
- build passes;
- guardian passes;
- secret scan passes.
