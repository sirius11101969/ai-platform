# AS6 Master Screen — Living Space Standard v1.0

Status: APPROVED / CANONICAL / DESIGN FREEZE

## Canonical authority

The approved Screen 1 «Фокус — Пространство концентрации» is the single visual authority for the AS6 interface.

Canonical visual artifact supplied and approved by the product owner:

- source filename: `ЭКРАН 1 ПРОСТРАНСТВО КОНЦЕНТРАЦИИ(5).png`
- canvas: `1536 × 1024 px`
- color mode: `RGBA`
- SHA-256: `95b21330030a963f0a1886da2c7ddc008afd785f945569df29aadfaf86371693`
- approval state: `FINAL / IDEAL / MASTER SCREEN`

The checksum identifies the exact approved visual revision. Any different rendering is not the canonical Master Screen unless a new architecture decision explicitly replaces this record.

## Core rule

All AS6 screens are states of one Living Space. Every existing and future space must inherit the Master Screen. Differences are allowed only in semantic content, entities, central-space meaning, events, recommendations, and contextual data.

Independent redesign, reinterpretation, or regeneration of shared components is forbidden.

## Locked visual inheritance

Every space must inherit without independent adaptation:

- global composition and grid;
- atmospheric background and cloud depth;
- central light distribution;
- typography family, hierarchy, color, opacity, weight, tracking, and line height;
- header placement and controls;
- left information region rhythm;
- right event rail structure;
- state metric component;
- lower reasoning path;
- lower recommendation region;
- action-link presentation;
- AS6 input line and microphone;
- spacing, transparency, glow, and motion language.

## Central living object standard

The central living object on the approved Master Screen establishes the quality threshold for all spaces:

- layered translucent geometry;
- soft milk-white internal light;
- extremely subtle warm-golden energy;
- fine internal connections;
- small luminous nodes;
- controlled outer halo;
- visible depth without excessive brightness;
- no neon, hard contrast, or white clipping.

The central object must remain the first point of attention. Metrics, rails, labels, and decorative effects must not compete with it.

## Locked Master Components

The following components are global and immutable across spaces:

1. Header pattern.
2. Language, theme, time, date, and weather controls.
3. Right event rail.
4. State percentage and update-time layout.
5. Lower reasoning path.
6. Recommendation layout.
7. Text action link.
8. Bottom AS6 input line.
9. Microphone icon.

These components must be reused as shared implementation components. They must not be redrawn separately for CRM, Finance, Documents, or any later space.

## Bottom AS6 input line — canonical appearance

The approved Master Screen input line is a locked component.

Required behavior and appearance:

- placed at the bottom of the main workspace;
- no visible rectangular frame around the entire field;
- no heavy glass card;
- no double outline;
- no thick border;
- no isolated container appearance;
- the component exists through a very subtle translucent field and a soft horizontal light line;
- calm blue placeholder text aligned to the left;
- microphone aligned to the right;
- identical height, width, baseline, padding, glow, opacity, and microphone geometry on every space;
- only the placeholder content may change by context.

Master placeholder:

`Расскажите, что вы хотите получить.`

Any visible enclosing rectangular border is an interface regression.

## State metric standard

The percentage indicator is secondary information.

For the `1536 × 1024 px` reference canvas:

- visible percentage character height: approximately `18 px`;
- same family, weight, tracking, opacity, and line height as the approved Master Screen;
- no card, frame, dot, contour, or additional glow;
- never larger or visually heavier than the Master Screen value `72%`.

## AS6 Living Sky standard

Required:

- natural light-blue sky;
- real soft clouds;
- multiple translucent cloud layers;
- slightly stronger blue through the central region;
- light edges;
- milk-white ambient light;
- no visible light source;
- minimal warm-golden accent;
- interface appears inside the sky, not over a sky image.

Forbidden:

- vignette;
- dark corners;
- dirty gray;
- violet cast;
- dark blue masses;
- dark clouds;
- aggressive contrast;
- heavy panels;
- cyberpunk or neon treatment.

## Typography lock

All text on subsequent spaces must use the Master Screen typography system. A space-specific color interpretation is forbidden.

Locked properties:

- hue;
- saturation;
- opacity;
- weight;
- size role;
- tracking;
- line height;
- hierarchy.

## Change control

A modification to any locked property is an architecture-level change. It requires:

1. explicit product-owner approval;
2. a new canonical revision;
3. a new checksum record;
4. updates to Living Space governance;
5. validation of every existing space against the new revision.

Until that process is completed, this v1.0 record remains authoritative.

## Acceptance test

A new space is accepted only if it feels like the same interface changing state, not a new module opening.

The visual test is:

> «Я остаюсь в одном спокойном живом пространстве; изменился только смысл текущего состояния.»

## Source-of-truth order

1. This canonical Master Screen record.
2. `docs/AS6_LIVING_SPACE_RULES.md`.
3. `docs/architecture/09_AS6_CORE_SPECIFICATION.md`.
4. Shared design tokens and implementation components.
5. Space-specific specifications.

If a lower-level artifact conflicts with this document, the lower-level artifact must be corrected.