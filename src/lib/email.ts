import sgMail from '@sendgrid/mail'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'noreply@Trila.co'
const FROM_NAME = process.env.FROM_NAME ?? 'Trila Masterclass'
const WEBINAR_LINK = process.env.WEBINAR_LINK ?? 'https://Trila.co/webinar'
const CONSULTING_LINK =
  process.env.CONSULTING_SCHEDULING_LINK ??
  'https://calendly.com/Trila/consulting'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
} else {
  console.warn('[email] SENDGRID_API_KEY is not set — emails will not be sent.')
}

async function sendEmail(msg: sgMail.MailDataRequired): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('[email] Skipping send — SENDGRID_API_KEY not configured.')
    return
  }
  await sgMail.send(msg)
}

// ─── HTML Helpers ─────────────────────────────────────────────────────────────

function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Trila Masterclass</title>
</head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0f1b2d;border-radius:12px;overflow:hidden;max-width:600px;width:100%;border:1px solid #1e3050;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f1b2d 0%,#1a2d4a 100%);padding:28px 32px;border-bottom:1px solid #1e3050;">
              <p style="margin:0;color:#4a9eff;font-size:13px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;">Trila Masterclass</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;color:#c8d8f0;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#080f1a;padding:20px 32px;border-top:1px solid #1e3050;text-align:center;">
              <p style="margin:0;color:#4a6080;font-size:12px;">© ${new Date().getFullYear()} Trila. All rights reserved.</p>
              <p style="margin:6px 0 0;color:#3a5070;font-size:11px;">Lagos · Dubai · London · Singapore</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function infoBox(content: string): string {
  return `<div style="background:#0b1828;border:1px solid #1e3050;border-radius:8px;padding:20px 24px;margin:20px 0;">${content}</div>`
}

function infoRow(label: string, value: string): string {
  return `<p style="margin:8px 0;font-size:14px;">
    <span style="color:#5a7a9a;min-width:150px;display:inline-block;">${label}</span>
    <span style="color:#c8d8f0;font-weight:600;">${value}</span>
  </p>`
}

function alertBox(
  content: string,
  borderColor = '#d4a422',
  bgColor = '#1a1500',
): string {
  return `<div style="background:${bgColor};border-left:4px solid ${borderColor};border-radius:8px;padding:20px 24px;margin:20px 0;">${content}</div>`
}

function primaryButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#2563eb;color:#ffffff;font-weight:bold;font-size:14px;padding:14px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">${label}</a>`
}

/** Formats an array of ISO dates into a readable string */
function formatDates(dates: string[], isTwoDay?: boolean): string {
  if (!dates || dates.length === 0) return 'TBD'
  if (!isTwoDay || dates.length === 1) {
    return new Date(dates[0]).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  const d1 = new Date(dates[0])
  const d2 = new Date(dates[1])
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  }
  return `${d1.toLocaleDateString('en-NG', opts)} & ${d2.toLocaleDateString('en-NG', opts)}, ${d1.getFullYear()}`
}

// ─── Email Params ─────────────────────────────────────────────────────────────

interface BaseEmailParams {
  name: string
  email: string
  enrollmentReference: string
  // Optional at registration time — product hasn't been selected yet
  productType?: string
}

interface SessionEmailParams extends BaseEmailParams {
  productType: string // Always required for session-level emails
  sessionDates: string[]
  sessionTime: string
  sessionVenue?: string
  sessionCity?: string
  isTwoDay?: boolean
}

// ─── 1. Registration Confirmation ─────────────────────────────────────────────

export async function sendRegistrationConfirmation(
  params: BaseEmailParams,
): Promise<void> {
  const { name, email, enrollmentReference } = params

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">Welcome, ${name}! 🎉</h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      Your registration has been received. Complete payment in the next step to secure your spot.
    </p>
    ${infoBox(`
      ${infoRow('Name', name)}
      ${infoRow('Email', email)}
      ${infoRow('Reference', `<code style="background:#0d1a2e;padding:3px 8px;border-radius:4px;font-family:monospace;color:#4a9eff;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(`
      <p style="margin:0 0 6px;color:#d4a422;font-weight:bold;font-size:14px;">Next Step</p>
      <p style="margin:0;color:#b08a1a;font-size:14px;line-height:1.6;">
        Return to the payment page to select your session and complete your enrollment.
        Your reference is required for check-in — save it now.
      </p>
    `)}
    <p style="color:#8aa8c8;line-height:1.7;margin-top:28px;font-size:14px;">Best regards,<br/>
    <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Registration Received – Reference: ${enrollmentReference}`,
    html,
  })
}

