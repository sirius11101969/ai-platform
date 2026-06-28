# AS6 Vite ManualChunks Cycle Fix Root Cause

- Build passes, but Vite/Rollup reports: Circular chunk: vendor -> vendor-react -> vendor.
- Root cause: manual chunk rules split React-related dependencies into a separate vendor-react chunk while other vendor code can still reference it through the generic vendor chunk.
- Effect: build is successful, but chunk graph is not clean and may be harder to cache/debug.
- Resolution: simplify manual chunking so React and vendor dependencies are not split into mutually dependent manual chunks.
- Interface changed: none.
- Pages changed: none.
