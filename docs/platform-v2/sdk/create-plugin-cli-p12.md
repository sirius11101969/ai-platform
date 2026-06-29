# AS6 Platform V2 — Create Plugin CLI P12

## Purpose

P12 adds a developer CLI for generating AS6 plugins.

## Command

ops/bin/as6-create-plugin my-plugin "My Plugin"

## Generated structure

frontend/src/as6/plugins/generated/my-plugin/
- manifest.js
- README.md

## Generated extension points

- Widget
- AI Action
- Universal Service Bus handler

## Validation

ops/bin/as6-diagnose-generated-plugin my-plugin

## Rule

Generated plugins must use defineAS6Plugin from the Public Extension SDK.
