(function () {
  if (location.pathname !== "/command-center") return;

  document.documentElement.classList.add("as6-route-command-center");

  function apply() {
    const shell = document.querySelector(".app-shell");
    if (!shell) return false;
    shell.classList.add("command-shell");
    shell.setAttribute("data-route", "command-center");
    return true;
  }

  if (!apply()) {
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 5000);
  }
})();
