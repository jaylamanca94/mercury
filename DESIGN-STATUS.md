# Mercury — Design Status

**Last reviewed:** 2026-09-05

10 implemented canonical flows have design and automated coverage at varying depths; private export remains deferred. Home, Portfolio, Income Overview/Budget, Plan and Asset details use Acadia. This pass refines one existing flow; no screens or flows added.

Asset editing now has a sticky Acadia action bar with saved, dirty, saving, success and recoverable failure states. Return/yield labels use canonical Summary Measures. Desktop 1440px, tablet 768px and phones 390/320px were checked with disposable local data. No horizontal overflow; phone buttons are 44px high and clear the dock by 12px. Save failure, retry, Cancel and background draft preservation were checked. `npm run check`: 116 passed.

The only new adapter positions Acadia's action bar above Mercury's phone navigation using its existing clearance token. No new visual primitives, missing design states or calculations were introduced. Long forms remain the main complexity hotspot. These checks do not establish authenticated production writes, physical-keyboard viewport behaviour or full assistive-technology acceptance.

## Next design opportunities

1. **Protect drafts when leaving Asset details.** Confirmed: navigating Back discards unsaved changes. The new dirty state makes edits explicit; navigation protection remains separate work.
2. **Clarify expired-session recovery.** Hypothesis: an expired session during a long edit may leave an unclear route to signing in and resuming. Requires a real expiry-state review.
3. **Calibrate first-use history and manual valuation.** Review the existing honest empty/history-building states with the owner's early records before adding further content or controls.
