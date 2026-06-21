# AS6 V122B AEC

Do not inject JSX into CommandCenterPage.jsx using sed.
Command Center must use the restored real page source and a side-effect route-aware guard imported from main.jsx.
External AS6 overlay roots must be hidden only while /command-center is active and restored on route change.
