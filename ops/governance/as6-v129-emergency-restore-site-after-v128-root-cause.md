# AS6 V129 Emergency Root Cause

V128 broke site loading after injecting a public hard runtime script directly into frontend/index.html.
Root cause: direct global runtime DOM/CSS mutation affected the whole SPA loading/runtime path.
Emergency repair: remove V128 hard runtime script, remove script tag from index.html, rebuild frontend, redeploy nginx static dist, validate health, commit and push.
