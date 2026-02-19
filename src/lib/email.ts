import sgMail from '@sendgrid/mail'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'noreply@trila.co'
const FROM_NAME = process.env.FROM_NAME ?? 'Trila Masterclass'
const WEBINAR_LINK = process.env.WEBINAR_LINK ?? 'https://trila.co/webinar'
const CONSULTING_LINK =
  process.env.CONSULTING_SCHEDULING_LINK ??
  'https://calendly.com/trila/consulting'

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
              <p style="margin:0;color:#4a9eff;font-size:13px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;">Trila · JaaS Masterclass</p>
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
