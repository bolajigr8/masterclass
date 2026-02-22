// import { NextResponse } from 'next/server'
// import { randomBytes } from 'crypto'
// import connectToDatabase from '@/lib/mongodb'
// import Enrollment from '@/models/Enrollment'
// import { isValidProductType } from '@/lib/pricing'
// import {
//   findSessionByIdFromDB,
//   getSessionsForProductFromDB,
// } from '@/lib/session-db'
// import { sendReservationConfirmation } from '@/lib/email'

// // ─── Constants ────────────────────────────────────────────────────────────────

// /** How long a reservation holds a seat before auto-expiry. */
// const RESERVATION_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// /**
//  * Cryptographically secure enrollment reference.
//  * Format: ENR-<timestamp-base36>-<8-random-hex-bytes>
//  * e.g.   ENR-LZK3F2A-A1B2C3D4E5F60708
//  */
// function generateEnrollmentReference(): string {
//   const timestamp = Date.now().toString(36).toUpperCase()
//   const randomHex = randomBytes(8).toString('hex').toUpperCase()
//   return `ENR-${timestamp}-${randomHex}`
// }

// /**
//  * Secure token for the payment link embedded in the reservation email.
//  * 32 random bytes → 64 hex characters.
//  */
// function generateReservationToken(): string {
//   return randomBytes(32).toString('hex')
// }

// /**
//  * Picks the soonest available (not full, not past) session for a product.
//  * Mirrors the client-side pickBestSession() in enrollment-modal.tsx so that
//  * the seat we hold server-side matches what the user would have seen.
//  */
// async function pickBestSessionForProduct(
//   productType: string,
// ): Promise<{ sessionId: string; label: string } | null> {
//   const sessions = await getSessionsForProductFromDB(productType)
//   if (!sessions.length) return null

//   const today = new Date()
//   today.setHours(0, 0, 0, 0)

//   // Filter to future sessions
//   const future = sessions.filter((s) => {
//     const lastDate = new Date(s.dates[s.dates.length - 1])
//     return lastDate >= today
//   })

//   if (!future.length) return null

//   // Count confirmed + actively-held reservations for each session
//   const withCounts = await Promise.all(
//     future.map(async (s) => {
//       const [confirmedCount, reservationCount] = await Promise.all([
//         Enrollment.countDocuments({
//           'selectedSession.sessionId': s.sessionId,
//           paymentStatus: 'success',
//           bookingStatus: 'confirmed',
//           cancelledAt: { $exists: false },
//         }),
//         Enrollment.countDocuments({
//           'selectedSession.sessionId': s.sessionId,
//           reservationType: 'manual_paystack',
//           paymentWindowStatus: { $in: ['pending', 'reminded'] },
//           reservationExpiresAt: { $gt: new Date() },
//           cancelledAt: { $exists: false },
//         }),
//       ])
//       const held = confirmedCount + reservationCount
//       return { ...s, held }
//     }),
//   )

//   // Prefer soonest available (not full)
//   const available = withCounts
//     .filter((s) => s.held < s.capacity)
//     .sort(
//       (a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime(),
//     )

//   if (available.length)
//     return { sessionId: available[0].sessionId, label: available[0].label }

//   // Fall back to soonest even if full (rare — caller should surface the error)
//   const sorted = withCounts.sort(
//     (a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime(),
//   )
//   return sorted.length
//     ? { sessionId: sorted[0].sessionId, label: sorted[0].label }
//     : null
// }

// // ─── Handler ──────────────────────────────────────────────────────────────────

// /**
//  * POST /api/reserve
//  *
//  * Creates a pending reservation for a user who has not yet paid.
//  * Assigns the best available session, stores it on the enrollment,
//  * and counts it against capacity so no two people can claim the same last seat.
//  *
//  * On success the user receives a reservation confirmation email containing
//  * a secure one-time payment link valid for RESERVATION_WINDOW_MS (24 h).
//  *
//  * Body:
//  *   name        string  required
//  *   email       string  required
//  *   phone       string  required
//  *   city        string  optional
//  *   productType string  required — must match a valid ProductType
//  *
//  * Responses:
//  *   201  { success, enrollmentReference, expiresAt }
//  *   400  validation error
//  *   404  no sessions available for the product
//  *   409  email already has an active reservation or confirmed enrollment
//  *   422  all sessions at capacity
//  *   500  unexpected error
//  */
// export async function POST(request: Request) {
//   try {
//     const body = await request.json()
//     const { name, email, phone, city, productType } = body

