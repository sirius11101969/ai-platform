import { AS6AppRuntimeIntegrationPanel } from "../AS6AppRuntimeIntegration";

export const AS6_REAL_APP_WIRING_VERSION = "P19";

export function getAS6RealAppWiringConfig() {
  return {
    version: AS6_REAL_APP_WIRING_VERSION,
    enabled: true,
    defaultRuntimePath: "/marketplace",
    integration: "AS6AppRuntimeIntegrationPanel",
  };
}

export function AS6RealAppWiring({ path = "/marketplace" }) {
  return (
    <section data-as6-real-app-wiring="enabled">
      <AS6AppRuntimeIntegrationPanel path={path} />
    </section>
  );
}
