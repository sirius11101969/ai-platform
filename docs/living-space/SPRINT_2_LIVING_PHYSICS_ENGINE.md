# AS6 Sprint 2 — Living Physics Engine

## Status

IMPLEMENTED FOUNDATION

## Goal

Move Living Space from static component placement to calculated spatial behavior.

Sprint 2 introduces the first Living Physics layer:

- Attention Engine;
- Energy Engine;
- Gravity Engine;
- Connection Engine;
- Physics Engine composition.

## Implemented Files

- frontend/src/living/engine/AttentionEngine.js
- frontend/src/living/engine/EnergyEngine.js
- frontend/src/living/engine/GravityEngine.js
- frontend/src/living/engine/ConnectionEngine.js
- frontend/src/living/engine/PhysicsEngine.js
- frontend/src/living/engine/LivingSpace.jsx
- frontend/src/living/nodes/LivingNode.jsx
- frontend/src/living/nodes/LivingNode.css

## Architecture Rules Preserved

- Space controls components, not the opposite.
- AS6 Core remains the center of gravity.
- Active nodes move closer to the Core.
- Active nodes receive higher attention and energy.
- Quiet nodes are still present but do not compete with Core.
- Living Space remains state-driven.

## Result

Living Space preview now uses calculated physics for node position, energy and attention.

## Preview Route

- /as6-living-preview

## Readiness

AS6_PROJECT_READINESS_AFTER_SPRINT_2_LIVING_PHYSICS_ENGINE=99.9%
