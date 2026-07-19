# AS6 rclone encrypted-header compatibility v1

## Diagnosis

The production rclone configuration was successfully encrypted and contained
`RCLONE_ENCRYPT_V0:`, but the one-time offsite setup rejected it.

## Root cause

`as6-configure-google-drive-offsite-v1` required the encryption marker to be
the literal first line. Current rclone output may place a comment and blank
line before the marker, producing a false negative.

## Failure class

`AS6_RCLONE_ENCRYPTED_CONFIG_HEADER_POSITION_DRIFT`

## Repair

The canonical checker now evaluates the first non-empty, non-comment line and
requires an exact `RCLONE_ENCRYPT_V<version>:` marker. A marker later inside a
plain configuration remains rejected.

The setup also creates the crypt remote root before listing it. A newly
authorized Drive has no `AS6-Encrypted-Backups` directory yet, so validating
with `lsd` before `mkdir` produced a false setup failure.

## Result

`AS6_RCLONE_ENCRYPTED_HEADER_COMPAT=PASS`

`AS6_RCLONE_CRYPT_ROOT_BOOTSTRAP=PASS`
