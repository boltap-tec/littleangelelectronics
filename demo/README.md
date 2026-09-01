# Demo data

`demo-data.json` — a ready-made sample dataset: **10 products, 10 purchases, 10 sales** (with colour variants, cash/card/bank payments, and 2 records left on credit). Uses the company profile for **LITTLE ANGEL ELECTRONICS GENERAL TRADING - L.L.C - O.P.C**.

## Figures (for quick reference)
- Total purchases: **AED 147,450**
- Total sales: **AED 56,117.25**
- Receivables (customers owe): **AED 6,962.50**  (INV-0003, INV-0009)
- Payables (owe suppliers): **AED 11,550**  (PUR-0004, PUR-0009)

## Use it now (in the web app / APK)
Two ways:
1. **Settings → Load Demo (10 + 10)** — regenerates this same data in one click, or
2. **Settings → Import Backup** — select this `demo-data.json` file.

Either replaces the current products/purchases/sales (your users & company profile are kept).

## Later: loading into Supabase
This file is the seed source for the future cloud version. The top-level keys map to tables:

| JSON key | Suggested Supabase table |
|----------|--------------------------|
| `products` | `products` |
| `purchases` | `purchases` (+ `payments[]` → `purchase_payments`) |
| `sales` | `sales` (+ `items[]` → `sale_items`, `payments[]` → `sale_payments`) |
| `users` | handled by Supabase Auth (roles: owner / employee) |
| `settings` | a single-row `settings` table |

When you're ready to connect Supabase, I can generate the matching `schema.sql` + `seed.sql` from this file. Keep money as `numeric`, dates as `date`, and product photos as **URLs** (not blobs) to stay within the free 500 MB tier.
