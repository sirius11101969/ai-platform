# AS6 V117 Change Plan

1. Add public final reference CSS file.
2. Link it in frontend/index.html.
3. Ensure built dist/index.html also loads it after generated CSS.
4. Remove visual drift: logo frame, sidebar excess border, bright quick-action strip, Copilot outline, bottom line, recommendation overflow.
5. Keep React structure unchanged.
6. Build, deploy to nginx, validate, secret scan, commit and push.
