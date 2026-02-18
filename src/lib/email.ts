import sgMail from '@sendgrid/mail'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'noreply@yourdomain.com'
const FROM_NAME = process.env.FROM_NAME ?? 'Masterclass Team'
const WEBINAR_LINK =
  process.env.WEBINAR_LINK ?? 'https://yourdomain.com/webinar'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
} else {
  console.warn('[email] SENDGRID_API_KEY is not set — emails will not be sent.')
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

async function sendEmail(msg: sgMail.MailDataRequired): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('[email] Skipping send — SENDGRID_API_KEY not configured.')
    return
  }
  await sgMail.send(msg)
}

function base(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Masterclass</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:#1a1a2e;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">Masterclass</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#f4f4f5;padding:16px 32px;text-align:center;">
              <p style="margin:0;color:#888;font-size:12px;">© ${new Date().getFullYear()} Masterclass Team. All rights reserved.</p>
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
  return `<div style="background:#f8f9fa;border-radius:6px;padding:16px 20px;margin:16px 0;">${content}</div>`
}

function infoRow(label: string, value: string): string {
  return `<p style="margin:6px 0;color:#333;font-size:15px;"><strong>${label}:</strong> ${value}</p>`
}

function alertBox(
  content: string,
  color = '#fff8e1',
  border = '#ffc107',
): string {
  return `<div style="background:${color};border-left:4px solid ${border};border-radius:6px;padding:16px 20px;margin:16px 0;">${content}</div>`
}

// ---------------------------------------------------------------------------
// 1. Registration confirmation (no payment yet)
// ---------------------------------------------------------------------------

export async function sendRegistrationConfirmation(params: {
  name: string
  email: string
  enrollmentReference: string
}): Promise<void> {
  const { name, email, enrollmentReference } = params

  const html = base(`
    <h2 style="color:#1a1a2e;margin-top:0;">Welcome, ${name}! 🎉</h2>
    <p style="color:#555;line-height:1.6;">
      Your registration has been received. Please keep your enrollment reference safe —
      you will need it to complete payment and for live event check-in.
    </p>
    ${infoBox(`
      ${infoRow('Name', name)}
      ${infoRow('Email', email)}
      ${infoRow('Enrollment Reference', `<code style="background:#e9ecef;padding:2px 6px;border-radius:4px;font-size:14px;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(`
      <p style="margin:0;color:#856404;font-weight:bold;">Next Step</p>
      <p style="margin:8px 0 0;color:#856404;">
        Proceed to select your session, choose a product type, and complete payment to secure your spot.
      </p>
    `)}
    <p style="color:#555;line-height:1.6;margin-top:24px;">Best regards,<br/><strong>The Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Registration Received – Your Reference: ${enrollmentReference}`,
    html,
  })
}

// ---------------------------------------------------------------------------
// 2. Virtual access confirmation (sent immediately after successful payment)
// ---------------------------------------------------------------------------

export async function sendVirtualAccessConfirmation(params: {
  name: string
  email: string
  enrollmentReference: string
  productType: string
  sessionDate: string
  sessionTime: string
}): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    productType,
    sessionDate,
    sessionTime,
  } = params

  const html = base(`
    <h2 style="color:#1a1a2e;margin-top:0;">You're In, ${name}! ✅</h2>
    <p style="color:#555;line-height:1.6;">
      Your payment was successful and your <strong>Virtual</strong> access is confirmed.
      Your webinar link is below — join at the scheduled time.
    </p>
    ${infoBox(`
      ${infoRow('Event', productType)}
      ${infoRow('Session Date', sessionDate)}
      ${infoRow('Session Time', sessionTime)}
      ${infoRow('Access Tier', 'Virtual')}
      ${infoRow('Enrollment Reference', `<code style="background:#e9ecef;padding:2px 6px;border-radius:4px;font-size:14px;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(
      `
      <p style="margin:0 0 8px;color:#155724;font-weight:bold;">🔗 Your Webinar Link</p>
      <a href="${WEBINAR_LINK}" style="color:#1a73e8;word-break:break-all;font-size:15px;">${WEBINAR_LINK}</a>
      <p style="margin:8px 0 0;color:#555;font-size:13px;">This link becomes active at the time of your session. Do not share it.</p>
    `,
      '#d4edda',
      '#28a745',
    )}
    <p style="color:#555;line-height:1.6;margin-top:24px;">Best regards,<br/><strong>The Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Your Virtual Access Link – ${productType}`,
    html,
  })
}

// ---------------------------------------------------------------------------
// 3. Full (live) access confirmation
// ---------------------------------------------------------------------------

