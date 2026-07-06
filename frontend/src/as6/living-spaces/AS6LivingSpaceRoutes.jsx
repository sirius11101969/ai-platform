import { lazy } from "react";
import { Route } from "react-router-dom";
import { as6LivingSpaces } from "./as6LivingSpaceRegistry";

import { RequireAuth } from "../auth/AS6RouteAuth";
const AS6OneShellAdapter = lazy(() => import("../../as6-one/AS6OneShellAdapter"));
const AS6CrmShellAdapter = lazy(() => import("../../as6-crm/AS6CrmShellAdapter"));
const AS6SalesShellAdapter = lazy(() => import("../../as6-sales/AS6SalesShellAdapter"));

const livingSpaceAdapterById = {
  "as6-one": AS6OneShellAdapter,
  "as6-crm": AS6CrmShellAdapter,
  "as6-sales": AS6SalesShellAdapter,
};

function renderLivingSpaceElement(space, Adapter) {
  const element = <Adapter />;

  if (space.authRequired) {
    return <RequireAuth>{element}</RequireAuth>;
  }

  return element;
}

export function AS6LivingSpaceRoutes() {
  return (
    <>
      {as6LivingSpaces.map((space) => {
        const Adapter = livingSpaceAdapterById[space.id];

        if (!Adapter) {
          return null;
        }

        return (
          <Route
            key={space.id}
            path={space.route}
            element={renderLivingSpaceElement(space, Adapter)}
          />
        );
      })}
    </>
  );
}