// ─── 2. Virtual Masterclass Confirmation ──────────────────────────────────────

export async function sendVirtualAccessConfirmation(
  params: SessionEmailParams,
): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    productType,
    sessionDates,
    sessionTime,
    isTwoDay,
  } = params
  const formattedDates = formatDates(sessionDates, isTwoDay)
  // For virtual, sessionDates is an array of all 4 session dates
  const sessionList =
    sessionDates.length > 1
      ? sessionDates
          .map(
            (d, i) =>
              `<li style="color:#8aa8c8;font-size:14px;margin:4px 0;">Session ${i + 1}: ${new Date(d).toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })}</li>`,
          )
          .join('')
      : ''

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">You're In, ${name}! ✅</h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      Your payment is confirmed and your virtual access to <strong style="color:#ffffff;">${productType}</strong> is ready.
      Your webinar link is below — join at the session time each week.
    </p>
    ${infoBox(`
      ${infoRow('Programme', productType)}
      ${infoRow('Format', '4 × 90-min Zoom Sessions')}
      ${infoRow('Session Time', sessionTime + ' WAT each week')}
      ${infoRow('Access', 'Virtual (Zoom)')}
      ${infoRow('Reference', `<code style="background:#0d1a2e;padding:3px 8px;border-radius:4px;font-family:monospace;color:#4a9eff;">${enrollmentReference}</code>`)}
    `)}
    ${
      sessionList
        ? `<div style="background:#0b1828;border:1px solid #1e3050;border-radius:8px;padding:16px 24px;margin:16px 0;">
      <p style="margin:0 0 10px;color:#5a7a9a;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;">Your Session Dates</p>
      <ul style="margin:0;padding-left:20px;">${sessionList}</ul>
    </div>`
        : ''
    }
    ${alertBox(
      `
      <p style="margin:0 0 10px;color:#28a745;font-weight:bold;font-size:14px;">🔗 Your Webinar Link</p>
      <a href="${WEBINAR_LINK}" style="color:#4a9eff;word-break:break-all;font-size:14px;">${WEBINAR_LINK}</a>
      <p style="margin:10px 0 0;color:#5a7a9a;font-size:13px;">This link becomes active at the start of each session. Do not share it.</p>
    `,
      '#28a745',
      '#0a1a0f',
    )}
    <p style="color:#8aa8c8;line-height:1.7;margin-top:28px;font-size:14px;">Best regards,<br/>
    <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Virtual Access Confirmed – ${productType}`,
    html,
  })
}

// ─── 3. Signature Live Masterclass Confirmation (2-day) ───────────────────────

export async function sendFullAccessConfirmation(
  params: SessionEmailParams,
): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    productType,
    sessionDates,
    sessionTime,
    sessionVenue,
    sessionCity,
    isTwoDay,
  } = params

  const formattedDates = formatDates(sessionDates, isTwoDay)
  const day1 = sessionDates[0]
    ? new Date(sessionDates[0]).toLocaleDateString('en-NG', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''
  const day2 = sessionDates[1]
    ? new Date(sessionDates[1]).toLocaleDateString('en-NG', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">Your Seat is Secured, ${name}! 🎟️</h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      Your payment is confirmed for the <strong style="color:#ffffff;">${productType}</strong>.
      See below for your session details and check-in instructions.
    </p>
    ${infoBox(`
      ${infoRow('Programme', productType)}
      ${infoRow('City', sessionCity ?? 'TBD')}
      ${infoRow('Venue', sessionVenue ?? 'TBD')}
      ${day1 ? infoRow('Day 1', day1) : ''}
      ${day2 ? infoRow('Day 2', day2) : ''}
      ${infoRow('Start Time', sessionTime + ' (both days)')}
      ${infoRow('Reference', `<code style="background:#0d1a2e;padding:3px 8px;border-radius:4px;font-family:monospace;color:#4a9eff;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(`
      <p style="margin:0 0 14px;color:#d4a422;font-weight:bold;font-size:15px;">📋 Your Enrollment Reference</p>
      <div style="background:#080f1a;border:1px solid #3a2800;border-radius:6px;padding:14px 18px;margin-bottom:14px;">
        <code style="color:#d4a422;font-size:20px;font-weight:bold;letter-spacing:0.08em;word-break:break-all;">${enrollmentReference}</code>
      </div>
      <p style="margin:0;color:#b08a1a;font-size:13px;font-weight:bold;">
        ⚠️ This reference is required for check-in on BOTH Day 1 and Day 2. Save it now.
      </p>
    `)}
    <div style="background:#0b1828;border:1px solid #1e3050;border-radius:8px;padding:20px 24px;margin:20px 0;">
      <p style="margin:0 0 16px;color:#4a9eff;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;">📍 How to Check In (Both Days)</p>
      <ol style="margin:0;padding-left:20px;color:#8aa8c8;font-size:14px;line-height:2;">
        <li>Arrive at least <strong style="color:#c8d8f0;">30 minutes</strong> before the session starts.</li>
        <li>Scan the QR code displayed at the venue entrance.</li>
        <li>Enter your registered email and your enrollment reference.</li>
        <li>You'll see <strong style="color:#28a745;">"Access Granted"</strong> — you're in.</li>
        <li><strong style="color:#d4a422;">Repeat this on Day 2</strong> with the same reference.</li>
      </ol>
    </div>
    <p style="color:#8aa8c8;line-height:1.7;margin-top:28px;font-size:14px;">Best regards,<br/>
    <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Live Attendance Confirmed – ${productType} · ${sessionCity}`,
    html,
  })
}

