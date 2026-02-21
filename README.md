# Trila Masterclass Platform

A full-stack Next.js application for managing, selling, and operating the Trila JaaS Masterclass series — including enrollment, payments, virtual session reminders, physical check-in, a waitlist system, and a comprehensive admin dashboard.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Environment Variables](#3-environment-variables)
4. [Database Models](#4-database-models)
5. [API Routes Reference](#5-api-routes-reference)
6. [Frontend Components](#6-frontend-components)
7. [Admin Dashboard](#7-admin-dashboard)
8. [Enrollment & Payment Flow](#8-enrollment--payment-flow)
9. [Waitlist System](#9-waitlist-system)
10. [Email Reminder System](#10-email-reminder-system)
11. [Cron Jobs](#11-cron-jobs)
12. [Check-In System](#12-check-in-system)
13. [Session Management](#13-session-management)
14. [First-Time Setup](#14-first-time-setup)
15. [File Structure](#15-file-structure)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App (App Router)                  │
├──────────────────────────┬──────────────────────────────────────┤
│  Public Frontend         │  Admin Dashboard                      │
│  ─────────────────       │  ─────────────────                    │
│  Landing page            │  /admin — password-protected          │
│  Pricing cards           │  Tabs: Check-In, Bookings, Revenue,   │
│  Reserve Access form     │        Waitlist, Notify, Schedules    │
│  Enrollment modal        │                                       │
│  Waitlist confirm page   │                                       │
├──────────────────────────┴──────────────────────────────────────┤
│                         API Routes                               │
│  /api/register          /api/payment/verify                      │
│  /api/sessions          /api/waitlist   /api/waitlist/confirm    │
│  /api/admin/*           /api/cron/*     /api/checkin             │
├─────────────────────────────────────────────────────────────────┤
│                         MongoDB (via Mongoose)                   │
│  Enrollment   Waitlist   SessionConfig                           │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
          Paystack        SendGrid        Vercel Cron
        (payments)        (email)    (reminders + waitlist)
```

**Key design principle:** Sessions are stored in MongoDB (`SessionConfig` collection) — not hardcoded in TypeScript. Admins can create, edit, and archive sessions from the dashboard without redeployment.

---

## 2. Tech Stack

| Layer               | Technology                          |
| ------------------- | ----------------------------------- |
| Framework           | Next.js 14+ (App Router)            |
| Language            | TypeScript                          |
| Database            | MongoDB via Mongoose                |
| Payments            | Paystack (NGN primary, USD display) |
| Email               | SendGrid                            |
| Scheduling          | Vercel Cron Jobs                    |
| Styling             | Tailwind CSS                        |
| Toast notifications | Sonner                              |
| Icons               | Lucide React                        |
| Deployment          | Vercel                              |

---

## 3. Environment Variables

Copy this into `.env.local` and populate all values before running locally or deploying.

```bash
# ── Database ───────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/trila

# ── Payments ───────────────────────────────────────────────────────
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx   # shown to client
PAYSTACK_SECRET_KEY=sk_live_xxxx               # server-side only, NEVER expose

# ── Email (SendGrid) ───────────────────────────────────────────────
SENDGRID_API_KEY=SG.xxxx
FROM_EMAIL=noreply@trila.pro                   # must be verified in SendGrid

# ── Admin ──────────────────────────────────────────────────────────
ADMIN_PASSWORD=your-strong-admin-password      # hashed server-side on each check

# ── Cron Jobs ──────────────────────────────────────────────────────
CRON_SECRET=your-random-cron-secret            # Bearer token protecting cron endpoints
INTERNAL_API_SECRET=your-internal-secret       # Used for cron→API internal calls

# ── App URLs ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://trila.pro          # Used in email links

# ── Virtual Sessions ───────────────────────────────────────────────
NEXT_PUBLIC_WEBINAR_LINK=https://zoom.us/j/xxx # Zoom join URL for virtual classes
ZOOM_MEETING_ID=123-456-789                    # Shown in reminder emails
ZOOM_PASSCODE=abc123                           # Shown in reminder emails

# ── Consulting ─────────────────────────────────────────────────────
NEXT_PUBLIC_CONSULTING_SCHEDULING_LINK=https://calendly.com/trila/consulting
```

> **Security note:** `PAYSTACK_SECRET_KEY` must never be in a `NEXT_PUBLIC_` variable or any client-side code. It is only used in `app/api/payment/verify/route.ts`.

---

## 4. Database Models

### `Enrollment`

The core record created when a user completes payment. One record per enrollee.

| Field                     | Type                        | Description                                           |
| ------------------------- | --------------------------- | ----------------------------------------------------- |
| `name`                    | String                      | Full name                                             |
| `email`                   | String                      | Unique, lowercase                                     |
| `phone`                   | String                      | International format                                  |
| `city`                    | String                      | Optional                                              |
| `enrollmentReference`     | String                      | Unique ID, e.g. `ENR-1234567890-ABCD`                 |
| `paymentStatus`           | `pending\|success`          | Set to `success` by Paystack webhook/verify           |
| `bookingStatus`           | `pending\|confirmed`        | Confirmed once payment verified                       |
| `paymentReference`        | String                      | Paystack transaction reference                        |
| `productType`             | String                      | One of 3 product types                                |
| `accessTier`              | `virtual\|full\|consulting` | Derived from product                                  |
| `amountPaid`              | Number                      | In NGN kobo                                           |
| `selectedSession`         | Object                      | `{ sessionId, dates[], time, venue, city, isTwoDay }` |
| `checkedInDay1`           | Boolean                     | Signature Live Day 1 check-in                         |
| `checkedInDay1At`         | Date                        | Timestamp                                             |
| `checkedInDay2`           | Boolean                     | Signature Live Day 2 check-in                         |
| `checkedInDay2At`         | Date                        | Timestamp                                             |
| `reminder24hSentAt`       | Date                        | Prevents duplicate 24h reminder emails                |
| `reminder1hSentAt`        | Date                        | Prevents duplicate 1h reminder emails                 |
| `cancelledAt`             | Date                        | Set by admin to free a spot and trigger waitlist      |
| `createdAt` / `updatedAt` | Date                        | Auto-managed                                          |

---

### `Waitlist`

Queue of users waiting for a spot to open in a full session.

| Field                            | Type                                             | Description                              |
| -------------------------------- | ------------------------------------------------ | ---------------------------------------- |
| `name`, `email`, `phone`, `city` | String                                           | User contact info                        |
| `productType`                    | String                                           | Which product they want                  |
| `sessionId`                      | String                                           | References `SessionConfig.sessionId`     |
| `position`                       | Number                                           | 1-based queue position                   |
| `status`                         | `waiting\|notified\|converted\|expired\|removed` | Lifecycle                                |
| `notifiedAt`                     | Date                                             | When the spot-available email was sent   |
| `confirmationExpiresAt`          | Date                                             | `notifiedAt + 24h` — deadline to confirm |
| `convertedEnrollmentReference`   | String                                           | Set when they pay and enroll             |
| `confirmationToken`              | String                                           | 32-byte hex token, used in email URL     |

**Status lifecycle:**

```
waiting → [spot opens] → notified → [user pays] → converted
                                   → [24h passes] → expired → [next person notified]
waiting → [user requests removal] → removed
```

---

### `SessionConfig`

All masterclass sessions stored in MongoDB, editable from the admin dashboard.

| Field         | Type     | Description                                       |
| ------------- | -------- | ------------------------------------------------- |
| `sessionId`   | String   | Unique, immutable slug, e.g. `sig-lagos-mar-2026` |
| `productType` | String   | One of the 3 product types                        |
| `label`       | String   | Display name, e.g. `Lagos · Mar 14–15, 2026`      |
| `dates`       | String[] | ISO date strings (`YYYY-MM-DD`)                   |
| `time`        | String   | 24h format, e.g. `09:00`                          |
| `displayTime` | String   | Human-readable, e.g. `9:00 AM WAT`                |
| `city`        | String   | Location name                                     |
| `venue`       | String   | Optional physical venue                           |
| `isTwoDay`    | Boolean  | Enables Day 1/Day 2 check-in logic                |
| `capacity`    | Number   | Max confirmed enrollments before waitlist         |
| `isActive`    | Boolean  | `false` = archived, hidden from enrollment modal  |
| `sortOrder`   | Number   | Controls dropdown order                           |

> **Important:** `sessionId` is embedded in `Enrollment.selectedSession.sessionId`, `Waitlist.sessionId`, and QR codes. It cannot be changed after creation.

---

## 5. API Routes Reference

### Public Routes (no auth required)

| Method | Path                              | Description                                                                                                                                                        |
| ------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST` | `/api/register`                   | Creates a pending enrollment record. Returns `enrollmentReference`.                                                                                                |
| `GET`  | `/api/sessions`                   | Returns all active sessions grouped by product type, enriched with live capacity data (`confirmedCount`, `spotsRemaining`, `isFull`, `waitlistCount`). Cached 60s. |
| `POST` | `/api/waitlist`                   | Adds a user to the waitlist for a full session. Validates capacity, prevents duplicates, sends confirmation email.                                                 |
| `GET`  | `/api/waitlist?email=&sessionId=` | Returns waitlist position for an email + session combination.                                                                                                      |
| `POST` | `/api/waitlist/confirm`           | Validates a waitlist confirmation token. Returns user's pre-filled details if valid. Used by `/waitlist/confirm` page.                                             |
| `POST` | `/api/payment/verify`             | Verifies a Paystack transaction and confirms the enrollment.                                                                                                       |
| `GET`  | `/api/checkin`                    | QR scan endpoint — marks an attendee as checked in.                                                                                                                |

---

### Admin Routes (`Authorization: Bearer <ADMIN_PASSWORD>`)

| Method   | Path                              | Description                                                                                                  |
| -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `GET`    | `/api/admin/stats`                | Session stats for a specific sessionId (used by check-in dashboard).                                         |
| `GET`    | `/api/admin/attendees`            | All confirmed attendees for a session + day.                                                                 |
| `GET`    | `/api/admin/checked-in`           | Attendees checked in for a session + day.                                                                    |
| `GET`    | `/api/admin/not-checked-in`       | Attendees not yet checked in.                                                                                |
| `GET`    | `/api/admin/enrollments`          | Paginated enrollment list with filters: status, tier, productType, city, sessionId, search, sortBy, sortDir. |
| `GET`    | `/api/admin/export`               | CSV export (max 5,000 rows) with the same filters as enrollments.                                            |
| `POST`   | `/api/admin/notify`               | Sends a branded email blast to filtered enrollees (max 2,000, batched 100).                                  |
| `GET`    | `/api/admin/capacity`             | Capacity status for every session (live enrollment counts).                                                  |
| `GET`    | `/api/admin/revenue`              | Revenue analytics for last N days: summary, by tier, by product, time series, geographic.                    |
| `GET`    | `/api/admin/waitlist`             | Waitlist entries for a session, filterable by status.                                                        |
| `GET`    | `/api/admin/sessions`             | All sessions (active + archived) with live enrollment counts.                                                |
| `POST`   | `/api/admin/sessions`             | Create a new session. Auto-generates `sessionId` and `displayTime`.                                          |
| `GET`    | `/api/admin/sessions/[sessionId]` | Single session detail.                                                                                       |
| `PUT`    | `/api/admin/sessions/[sessionId]` | Update a session. Capacity floor guard prevents reducing below confirmed count.                              |
| `DELETE` | `/api/admin/sessions/[sessionId]` | Soft archive (default) or hard delete (`?hard=true`, only if 0 enrollments).                                 |
| `POST`   | `/api/admin/sessions/seed`        | One-time migration: imports static `SESSION_CONFIG` into MongoDB.                                            |

---

### Cron Routes (`Authorization: Bearer <CRON_SECRET>`)

| Method | Path                         | Schedule     | Description                                                                 |
| ------ | ---------------------------- | ------------ | --------------------------------------------------------------------------- |
| `GET`  | `/api/cron/send-reminders`   | Every 30 min | Sends 24h and 1h reminder emails to virtual session attendees. Idempotent.  |
| `GET`  | `/api/cron/process-waitlist` | Every 15 min | Expires stale notifications and promotes the next person in each queue.     |
| `POST` | `/api/cron/process-waitlist` | On demand    | Internal call from admin cancel action to immediately notify next in queue. |

---

## 6. Frontend Components

### `components/enrollment-modal.tsx`

The main purchase flow modal. Opens from pricing cards and the reserve-access form.

**Features:**

- Fetches sessions live from `/api/sessions` on open (no static config)
- Capacity-aware session cards:
  - Available: selectable with spot count
  - Low inventory (≤5 spots): shows amber warning
  - Full: greyed out with "Join Waitlist" button
- Four internal views:
  - `form` — normal enrollment + Paystack payment
  - `waitlist-form` — shown after clicking "Join Waitlist"
  - `waitlist-success` — queue position confirmation
  - Success screen (after payment confirmed)
- Accepts `waitlistToken` prop for the confirm page flow
- Accepts `initialSessionId` to pre-select a session

**Props:**

```ts
interface EnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  initialProduct?: ProductType // Locks product selector
  initialFormData?: { name; email; phone; city }
  initialEnrollmentReference?: string // Skips /api/register if set
  waitlistToken?: string // From /waitlist/confirm page
  initialSessionId?: string // Pre-selects a session
}
```

---

### `components/pricing.tsx`

Pricing cards (Virtual, Signature, Consulting). Each "CTA" button opens the enrollment modal with the corresponding product pre-selected.

---

### `components/reserve-access.tsx`

The "Reserve Your Spot" section at the bottom of the landing page. Contains a form that:

1. Validates name/email/phone client-side
2. Calls `/api/register` to create a pending enrollment
3. Opens the enrollment modal with the returned `enrollmentReference` pre-set (skipping re-registration)

---

### `app/waitlist/confirm/page.tsx`

The page users land on when clicking "Confirm My Spot" in the waitlist email.

**Behaviour:**

- Reads `?token=` from URL
- Calls `POST /api/waitlist/confirm` on mount
- Handles four states:
  - **Loading** — spinner while validating
  - **Valid** — shows countdown timer + opens enrollment modal automatically
  - **Already converted** — polite message, they already paid
  - **Expired** — explains 24h window passed, offers to rejoin
  - **Error** — invalid token, contact support
- Opens `EnrollmentModal` pre-filled with their name/email/phone/sessionId
- Passes `waitlistToken` to the modal so `payment/verify` can mark the waitlist entry as `converted`

---

## 7. Admin Dashboard

Access at `/admin` — protected by `ADMIN_PASSWORD`. Tabs:

### Check-In

- Select a Signature Live session from a live DB-loaded dropdown
- Day 1 / Day 2 toggle with date labels
- Stats cards: total registered, checked in, pending
- QR code display for scanning at venue
- Attendance table with All / Checked-In / Not Checked-In filters
- Auto-refreshes on session/day change

### Bookings

- Full enrollment list across all sessions
- Filters: status, tier, session, search (name/email/phone/reference)
- Sort: by date, amount, name
- CSV export button (applies same filters, no row limit up to 5,000)
- Status badges: confirmed (green), pending (yellow), cancelled (red)

### Revenue

- Lookback period selector: 30/60/90/180/365 days
- Summary cards: total revenue, confirmed count, average order value, conversion rate
- Bar charts: bookings over time, revenue over time
- Revenue breakdown by tier and by product
- Geographic distribution ranked by attendee count

### Waitlist

- Session dropdown selector
- Status filter: all / waiting / notified / converted / expired / removed
- Table with position, name/email, notification time, expiry window

### Notify

- Compose subject + message body (`{name}` personalisation supported)
- Audience filter: status, tier, session, or paste specific enrollment references
- Sender name override
- Sends via SendGrid in batches of 100, max 2,000 recipients

### Schedules

- View all sessions grouped by product type with live enrollment counts and capacity bars
- **Create** new session — smart date fields (Virtual: 4 dates, Signature: 2 dates, Consulting: 1)
- **Edit** — all fields except `sessionId` (immutable)
- **Archive** — soft-hides session from enrollment modal; preserves all enrollment data
- **Restore** — makes archived session active again
- **Seed from config** button (shown when DB is empty) — imports static `session-config.ts` into MongoDB
- Sort order controls dropdown ordering

---

## 8. Enrollment & Payment Flow

```
1. User fills reserve-access form or clicks pricing CTA
        ↓
2. POST /api/register → creates Enrollment { status: pending }
   Returns enrollmentReference
        ↓
3. Enrollment modal opens with pre-filled data
   User selects session (fetched from /api/sessions with capacity)
        ↓
4. User clicks "Proceed to Payment"
   Paystack popup opens (client-side SDK)
        ↓
5. User completes payment in Paystack iframe
   Paystack calls modal callback with { reference }
        ↓
6. POST /api/payment/verify
   - Verifies transaction with Paystack API (server-side)
   - Updates Enrollment: paymentStatus=success, bookingStatus=confirmed
   - Saves session details to enrollment record
   - If waitlistToken present: marks Waitlist entry as converted
   - Sends confirmation email (SendGrid)
        ↓
7. Modal shows success screen with:
   - Enrollment reference (copy button)
   - Session details
   - Webinar link (virtual) / scheduling link (consulting) / check-in instructions (live)
```

---

## 9. Waitlist System

### Joining the Waitlist

```
1. User opens enrollment modal → session card shows "FULL"
2. User clicks "Join Waitlist"
3. Modal switches to waitlist-form view (same modal, form data preserved)
4. User confirms details → POST /api/waitlist
5. API validates:
   - Session genuinely at capacity
   - Email not already enrolled in this session
   - Email not already on waitlist for this session
6. Creates Waitlist entry with position = last_position + 1
7. Sends "You're on the Waitlist" email with queue position
8. Modal shows waitlist-success screen with their position
```

### When a Spot Opens

```
Admin cancels enrollment:
   → Sets Enrollment.cancelledAt = now
   → Calls POST /api/cron/process-waitlist { sessionId }

OR Cron runs every 15 min:
   → Finds all 'notified' entries where confirmationExpiresAt < now
   → Marks them 'expired'
   → For each session with expired entries:
      → Finds next 'waiting' entry (lowest position)
      → Sets status = 'notified', confirmationExpiresAt = now + 24h
      → Sends "A Spot Just Opened" email with confirmation URL
```

### Confirming a Spot

```
User clicks link in email → /waitlist/confirm?token=XXX

1. Page calls POST /api/waitlist/confirm with token
2. Validates token: must be status='notified' and not expired
3. Returns pre-filled user data + expiresAt timestamp
4. Page opens EnrollmentModal with:
   - Pre-filled name/email/phone
   - Session pre-selected (initialSessionId)
   - Countdown timer to expiresAt
5. User pays normally → POST /api/payment/verify
   - payment/verify receives waitlistToken
   - Marks Waitlist entry as 'converted'
```

---

## 10. Email Reminder System

Automated session reminders for virtual (Zoom) attendees only.

**Trigger:** Vercel Cron calls `GET /api/cron/send-reminders` every 30 minutes.

**Logic (per confirmed virtual enrollment):**

1. Find the next upcoming date in `selectedSession.dates[]` (skips past dates)
2. Calculate `minutesUntil = (sessionStart - now) / 60_000`
3. If `minutesUntil` is within 24h ± 35 min window **and** `reminder24hSentAt` is not set → send 24h email
4. If `minutesUntil` is within 1h ± 35 min window **and** `reminder1hSentAt` is not set → send 1h email
5. Stamp the sent timestamp to prevent duplicates (idempotent)

**Emails include:** session label, date, time, webinar link, Zoom meeting ID + passcode, enrollment reference.

---

## 11. Cron Jobs

Configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/process-waitlist",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Security:** Both endpoints require `Authorization: Bearer <CRON_SECRET>`. Vercel automatically sends this when triggering cron endpoints.

**Testing locally:** Call the endpoints manually with the header:

```bash
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/send-reminders
```

---

## 12. Check-In System

Used at Signature Live Masterclass venues. Attendees are scanned at the door.

**QR Code:** Each session + day combination generates a unique QR code displayed on the admin dashboard. The QR encodes a URL: `/checkin?sessionId=sig-lagos-mar-2026&day=1`.

**Check-in flow:**

1. Attendee's QR code or reference is scanned
2. `GET /api/checkin?sessionId=&day=&reference=` (or email)
3. Finds the enrollment, verifies it's confirmed
4. Sets `checkedInDay1 = true` (or Day 2) + timestamp
5. Returns `{ success: true, name, accessGranted: true }`

**Admin view:** Check-In tab shows real-time stats and an attendance table per session/day.

---

## 13. Session Management

### First Time: Seeding from Static Config

After deploying, the database starts empty. Run the seed endpoint once:

```bash
curl -X POST https://your-domain.com/api/admin/sessions/seed \
  -H "Authorization: Bearer your-admin-password"
```

This imports all sessions from `lib/session-config.ts` into MongoDB. Subsequent calls are safe — existing sessions are skipped.

### Creating a Session via Dashboard

1. Go to `/admin` → Schedules tab
2. Click "New Session"
3. Select product type (determines how many date fields appear)
4. Fill in label, dates, time, city, venue, capacity
5. `sessionId` is auto-generated from product + city + first date
6. `displayTime` is auto-generated from `time` + `city` timezone rules

### Capacity Guard

When editing, capacity cannot be reduced below the current confirmed enrollment count. The API returns a `422` with the exact current count if attempted.

### Archiving vs Deleting

- **Archive** (default): `isActive = false`. Session disappears from enrollment modal but all historical data is preserved. Can be restored.
- **Hard delete** (`?hard=true`): Permanently removes. Blocked if any confirmed enrollments exist.

---

## 14. First-Time Setup

```bash
# 1. Clone and install
git clone <repo>
cd trila-masterclass
npm install

# 2. Copy env vars
cp .env.example .env.local
# Fill in all values

# 3. Run locally
npm run dev

# 4. Seed sessions into DB (one time, after first deploy)
curl -X POST http://localhost:3000/api/admin/sessions/seed \
  -H "Authorization: Bearer your-admin-password"

# 5. Verify sessions loaded
curl http://localhost:3000/api/sessions | jq .
```

**MongoDB Atlas:**

- Create a free M0 cluster
- Add your IP (or `0.0.0.0/0` for Vercel)
- Create a database user
- Copy the connection string into `MONGODB_URI`

**Paystack:**

- Create account at paystack.com
- Get Public key → `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- Get Secret key → `PAYSTACK_SECRET_KEY` (never expose publicly)
- Add your domain to allowed callback URLs in Paystack dashboard

**SendGrid:**

- Create account at sendgrid.com
- Create an API key with "Mail Send" permission
- Verify your sender domain/email

**Vercel Cron:**

- Deploy to Vercel
- Cron jobs start automatically based on `vercel.json`
- Set `CRON_SECRET` in Vercel environment variables

---

## 15. File Structure

```
├── app/
│   ├── admin/
│   │   └── page.tsx                    # Admin login + dashboard entry
│   ├── checkin/
│   │   └── page.tsx                    # QR scan check-in page
│   ├── waitlist/
│   │   └── confirm/
│   │       └── page.tsx                # Waitlist spot confirmation page
│   └── api/
│       ├── register/route.ts           # Create pending enrollment
│       ├── sessions/route.ts           # Public: active sessions + capacity
│       ├── payment/
│       │   └── verify/route.ts         # Verify Paystack payment
│       ├── waitlist/
│       │   ├── route.ts                # Join / query waitlist
│       │   └── confirm/route.ts        # Validate confirmation token
│       ├── checkin/route.ts            # Venue check-in
│       ├── admin/
│       │   ├── sessions/
│       │   │   ├── route.ts            # List all / Create
│       │   │   ├── [sessionId]/route.ts # Get / Update / Archive
│       │   │   └── seed/route.ts       # One-time migration
│       │   ├── enrollments/route.ts    # Paginated enrollment list
│       │   ├── export/route.ts         # CSV export
│       │   ├── notify/route.ts         # Email blast
│       │   ├── capacity/route.ts       # Live capacity per session
│       │   ├── revenue/route.ts        # Revenue analytics
│       │   ├── waitlist/route.ts       # Admin waitlist view
│       │   ├── attendees/route.ts      # Check-in attendee list
│       │   ├── stats/route.ts          # Check-in session stats
│       │   ├── checked-in/route.ts
│       │   └── not-checked-in/route.ts
│       └── cron/
│           ├── send-reminders/route.ts # 24h + 1h Zoom reminders
│           └── process-waitlist/route.ts # Expire + promote waitlist
│
├── components/
│   ├── enrollment-modal.tsx            # Full purchase + waitlist flow
│   ├── pricing.tsx                     # Pricing cards
│   ├── reserve-access.tsx              # Landing page reserve form
│   └── admin/
│       ├── admin-dashboard.tsx         # Main dashboard (6 tabs)
│       ├── schedules-panel.tsx         # Session management UI
│       ├── bookings-panel.tsx          # Enrollment list + CSV
│       ├── revenue-panel.tsx           # Revenue analytics UI
│       ├── waitlist-panel.tsx          # Waitlist monitor
│       ├── notify-panel.tsx            # Email blast composer
│       ├── stats-card.tsx              # Check-in stats cards
│       ├── qr-code-display.tsx         # QR code generator
│       └── attendance-table.tsx        # Attendee table
│
├── models/
│   ├── Enrollment.ts                   # Core enrollment model
│   ├── Waitlist.ts                     # Waitlist queue model
│   └── SessionConfig.ts               # Dynamic session configuration
│
├── lib/
│   ├── mongodb.ts                      # Mongoose connection singleton
│   ├── session-config.ts              # Static fallback + pure utils (formatSessionDates)
│   ├── sessions-db.ts                 # Server-side DB session helpers
│   ├── email.ts                        # Base email templates + core senders
│   ├── email-additions.ts             # Waitlist + reminder email templates
│   ├── validations.ts                 # Zod schemas + shared types
│   ├── pricing.ts                     # Server-side price map
│   ├── adminAuth.ts                   # Admin auth middleware
│   └── admin/
│       └── auth.ts                    # Client-side admin API helpers + types
│
├── hooks/
│   └── useAdminAuth.ts                # Admin auth hook
│
├── vercel.json                        # Cron job configuration
└── README.md
```

---

## Notes

**Email integration:** The templates in `lib/email-additions.ts` must be merged into `lib/email.ts` before deploying. Copy all `export async function` exports from `email-additions.ts` to the bottom of `email.ts`.

**`session-config.ts` after migration:** Once sessions are seeded into MongoDB and the seed endpoint has been run, the static `SESSION_CONFIG` in `session-config.ts` is only used by the seed endpoint and for `formatSessionDates` / `CONSULTING_SCHEDULING_LINK` utilities. The enrollment modal and all API routes read from DB. You can eventually remove the static session data from that file, keeping only the utility functions.

**Timezone handling:** Session times are stored as 24h strings (e.g. `09:00`) and city names. The cron reminder system uses city-based timezone offsets to calculate the correct UTC session start time for reminder windows. Supported offsets: Dubai (GMT+4), London (GMT+0), Singapore (GMT+8), default WAT (GMT+1).

**Capacity is a soft limit:** The `/api/sessions` response is cached for 60 seconds. A session could theoretically accept one extra enrollment if two users hit payment simultaneously at exactly full capacity. The `payment/verify` route should add a final capacity check if this is a concern for high-demand sessions.