//     // ── Field validation ───────────────────────────────────────────────────
//     if (!name || !email || !phone || !productType) {
//       return NextResponse.json(
//         {
//           error: 'Missing required fields.',
//           details: 'name, email, phone, and productType are all required.',
//         },
//         { status: 400 },
//       )
//     }

//     const cleanName = String(name).trim()
//     const cleanEmail = String(email).toLowerCase().trim()
//     const cleanPhone = String(phone).replace(/\s+/g, '')
//     const cleanCity = city ? String(city).trim() : undefined

//     if (cleanName.length < 2) {
//       return NextResponse.json(
//         { error: 'Name must be at least 2 characters.' },
//         { status: 400 },
//       )
//     }
//     if (!EMAIL_RE.test(cleanEmail)) {
//       return NextResponse.json(
//         { error: 'Invalid email address.' },
//         { status: 400 },
//       )
//     }
//     if (cleanPhone.length < 10) {
//       return NextResponse.json(
//         { error: 'Phone number must be at least 10 digits.' },
//         { status: 400 },
//       )
//     }
//     if (!isValidProductType(productType)) {
//       return NextResponse.json(
//         { error: 'Invalid product type.' },
//         { status: 400 },
//       )
//     }

//     await connectToDatabase()

//     // ── Duplicate checks ───────────────────────────────────────────────────

//     const existingEnrollment = await Enrollment.findOne({
//       email: cleanEmail,
//     }).lean()

//     if (existingEnrollment) {
//       // Already paid — hard block
//       if (existingEnrollment.paymentStatus === 'success') {
//         return NextResponse.json(
//           {
//             error: 'Email already enrolled.',
//             details:
//               'A completed enrollment exists for this email address. Contact support if you need help.',
//           },
//           { status: 409 },
//         )
//       }

//       // Active reservation still within its window — resend the payment link
//       // instead of creating a duplicate. This handles "I didn't get the email".
//       if (
//         existingEnrollment.reservationType === 'manual_paystack' &&
//         existingEnrollment.paymentWindowStatus !== 'expired' &&
//         existingEnrollment.reservationExpiresAt &&
//         new Date(existingEnrollment.reservationExpiresAt) > new Date()
//       ) {
//         // Resend the confirmation email non-blocking
//         if (existingEnrollment.reservationToken) {
//           const sessionConfig = existingEnrollment.selectedSession?.sessionId
//             ? await findSessionByIdFromDB(
//                 existingEnrollment.selectedSession.sessionId,
//               )
//             : null

//           sendReservationConfirmation({
//             name: existingEnrollment.name,
//             email: existingEnrollment.email,
//             enrollmentReference: existingEnrollment.enrollmentReference,
//             productType: existingEnrollment.productType ?? productType,
//             sessionLabel: sessionConfig?.label ?? 'your session',
//             reservationToken: existingEnrollment.reservationToken,
//             expiresAt: existingEnrollment.reservationExpiresAt,
//           }).catch((err) =>
//             console.error('[reserve] Resend email failed:', err),
//           )
//         }

//         return NextResponse.json(
//           {
//             success: true,
//             resent: true,
//             enrollmentReference: existingEnrollment.enrollmentReference,
//             expiresAt: existingEnrollment.reservationExpiresAt,
//             message:
//               'A reservation already exists for this email. The payment link has been resent.',
//           },
//           { status: 200 },
//         )
//       }

//       // Stale pending Paystack enrollment (opened modal but never paid) —
//       // let them re-reserve by falling through and creating fresh enrollment.
//       // The old record's email uniqueness constraint would block us, so we
//       // update it in place instead of inserting.
//       if (
//         existingEnrollment.reservationType !== 'manual_paystack' &&
//         existingEnrollment.paymentStatus === 'pending'
//       ) {
//         // Update the existing stale record to become a reservation
//         const reservationToken = generateReservationToken()
//         const reservationExpiresAt = new Date(
//           Date.now() + RESERVATION_WINDOW_MS,
//         )

//         // Find the best session
//         const bestSession = await pickBestSessionForProduct(productType)
//         if (!bestSession) {
//           return NextResponse.json(
//             {
//               error: 'No upcoming sessions available.',
//               details: 'Please check back soon or contact us.',
//             },
//             { status: 404 },
//           )
//         }