// ─── 4. Private JaaS Consulting Confirmation ──────────────────────────────────

export async function sendConsultingConfirmation(
  params: SessionEmailParams,
): Promise<void> {
  const { name, email, enrollmentReference, productType } = params

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">Consulting Slot Confirmed, ${name}! 🤝</h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      Your payment for <strong style="color:#ffffff;">${productType}</strong> is confirmed.
      Use the scheduling link below to book your preferred 1-on-1 session time with Femi Olawale.
    </p>
    ${infoBox(`
      ${infoRow('Service', productType)}
      ${infoRow('Format', '1-on-1 Private Zoom Session')}
      ${infoRow('Reference', `<code style="background:#0d1a2e;padding:3px 8px;border-radius:4px;font-family:monospace;color:#4a9eff;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(
      `
      <p style="margin:0 0 16px;color:#4a9eff;font-weight:bold;font-size:14px;">📅 Book Your Session Time</p>
      <p style="margin:0 0 16px;color:#8aa8c8;font-size:14px;line-height:1.6;">
        Click below to choose a date and time that works for you. 
        Slots are available Monday–Friday, 9am–5pm WAT.
      </p>
      ${primaryButton('Book Your Session →', CONSULTING_LINK)}
      <p style="margin:14px 0 0;color:#4a6080;font-size:12px;word-break:break-all;">${CONSULTING_LINK}</p>
    `,
      '#4a9eff',
      '#0a1220',
    )}
    <div style="background:#0b1828;border:1px solid #1e3050;border-radius:8px;padding:16px 24px;margin:20px 0;">
      <p style="margin:0 0 10px;color:#5a7a9a;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;">What's Included</p>
      <ul style="margin:0;padding-left:20px;color:#8aa8c8;font-size:14px;line-height:2;">
        <li>1-on-1 private Zoom session with Femi Olawale</li>
        <li>Custom JaaS project strategy review</li>
        <li>Funding & investor introduction guidance</li>
        <li>Follow-up email support for 30 days</li>
        <li>Trila University lifetime access</li>
      </ul>
    </div>
    <p style="color:#8aa8c8;line-height:1.7;margin-top:28px;font-size:14px;">Best regards,<br/>
    <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Private Consulting Confirmed – Book Your Session Now`,
    html,
  })
}

// ─── 5. Tier Change Emails (kept for admin-initiated changes) ─────────────────

export async function sendTierChangedToVirtualEmail(
  params: SessionEmailParams,
): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    productType,
    sessionDates,
    sessionTime,
    isTwoDay,
  } = params

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">Access Updated to Virtual, ${name}</h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      Your access has been changed to <strong style="color:#ffffff;">Virtual</strong>. You are no longer registered for live in-person check-in.
    </p>
    ${infoBox(`
      ${infoRow('Programme', productType)}
      ${infoRow('Session Dates', formatDates(sessionDates, isTwoDay))}
      ${infoRow('Updated Access', 'Virtual (Zoom)')}
      ${infoRow('Reference', `<code style="background:#0d1a2e;padding:3px 8px;border-radius:4px;font-family:monospace;color:#4a9eff;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(
      `
      <p style="margin:0 0 10px;color:#28a745;font-weight:bold;">🔗 Your Webinar Link</p>
      <a href="${WEBINAR_LINK}" style="color:#4a9eff;word-break:break-all;font-size:14px;">${WEBINAR_LINK}</a>
    `,
      '#28a745',
      '#0a1a0f',
    )}
    <p style="color:#8aa8c8;font-size:14px;margin-top:24px;">Best regards,<br/><strong style="color:#c8d8f0;">The Trila Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Access Updated to Virtual – Your Webinar Link`,
    html,
  })
}

