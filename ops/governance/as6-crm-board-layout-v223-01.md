# AS6 V223_01 Governance — CRM Board Layout

- Failure class: CRM_BOARD_HORIZONTAL_SCROLL_LEAK_AND_NARROW_COLUMNS
- Root cause: compact_pipeline_improved_height_but_columns_remained_too_narrow_and_page_horizontal_scroll_was_not_fully_contained
- AEC rule: CRM board horizontal scroll must be contained inside the board; page-level horizontal scroll is not allowed.
- AEC rule: CRM stage columns must be wide enough to avoid badge/source text breaking by default.
- Readiness: 99%.
