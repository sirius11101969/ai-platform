(function () {
  const sidebar = document.querySelector("aside.sidebar.command-sidebar");
  const logo = document.querySelector(".as6-sidebar-brand img, .as6-real-logo-image");
  const scroll = document.querySelector(".sidebar-scroll");
  const payload = {
    diagnostic: "AS6_SIDEBAR_ALIGNMENT_TRACE_V207",
    hasSidebar: Boolean(sidebar),
    sidebarClass: sidebar ? sidebar.className : null,
    sidebarBorderRight: sidebar ? getComputedStyle(sidebar).borderRight : null,
    sidebarAfterDisplay: sidebar ? getComputedStyle(sidebar, "::after").display : null,
    scrollAfterDisplay: scroll ? getComputedStyle(scroll, "::after").display : null,
    logoLeft: logo ? Math.round(logo.getBoundingClientRect().left) : null,
    logoWidth: logo ? Math.round(logo.getBoundingClientRect().width) : null,
    sidebarLeft: sidebar ? Math.round(sidebar.getBoundingClientRect().left) : null,
    sidebarWidth: sidebar ? Math.round(sidebar.getBoundingClientRect().width) : null
  };
  window.AS6_SIDEBAR_ALIGNMENT_TRACE_V207 = payload;
  console.table(payload);
})();