/**
 * Additional email templates appended to email.ts.
 * These functions follow the exact same pattern as the existing ones —
 * same base(), infoBox(), alertBox(), primaryButton() helpers,
 * same sendEmail() wrapper, same FROM_EMAIL / FROM_NAME constants.
 *
 * HOW TO INTEGRATE:
 * Copy every export below into the bottom of your existing lib/email.ts file.
 * The imports (sgMail, base, infoBox, etc.) are already defined there.
 */

// ─── 6. Virtual Session 24h Reminder ──────────────────────────────────────────

export interface ReminderEmailParams {
  name: string
  email: string
  enrollmentReference: string
  sessionLabel: string // e.g. "Series A — March 2026"
  sessionDate: string // ISO date of the NEXT upcoming session
  sessionTime: string // displayTime, e.g. "6:00 PM WAT"
  sessionNumber: number // e.g. 2 (out of 4)
  totalSessions: number // always 4 for virtual
  webinarLink: string
  zoomMeetingId?: string
  zoomPasscode?: string
}

export async function sendVirtualSessionReminder24h(
  params: ReminderEmailParams,
): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    sessionLabel,
    sessionDate,
    sessionTime,
    sessionNumber,
    totalSessions,
    webinarLink,
    zoomMeetingId,
    zoomPasscode,
  } = params

  const dateFormatted = (() => {
    const [y, m, d] = sessionDate.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })()

  const zoomBlock =
    zoomMeetingId || zoomPasscode
      ? `
    <div style="background:#0b1828;border:1px solid #1e3050;border-radius:8px;padding:16px 24px;margin:16px 0;">
      <p style="margin:0 0 10px;color:#5a7a9a;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;">Zoom Details</p>
      ${zoomMeetingId ? `<p style="margin:6px 0;font-size:14px;color:#c8d8f0;"><span style="color:#5a7a9a;display:inline-block;min-width:120px;">Meeting ID</span><code style="background:#0d1a2e;padding:2px 8px;border-radius:4px;">${zoomMeetingId}</code></p>` : ''}
      ${zoomPasscode ? `<p style="margin:6px 0;font-size:14px;color:#c8d8f0;"><span style="color:#5a7a9a;display:inline-block;min-width:120px;">Passcode</span><code style="background:#0d1a2e;padding:2px 8px;border-radius:4px;">${zoomPasscode}</code></p>` : ''}
    </div>`
      : ''

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">Session Tomorrow, ${name}! ⏰</h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      This is your 24-hour reminder for <strong style="color:#ffffff;">Session ${sessionNumber} of ${totalSessions}</strong>
      from your <strong style="color:#ffffff;">${sessionLabel}</strong> masterclass.
    </p>
    ${infoBox(`
      ${infoRow('Programme', sessionLabel)}
      ${infoRow('Session', `${sessionNumber} of ${totalSessions}`)}
      ${infoRow('Date', dateFormatted)}
      ${infoRow('Time', sessionTime)}
      ${infoRow('Reference', `<code style="background:#0d1a2e;padding:3px 8px;border-radius:4px;font-family:monospace;color:#4a9eff;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(
      `
      <p style="margin:0 0 16px;color:#4a9eff;font-weight:bold;font-size:14px;">🔗 Your Zoom Join Link</p>
      <div style="margin-bottom:16px;">
        ${primaryButton('Join Session ' + sessionNumber + ' →', webinarLink)}
      </div>
      <p style="margin:0;color:#4a6080;font-size:12px;word-break:break-all;">${webinarLink}</p>
      <p style="margin:10px 0 0;color:#5a7a9a;font-size:12px;">Link becomes active 5 minutes before the session starts.</p>
    `,
      '#4a9eff',
      '#0a1220',
    )}
    ${zoomBlock}
    <p style="color:#8aa8c8;line-height:1.7;margin-top:24px;font-size:14px;">See you tomorrow!<br/>
    <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Session Tomorrow — ${sessionLabel} Session ${sessionNumber} at ${sessionTime}`,
    html,
  })
}

// ─── 7. Virtual Session 1h Reminder ───────────────────────────────────────────

export async function sendVirtualSessionReminder1h(
  params: ReminderEmailParams,
): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    sessionLabel,
    sessionDate,
    sessionTime,
    sessionNumber,
    totalSessions,
    webinarLink,
    zoomMeetingId,
    zoomPasscode,
  } = params

  const dateFormatted = (() => {
    const [y, m, d] = sessionDate.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-NG', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  })()

  const zoomBlock =
    zoomMeetingId || zoomPasscode
      ? `
    <div style="background:#0b1828;border:1px solid #1e3050;border-radius:8px;padding:16px 24px;margin:16px 0;">
      <p style="margin:0 0 10px;color:#5a7a9a;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;">Zoom Details</p>
      ${zoomMeetingId ? `<p style="margin:6px 0;font-size:14px;color:#c8d8f0;"><span style="color:#5a7a9a;display:inline-block;min-width:120px;">Meeting ID</span><code style="background:#0d1a2e;padding:2px 8px;border-radius:4px;">${zoomMeetingId}</code></p>` : ''}
      ${zoomPasscode ? `<p style="margin:6px 0;font-size:14px;color:#c8d8f0;"><span style="color:#5a7a9a;display:inline-block;min-width:120px;">Passcode</span><code style="background:#0d1a2e;padding:2px 8px;border-radius:4px;">${zoomPasscode}</code></p>` : ''}
    </div>`
      : ''

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">Starting in 1 Hour, ${name}! 🚀</h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      <strong style="color:#ffffff;">Session ${sessionNumber} of ${totalSessions}</strong> starts in <strong style="color:#d4a422;">approximately 1 hour</strong>.
      Join the Zoom a few minutes early so we can start on time.
    </p>
    ${infoBox(`
      ${infoRow('Session', `${sessionNumber} of ${totalSessions}`)}
      ${infoRow('Today', dateFormatted)}
      ${infoRow('Starts At', sessionTime)}
    `)}
    ${alertBox(
      `
      <p style="margin:0 0 16px;color:#28a745;font-weight:bold;font-size:15px;">⚡ Join Now</p>
      <div style="margin-bottom:16px;">
        ${primaryButton('Join Session →', webinarLink)}
      </div>
      <p style="margin:0;color:#4a6080;font-size:12px;word-break:break-all;">${webinarLink}</p>
    `,
      '#28a745',
      '#0a1a0f',
    )}
    ${zoomBlock}
    <p style="color:#8aa8c8;line-height:1.7;margin-top:24px;font-size:14px;">See you in there!<br/>
    <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Starting in 1 Hour — ${sessionLabel} Session ${sessionNumber}`,
    html,
  })
}

