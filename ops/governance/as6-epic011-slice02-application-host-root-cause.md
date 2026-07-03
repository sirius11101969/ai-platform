# AS6 EPIC011 Slice 02 Root Cause

Root cause:
Application Foundation existed, but no declarative Application Host existed to resolve, load and activate registered applications.

Resolution:
Added Application Host Contract, Descriptor, Capability Contract, Registry, Resolver, Loader, Dependency Graph, Capability Graph, Runtime Manifest, Tracer and Health Snapshot without business logic or baseline mutation.
