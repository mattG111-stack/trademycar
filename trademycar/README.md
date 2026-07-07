# TradeMyCar.co.nz

NZ car-buying service: marketing site + mobile-first 4-step "Get my offer" flow,
inquiry emails, and an admin funnel dashboard. Built from the design handoff
with Next.js (App Router), React and Tailwind CSS v4.

**Requires Node >= 22.5** (uses the built-in `node:sqlite` — no native deps).

## Run it

```bash
npm install
cp .env.example .env.local   # fill in what you have (all optional to start)
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## What's included

- `components/MarketingSite.tsx` — landing page (hero + NZ plate input, guarantee band, stats, how it works, why us, reviews, FAQ, final CTA, footer)
- `components/OfferFlow.tsx` — 4-step flow (confirm vehicle → contact → competing offer → photos) + done screen
- `app/admin/page.tsx` — **admin dashboard** (see below)
- `app/api/plate-lookup/route.ts` — plate → vehicle details (mocked until your API key arrives)
- `app/api/submit-offer/route.ts` — saves the lead, stores files, **emails the inquiry**, records the conversion
- `app/api/track/route.ts` + `lib/track.ts` — anonymous funnel analytics (first-party session cookie, no personal data on events)
- `lib/db.ts` — SQLite storage (`./data/trademycar.db`); leads + events
- `lib/email.ts` — SMTP inquiry emails via nodemailer
- `app/opengraph-image.tsx` — generated 1200×630 share image
- SEO + JSON-LD (`AutoDealer`, `FAQPage`) in `app/layout.tsx`

## Admin dashboard — `/admin`

Login screen at `/admin/login` — password = `ADMIN_PASSWORD` from your
environment variables. Sessions last a week; there's a Log out button in
the dashboard header. (Open without a password in development; disabled
in production until `ADMIN_PASSWORD` is set.)

Shows, for last 7 days / 30 days / all time:
- **Visitors** (unique sessions), **leads submitted**, **conversion rate**
- **Funnel with drop-off** at every stage: visited → entered plate → confirmed
  car → left contact details → passed trade-in step → submitted, with
  % of previous step and how many dropped
- Daily visitors + leads for the last 14 days
- The 25 most recent leads (time, plate, name, mobile)

## Inquiry emails

Every completed flow is emailed to `INQUIRY_EMAIL`. Set it plus `SMTP_HOST` /
`SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` in `.env.local` (any SMTP provider —
Gmail app password, SES, Mailgun, your host…). The email includes the plate,
vehicle, contact details, finance answer, competing offer, and attaches the
uploaded photos/offer document up to ~15 MB (larger sets stay on disk in
`data/uploads/<leadId>/`). **Leads are always saved to the database first**,
so nothing is lost if email is down or not yet configured.

## Plate lookup — CarJam (wired)

Set `PLATE_LOOKUP_API_KEY` to your CarJam Developer API key (Railway →
Variables) and real lookups are live — no code changes needed. It uses
CarJam's ABCD product (their lowest-cost lookup) and handles CarJam's
"still fetching, retry" responses automatically. To use CarJam's test
environment first, also set
`PLATE_LOOKUP_API_URL=https://test.carjam.co.nz/a/vehicle:abcd`
(test plates: https://test.carjam.co.nz/?testplates=1).

ABCD returns make / model / submodel / year. Odometer, fuel and drivetrain
are confirmed or edited by the seller in step 1 (and the odometer photo
captures current km). Unknown plates and CarJam outages drop the seller
into the editable vehicle form — never a dead end. Without a key, a
deterministic mock keeps the whole flow testable.

Mapping lives in `lib/carjam.ts` if CarJam ever changes field names.

## Deployment note

SQLite + on-disk uploads suit a VPS / Docker / any long-running host. On
serverless platforms (Vercel etc.) the filesystem is ephemeral — swap
`lib/db.ts` for Postgres/Turso and stream uploads to S3; the rest of the app
only talks to the functions those modules export.