// ─── 8. Waitlist Joined Confirmation ──────────────────────────────────────────

export interface WaitlistJoinedParams {
  name: string
  email: string
  productType: string
  sessionLabel: string
  position: number
}

export async function sendWaitlistJoinedEmail(
  params: WaitlistJoinedParams,
): Promise<void> {
  const { name, email, productType, sessionLabel, position } = params

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">You're on the Waitlist, ${name}</h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      This session is currently at capacity, but we've added you to the waitlist for
      <strong style="color:#ffffff;">${productType} — ${sessionLabel}</strong>.
    </p>
    ${infoBox(`
      ${infoRow('Programme', productType)}
      ${infoRow('Session', sessionLabel)}
      ${infoRow('Your Position', `#${position} on the waitlist`)}
    `)}
    ${alertBox(`
      <p style="margin:0 0 8px;color:#d4a422;font-weight:bold;font-size:14px;">What happens next?</p>
      <p style="margin:0;color:#b08a1a;font-size:14px;line-height:1.7;">
        When a spot opens, we'll email you immediately. You'll have <strong>24 hours</strong>
        to confirm and complete payment. After that, the spot moves to the next person.
        We'll keep you updated.
      </p>
    `)}
    <p style="color:#8aa8c8;line-height:1.7;margin-top:24px;font-size:14px;">Thank you for your patience.<br/>
    <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Waitlist Confirmed — ${productType} · Position #${position}`,
    html,
  })
}

