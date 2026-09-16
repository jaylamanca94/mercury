# Portfolio asset subtitles — 16 September 2026

Replaced the investment-card subtitle’s name/instrument fallback with a pure exposure/type resolver. Exact issuer-verified symbols cover VFIAX/VOO (S&P 500), VSMAX/VB (Small-Cap), VTIAX/VXUS (International), VBTLX (Bonds) and VGT (Technology). Crypto and cash stay explicit. Other holdings use meaningful saved allocation categories, then known instrument types, then Unclassified. Issuer sources and precedence are documented in DESIGN-README.md.

All 260 automated checks passed. Browser verification used synthetic balances and holdings with legacy Other metadata, confirmed all eight fund labels plus BTC/ETH Crypto, verified saved holdings were unchanged, and checked desktop/400px phone rendering without overflow or browser errors. Screenshots and checks.json are attached here. No owner financial data or persistence writes were used.

This is local browser verification. Authenticated production UI and physical-device testing remain separate from public deployment-source verification.
