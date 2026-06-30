import { useEffect, useState } from "react";
import {
  bootstrapAS6DynamicShellRegistry,
  getAS6DynamicNavigation,
  getAS6DynamicRoutes,
  getAS6DynamicShellState,
} from "./AS6DynamicShellRegistry";

export function useAS6DynamicShellIntegration() {
  const [state, setState] = useState(() => getAS6DynamicShellState());

  useEffect(() => {
    bootstrapAS6DynamicShellRegistry();
    setState(getAS6DynamicShellState());
  }, []);

  return state;
}

export function getAS6DynamicShellRouteMap() {
  bootstrapAS6DynamicShellRegistry();
  return getAS6DynamicRoutes();
}

export function getAS6DynamicShellNavigationItems() {
  bootstrapAS6DynamicShellRegistry();
  return getAS6DynamicNavigation();
}

export function AS6DynamicShellNavigationList({ items }) {
  const navItems = items || getAS6DynamicShellNavigationItems();

  return (
    <nav data-as6-dynamic-shell-navigation="enabled">
      {navItems.map((item) => (
        <a key={item.id} href={item.path}>
          {item.title}
        </a>
      ))}
    </nav>
  );
}
