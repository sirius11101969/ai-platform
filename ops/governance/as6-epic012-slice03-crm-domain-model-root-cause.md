# AS6 EPIC012 Slice 03 CRM Domain Model Root Cause

Root cause:
CRM Entity Runtime existed, but CRM needed a declarative domain model layer before domain modules such as Contacts, Companies, Deals and Tasks could be introduced.

Resolution:
Added CRM Domain Contract, Descriptor, Registry, Resolver, Aggregate Model, Relationship Contract, Relationship Model, Domain Manifest, Runtime, Diagnostics, Tracer and Health Snapshot.
