# AS6 Shell Runtime Integration Root Cause P17

Root cause: P16 added Dynamic Shell Registry, but AS6 Shell still lacked runtime helpers to consume dynamic routes and navigation.

Risk: plugin routes can remain registered but not easily renderable by Shell/App runtime.

Repair: add Shell Runtime Integration helpers, navigation component and route outlet.
