# AS6 V222_42 Governance — Targeted Product Recommendation Inline Guard

- Failure class: OVERBROAD_INLINE_STYLE_GUARD_FALSE_POSITIVE
- Root cause: previous_guard_blocked_legitimate_progress_chart_inline_styles
- AEC rule: inline-style diagnostics must be scoped to the governed component being repaired.
- Prevention: product recommendation guard checks only ProductRecommendationCard and its slot block.
- Readiness: 99%.