//         const sessionConfig = await findSessionByIdFromDB(bestSession.sessionId)
//         if (!sessionConfig) {
//           return NextResponse.json(
//             { error: 'Session configuration error. Please try again.' },
//             { status: 500 },
//           )
//         }

//         // Verify session has capacity (confirmedCount + reservations < capacity)
//         const [confirmedCount, reservationCount] = await Promise.all([
//           Enrollment.countDocuments({
//             'selectedSession.sessionId': bestSession.sessionId,
//             paymentStatus: 'success',
//             bookingStatus: 'confirmed',
//             cancelledAt: { $exists: false },
//           }),
//           Enrollment.countDocuments({
//             'selectedSession.sessionId': bestSession.sessionId,
//             reservationType: 'manual_paystack',
//             paymentWindowStatus: { $in: ['pending', 'reminded'] },
//             reservationExpiresAt: { $gt: new Date() },
//             cancelledAt: { $exists: false },
//           }),
//         ])

//         const totalHeld = confirmedCount + reservationCount
//         if (totalHeld >= sessionConfig.capacity) {
//           return NextResponse.json(
//             {
//               error: 'All sessions are currently at capacity.',
//               details:
//                 'Seats may open up if pending reservations expire. Please check back in a few hours.',
//             },
//             { status: 422 },
//           )
//         }

//         await Enrollment.updateOne(
//           { email: cleanEmail },
//           {
//             $set: {
//               name: cleanName,
//               phone: cleanPhone,
//               city: cleanCity,
//               productType,
//               reservationType: 'manual_paystack',
//               reservationToken,
//               reservationExpiresAt,
//               paymentWindowStatus: 'pending',
//               selectedSession: {
//                 sessionId: sessionConfig.sessionId,
//                 dates: sessionConfig.dates,
//                 time: sessionConfig.time,
//                 venue: sessionConfig.venue,
//                 city: sessionConfig.city,
//                 isTwoDay: sessionConfig.isTwoDay,
//               },
//             },
//             // $unset clears reminderSentAt if it existed on the old record
//             // (setting to undefined inside $set is silently ignored by MongoDB)
//             $unset: { reminderSentAt: '' },
//           },
//         )

//         sendReservationConfirmation({
//           name: cleanName,
//           email: cleanEmail,
//           enrollmentReference: existingEnrollment.enrollmentReference,
//           productType,
//           sessionLabel: sessionConfig.label,
//           reservationToken,
//           expiresAt: reservationExpiresAt,
//         }).catch((err) =>
//           console.error('[reserve] Confirmation email failed:', err),
//         )

//         return NextResponse.json(
//           {
//             success: true,
//             enrollmentReference: existingEnrollment.enrollmentReference,
//             expiresAt: reservationExpiresAt,
//           },
//           { status: 201 },
//         )
//       }

//       // Catch-all for any other duplicate case
//       return NextResponse.json(
//         {
//           error: 'Email already registered.',
//           details:
//             'This email address is already in our system. Contact support if you need help.',
//         },
//         { status: 409 },
//       )
//     }

//     // ── Pick best session ──────────────────────────────────────────────────
//     const bestSession = await pickBestSessionForProduct(productType)
//     if (!bestSession) {
//       return NextResponse.json(
//         {
//           error: 'No upcoming sessions available.',
//           details: 'Please check back soon or contact us to be notified.',
//         },
//         { status: 404 },
//       )
//     }

//     const sessionConfig = await findSessionByIdFromDB(bestSession.sessionId)
//     if (!sessionConfig) {
//       return NextResponse.json(
//         { error: 'Session configuration error. Please try again.' },
//         { status: 500 },
//       )
//     }

//     // ── Capacity check (confirmed + active reservations) ──────────────────
//     const [confirmedCount, reservationCount] = await Promise.all([
//       Enrollment.countDocuments({
//         'selectedSession.sessionId': bestSession.sessionId,
//         paymentStatus: 'success',
//         bookingStatus: 'confirmed',
//         cancelledAt: { $exists: false },
//       }),
//       Enrollment.countDocuments({
//         'selectedSession.sessionId': bestSession.sessionId,
//         reservationType: 'manual_paystack',
//         paymentWindowStatus: { $in: ['pending', 'reminded'] },
//         reservationExpiresAt: { $gt: new Date() },
//         cancelledAt: { $exists: false },
//       }),
//     ])