export async function sendFullAccessConfirmation(params: {
  name: string
  email: string
  enrollmentReference: string
  productType: string
  sessionDate: string
  sessionTime: string
}): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    productType,
    sessionDate,
    sessionTime,
  } = params

  const html = base(`
    <h2 style="color:#1a1a2e;margin-top:0;">Your Spot is Confirmed, ${name}! 🎟️</h2>
    <p style="color:#555;line-height:1.6;">
      Your payment was successful and your <strong>Full (Live)</strong> access is confirmed.
      See below for your session details and check-in instructions.
    </p>
    ${infoBox(`
      ${infoRow('Event', productType)}
      ${infoRow('Session Date', sessionDate)}
      ${infoRow('Session Time', sessionTime)}
      ${infoRow('Access Tier', 'Full – Live Attendance')}
      ${infoRow('Enrollment Reference', `<code style="background:#e9ecef;padding:2px 6px;border-radius:4px;font-size:14px;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(`
      <p style="margin:0 0 12px;color:#856404;font-weight:bold;">📍 Live Check-In Instructions</p>
      <ol style="margin:0;padding-left:20px;color:#555;line-height:1.8;">
        <li>Arrive at the venue at least <strong>15 minutes</strong> before the session starts.</li>
        <li>Look for the QR code displayed at the entrance by the event staff.</li>
        <li>Scan the QR code with your phone's camera — it will open a check-in page.</li>
        <li>Enter your email and your enrollment reference: <strong>${enrollmentReference}</strong></li>
        <li>You will see an <strong>"Access Granted"</strong> message on your screen.</li>
      </ol>
      <p style="margin:12px 0 0;color:#888;font-size:13px;">Check-in opens 30 minutes before the event. Late arrivals may not be admitted after the session ends.</p>
    `)}
    <p style="color:#555;line-height:1.6;margin-top:24px;">Best regards,<br/><strong>The Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Live Attendance Confirmed – ${productType} on ${sessionDate}`,
    html,
  })
}

// ---------------------------------------------------------------------------
// 4. Tier change to virtual (webinar link sent on tier update)
// ---------------------------------------------------------------------------

export async function sendTierChangedToVirtualEmail(params: {
  name: string
  email: string
  enrollmentReference: string
  productType: string
  sessionDate: string
  sessionTime: string
}): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    productType,
    sessionDate,
    sessionTime,
  } = params

  const html = base(`
    <h2 style="color:#1a1a2e;margin-top:0;">Access Tier Updated, ${name}</h2>
    <p style="color:#555;line-height:1.6;">
      Your access tier has been changed to <strong>Virtual</strong>.
      You are no longer registered for live in-person check-in.
      Your webinar link is included below.
    </p>
    ${infoBox(`
      ${infoRow('Event', productType)}
      ${infoRow('Session Date', sessionDate)}
      ${infoRow('Session Time', sessionTime)}
      ${infoRow('Updated Access Tier', 'Virtual')}
      ${infoRow('Enrollment Reference', `<code style="background:#e9ecef;padding:2px 6px;border-radius:4px;font-size:14px;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(
      `
      <p style="margin:0 0 8px;color:#155724;font-weight:bold;">🔗 Your Webinar Link</p>
      <a href="${WEBINAR_LINK}" style="color:#1a73e8;word-break:break-all;font-size:15px;">${WEBINAR_LINK}</a>
      <p style="margin:8px 0 0;color:#555;font-size:13px;">This link becomes active at the time of your session.</p>
    `,
      '#d4edda',
      '#28a745',
    )}
    <p style="color:#555;line-height:1.6;margin-top:24px;">Best regards,<br/><strong>The Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Access Tier Updated to Virtual – Your Webinar Link`,
    html,
  })
}

// ---------------------------------------------------------------------------
// 5. Tier change to full (live) access
// ---------------------------------------------------------------------------

export async function sendTierChangedToFullEmail(params: {
  name: string
  email: string
  enrollmentReference: string
  productType: string
  sessionDate: string
  sessionTime: string
}): Promise<void> {
  const {
    name,
    email,
    enrollmentReference,
    productType,
    sessionDate,
    sessionTime,
  } = params

  const html = base(`
    <h2 style="color:#1a1a2e;margin-top:0;">Access Tier Updated, ${name}</h2>
    <p style="color:#555;line-height:1.6;">
      Your access tier has been changed to <strong>Full (Live)</strong>.
      You are now eligible for in-person check-in at the venue.
    </p>
    ${infoBox(`
      ${infoRow('Event', productType)}
      ${infoRow('Session Date', sessionDate)}
      ${infoRow('Session Time', sessionTime)}
      ${infoRow('Updated Access Tier', 'Full – Live Attendance')}
      ${infoRow('Enrollment Reference', `<code style="background:#e9ecef;padding:2px 6px;border-radius:4px;font-size:14px;">${enrollmentReference}</code>`)}
    `)}
    ${alertBox(`
      <p style="margin:0 0 12px;color:#856404;font-weight:bold;">📍 Live Check-In Instructions</p>
      <ol style="margin:0;padding-left:20px;color:#555;line-height:1.8;">
        <li>Arrive at the venue at least <strong>15 minutes</strong> before the session starts.</li>
        <li>Scan the QR code displayed at the entrance.</li>
        <li>Enter your email and enrollment reference: <strong>${enrollmentReference}</strong></li>
        <li>You will see an <strong>"Access Granted"</strong> message on your screen.</li>
      </ol>
    `)}
    <p style="color:#555;line-height:1.6;margin-top:24px;">Best regards,<br/><strong>The Masterclass Team</strong></p>
  `)

  await sendEmail({
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Access Tier Updated to Full Live Attendance`,
    html,
  })
}
