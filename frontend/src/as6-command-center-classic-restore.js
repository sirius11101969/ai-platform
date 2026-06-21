import "./styles/as6-command-center-classic-restore.css";

function as6ClassicCommandCenter() {
  if (!window.location.pathname.includes("command-center")) return;
  document.body.classList.add("as6-command-center-classic");
  const nodes = Array.from(document.querySelectorAll("body *"));
  for (const node of nodes) {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const topBar = rect.top < 80 && text.includes("AS6 Mission Control") && text.includes("Production") && text.includes("Autonomy");
    const cockpit = rect.left > window.innerWidth * 0.60 && (text.includes("AUTONOMOUS COCKPIT") || text.includes("Mission Context") || text.includes("LIVE STREAM"));
    if (topBar || cockpit) node.setAttribute("data-as6-classic-hidden", "true");
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("load", as6ClassicCommandCenter);
  setTimeout(as6ClassicCommandCenter, 100);
  setTimeout(as6ClassicCommandCenter, 700);
  setTimeout(as6ClassicCommandCenter, 1600);
  new MutationObserver(as6ClassicCommandCenter).observe(document.documentElement, { childList: true, subtree: true });
}
