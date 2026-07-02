# EPIC-005 PR-4 Repair Governance

- JSX generated from shell commands must not contain unescaped JavaScript template literals.
- Bash-generated JSX keys must use concatenation or a dedicated writer.
- Any key={} corruption is merge-blocking.
- AS6_JSX_TEMPLATE_LITERAL_BASH_SUBSTITUTION_GAP must be registered as a known failure class.
