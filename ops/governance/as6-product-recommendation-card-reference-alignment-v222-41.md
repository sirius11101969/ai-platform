# AS6 V222_41 Governance — Product Recommendation Card Reference Alignment

- Failure class: PRODUCT_RECOMMENDATION_INLINE_MICRO_LAYOUT_DRIFT
- Repair class: DIAGNOSTIC_RUNTIME_BACKUP_SCOPE_FALSE_POSITIVE
- Root cause: product_recommendation_card_was_constrained_by_inline_micro_width_and_padding
- AEC rule: diagnostics for UI source must exclude runtime backup artifacts unless explicitly validating runtime evidence.
- Prevention: card regression checks scan frontend source only and block 280px/210px micro layout constraints.
- Readiness: 99%.