// ─── 9. Waitlist Spot Available ────────────────────────────────────────────────

export interface WaitlistSpotParams {
  name: string
  email: string
  productType: string
  sessionLabel: string
  confirmUrl: string // e.g. https://Trila.co/waitlist/confirm?token=XXX
  expiresInHours: number // always 24
}

export async function sendWaitlistSpotAvailableEmail(
  params: WaitlistSpotParams,
): Promise<void> {
  const { name, email, productType, sessionLabel, confirmUrl, expiresInHours } =
    params

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">A Spot Just Opened, ${name}! 🎉</h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      Great news — a spot has opened in <strong style="color:#ffffff;">${productType} — ${sessionLabel}</strong>.
      You have <strong style="color:#d4a422;">${expiresInHours} hours</strong> to confirm your place before it moves to the next person.
    </p>
    ${alertBox(
      `
      <p style="margin:0 0 16px;color:#28a745;font-weight:bold;font-size:15px;">⚡ Claim Your Spot</p>
      <p style="margin:0 0 16px;color:#8aa8c8;font-size:14px;line-height:1.6;">
        Click below to confirm and complete your payment. This link expires in <strong style="color:#d4a422;">${expiresInHours} hours</strong>.
      </p>
      <div style="margin-bottom:16px;">
        ${primaryButton('Confirm My Spot →', confirmUrl)}
      </div>
      <p style="margin:0;color:#4a6080;font-size:12px;word-break:break-all;">${confirmUrl}</p>
    `,
      '#28a745',
      '#0a1a0f',
    )}
    ${infoBox(`
      ${infoRow('Programme', productType)}
      ${infoRow('Session', sessionLabel)}
      ${infoRow('Expires', `${expiresInHours} hours from now`)}
    `)}
    <p style="color:#5a7a9a;font-size:13px;margin-top:24px;">
      If you no longer want this spot, you can simply ignore this email and it will automatically pass to the next person.
    </p>
    <p style="color:#8aa8c8;line-height:1.7;margin-top:12px;font-size:14px;">
    <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `A Spot Opened for You — Confirm Within ${expiresInHours} Hours`,
    html,
  })
}

// ─── 10. Admin Notification Blast ─────────────────────────────────────────────

export interface AdminNotifyParams {
  recipients: Array<{ name: string; email: string }>
  subject: string
  messageBody: string // plain text — will be wrapped in the branded template
  senderName?: string // defaults to 'The Trila Masterclass Team'
}

export async function sendAdminNotificationBlast(
  params: AdminNotifyParams,
): Promise<void> {
  const { recipients, subject, messageBody, senderName } = params

  const signature = senderName ?? 'The Trila Masterclass Team'

  // Send in batches to avoid rate limits (SendGrid allows 1000/batch)
  const BATCH_SIZE = 100
  const batches: (typeof recipients)[] = []
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE))
  }

  for (const batch of batches) {
    await Promise.all(
      batch.map(({ name, email }) => {
        const personalizedBody = messageBody.replace(/\{name\}/g, name)
        const html = base(`
          <p style="color:#8aa8c8;line-height:1.8;font-size:15px;white-space:pre-line;">${personalizedBody}</p>
          <p style="color:#8aa8c8;line-height:1.7;margin-top:28px;font-size:14px;">
          Best regards,<br/><strong style="color:#c8d8f0;">${signature}</strong></p>
        `)
        return sendEmail({
          to: email,
          from: { email: FROM_EMAIL, name: FROM_NAME },
          subject,
          html,
        })
      }),
    )
  }
}

/**
 * ─── RESERVATION EMAIL TEMPLATES ─────────────────────────────────────────────
 *
 * Append these exports to the bottom of your existing lib/email.ts file.
 *
 * All helpers (base, infoBox, alertBox, primaryButton, sendEmail,
 * FROM_EMAIL, FROM_NAME) are already defined in that file — do not
 * re-declare them here. This file shows only the new additions.
 *
 * HOW TO INTEGRATE:
 *   Copy everything from "// ─── 11." onwards into the bottom of lib/email.ts
 */

// ─── Shared ───────────────────────────────────────────────────────────────────

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://Trila.co'

