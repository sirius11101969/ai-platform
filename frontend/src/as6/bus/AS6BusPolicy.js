import { validateAS6UniversalServiceBusPolicy } from "./AS6UniversalServiceBus";

export const AS6_BUS_POLICY_VERSION = "P6";

export function validateAS6BusPolicy() {
  const validation = validateAS6UniversalServiceBusPolicy();

  return {
    ok: validation.ok,
    failures: validation.failures,
    version: AS6_BUS_POLICY_VERSION,
  };
}
