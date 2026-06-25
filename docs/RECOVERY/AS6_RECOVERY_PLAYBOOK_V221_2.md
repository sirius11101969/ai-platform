# AS6 Recovery Playbook V221.2

To restore the state before V221.2:
1. git fetch --all --tags
2. git checkout AS6_RESTORE_V221_1_FOUNDATION_20260625T100200Z
3. run ops/bin/as6-engineering-guards
4. run npm run build if package.json contains a build script

To restore the state after V221.2:
1. git fetch --all --tags
2. git checkout AS6_RESTORE_V221_2_ENGINEERING_GUARDS_20260625T103246Z
3. run ops/bin/as6-engineering-guards
