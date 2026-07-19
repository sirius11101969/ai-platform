# AS6 rclone encrypted-header compatibility AEC v1

- An encrypted rclone configuration must be identified by its first non-empty,
  non-comment data line.
- The accepted marker is exactly `RCLONE_ENCRYPT_V<version>:`.
- Comments before the marker are compatible and must not block offsite backup
  activation.
- A marker embedded later in a plaintext configuration must not be accepted.
- The crypt remote root must be created idempotently before its first listing.
- No diagnostic or control may print OAuth tokens, crypt passwords, salts, or
  the encrypted configuration payload.
