import {
  AS6ShellRuntimeNavigation,
  AS6ShellRuntimeRouteOutlet,
  useAS6ShellRuntimeIntegration,
} from "../shell/runtime";
import "../shell/runtime/AS6ShellRuntimeIntegration.css";

export const AS6_APP_RUNTIME_INTEGRATION_VERSION = "P18";

export function useAS6AppRuntimeIntegration() {
  return useAS6ShellRuntimeIntegration();
}

export function AS6AppRuntimeNavigation() {
  const runtime = useAS6AppRuntimeIntegration();

  return <AS6ShellRuntimeNavigation items={runtime.navigation} />;
}

export function AS6AppRuntimeRouteOutlet({ path }) {
  return <AS6ShellRuntimeRouteOutlet path={path} />;
}

export function AS6AppRuntimeIntegrationPanel({ path = "/marketplace" }) {
  const runtime = useAS6AppRuntimeIntegration();

  return (
    <section data-as6-app-runtime-integration="enabled">
      <AS6AppRuntimeNavigation />
      <div data-as6-app-runtime-route-outlet="enabled">
        <AS6AppRuntimeRouteOutlet path={path} />
      </div>
      <small>
        Dynamic routes: {runtime.routes.length} / Navigation items: {runtime.navigation.length}
      </small>
    </section>
  );
}
