# Standard Operating Procedure (SOP)
## Little Angel Electronics — Inventory, Billing & Cash/Card Management App

**Company:** LITTLE ANGEL ELECTRONICS GENERAL TRADING - L.L.C - O.P.C, Abu Dhabi, UAE
**Document owner:** Business Owner (Admin)
**Applies to:** All staff who use the app (Owner and Workers)

> This SOP describes how to operate the software correctly and consistently. Read the section for your role, then the module you use. Business rules that affect money (cashback, cash discount, gift cards, card due dates) are collected in **Section 8 — Business Rules**.

---

## 1. What the app is

A single-page web application that runs in a browser (desktop or mobile). It manages:

- **Products** (catalogue) and **Inventory** (live stock from purchases − sales)
- **Purchases** (stock bought from suppliers) with split payment (cash / credit card / gift card)
- **Sales & Billing** (customer invoices, with VAT options)
- **Payments** (collecting/paying outstanding balances)
- **Cash Book / Wallets** (each person's cash-in-hand)
- **Credit Cards** (limits, cashback, statement/due dates) and **Card Preference** (which card to use)
- **Gift Cards** (store gift cards bought like a product and used to pay)
- **Reports** (Daily Summary, Card Statement, Profit & Reports)
- **Approvals** (workers' edit/delete requests) and **Settings**

**Data storage:** the entire database is kept as **one JSON record in Supabase** (cloud) and cached in the browser. All connected devices sync live. See **Section 9 — Data, Sync & Backup**.

---

## 2. Roles & access

| Role | Sees | Can do |
|---|---|---|
| **Owner (Admin)** | Everything | Create, edit and delete anything **immediately**; manage users, cards, settings, reports; approve/reject worker requests |
| **Worker** | Only permitted screens (default: **Store, Purchases, Sales, Cash Book, Gift Cards**) | Create new records freely; **edits and deletes require Owner approval** |

- The Owner grants each worker their screens in **Settings → Users**.
- Owner-only screens include **Credit Cards, Card Preference, Reports, Approvals, Profit, Settings**.

---

## 3. Logging in

1. Open the app URL in the browser.
2. Enter your **Phone number or Username** and your **PIN/Password**.
3. Tap **Sign in**.

- The session is remembered on that device until you **Logout** (top-right).
- Keep your PIN private. The Owner can reset a worker's PIN in **Settings → Users**.

---

## 4. Recommended daily workflow

1. **Confirm you are online** (no red "Offline" bar at the bottom). Changes cannot be saved while offline.
2. **Purchases** — record any stock bought (with how it was paid).
3. **Sales & Billing** — raise invoices for what you sell; record amount received.
4. **Cash Book** — log any expenses, transfers, or opening balances (cash from sales/purchases is automatic — do **not** re-enter it).
5. **Payments** — collect outstanding customer balances / pay outstanding supplier balances.
6. **Owner, end of day** — review **Daily Summary**, clear **Approvals**, and check **Credit Cards** for anything due soon.

---

## 5. Module procedures

### 5.1 Products
- **Add:** Products → **＋** → enter Name (required, unique), Category, Colour, optional photo URL → Save.
- Products are matched **by name** in Purchases and Sales, so name them consistently.

### 5.2 Purchases (stock in)
1. Purchases → **📦 New Product Purchase**.
2. Set **Date** and **Supplier**.
3. Add one or more **product lines** (product, qty, cost/rate).
4. Under **Payment**, add one or more split lines — each is **Cash**, **Credit Card**, **Gift Card**, points, or bank:
   - **Credit Card:** pick the card; the line shows available balance and the cashback it will earn. A card can exceed its limit only if it is set to "allow over-limit".
   - **Gift Card:** pick an **active** gift card; it shows the card number (last 4) and **balance**. The amount **cannot exceed the balance**.
   - **Cash:** you may enter a **cash discount %** — see Section 8.4.
5. The totals box shows Paid vs Balance. Save.
- Unpaid balance = supplier credit, collected later in **Payments**.

### 5.3 Gift Card purchase (buying a store gift card)
- Purchases → **🎁 New Gift Card Purchase**, or Gift Cards → **＋ Purchase Gift Card**.
- Enter Store, Name, **Card Number (last 4 is required)**, **Amount Loaded**, and pay for it with the **same split payment** (cash and/or credit card — paying by card still earns that card's cashback).
- A hint under "Amount Loaded" shows the funds available (cash wallet + best card).
- See Section 8.5 for gift-card rules.

### 5.4 Inventory
- Live stock per product = total bought − total sold. Low-stock items are flagged (threshold in Settings).

### 5.5 Store
- A quick catalogue/cart view of in-stock products to add to a sale.

### 5.6 Sales & Billing (stock out)
1. Sales → **＋ New Sale Bill**.
2. Customer (or "Walk-in"), phone/address (optional).
3. Add product lines (product, qty, sell rate). Stock is checked — you cannot oversell.
4. Choose **VAT mode** (none / added / included) and **Payment Method** (Cash, Card, Bank, Cheque).
   - **Cash** offers an optional **cash discount %** — see Section 8.4.
5. Enter **Amount Received** (less than total = credit sale). Choose who collected the cash. Save (or **Save & Print Bill**).

### 5.7 Payments
- Lists purchases/sales with an outstanding balance. Record part-payments here; each is added to that record's payment history.

### 5.8 Cash Book / Wallets
- Each person has a **cash wallet**. Sales add cash; purchases and cash card top-ups reduce it — **automatically**.
- Use the buttons only for **opening balance, expenses, cash in/out, transfers, and card recharge/pay from cash**.
- Do **not** re-enter sale/purchase cash here.

### 5.9 Credit Cards *(Owner)*
- Add/edit cards with: limit, **Cashback %** and **Maximum Cashback / Month**, and the **due-date basis** (Section 8.2).
- Per card you can record **Payment**, **Recharge**, **Cashback**, or a **Manual charge**, and (Owner) **Edit balance** (logged as an "EDITED" ledger entry).
- Cards over their limit trigger an immediate "pay now" alert.

### 5.10 Card Preference *(Owner)*
- Recommends the **best card to use next**, ranked by the cashback it earns **and** whether it has enough available balance and monthly cap left.
- Enter a planned purchase amount to see what each card would earn; a card with a high rate but no balance/cap is correctly demoted.
- Shows **pending cashback** per card and when it will be credited (statement date). See Section 8.1.

### 5.11 Gift Cards
- Lists gift cards with balance (Active / Inactive). Actions: **Use/Spend**, **Edit balance** (Owner), **Details** (full history). See Section 8.5.

### 5.12 Price Compare
- Log competitor prices per product for reference.

### 5.13 Reports *(Owner)*
- **Daily Summary** — the day's sales, purchases, cash and profit; Excel export.
- **Card Statement** — per-card and combined ledger; Excel export.
- **Profit & Reports** — revenue, cost, profit by product and by day.

### 5.14 Approvals *(Owner)*
- Workers' **edit/delete requests** appear here. **Approve** applies the change (and re-syncs cash/card ledgers); **Reject** discards it. Decided requests remain listed with their status. See Section 7.

### 5.15 Settings *(Owner)*
- Company profile & invoice branding, VAT %, low-stock level, **Users & permissions**, theme, and data export.

---

## 6. Money confirmation & safety

- Every action that changes data shows a **text confirmation message** (toast) — e.g. "Purchase saved", "Sale saved", "Card saved", "Gift card purchased". There is no celebratory animation; the text message is the confirmation.
- Deletes and worker edits ask for confirmation first.

---

## 7. Audit & history — the Activity Log

Every **edit** and **delete** is now recorded in the **Activity Log** (Owner-only, under **Management**), including the Owner's own changes.

| Change | Recorded? | Where / detail |
|---|---|---|
| **Any edit or delete** (Owner or Worker) | **Yes** | **Activity Log** — when, who, action (edit/delete), record type, reference, and a short summary (e.g. old→new total). |
| **Approved worker** edit/delete | **Yes** | Logged against the **requester**, tagged “approved by \<Owner\>”. Also kept in the **Approvals** list. |
| **Card / Gift-card balance correction** | **Yes** | In the Activity Log **and** as an **“EDITED”** entry in that card's ledger. |
| **Who created** a record | **Yes** | Stored on the purchase/sale/ledger entry. |

**Notes:**
- The Activity Log is **permanent / append-only** — there is no clear button, by design.
- It records the **change and a summary**, not a full field-by-field before/after snapshot; for exact prior figures, keep periodic backups (Section 9).
- Filter by Edits / Deletes, search by user or reference, and **export to Excel**.
- **Creates** (new purchases, sales, gift cards, etc.) are not in this log — new records are visible in their own screens and reports.

---

## 8. Business rules (important)

### 8.1 Cashback is NOT instant
Credit-card cashback (e.g. on Carrefour purchases) is **not credited at the till**. It is **calculated and credited during the statement cycle**. In the app it is shown as **pending** for the current cycle, with the date it will be credited (the card's statement/due date). See **Card Preference** and the card's detail screen.

### 8.2 Card due date — two bases
When adding/editing a card, choose **Payment due date basis**:
- **Fixed payment day** — due on the same day each month.
- **From statement date** — due date = **Statement Day + "Due days after statement"** (UAE style). For example, statement day 5 + 25 days ⇒ due on the 30th. The edit screen previews the exact next due date.

### 8.3 Cashback cap
Each card can have a **Maximum Cashback / Month**. Cashback stops accruing once the cap is reached; Card Preference accounts for the remaining cap when ranking.

### 8.4 Cash discount %
On a **cash** payment (purchases and sales) you may enter a **discount %**:
- The **bill/invoice is settled in full**, but **only the discounted cash actually moves** in the Cash Book.
- Example: AED 1,000 at 6% ⇒ **AED 940** leaves/enters the wallet; AED 60 is the saving/discount.

### 8.5 Gift cards are single-use
- A gift card is **bought like a product** — its face value is its opening balance.
- **Card number (at least last 4) is required.**
- Used as a **payment method** on purchases; each use **deducts from the balance** and is kept in the card's history. **Cannot exceed the balance.**
- **No top-up.** Once the balance reaches **zero**, the card **auto-retires to Inactive** and disappears from payment lists.
- Gift cards are **not** offered as a sales payment method.

### 8.6 VAT
Sales support **Without VAT**, **VAT added (exclusive)**, or **VAT included (inclusive)**, using the VAT % in Settings.

---

## 9. Data, sync & backup

- **Storage model:** the whole database is **one JSON row** in Supabase (`app_state.data`), cached locally in each browser.
- **Live sync:** all connected devices update in real time. Per-person **cash wallets** are tracked separately.
- **Online required to save:** if the red **"Offline"** bar shows, you can view data but **cannot save changes** until you reconnect. Do not rely on unsaved work while offline.
- **Backup:** use **Settings → Export** and the report **Excel** exports regularly. There is no automatic local backup of the JSON row beyond the cloud copy.
- **Bulk data load:** use the provided **`little-angel-data-template.xlsx`** to prepare data. Because Supabase holds one JSON row (not per-entity tables), the workbook is loaded through the app (an in-app importer) or converted to JSON — it cannot be imported straight into Supabase tables.

---

## 10. Troubleshooting

| Symptom | Do this |
|---|---|
| "Offline — changes disabled" bar | Reconnect to the internet; if it says "reload to enable editing", reload the page. |
| Can't save / button seems to do nothing | Check the offline bar; confirm required (*) fields are filled. |
| Card payment blocked | The card is over its limit and not set to allow over-limit — reduce the amount or change the card setting. |
| Gift card not in the payment list | Its balance is zero (auto-inactive) or it is set Inactive. |
| Worker can't edit/delete | By design — the request goes to the Owner in **Approvals**. |
| Excel export says "engine not loaded" | Connect to the internet once so the Excel engine caches, then retry. |

---

## 11. Change log for this SOP
- v1.0 — Initial SOP covering products, purchases (split payment), sales, cash book, credit cards (cashback + statement due dates), Card Preference, gift cards (single-use), cash discount, approvals, audit limitations, data/sync and troubleshooting.
