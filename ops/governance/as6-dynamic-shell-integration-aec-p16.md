# AS6 Dynamic Shell Integration AEC P16

Failure classes:
- AS6_DYNAMIC_SHELL_INTEGRATION_DRIFT
- AS6_DYNAMIC_ROUTE_REGISTRY_GAP
- AS6_DYNAMIC_NAVIGATION_REGISTRY_GAP
- AS6_MARKETPLACE_SHELL_BOOTSTRAP_GAP
- AS6_SHELL_MANUAL_ROUTE_WIRING_RISK

AEC rules:
- Dynamic routes must register through Dynamic Shell Registry.
- Dynamic navigation must register through Dynamic Shell Registry.
- Marketplace route/navigation must bootstrap through dynamic shell integration.
- Shell/App must consume dynamic shell state in next stage.
