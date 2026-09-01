# Little Angel Electronics

Inventory, purchase, sales, billing & payments web app for **LITTLE ANGEL ELECTRONICS GENERAL TRADING - L.L.C - O.P.C**, Abu Dhabi, UAE.

A single self-contained `index.html` — no server, no build step, works offline. Open it in any browser, or host it (GitHub Pages / Vercel). Designed to later wrap into an Android **APK**.

## Features
- **Role-based login** — Owner (full access incl. profit) and Employee (operations only)
- **Products** — catalog with category icons (default) or your own photo (URL or upload)
- **Purchases** — varying rate per date, supplier, Cash / Card / Bank, credit tracking
- **Sales & Billing** — multi-item printable **UAE Tax Invoice** with VAT, TRN & logo
- **Payments** — money in / out, receivables, payables, and a full payment ledger
- **Inventory** — live stock with moving-average cost
- **Profit & Reports** — owner-only; profit excludes VAT (VAT is a pass-through liability)
- **Settings** — company profile, full control of the sales-bill layout, users, backup/restore

## Default logins
| Role | Username | Password |
|------|----------|----------|
| Owner | `owner` | `1234` |
| Employee | `staff` | `1234` |

Change these in **Settings → My Password / Users** after first login.

## Run
Just open `index.html` in a browser. Or serve locally:
```bash
python -m http.server 8000
```
then visit `http://localhost:8000`.

## Data & storage
Data is saved in the browser's **localStorage (per device)**. Use **Settings → Export/Import Backup** to move data between devices.

## Roadmap (planned stack)
- **GitHub** — source hosting (this repo)
- **Vercel** — static hosting for the web app
- **Supabase (free 500 MB)** — shared multi-device database + auth + storage

Product photos are stored as **URLs or small thumbnails** (auto-shrunk to ~512px) rather than large blobs, to stay well within the 500 MB free tier.

### Pending
- Module 2: **Credit-card maintenance** (to be specified)
- Optional cloud (Supabase) version for shared, real-time multi-device data