function buildReservationPaymentUrl(token: string): string {
  return `${APP_BASE_URL}/reserve/confirm?token=${token}`
}

function formatExpiry(date: Date): string {
  return (
    date.toLocaleString('en-NG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Lagos',
    }) + ' WAT'
  )
}

// ─── 11. Reservation Confirmation (immediate — sent on /api/reserve) ──────────

export interface ReservationConfirmationParams {
  name: string
  email: string
  enrollmentReference: string
  productType: string
  sessionLabel: string
  reservationToken: string
  expiresAt: Date
}

export async function sendReservationConfirmation(
  params: ReservationConfirmationParams,
): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    productType,
    sessionLabel,
    reservationToken,
    expiresAt,
  } = params

  const paymentUrl = buildReservationPaymentUrl(reservationToken)
  const expiryFormatted = formatExpiry(expiresAt)

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">
      Your Seat Is Reserved, ${name}! 🎉
    </h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      Great news — we've held a spot in
      <strong style="color:#ffffff;">${productType} — ${sessionLabel}</strong>
      for you. Your seat is reserved but <strong style="color:#d4a422;">not yet activated</strong>.
      Complete payment using the link below to secure it.
    </p>

    ${alertBox(`
      <p style="margin:0 0 6px;color:#d4a422;font-weight:bold;font-size:14px;">
        ⚠️ No Zoom Link or Access Code Until Payment Is Complete
      </p>
      <p style="margin:0;color:#b08a1a;font-size:13px;line-height:1.6;">
        Your reservation holds the seat but does not grant access to the session.
        Once payment is confirmed, you will receive your full access credentials
        at this email address.
      </p>
    `)}

    ${infoBox(`
      ${infoRow('Programme', productType)}
      ${infoRow('Session', sessionLabel)}
      ${infoRow('Reference', `<code style="background:#0d1a2e;padding:3px 8px;border-radius:4px;font-family:monospace;color:#4a9eff;">${enrollmentReference}</code>`)}
      ${infoRow('Seat Held Until', `<strong style="color:#d4a422;">${expiryFormatted}</strong>`)}
    `)}

    ${alertBox(
      `
      <p style="margin:0 0 16px;color:#4a9eff;font-weight:bold;font-size:15px;">
        💳 Complete Your Payment
      </p>
      <p style="margin:0 0 16px;color:#8aa8c8;font-size:14px;line-height:1.6;">
        Click the button below to pay securely via <strong style="color:#ffffff;">Paystack</strong>.
        Your seat is held for <strong style="color:#d4a422;">24 hours</strong> — after that it is
        automatically released to the next person.
      </p>
      <div style="margin-bottom:16px;">
        ${primaryButton('Complete Payment Now →', paymentUrl)}
      </div>
      <p style="margin:0;color:#4a6080;font-size:12px;word-break:break-all;">
        ${paymentUrl}
      </p>
    `,
      '#4a9eff',
      '#0a1220',
    )}

    <div style="background:#0b1828;border:1px solid #1e3050;border-radius:8px;padding:16px 24px;margin:20px 0;">
      <p style="margin:0 0 10px;color:#5a7a9a;font-size:13px;font-weight:bold;
                text-transform:uppercase;letter-spacing:0.1em;">What Happens Next</p>
      <ol style="margin:0;padding-left:20px;color:#8aa8c8;font-size:14px;line-height:2.2;">
        <li>Click the payment link above</li>
        <li>Complete checkout via Paystack (card payment)</li>
        <li>Receive your confirmation email with full access credentials</li>
      </ol>
    </div>

    <p style="color:#5a7a9a;font-size:12px;margin-top:24px;line-height:1.6;">
      If you did not request this reservation, you can safely ignore this email.
      The seat will be released automatically after 24 hours.
    </p>
    <p style="color:#8aa8c8;line-height:1.7;margin-top:16px;font-size:14px;">
      Best regards,<br/>
      <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong>
    </p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Seat Reserved — Complete Payment Within 24 Hours · ${productType}`,
    html,
  })
}

// ─── 12. Reservation Reminder (sent ~4h before expiry by cron) ────────────────

export interface ReservationReminderParams {
  name: string
  email: string
  enrollmentReference: string
  productType: string
  reservationToken: string
  expiresAt: Date
}

export async function sendReservationReminder(
  params: ReservationReminderParams,
): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    productType,
    reservationToken,
    expiresAt,
  } = params

  const paymentUrl = buildReservationPaymentUrl(reservationToken)
  const expiryFormatted = formatExpiry(expiresAt)

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">
      Your Seat Expires Soon, ${name}! ⏰
    </h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      This is a reminder that your reserved seat in
      <strong style="color:#ffffff;">${productType}</strong> is about to be released.
      Complete payment now to keep your spot.
    </p>

    ${alertBox(
      `
      <p style="margin:0 0 10px;color:#d4a422;font-weight:bold;font-size:15px;">
        ⚠️ Your Seat Expires At: ${expiryFormatted}
      </p>
      <p style="margin:0 0 16px;color:#b08a1a;font-size:14px;line-height:1.6;">
        After this time, your reservation is automatically cancelled and the seat
        is offered to the next person. Don't lose your spot!
      </p>
      <div style="margin-bottom:16px;">
        ${primaryButton('Complete Payment Now →', paymentUrl)}
      </div>
      <p style="margin:0;color:#4a6080;font-size:12px;word-break:break-all;">
        ${paymentUrl}
      </p>
    `,
      '#d4a422',
      '#1a1200',
    )}

    ${infoBox(`
      ${infoRow('Programme', productType)}
      ${infoRow('Reference', `<code style="background:#0d1a2e;padding:3px 8px;border-radius:4px;font-family:monospace;color:#4a9eff;">${enrollmentReference}</code>`)}
      ${infoRow('Expires', `<strong style="color:#d4a422;">${expiryFormatted}</strong>`)}
    `)}

    <p style="color:#5a7a9a;font-size:12px;margin-top:24px;line-height:1.6;">
      If you no longer want this seat, no action is needed — it will be released
      automatically.
    </p>
    <p style="color:#8aa8c8;line-height:1.7;margin-top:16px;font-size:14px;">
      Best regards,<br/>
      <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong>
    </p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `⏰ Your Seat Is About to Expire — Complete Payment Now · ${productType}`,
    html,
  })
}

// ─── 13. Reservation Expired Notification ─────────────────────────────────────

export interface ReservationExpiredParams {
  name: string
  email: string
  productType: string
}

export async function sendReservationExpired(
  params: ReservationExpiredParams,
): Promise<void> {
  const { name, email, productType } = params

  const reserveUrl = `${APP_BASE_URL}/#reserve-access`

  const html = base(`
    <h2 style="color:#ffffff;margin-top:0;font-size:22px;">
      Your Reservation Has Expired
    </h2>
    <p style="color:#8aa8c8;line-height:1.7;font-size:15px;">
      Hi ${name}, your reserved seat in
      <strong style="color:#ffffff;">${productType}</strong>
      has been released because the 24-hour payment window elapsed without a
      completed payment.
    </p>

    ${alertBox(
      `
      <p style="margin:0 0 12px;color:#8aa8c8;font-size:14px;line-height:1.6;">
        If you are still interested in joining, seats may still be available.
        Reserve again using the link below — the process takes less than a minute.
      </p>
      ${primaryButton('Reserve a New Seat →', reserveUrl)}
    `,
      '#4a9eff',
      '#0a1220',
    )}

    <div style="background:#0b1828;border:1px solid #1e3050;border-radius:8px;
                padding:16px 24px;margin:20px 0;">
      <p style="margin:0 0 10px;color:#5a7a9a;font-size:13px;font-weight:bold;
                text-transform:uppercase;letter-spacing:0.1em;">Need Help?</p>
      <p style="margin:0;color:#8aa8c8;font-size:14px;line-height:1.7;">
        If you experienced a payment issue or need assistance, please reach out to
        us directly — we are happy to help you secure a spot.
      </p>
      <p style="margin:10px 0 0;">
        <a href="mailto:masterclass@Trila.pro"
           style="color:#4a9eff;font-size:14px;">
          masterclass@Trila.pro
        </a>
        &nbsp;·&nbsp;
        <a href="https://wa.me/2347064000854"
           style="color:#4a9eff;font-size:14px;">
          WhatsApp: +234 7064000854
        </a>
      </p>
    </div>

    <p style="color:#8aa8c8;line-height:1.7;margin-top:24px;font-size:14px;">
      Best regards,<br/>
      <strong style="color:#c8d8f0;">The Trila Masterclass Team</strong>
    </p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Your Reservation Has Expired — ${productType}`,
    html,
  })
}