//     const totalHeld = confirmedCount + reservationCount
//     if (totalHeld >= sessionConfig.capacity) {
//       return NextResponse.json(
//         {
//           error: 'All sessions are currently at capacity.',
//           details:
//             'Seats may open up when pending reservations expire. Please check back in a few hours, or contact us to join the waitlist.',
//         },
//         { status: 422 },
//       )
//     }

//     // ── Create the reservation ─────────────────────────────────────────────
//     const enrollmentReference = generateEnrollmentReference()
//     const reservationToken = generateReservationToken()
//     const reservationExpiresAt = new Date(Date.now() + RESERVATION_WINDOW_MS)

//     await Enrollment.create({
//       name: cleanName,
//       email: cleanEmail,
//       phone: cleanPhone,
//       city: cleanCity,
//       productType,
//       enrollmentReference,
//       paymentStatus: 'pending',
//       bookingStatus: 'pending',
//       reservationType: 'manual_paystack',
//       reservationToken,
//       reservationExpiresAt,
//       paymentWindowStatus: 'pending',
//       selectedSession: {
//         sessionId: sessionConfig.sessionId,
//         dates: sessionConfig.dates,
//         time: sessionConfig.time,
//         venue: sessionConfig.venue,
//         city: sessionConfig.city,
//         isTwoDay: sessionConfig.isTwoDay,
//       },
//     })

//     // ── Send confirmation email (non-blocking) ─────────────────────────────
//     sendReservationConfirmation({
//       name: cleanName,
//       email: cleanEmail,
//       enrollmentReference,
//       productType,
//       sessionLabel: sessionConfig.label,
//       reservationToken,
//       expiresAt: reservationExpiresAt,
//     }).catch((err) =>
//       console.error('[reserve] Confirmation email failed:', err),
//     )

//     return NextResponse.json(
//       {
//         success: true,
//         enrollmentReference,
//         expiresAt: reservationExpiresAt,
//       },
//       { status: 201 },
//     )
//   } catch (error: any) {
//     console.error('[reserve] Error:', error)

//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern ?? {})[0]
//       if (field === 'email') {
//         return NextResponse.json(
//           { error: 'Email already registered.' },
//           { status: 409 },
//         )
//       }
//       if (field === 'reservationToken') {
//         // Astronomically unlikely — just retry
//         return NextResponse.json(
//           { error: 'Token collision. Please try again.' },
//           { status: 409 },
//         )
//       }
//       return NextResponse.json(
//         { error: 'Reference conflict. Please try again.' },
//         { status: 409 },
//       )
//     }

//     return NextResponse.json(
//       {
//         error: 'Reservation failed. Please try again.',
//         details:
//           process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       { status: 500 },
//     )
//   }
// }

import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Waitlist from '@/models/Waitlist'
import { isValidProductType } from '@/lib/pricing'
import {
  findSessionByIdFromDB,
  getSessionsForProductFromDB,
} from '@/lib/session-db'
import { sendReservationConfirmation } from '@/lib/email'

// ─── Constants ────────────────────────────────────────────────────────────────

/** How long a reservation holds a seat before auto-expiry. */
const RESERVATION_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Cryptographically secure enrollment reference.
 * Format: ENR-<timestamp-base36>-<8-random-hex-bytes>
 * e.g.   ENR-LZK3F2A-A1B2C3D4E5F60708
 */
function generateEnrollmentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomHex = randomBytes(8).toString('hex').toUpperCase()
  return `ENR-${timestamp}-${randomHex}`
}

/**
 * Secure token for the payment link embedded in the reservation email.
 * 32 random bytes → 64 hex characters.
 */
function generateReservationToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Picks the soonest available (not full, not past) session for a product.
 * Mirrors the client-side pickBestSession() in enrollment-modal.tsx so that
 * the seat we hold server-side matches what the user would have seen.
 */
