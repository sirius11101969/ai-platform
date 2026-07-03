export function resolveCrmContactsWorkspaceState(snapshot) {
  if (!snapshot) return "loading";
  if (snapshot.diagnostic?.status !== "PASS") return "error";
  return "ready";
}
