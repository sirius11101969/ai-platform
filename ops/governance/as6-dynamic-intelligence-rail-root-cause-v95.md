# AS6 Dynamic Intelligence Rail Root Cause V95

Root cause: V94 added active Living Space Context Bar, but AS6Shell still lacks a shell-level Intelligence Rail driven by active Living Space metadata.

Risk: AI/assistant panels can become page-specific duplicated logic instead of shell-level intelligence.

Repair: add AS6DynamicIntelligenceRail powered by getAS6ActiveLivingSpace(pathname) and render it in AS6Shell.
