# AS6 Frontend Docker Lockfile Cache Failure Classes v213d

- `CI_USED_STALE_PACKAGE_LOCK`: CI executed `npm ci` against a package lock that does not contain the frontend dependencies required by the current package manifest.
- `DOCKER_BUILD_CACHE_STALE_PACKAGE_JSON`: Docker build cache reused stale package metadata or install layers instead of rebuilding from the current frontend package manifest and lockfile.
- `PR_HEAD_NOT_UPDATED`: the pull request head commit is behind the local branch commit that contains the lockfile or guardian fix.
- `FRONTEND_LOCKFILE_SYNC_NOT_VERIFIED_IN_CI`: CI did not verify that `frontend/package.json` and `frontend/package-lock.json` both declare the required frontend dependencies before Docker build.
