# Property geography and Plan appreciation — 0.2.0

Request: derive a property appreciation assumption from its location and include that growth in Plan. Earlier DOB work remains in 0.1.1.

## Delivered behaviour

- Optional city, state and county/independent-city FIPS in the existing property editor. Legacy location text is retained for confirmation; no address inference or external geocoder request.
- Automatic ten-year annualised nominal appreciation from the FHFA county All-Transactions developmental HPI. Bundled public release: 2026-03-31, 2015–2025, 2,795 county identities / 2,661 complete endpoint pairs. Original endpoint indexes, source URL and workbook SHA-256 are retained in the generated data. Reproducible standard-library refresh script also updates the asset cache key.
- Explicit custom override, including zero and negative rates; clearing restores county history. Missing county/history remains unavailable, with no alternate-region fallback.
- Future property market value compounds independently, subtracts unchanged recorded debt and contributes to Plan net worth, value change and expected growth. The exact investment/equity breakdown reconciles the total. No property-funded spending, dividends, amortisation, future sale or rental income is invented.
- Missing appreciation holds current property value constant and displays an incomplete-growth notice. Missing property reads withhold combined totals and offer repair via Portfolio. Negative equity remains negative; unsafe projected magnitudes are withheld.
- Property writes are account-scoped, deadline-bounded and ignore results from replaced account contexts. Existing editor concurrency limitations remain separate from Plan's revision-aware saves.

## Verification

`npm run check`: 250 tests pass, including ten new domain/controller regressions. Coverage includes source identity and independent cities, exact ten-year calculation, missing/negative/zero history, override precedence/clear, 10/20-year compounding on gross value, debt and purchase-price independence, multiple-property reconciliation, investment depletion and unchanged dividends, overflow, save/reopen and replaced-account responses.

Official source downloaded directly: https://www.fhfa.gov/hpi/download/annual/hpi_at_county.xlsx, linked from https://www.fhfa.gov/data/hpi/datasets. Source workbook was inspected; county base-index endpoints are used consistently. Annual snapshot refresh is a reviewed publication step, not a real-time valuation service.

Isolated CUA browser: meaningful Plan content and no initial console errors; property editor entered via Portfolio; synthetic Roanoke City selection shows 6.81% from 2015–2025, distinct from Roanoke County. Confirmed save/reopen, explicit zero preview, keyboard clearing to restore automatic history, 10/20Y Plan changes and exact investment/equity totals. Native number-input clearing was verified with Select All/Backspace because the browser fill helper did not clear zero. Desktop, 768px tablet, 390/320px phone, and 320px with 200% text remain horizontally contained; native controls and Cancel remain usable. Shared Acadia files/CSS were not changed. Screenshots were inspected in the tool; no physical-device or VoiceOver claim.

Applied only forward migration `20260914230000_property_geography.sql` with its migration-ledger entry in one transaction; existing financial records were not backfilled. Separately authenticated disposable Supabase QA confirmed nullable legacy geography, city/state/FIPS read-back, null/zero/positive/negative rates, invalid-format rejection and unchanged value/debt. Cleanup was verified. Browser fixtures and real backend verification are separate evidence paths.

## Review focus

Refresh Mercury → Portfolio → property actions → Edit property. Confirm city, state and actual county/independent city. Review the dated historical assumption, optionally customise it, Save, then review 10Y/20Y Plan. Past regional appreciation is not a guarantee for an individual home. Mortgage debt remains constant until updated manually.
