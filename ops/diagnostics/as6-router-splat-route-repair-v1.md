
## v2 closure
- the router source patch was valid;
- the generated control used an over-escaped /app/* marker;
- the control was recreated with grep -F;
- validation, commit, push and production deployment were resumed.

Additional failure classes:
- AS6_ROUTER_CONTROL_OVERESCAPED_SPLAT_MARKER
- AS6_VALID_ROUTER_PATCH_BLOCKED_BY_CONTROL
- AS6_ROUTER_PATCH_NOT_DEPLOYED
