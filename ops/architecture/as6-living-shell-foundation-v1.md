# AS6 Living Shell Foundation v1

The visual composition is stable. The data inside it is dynamic.

## Stable shell

- reference geometry, logo area, top controls, identity area, graph, center, left rail, right rail and intent control;
- common route history and workspace selection;
- common accessibility, locale and data-state semantics.

## Dynamic snapshot

- current workspace and brand mode;
- current user identity and avatar;
- top-ranked verified priority;
- prepared context in the left rail;
- explanation, next step and expected change in the right rail;
- domain node notes and active business chain;
- intent seeded from the same priority.

The snapshot boundary prevents partial changes: a new priority replaces the center and both rails together.

## Persistence

- user: display_name, avatar_url, locale;
- workspace: name, company_logo_url, branding_mode;
- images: HTTPS URL or validated PNG/JPG/WebP data URL up to 1 MB;
- workspace branding changes require owner or admin role.

## Deployment

Frontend release is atomic at the document boundary: immutable hashed assets are copied first, then index.html is replaced with a single rename. The current single-backend topology still has a bounded restart window; true backend zero-downtime requires at least two API replicas and a health-aware upstream before it can be marked closed.

