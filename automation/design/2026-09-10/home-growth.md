# Home automatic annual growth

Home’s Expected annual growth previously read `totalExpectedAnnualGrowthCents`, which requires manually saved return assumptions. It now reads the existing `totalEstimatedAnnualGrowthCents`: per-holding current value × provider historical annualised return, rounded to cents and summed. Manual holding assumptions and Plan overrides remain separate. No domain arithmetic, provider, persistence or styling change.

Loading, missing history, missing valuation, empty portfolio and unavailable-account states explain what is missing without asking for manual return entry. Available values identify historical provenance and are explicitly not a forecast.

Validation: 174 checks passed. A two-holding synthetic browser fixture ($7,500 at 8% and $2,500 at 4%) displays $700, remains $700 with 50% manual assumptions, withholds pending/incomplete history and recovers automatically. Positive, zero and negative values are covered by controller tests using the actual portfolio aggregate. Browser containment checked at 1440/768/390px; desktop light and phone dark visually reviewed. No browser errors observed. Local isolated data only; authenticated production account data and provider availability were not retested.
