# AS6 Light Brand Background v1 — diagnostic

## Root cause

The accepted pure-white screen was clean but visually disconnected from the AS6 identity. Reusing the complete logo as a watermark would compete with the living graph and reduce legibility.

## Structure

- The branded surface uses only cool ice-blue rings, circuit traces, contact pads and restrained glints.
- It is rendered on a dedicated pointer-transparent layer below the canvas.
- The central business graph, goal, identity and guidance remain foreground content.
- The preference is stored per workspace in the current browser.
- A clean pure-white fallback remains available from the light-theme utilities.
- The dark theme does not select or render the branded layer.

## Failure classes

- `AS6_LIGHT_BRAND_BACKGROUND_DARK_THEME_LEAK`
- `AS6_LIGHT_BRAND_BACKGROUND_CONTENT_OCCLUSION`
- `AS6_LIGHT_BRAND_BACKGROUND_WARM_CAST`
- `AS6_LIGHT_BACKGROUND_PREFERENCE_GLOBAL_LEAK`
- `AS6_LIGHT_BACKGROUND_CLEAN_FALLBACK_GAP`

## Automated proof

Run:

```bash
ops/bin/as6-control-light-brand-background-v1
```
