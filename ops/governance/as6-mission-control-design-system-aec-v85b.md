# AS6 V85B AEC

Diagnostics must avoid output strings that collide with secret-scan key/value heuristics.
UI design system token checks must remain active without emitting secret-like text.
Build, production health, enforcement guard, secret scan and runtime staging guard must pass before commit and push.
