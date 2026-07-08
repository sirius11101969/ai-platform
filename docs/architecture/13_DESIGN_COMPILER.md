# AS6 Design Compiler (ADC) v1.0

## Purpose

AS6 Design Compiler is the validation system for AS6 Living Space design quality.

It does not judge whether a state is subjectively beautiful.

It verifies whether a new Living Space state complies with the governed AS6 architecture.

## Main Rule

A new AS6 state is approved only when it passes the Design Compiler.

The Design Compiler validates:

- Living Space Genome;
- Geometry Atlas;
- Spatial Composition System;
- Motion & Transition System;
- Visual Grammar;
- Master Screen 3 inheritance;
- Calm Growth emotional consistency.

## Compiler Inputs

Every new state must provide:

1. State name.
2. User task.
3. Emotional target.
4. Visual grammar formula.
5. Central geometry description.
6. Spatial composition description.
7. Motion transition description.
8. Master Screen 3 inheritance notes.
9. Difference from existing states.
10. One-second recognition evidence.

## Compiler Modules

### 1. Genome Validator

Checks that the state follows the core AS6 principle:

**Brand is constant. State is variable.**

Validates:

- same AS6 atmosphere;
- same light behavior;
- same material logic;
- same typography logic;
- same calm emotional base;
- no separate page style.

### 2. Grammar Validator

Checks the formal visual language.

Validates:

- approved visual primitives only;
- written visual formula;
- emotional meaning per primitive;
- valid grammar operators;
- no uncontrolled primitive drift.

### 3. Geometry Validator

Checks the central geometry.

Validates:

- one unique central geometry;
- no duplicate composition;
- consistency with Geometry Atlas;
- clear difference from all existing states;
- no repeated central composition.

### 4. Composition Validator

Checks spatial arrangement.

Validates:

- one primary center;
- no competing visual centers;
- no more than three attention levels;
- enough active empty space;
- panels support the central geometry;
- interface is born from the space.

### 5. Motion Validator

Checks transition behavior.

Validates:

- transition is transformation, not page switch;
- motion explains what changed;
- motion preserves spatial continuity;
- panels do not jump;
- light changes calmly;
- central geometry is the primary moving object.

### 6. Brand Validator

Checks AS6 recognition.

Validates:

- AS6 is recognizable in less than one second;
- Master Screen 3 atmosphere is inherited;
- no local visual style appears;
- light, depth, typography and panels remain AS6-native.

### 7. Emotion Validator

Checks emotional integrity.

Validates:

- the state has one emotional target;
- geometry supports the emotion;
- motion supports the emotion;
- Calm Growth is preserved;
- no visual anxiety or overload is introduced.

## Compiler Report Format

Every state must produce a report:

```text
AS6 Design Compiler Report

State Name ................ <STATE>
Living Space Genome ........ PASS|FAIL
Visual Grammar ............. PASS|FAIL
Geometry Atlas ............. PASS|FAIL
Spatial Composition ........ PASS|FAIL
Motion System .............. PASS|FAIL
Brand Consistency .......... PASS|FAIL
Emotion Consistency ........ PASS|FAIL
Duplicate Geometry Check ... PASS|FAIL
One-Second Recognition ..... PASS|FAIL

Overall Score .............. 0-100%
Decision ................... APPROVED|REJECTED
```

## Approval Threshold

A state is approved only when:

- all critical checks are PASS;
- overall score is 100%;
- no duplicate central geometry exists;
- Master Screen 3 inheritance is confirmed;
- one-second AS6 recognition is confirmed.

## Critical Failure Classes

- AS6_DESIGN_COMPILER_RULE_VIOLATION
- AS6_VISUAL_GRAMMAR_VALIDATION_FAILED
- AS6_MASTER_SCREEN_INHERITANCE_FAILED
- AS6_DUPLICATE_STATE_GEOMETRY
- AS6_PAGE_BASED_TRANSITION_DETECTED
- AS6_MULTIPLE_PRIMARY_FOCUS
- AS6_EMOTIONAL_INCONSISTENCY
- AS6_BRAND_LANGUAGE_DRIFT
- AS6_STATE_WITHOUT_COMPILER_REPORT

## AEC Rules

- AS6_DESIGN_COMPILER_REQUIRED_RULE
- AS6_STATE_MUST_PASS_ALL_COMPILER_MODULES_RULE
- AS6_NO_STATE_WITHOUT_FORMULA_RULE
- AS6_NO_STATE_WITHOUT_UNIQUE_GEOMETRY_RULE
- AS6_NO_PAGE_SWITCH_TRANSITION_RULE
- AS6_NO_MULTIPLE_PRIMARY_FOCUS_RULE
- AS6_MASTER_SCREEN_3_COMPILER_GATE_RULE
- AS6_ONE_SECOND_RECOGNITION_REQUIRED_RULE

## Practical Use

Before any new visual state is implemented, the team or AI agent must create a compiler report.

If the report fails, the state must be redesigned before implementation.

## Result

AS6 Design Compiler turns design architecture into enforceable design governance.

It is the bridge between documentation and implementation.
