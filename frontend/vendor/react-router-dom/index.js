import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const RouterContext = createContext(null);
const OutletContext = createContext(null);

function normalizePath(path) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function toHref(to) {
  return typeof to === "string" ? to : to?.pathname || "/";
}

function readLocation() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  };
}

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const onPopState = () => setLocation(readLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to, options = {}) => {
    const href = toHref(to);
    if (options.replace) window.history.replaceState(null, "", href);
    else window.history.pushState(null, "", href);
    setLocation(readLocation());
  };

  const value = useMemo(() => ({ location, navigate }), [location]);
  return React.createElement(RouterContext.Provider, { value }, children);
}

export function useLocation() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("useLocation must be used within a BrowserRouter");
  return context.location;
}

export function useNavigate() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("useNavigate must be used within a BrowserRouter");
  return context.navigate;
}

export function Link({ to, replace = false, onClick, children, ...props }) {
  const navigate = useNavigate();
  const href = toHref(to);

  const handleClick = (event) => {
    if (onClick) onClick(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || props.target) return;
    event.preventDefault();
    navigate(href, { replace });
  };

  return React.createElement("a", { href, onClick: handleClick, ...props }, children);
}

export function NavLink({ to, className, children, end = false, ...props }) {
  const location = useLocation();
  const href = toHref(to);
  const active = end ? location.pathname === href : location.pathname.startsWith(href);
  const resolvedClassName = typeof className === "function" ? className({ isActive: active }) : [className, active ? "active" : ""].filter(Boolean).join(" ");
  const resolvedChildren = typeof children === "function" ? children({ isActive: active }) : children;
  return React.createElement(Link, { to: href, className: resolvedClassName, "aria-current": active ? "page" : undefined, ...props }, resolvedChildren);
}

export function Navigate({ to, replace = true }) {
  const navigate = useNavigate();
  useEffect(() => navigate(to, { replace }), [navigate, replace, to]);
  return null;
}

export function Outlet() {
  return useContext(OutletContext);
}

function flattenRoutes(children) {
  return React.Children.toArray(children).filter(Boolean);
}

function joinPath(base, child) {
  if (!child) return normalizePath(base);
  if (child.startsWith("/")) return child;
  return normalizePath(`${base.replace(/\/$/, "")}/${child}`);
}

function renderMatch(routes, pathname, base = "") {
  for (const route of routes) {
    if (!React.isValidElement(route)) continue;
    const { path = "", element, children } = route.props;
    const isTrailingSplat = path.endsWith("/*");
    const splatBase = isTrailingSplat
      ? joinPath(base || "/", path.slice(0, -2))
      : null;
    const fullPath = path === "*" ? "*" : joinPath(base || "/", path);
    const childRoutes = flattenRoutes(children);
    const trailingSplatMatch =
      isTrailingSplat &&
      (pathname === splatBase || pathname.startsWith(`${splatBase}/`));

    if (path === "*" || pathname === fullPath || trailingSplatMatch) {
      const outlet = childRoutes.length ? renderMatch(childRoutes, pathname, fullPath) : null;
      return React.createElement(OutletContext.Provider, { value: outlet }, element);
    }

    if (childRoutes.length && pathname.startsWith(`${fullPath.replace(/\/$/, "")}/`)) {
      const outlet = renderMatch(childRoutes, pathname, fullPath);
      if (outlet) return React.createElement(OutletContext.Provider, { value: outlet }, element);
    }
  }
  return null;
}

export function Routes({ children }) {
  const location = useLocation();
  return renderMatch(flattenRoutes(children), location.pathname) || null;
}

export function Route() {
  return null;
}
