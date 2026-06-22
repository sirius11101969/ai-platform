(function () {
  const sidebar = document.querySelector(".command-sidebar");
  if (!sidebar) {
    console.warn("AS6_SIDEBAR_RUNTIME_TRACE_V202=NO_SIDEBAR");
    return;
  }
  const style = getComputedStyle(sidebar);
  const scroll = sidebar.querySelector(".sidebar-scroll");
  const payload = {
    diagnostic: "AS6_SIDEBAR_RUNTIME_TRACE_V202",
    width: style.width,
    minWidth: style.minWidth,
    maxWidth: style.maxWidth,
    height: style.height,
    borderRadius: style.borderRadius,
    padding: style.padding,
    overflow: style.overflow,
    scrollOverflowY: scroll ? getComputedStyle(scroll).overflowY : null,
    dataCommandSidebar: sidebar.getAttribute("data-command-sidebar"),
    className: sidebar.className
  };
  console.table(payload);
  window.AS6_SIDEBAR_RUNTIME_TRACE_V202 = payload;
})();
