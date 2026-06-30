# AS6 Cryptographic Signature Verification AEC P28

Failure classes:
- AS6_CRYPTOGRAPHIC_SIGNATURE_VERIFICATION_DRIFT
- AS6_TRUSTED_PUBLISHER_KEY_GAP
- AS6_PLUGIN_SIGNATURE_VERIFICATION_GAP
- AS6_TRUSTED_KEY_ROTATION_GAP

AEC rules:
- Trusted publishers must have active verification keys.
- Plugin signatures must be verifiable by Web Crypto where available.
- Key rotation must preserve audit visibility.
- Metadata trust must distinguish from cryptographic verification.
