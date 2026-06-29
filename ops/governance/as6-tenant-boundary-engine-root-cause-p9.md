# AS6 Tenant / Organization Boundary Engine Root Cause P9

Root cause: Platform V2 has Living Spaces, AI, Service Bus, Widgets and Workspaces, but no organization boundary layer to isolate workspace/widget/context ownership.

Risk: future SaaS use can allow cross-tenant access or ambiguous ownership of workspaces, widgets and AI context.

Repair: add Tenant Runtime, Organization Boundary, Tenant Policy and integrate boundary checks into Workspace Runtime and AI Context Engine.
