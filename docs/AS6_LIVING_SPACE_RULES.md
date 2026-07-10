# AS6 Living Space Rules

Status: APPROVED / DESIGN FREEZE v1.0

## Source of truth

This document is normative for all AS6 interface work. Before proposing or implementing a new screen, state, component, prompt, or visual change, the repository rules in this document and related AS6 architecture documents must be checked first.

## Core axiom

AS6 is one Living Space. Screens are not separate interfaces or applications. They are states of the same continuous environment.

The user must never feel that they have opened another product, module, dashboard, CRM, ERP, or panel set.

## Master Screen

Screen 1 (Focus) is the Master Screen and visual reference for all spaces.

Every other space inherits its:

- atmosphere;
- sky background;
- light distribution;
- typography;
- visual hierarchy;
- spacing rhythm;
- panel behavior;
- component proportions;
- motion language;
- emotional perception;
- Calm Business character.

Changes are evolutionary only. A successful visual concept is polished, never replaced without a separately approved architectural decision.

## Approved spaces

1. Focus — Пространство концентрации — «Что сейчас самое важное?»
2. CRM — Пространство отношений — «С кем сейчас нужно работать?»
3. Финансы — Пространство устойчивости — «Насколько устойчив мой бизнес?»
4. Документы — Пространство знаний — «Что уже известно?»
5. Проекты — Пространство развития — «Куда развивается компания?»
6. Команда — Пространство взаимодействия — «Кто сейчас участвует?»
7. Решения — Пространство выбора — «Какое решение лучше?»
8. Автоматизация — Пространство автономности — «Что система сделает сама?»
9. Пульс бизнеса — Пространство состояния — «Что происходит сейчас?»
10. Совместное мышление — Пространство синхронизации — «О чём мы думаем вместе?»
11. Присутствие — Пространство сопровождения — «Кто сейчас рядом?»
12. Знания — Пространство памяти — «Что система уже знает?»

## One question per space

Each space answers exactly one primary user question.

A space must not become a container for unrelated features. If a proposed function does not improve the primary question of the space, it must be moved, re-architected, or rejected.

## Required space structure

Every space uses the same structural DNA:

1. Space name.
2. Space type subtitle: «Пространство …».
3. One primary user question.
4. Central sphere or central living object.
5. Central meaning text that does not duplicate the space name.
6. Short explanatory subtitle.
7. Related outer entities.
8. Right information rail: what is happening now.
9. Lower action area: what to do next.
10. One AS6 communication/input line.

## Header semantics

The first line answers: «Где я?»

The second line answers: «Какова роль этого пространства?»

Approved examples:

- Фокус / Пространство концентрации
- CRM / Пространство отношений
- Финансы / Пространство устойчивости

The central sphere must not repeat the space name. It explains the meaning or current work of the space.

## Visual priority

Attention order is always:

1. Central living space.
2. Connections and related entities.
3. Side information.
4. Secondary panels and controls.

No metric, label, badge, frame, glow, or decorative element may compete with the central living space.

## AS6 Living Sky background

The background is part of the interface architecture, not a decorative image behind it.

Required qualities:

- natural light-blue sky;
- real soft clouds;
- multiple translucent cloud layers;
- light passing through clouds;
- large atmospheric depth;
- slightly stronger blue saturation through the central area;
- light edges;
- no vignette;
- no dark corners;
- no dirty gray, violet, or heavy blue tones;
- soft milk-white light;
- extremely subtle warm golden accent;
- light appears to come from the space itself, without a visible source.

The interface must feel located inside the sky, not placed over a sky picture.

## Calm Business

The interface must communicate:

- calm;
- air;
- light;
- depth;
- confidence;
- clarity.

It must not communicate:

- heaviness;
- darkness;
- density;
- aggression;
- technical clutter;
- visual noise.

The desired emotional test is: «Я открыл окно утром.»

## Typography and metric governance

All informational percentages and confidence/state indicators must use the same typography and visual weight as the corresponding metric on the Master Screen.

Required:

- same visible character height;
- same font family;
- same weight;
- same letter spacing;
- same line height;
- same opacity and color behavior;
- same role in the visual hierarchy.

Percentages are second-level information. They must never dominate the central sphere.

For the current 1536×1024 reference screens, the visible character height of the Master Screen percentage is approximately 18 px. Exact implementation should prefer shared design tokens or direct reuse of the Master Screen component rather than independent visual approximation.

## Decoration restrictions

Do not add decorative elements that have no informational function.

Forbidden unless explicitly approved:

- decorative frames around metrics;
- extra glowing dots;
- unnecessary contours;
- heavy glass cards;
- dark panels;
- isolated technical widgets;
- random light effects;
- duplicate headings;
- visual ornaments that compete with content.

## Component reuse

Do not create parallel visual components for separate spaces when the Master Screen component can be reused.

Reuse the same:

- header pattern;
- state metric component;
- right rail structure;
- bottom action area;
- input line;
- spacing tokens;
- typography tokens;
- light and transparency rules.

Space-specific differences belong to meaning, entities, content, and central geometry—not to a separate UI system.

## Intent, context, and knowledge

Navigation is intent-first, not menu-first.

The system should determine:

1. user intent;
2. active context;
3. appropriate space;
4. relevant knowledge;
5. recommended next action.

Context must persist across spaces. A client, document, project, person, financial event, or decision remains available to every relevant space without manual re-entry.

Every meaningful action should update organizational knowledge and memory.

## Change acceptance rule

A change may be accepted only when it:

- makes AS6 simpler;
- makes AS6 calmer;
- improves understanding;
- preserves Living Space continuity;
- preserves the Master Screen character;
- reduces or does not increase cognitive load;
- helps the user decide or act faster;
- introduces no unnecessary decorative UI.

If any condition fails, the change must be rejected or redesigned.

## Architecture freeze

The following are frozen at v1.0 until a separate architecture decision is approved:

- one Living Space principle;
- the 12 approved spaces;
- one primary question per space;
- Screen 1 as Master Screen;
- AS6 Living Sky;
- Calm Business;
- shared visual hierarchy;
- intent-first navigation;
- persistent context;
- knowledge-first behavior;
- evolutionary change only.
