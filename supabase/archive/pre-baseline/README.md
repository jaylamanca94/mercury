# Historical SQL — do not replay

These seven files are exact originals from before the 2026-09-22 reconciliation. Their hashes are recorded in `manifest.json`; they remain available as provenance, outside the active migration scanner. Their SQL is incorporated verbatim into `../../migrations/20260903004833_remote_baseline.sql`. Duplicate eight-digit version prefixes made the old active history unreplayable. The hosted first ledger entry recorded Base Plan only; the other schema changes already existed without individual history entries. The consolidated bootstrap was checked against the hosted schema without altering its data or ledger.

Keep these files unchanged. New changes belong in new forward migrations.
