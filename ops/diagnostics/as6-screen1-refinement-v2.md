# AS6 Screen 1 Refinement v2

## Root cause

Later declarations in `AS6MasterScreenReference.css` overrode the accepted logo, avatar, intent and theme hierarchy. Workspace refreshes also had no request ordering guard, so an older response could replace a newly selected company.

## Corrective controls

- The final reference layer owns logo/avatar sizes, central metric alignment and the focus-only intent outline.
- Dark mode uses a neutral black baseline and neutral white/grey illumination only.
- Workspace selection is optimistic and stale read responses are ignored.
- Settings locale changes are visible immediately and are persisted by Save.
- Redundant `AS6 + AS6` co-branding is removed.
- Plan navigation uses the unambiguous `Тарифы и возможности` label.

## Validation

`ops/bin/as6-control-screen1-interaction-multi-workspace-v1` validates the source markers, model behavior and production build contract.
