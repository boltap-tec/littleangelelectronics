# Little Angel Electronics

Inventory, purchase, sales, billing & payments web app for **LITTLE ANGEL ELECTRONICS GENERAL TRADING - L.L.C - O.P.C**, Abu Dhabi, UAE.

A single self-contained `index.html` — no server, no build step, works offline. Open it in any browser, or host it (GitHub Pages / Vercel). Designed to later wrap into an Android **APK**.

## Features
- **Phone + PIN login, role-based** — Owner (full access incl. profit & user management) and Worker (only the screens the owner allows). The owner sets each user's phone, PIN, role & screen access in Settings.
- **Products** — catalog with category (pick existing or type new) and category icons or your own photo
- **Purchases** — **multiple products per entry**, varying rate per date, supplier autocomplete, and **split payment** (cash + one or more cards in any combination) with credit tracking
- **Sales & Billing** — multi-item printable **UAE Tax Invoice** with VAT, TRN & logo; customer autocomplete; average cost shown per line while selling
- **Payments** — money in / out, receivables, payables, and a full payment ledger
- **Credit Cards** — card master data (limit, commission discount % + monthly cap, payment day), auto-deducts each card's share on purchases, per-card ledger, and 🔔 payment-date reminders
- **Inventory** — live stock with moving-average cost, **grouped by category**
- **Dashboard** — quick-access tiles + per-product inventory, average cost & profit/loss (owner)
- **Profit & Reports** — owner-only; profit excludes VAT (VAT is a pass-through liability)
- **Settings** — company profile, full control of the sales-bill layout, users & roles, backup/restore

## Default login
| Role | Phone | PIN |
|------|-------|-----|
| Admin / Owner | `9626262427` | `1234` |

The admin adds owners & workers (with their phone, PIN, role & allowed screens) in **Settings → Users & Roles**. Change your PIN in **Settings → My PIN** after first login.

## Run
Just open `index.html` in a browser. Or serve locally:
```bash
python -m http.server 8000
```
then visit `http://localhost:8000`.

## Data & storage
By default data is saved in the browser's **localStorage (per device)**. Use **Settings → Export/Import Backup** to move data between devices.

### Optional cloud sync (Supabase)
Turn on shared, multi-device data with a free Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run [`SUPABASE_SETUP.sql`](SUPABASE_SETUP.sql).
3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
4. Paste both into `index.html` (`SUPABASE_URL` / `SUPABASE_ANON_KEY` near the top of the script).

The entire app state is stored as **one JSON row** in the `app_state` table. localStorage is kept as an offline cache, so the app still works with no connection and syncs on the next save. Leave the placeholders unchanged to keep running fully offline.

## Roadmap (planned stack)
- **GitHub** — source hosting (this repo)
- **Vercel** — static hosting for the web app
- **Supabase (free 500 MB)** — shared multi-device database (JSON-row sync, implemented)

Product photos are stored as **URLs or small thumbnails** (auto-shrunk to ~512px) rather than large blobs, to stay well within the 500 MB free tier.

### Pending
- Convert the web app to an Android **APK** (use web + APK together)
