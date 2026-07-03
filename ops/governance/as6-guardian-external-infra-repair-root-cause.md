# AS6 Guardian External Infrastructure Failure Repair Root Cause

FAILURE_CLASS=AS6_GUARDIAN_EXTERNAL_INFRASTRUCTURE_FAILURE

Root cause:
Guardian treated a transient external Docker Registry failure as a project failure even after the frontend Docker build recovered in the same run.

Resolution:
Added Guardian failure classification and recovered registry failure handling.

Prevention:
Separate BUILD_RESULT from MERGE_DECISION and classify external infrastructure failures independently from project, security and governance failures.
