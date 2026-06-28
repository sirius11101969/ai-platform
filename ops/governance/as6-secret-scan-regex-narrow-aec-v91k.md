# AS6 Secret Scan Regex Narrow AEC V91K

Failure classes:
- AS6_SECRET_SCAN_BROAD_REGEX_FALSE_POSITIVE
- AS6_SECRET_SCAN_DOCUMENTATION_TERM_BLOCK
- AS6_SECRET_SCAN_VALUE_PATTERN_GAP

AEC rules:
- Secret scan must block real added secret values.
- Secret scan must not block documentation terms such as secret scan, secret detection, or root cause.
- Secret scan must focus on assignment/value-like patterns and known token formats.
