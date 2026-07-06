import { useMemo } from "react";
import {
  bootstrapAS6DynamicShellRegistry,
  getAS6DynamicRoutes,
  getAS6DynamicNavigation,
} from "../dynamic";

export const AS6_SHELL_RUNTIME_INTEGRATION_VERSION = "P17";

export function getAS6ShellRuntimeRoutes() {
  bootstrapAS6DynamicShellRegistry();
  return getAS6DynamicRoutes();
}

export function getAS6ShellRuntimeNavigation() {
  bootstrapAS6DynamicShellRegistry();
  return getAS6DynamicNavigation();
}

export function useAS6ShellRuntimeIntegration() {
  return useMemo(() => {
    bootstrapAS6DynamicShellRegistry();

    return {
      version: AS6_SHELL_RUNTIME_INTEGRATION_VERSION,
      routes: getAS6DynamicRoutes(),
      navigation: getAS6DynamicNavigation(),
    };
  }, []);
}

export function AS6ShellRuntimeNavigation({ items }) {
  const runtimeItems = items || getAS6ShellRuntimeNavigation();

  return (
    <nav className="as6-shell-runtime-navigation" data-as6-shell-runtime-navigation="enabled">
      {runtimeItems.map((item) => (
        <a key={item.id} href={item.path} data-as6-shell-runtime-nav-item={item.id}>
          {item.title}
        </a>
      ))}
    </nav>
  );
}

export function AS6ShellRuntimeRouteOutlet({ path }) {
  const routes = getAS6ShellRuntimeRoutes();
  const currentRoute = routes.find((route) => route.path === path);

  if (!currentRoute?.element) return null;

  const RouteComponent = currentRoute.element;
  return <RouteComponent />;
}
