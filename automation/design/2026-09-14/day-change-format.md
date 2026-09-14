# Day change card — 0.2.2

The Day change card now displays signed compact currency plus the absolute percentage in parentheses, e.g. `-$5.4k (0.68%)`. Both value parts use `--acadia-status-danger-text` for a loss. The routine previous-market-close caption is removed; missing-valuation/previous-close/zero-baseline explanations remain available when needed. Other cards and calculations are unchanged.

All 250 automated checks pass with updated existing presentation expectations. Isolated CUA verification showed the exact requested negative example, both parts resolving to Acadia dark red `rgb(255, 69, 58)`, no routine caption, positive `+$5.4k (0.68%)` in normal text and zero `$0 (0%)`. Screenshots were inspected. Synthetic data only; no database changes.
