# AS6 V118B Root Cause

V118 restore stopped at staging because git add referenced a file that had already been removed.
Root cause: explicit pathspec for a missing temporary command-center patch file caused fatal staging error.
Repair: finish the reference restore with safe git add -A, restore CommandCenterPage.jsx from reference commit 155975f, remove all V115-V117 patch artifacts, build, deploy, validate, commit and push.
