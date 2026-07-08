# AS6 Brand / Interface Language Rule v1.0

## Purpose

This rule defines how brand text and interface text are used inside AS6 Living Space.

AS6 must not mix languages randomly.

The brand may remain international, while the product interface must speak the user's language.

## Main Rule

The AS6 logo remains unchanged:

```text
AS6
Calm Business
```

This is the international brand mark and must stay in English unless a separate localized brand strategy is approved.

All dynamic interface text must be in the user's language.

For the Russian interface, all state names, system messages, recommendations, statuses, timeline labels, node labels, and central Core messages must be in Russian.

## Central State Capsule

The top central capsule must show the current Living Space state as the primary line.

The permanent Living Space label must become the secondary line.

Correct structure:

```text
● Фокус
  Живое пространство
```

```text
● Мышление
  Живое пространство
```

```text
● Анализ
  Живое пространство
```

```text
● Стратегия
  Живое пространство
```

```text
● Решение
  Живое пространство
```

```text
● Рост
  Живое пространство
```

## Why

The state name changes from screen to screen.

The Living Space label is permanent across all screens.

Therefore, the state must be visually dominant and the Living Space label must be secondary.

The user must understand in less than one second:

1. this is AS6;
2. the current state is active;
3. the state belongs to the same Living Space.

## Prohibited

Do not use English for Russian interface state names.

Do not display `Calm Growth` inside the central state capsule in the Russian interface.

Do not make `Живое пространство` the primary line when the current state must be recognized.

Do not change the AS6 logo text unless a dedicated brand-localization decision is approved.

Do not mix Russian and English inside task messages, node labels, statuses, or recommendations.

## Correct Examples

Logo area:

```text
AS6
Calm Business
```

Top central capsule:

```text
● Фокус
  Живое пространство
```

AS6 Core message:

```text
Подготовил финансовую модель
3 сценария готовы
Жду вашего решения
```

Node labels:

```text
Финансовая модель
Инвесторы
Рынок
Риски
Команда
Стратегия
```

## Result

AS6_BRAND_INTERFACE_LANGUAGE_RULE=REGISTERED
