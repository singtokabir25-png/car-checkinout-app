# Car Check-in / Check-out App

Next.js (App Router, TypeScript) + Tailwind + Supabase.

## 1. Project structure

```
car-checkinout-app/
├─ supabase/
│  └─ schema.sql                 # transactions table, storage buckets, RLS policies
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                # landing: choose Check-In / Check-Out
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  ├─ actions.ts               # server actions: createTransaction, getTransaction
│  │  ├─ check/[type]/page.tsx    # the form (type = check_in | check_out)
│  │  └─ summary/[id]/page.tsx    # shareable summary view
│  ├─ components/
│  │  ├─ RoleSelector.tsx         # Employee / Customer / Depositor step
│  │  ├─ CheckForm.tsx            # main react-hook-form + zod form
│  │  ├─ EquipmentChecklist.tsx   # multi-select condition checklist
│  │  ├─ ImageUpload.tsx          # inspection photo capture/preview
│  │  ├─ SignaturePad.tsx         # react-signature-canvas wrapper
│  │  └─ SummaryCard.tsx          # exportable + LINE-shareable card
│  ├─ lib/
│  │  ├─ supabase/client.ts       # browser client
│  │  ├─ supabase/server.ts       # server client + service-role client
│  │  ├─ validations/transaction.ts # zod schema, role-aware refinements
│  │  └─ utils/cn.ts
│  └─ types/database.ts           # DB row types
├─ package.json
├─ tailwind.config.ts
├─ tsconfig.json
├─ next.config.js
└─ .env.local.example
```

## 2. Setup

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project values
```

Run `supabase/schema.sql` in the Supabase SQL editor (or `supabase db push`
if you use the CLI with a linked project). It creates:

- `user_role`, `transaction_type`, `transaction_status` enums
- `public.transactions` table
- RLS policies (authenticated users can read/write; anyone can read a row
  once `status = 'completed'`, which is what makes the `/summary/:id` link
  shareable without login)
- two public Storage buckets: `inspection-images`, `signatures`

Add `NEXT_PUBLIC_SITE_URL` in production (e.g. `https://yourapp.com`) so the
LINE share link points at the right domain.

```bash
npm run dev
```

## 3. Role logic

`RoleSelector` sets `userRole` to `employee | customer | Depositor`. The zod
schema (`transactionFormSchema`) uses `superRefine` to adjust validation
per role:

- **customer / Depositor** → phone number required (so the record is
  traceable to a non-employee).
- **Depositor** → also requires a "company / person visiting" field.
- **employee** → no phone required; instead `created_by` is populated from
  the authenticated Supabase user in the server action, tying the record to
  staff identity instead of a manually entered contact.

This metadata is stored per-row (`user_role`, `contact_phone`, `company`,
`created_by`), so reporting/filtering by role is a simple query.

## 4. Digital signature

`SignaturePad` wraps `react-signature-canvas`. On `onEnd` it exports a
trimmed PNG as a base64 data URL, which react-hook-form stores under
`signatureDataUrl`. On submit, the form converts it (and every uploaded
photo) into a `dataUrl` and sends them to the `createTransaction` server
action, which decodes them into buffers and uploads to the `signatures`
Storage bucket — this keeps the service-role/service upload logic off the
client entirely.

## 5. Summary view (screenshot-and-share to LINE)

`/summary/[id]` is a server component that fetches the completed
transaction (public read via RLS once `status = 'completed'`) and renders
`<SummaryCard />` — a mobile-sized card with the inspection photo, key
details, checklist, and signature, laid out to look clean at phone
screenshot resolution.

No export/share code is needed: staff open the page on their phone right
after submitting and take a native screenshot to send in LINE themselves.
This keeps the page dependency-free (no `html-to-image`, no Web Share API
branching) and avoids the reliability quirks of in-app share sheets.

If you later want an actual "Share" button (e.g. `html-to-image` → PNG →
`navigator.share`), the previous version of `SummaryCard.tsx` had that
wired up and can be reintroduced.

## 6. Extending this scaffold

- **Auth**: wire up Supabase Auth (e.g. magic link or Google OAuth) for
  employees; gate `/check/*` behind a session check in `middleware.ts`.
  Customers/Depositor can stay unauthenticated — RLS still allows inserts
  because the anon key is used, but you likely want a Supabase Edge
  Function or a dedicated "kiosk" service-role endpoint in production to
  avoid exposing broad insert rights to the anon key. `createServiceClient`
  in `lib/supabase/server.ts` is there for that.
- **Pairing check-in/check-out**: `related_transaction_id` on the table is
  ready for linking a check-out row back to its original check-in (e.g. a
  lookup-by-plate step before the check-out form).
- **PDF export**: swap `html-to-image` output into the existing `pdf`
  generation pipeline if you want a signed PDF instead of/alongside a PNG.
