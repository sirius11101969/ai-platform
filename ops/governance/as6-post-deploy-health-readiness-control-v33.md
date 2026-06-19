# AS6 Post Deploy Health Readiness Control V33
- Production health validation must use a readiness retry window after docker compose up.
- A single immediate 502 after restart is classified as startup race if backend becomes healthy inside readiness window.
- Closure is blocked if https health does not become OK after retries.
- Nginx upstream connection refused logs must be registered as post-deploy health evidence.
