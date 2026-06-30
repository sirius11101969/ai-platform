# AS6 Cryptographic Signature Verification Root Cause P28

Root cause: P27 validated signature metadata, but did not cryptographically verify signatures using trusted publisher public keys.

Repair: add trusted key registry, key rotation and Web Crypto signature verification helper.