async function pickBestSessionForProduct(
  productType: string,
): Promise<{ sessionId: string; label: string } | null> {
  const sessions = await getSessionsForProductFromDB(productType)
  if (!sessions.length) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Filter to future sessions
  const future = sessions.filter((s) => {
    const lastDate = new Date(s.dates[s.dates.length - 1])
    return lastDate >= today
  })

  if (!future.length) return null

  // Count confirmed + actively-held reservations for each session
  const withCounts = await Promise.all(
    future.map(async (s) => {
      const [confirmedCount, reservationCount] = await Promise.all([
        Enrollment.countDocuments({
          'selectedSession.sessionId': s.sessionId,
          paymentStatus: 'success',
          bookingStatus: 'confirmed',
          cancelledAt: { $exists: false },
        }),
        Enrollment.countDocuments({
          'selectedSession.sessionId': s.sessionId,
          reservationType: 'manual_paystack',
          paymentWindowStatus: { $in: ['pending', 'reminded'] },
          reservationExpiresAt: { $gt: new Date() },
          cancelledAt: { $exists: false },
        }),
      ])
      const held = confirmedCount + reservationCount
      return { ...s, held }
    }),
  )

  // Prefer soonest available (not full)
  const available = withCounts
    .filter((s) => s.held < s.capacity)
    .sort(
      (a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime(),
    )

  if (available.length)
    return { sessionId: available[0].sessionId, label: available[0].label }

  // Fall back to soonest even if full (rare — caller should surface the error)
  const sorted = withCounts.sort(
    (a, b) => new Date(a.dates[0]).getTime() - new Date(b.dates[0]).getTime(),
  )
  return sorted.length
    ? { sessionId: sorted[0].sessionId, label: sorted[0].label }
    : null
}

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * POST /api/reserve
 *
 * Creates a pending reservation for a user who has not yet paid.
 * Assigns the best available session, stores it on the enrollment,
 * and counts it against capacity so no two people can claim the same last seat.
 *
 * On success the user receives a reservation confirmation email containing
 * a secure one-time payment link valid for RESERVATION_WINDOW_MS (24 h).
 *
 * Body:
 *   name        string  required
 *   email       string  required
 *   phone       string  required
 *   city        string  optional
 *   productType string  required — must match a valid ProductType
 *
 * Responses:
 *   201  { success, enrollmentReference, expiresAt }
 *   400  validation error
 *   404  no sessions available for the product
 *   409  email already has an active reservation, confirmed enrollment, or active waitlist entry
 *   422  all sessions at capacity
 *   500  unexpected error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, city, productType } = body

    // ── Field validation ───────────────────────────────────────────────────
    if (!name || !email || !phone || !productType) {
      return NextResponse.json(
        {
          error: 'Missing required fields.',
          details: 'name, email, phone, and productType are all required.',
        },
        { status: 400 },
      )
    }

    const cleanName = String(name).trim()
    const cleanEmail = String(email).toLowerCase().trim()
    const cleanPhone = String(phone).replace(/\s+/g, '')
    const cleanCity = city ? String(city).trim() : undefined

    if (cleanName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
        { status: 400 },
      )
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 },
      )
    }
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Phone number must be at least 10 digits.' },
        { status: 400 },
      )
    }
    if (!isValidProductType(productType)) {
      return NextResponse.json(
        { error: 'Invalid product type.' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    // ── Duplicate checks ───────────────────────────────────────────────────

    const existingEnrollment = await Enrollment.findOne({
      email: cleanEmail,
    }).lean()

    if (existingEnrollment) {
      // Already paid — hard block
      if (existingEnrollment.paymentStatus === 'success') {
        return NextResponse.json(
          {
            error: 'Email already enrolled.',
            details:
              'A completed enrollment exists for this email address. Contact support if you need help.',
          },
          { status: 409 },
        )
      }

      // Active reservation still within its window — resend the payment link
      // instead of creating a duplicate. This handles "I didn't get the email".
      if (
        existingEnrollment.reservationType === 'manual_paystack' &&
        existingEnrollment.paymentWindowStatus !== 'expired' &&
        existingEnrollment.reservationExpiresAt &&
        new Date(existingEnrollment.reservationExpiresAt) > new Date()
      ) {
        // Resend the confirmation email non-blocking
        if (existingEnrollment.reservationToken) {
          const sessionConfig = existingEnrollment.selectedSession?.sessionId
            ? await findSessionByIdFromDB(
                existingEnrollment.selectedSession.sessionId,
              )
            : null

          sendReservationConfirmation({
            name: existingEnrollment.name,
            email: existingEnrollment.email,
            enrollmentReference: existingEnrollment.enrollmentReference,
            productType: existingEnrollment.productType ?? productType,
            sessionLabel: sessionConfig?.label ?? 'your session',
            reservationToken: existingEnrollment.reservationToken,
            expiresAt: existingEnrollment.reservationExpiresAt,
          }).catch((err) =>
            console.error('[reserve] Resend email failed:', err),
          )
        }

        return NextResponse.json(
          {
            success: true,
            resent: true,
            enrollmentReference: existingEnrollment.enrollmentReference,
            expiresAt: existingEnrollment.reservationExpiresAt,
            message:
              'A reservation already exists for this email. The payment link has been resent.',
          },
          { status: 200 },
        )
      }

      // Stale pending Paystack enrollment (opened modal but never paid) —
      // let them re-reserve by falling through and creating fresh enrollment.
      // The old record's email uniqueness constraint would block us, so we
      // update it in place instead of inserting.
      if (
        existingEnrollment.reservationType !== 'manual_paystack' &&
        existingEnrollment.paymentStatus === 'pending'
      ) {
        // Find the best session
        const bestSession = await pickBestSessionForProduct(productType)
        if (!bestSession) {
          return NextResponse.json(
            {
              error: 'No upcoming sessions available.',
              details: 'Please check back soon or contact us.',
            },
            { status: 404 },
          )
        }

        const sessionConfig = await findSessionByIdFromDB(bestSession.sessionId)
        if (!sessionConfig) {
          return NextResponse.json(
            { error: 'Session configuration error. Please try again.' },
            { status: 500 },
          )
        }

        // ── Bug #4: check for existing active waitlist entry ───────────────
        const activeWaitlistEntry = await Waitlist.findOne({
          email: cleanEmail,
          sessionId: bestSession.sessionId,
          status: { $in: ['waiting', 'notified'] },
        }).lean()

        if (activeWaitlistEntry) {
          return NextResponse.json(
            {
              error: 'Already on waitlist.',
              details:
                "You're already on the waitlist for this session. We'll email you the moment a seat opens.",
            },
            { status: 409 },
          )
        }

        // Verify session has capacity (confirmedCount + reservations < capacity)
        const [confirmedCount, reservationCount] = await Promise.all([
          Enrollment.countDocuments({
            'selectedSession.sessionId': bestSession.sessionId,
            paymentStatus: 'success',
            bookingStatus: 'confirmed',
            cancelledAt: { $exists: false },
          }),
          Enrollment.countDocuments({
            'selectedSession.sessionId': bestSession.sessionId,
            reservationType: 'manual_paystack',
            paymentWindowStatus: { $in: ['pending', 'reminded'] },
            reservationExpiresAt: { $gt: new Date() },
            cancelledAt: { $exists: false },
          }),
        ])

        const totalHeld = confirmedCount + reservationCount
        if (totalHeld >= sessionConfig.capacity) {
          return NextResponse.json(
            {
              error: 'All sessions are currently at capacity.',
              details:
                'Seats may open up if pending reservations expire. Please check back in a few hours.',
              // Bug #1: expose sessionId so the frontend can link to the waitlist
              sessionId: bestSession.sessionId,
              sessionLabel: sessionConfig.label,
            },
            { status: 422 },
          )
        }

        const reservationToken = generateReservationToken()
        const reservationExpiresAt = new Date(
          Date.now() + RESERVATION_WINDOW_MS,
        )

        await Enrollment.updateOne(
          { email: cleanEmail },
          {
            $set: {
              name: cleanName,
              phone: cleanPhone,
              city: cleanCity,
              productType,
              reservationType: 'manual_paystack',
              reservationToken,
              reservationExpiresAt,
              paymentWindowStatus: 'pending',
              selectedSession: {
                sessionId: sessionConfig.sessionId,
                dates: sessionConfig.dates,
                time: sessionConfig.time,
                venue: sessionConfig.venue,
                city: sessionConfig.city,
                isTwoDay: sessionConfig.isTwoDay,
              },
            },
            // $unset clears reminderSentAt if it existed on the old record
            $unset: { reminderSentAt: '' },
          },
        )

        sendReservationConfirmation({
          name: cleanName,
          email: cleanEmail,
          enrollmentReference: existingEnrollment.enrollmentReference,
          productType,
          sessionLabel: sessionConfig.label,
          reservationToken,
          expiresAt: reservationExpiresAt,
        }).catch((err) =>
          console.error('[reserve] Confirmation email failed:', err),
        )

        return NextResponse.json(
          {
            success: true,
            enrollmentReference: existingEnrollment.enrollmentReference,
            expiresAt: reservationExpiresAt,
          },
          { status: 201 },
        )
      }

      // Catch-all for any other duplicate case
      return NextResponse.json(
        {
          error: 'Email already registered.',
          details:
            'This email address is already in our system. Contact support if you need help.',
        },
        { status: 409 },
      )
    }

    // ── Pick best session ──────────────────────────────────────────────────
    const bestSession = await pickBestSessionForProduct(productType)
    if (!bestSession) {
      return NextResponse.json(
        {
          error: 'No upcoming sessions available.',
          details: 'Please check back soon or contact us to be notified.',
        },
        { status: 404 },
      )
    }

    const sessionConfig = await findSessionByIdFromDB(bestSession.sessionId)
    if (!sessionConfig) {
      return NextResponse.json(
        { error: 'Session configuration error. Please try again.' },
        { status: 500 },
      )
    }

    // ── Bug #4: check for existing active waitlist entry ───────────────────
    // Must happen after session selection so we check the correct sessionId.
    // Prevents a user with an active waitlist entry from also creating a
    // reservation, which could lead to double-booking when they're promoted.
    const activeWaitlistEntry = await Waitlist.findOne({
      email: cleanEmail,
      sessionId: bestSession.sessionId,
      status: { $in: ['waiting', 'notified'] },
    }).lean()

    if (activeWaitlistEntry) {
      return NextResponse.json(
        {
          error: 'Already on waitlist.',
          details:
            "You're already on the waitlist for this session. We'll email you the moment a seat opens.",
        },
        { status: 409 },
      )
    }

    // ── Capacity check (confirmed + active reservations) ──────────────────
    const [confirmedCount, reservationCount] = await Promise.all([
      Enrollment.countDocuments({
        'selectedSession.sessionId': bestSession.sessionId,
        paymentStatus: 'success',
        bookingStatus: 'confirmed',
        cancelledAt: { $exists: false },
      }),
      Enrollment.countDocuments({
        'selectedSession.sessionId': bestSession.sessionId,
        reservationType: 'manual_paystack',
        paymentWindowStatus: { $in: ['pending', 'reminded'] },
        reservationExpiresAt: { $gt: new Date() },
        cancelledAt: { $exists: false },
      }),
    ])

    const totalHeld = confirmedCount + reservationCount
    if (totalHeld >= sessionConfig.capacity) {
      return NextResponse.json(
        {
          error: 'All sessions are currently at capacity.',
          details:
            'Seats may open up when pending reservations expire. Please check back in a few hours, or contact us to join the waitlist.',
          // Bug #1: expose sessionId so the frontend can link directly to the waitlist form
          sessionId: bestSession.sessionId,
          sessionLabel: sessionConfig.label,
        },
        { status: 422 },
      )
    }

    // ── Create the reservation ─────────────────────────────────────────────
    const enrollmentReference = generateEnrollmentReference()
    const reservationToken = generateReservationToken()
    const reservationExpiresAt = new Date(Date.now() + RESERVATION_WINDOW_MS)

    await Enrollment.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      city: cleanCity,
      productType,
      enrollmentReference,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      reservationType: 'manual_paystack',
      reservationToken,
      reservationExpiresAt,
      paymentWindowStatus: 'pending',
      selectedSession: {
        sessionId: sessionConfig.sessionId,
        dates: sessionConfig.dates,
        time: sessionConfig.time,
        venue: sessionConfig.venue,
        city: sessionConfig.city,
        isTwoDay: sessionConfig.isTwoDay,
      },
    })

    // ── Send confirmation email (non-blocking) ─────────────────────────────
    sendReservationConfirmation({
      name: cleanName,
      email: cleanEmail,
      enrollmentReference,
      productType,
      sessionLabel: sessionConfig.label,
      reservationToken,
      expiresAt: reservationExpiresAt,
    }).catch((err) =>
      console.error('[reserve] Confirmation email failed:', err),
    )

    return NextResponse.json(
      {
        success: true,
        enrollmentReference,
        expiresAt: reservationExpiresAt,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('[reserve] Error:', error)

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern ?? {})[0]
      if (field === 'email') {
        return NextResponse.json(
          { error: 'Email already registered.' },
          { status: 409 },
        )
      }
      if (field === 'reservationToken') {
        // Astronomically unlikely — just retry
        return NextResponse.json(
          { error: 'Token collision. Please try again.' },
          { status: 409 },
        )
      }
      return NextResponse.json(
        { error: 'Reference conflict. Please try again.' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: 'Reservation failed. Please try again.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
