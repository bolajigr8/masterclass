// import { NextRequest, NextResponse } from 'next/server'
// import connectToDatabase from '@/lib/mongodb'
// import Enrollment from '@/models/Enrollment'
// import { getAccessTier, getPrice, isValidProductType } from '@/lib/pricing'
// import { verifyAdminAuth } from '@/lib/adminAuth'
// import {
//   sendVirtualAccessConfirmation,
//   sendFullAccessConfirmation,
//   sendConsultingConfirmation,
// } from '@/lib/email'

// /**
//  * POST /api/admin/confirm-payment
//  *
//  * Protected admin-only endpoint. Marks a manual reservation as paid
//  * and dispatches the appropriate confirmation email with credentials.
//  *
//  * This is intentionally separate from /api/payment/verify (Paystack).
//  * It is called by an admin after verifying receipt of payment via
//  * bank transfer, Payoneer, or any other manual channel.
//  *
//  * Authentication: same verifyAdminAuth used across all admin routes.
//  *   Authorization: Bearer <ADMIN_PASSWORD>
//  *
//  * Body:
//  *   enrollmentReference  string  required
//  *   paymentReference     string  required  — your internal payment note / transaction ID
//  *   productType          string  optional  — override if different from reservation
//  *   sessionId            string  optional  — override assigned session if needed
//  *
//  * Responses:
//  *   200  { success, emailSent, enrollment }
//  *   400  missing fields
//  *   401  missing or invalid credentials
//  *   404  enrollment not found
//  *   409  already confirmed
//  *   500  unexpected error
//  */
// export async function POST(request: NextRequest) {
//   // ── Auth guard ─────────────────────────────────────────────────────────────
//   const authError = verifyAdminAuth(request)
//   if (authError) return authError

//   try {
//     const body = await request.json()
//     const { enrollmentReference, paymentReference, productType, sessionId } =
//       body

//     if (!enrollmentReference || !paymentReference) {
//       return NextResponse.json(
//         {
//           error: 'Missing required fields.',
//           details:
//             'enrollmentReference and paymentReference are both required.',
//         },
//         { status: 400 },
//       )
//     }

//     if (productType && !isValidProductType(productType)) {
//       return NextResponse.json(
//         { error: 'Invalid product type.' },
//         { status: 400 },
//       )
//     }

//     await connectToDatabase()

//     const enrollment = await Enrollment.findOne({ enrollmentReference })

//     if (!enrollment) {
//       return NextResponse.json(
//         { error: 'Enrollment not found.' },
//         { status: 404 },
//       )
//     }

//     // ── Idempotency guard ──────────────────────────────────────────────────
//     if (enrollment.paymentStatus === 'success') {
//       return NextResponse.json(
//         {
//           success: true,
//           alreadyConfirmed: true,
//           message: 'This enrollment is already confirmed.',
//           enrollment: buildResponse(enrollment),
//         },
//         { status: 200 },
//       )
//     }

//     // ── Resolve final product type and access tier ─────────────────────────
//     const finalProductType = productType ?? enrollment.productType
//     if (!finalProductType || !isValidProductType(finalProductType)) {
//       return NextResponse.json(
//         {
//           error: 'Cannot determine product type.',
//           details:
//             'The enrollment has no productType set. Pass productType in the request body.',
//         },
//         { status: 400 },
//       )
//     }

//     const accessTier = getAccessTier(finalProductType)!

//     // ── Determine session details ──────────────────────────────────────────
//     // Use the overridden sessionId if provided; fall back to what was reserved.
//     let sessionDetails = enrollment.selectedSession

//     if (sessionId && sessionId !== sessionDetails?.sessionId) {
//       // Admin is reassigning to a different session — we only have the ID here
//       // so we can't fully hydrate session dates without a DB lookup, but the
//       // email sender only needs what's already stored or what admin provides.
//       // For a full session override, admin should use the session management UI.
//       // We'll update the sessionId reference and note it in the response.
//       if (sessionDetails) {
//         sessionDetails = { ...sessionDetails, sessionId }
//       }
//     }

//     // ── Derive expected amount from product (mirrors payment/verify) ──────
//     const expectedAmount = getPrice(finalProductType) ?? 0

//     // ── Update the enrollment ──────────────────────────────────────────────
//     enrollment.paymentStatus = 'success'
//     enrollment.bookingStatus = 'confirmed'
//     enrollment.paymentReference = paymentReference
//     enrollment.productType = finalProductType
//     enrollment.accessTier = accessTier
//     enrollment.paymentWindowStatus = 'paid'
//     enrollment.expectedAmount = expectedAmount
//     enrollment.amountPaid = expectedAmount // required for revenue analytics
//     if (sessionDetails) enrollment.selectedSession = sessionDetails

//     // ── Invalidate the token via $unset so the sparse index stays clean ────
//     await enrollment.save()
//     await enrollment.updateOne({ $unset: { reservationToken: '' } })

//     // ── Dispatch confirmation email ────────────────────────────────────────
//     const emailParams = {
//       name: enrollment.name,
//       email: enrollment.email,
//       enrollmentReference: enrollment.enrollmentReference,
//       productType: finalProductType,
//       sessionDates: sessionDetails?.dates ?? [],
//       sessionTime: sessionDetails?.time ?? '',
//       sessionVenue: sessionDetails?.venue,
//       sessionCity: sessionDetails?.city,
//       isTwoDay: sessionDetails?.isTwoDay ?? false,
//     }

//     let emailSent = false
//     try {
//       if (accessTier === 'virtual') {
//         await sendVirtualAccessConfirmation(emailParams)
//       } else if (accessTier === 'full') {
//         await sendFullAccessConfirmation(emailParams)
//       } else if (accessTier === 'consulting') {
//         await sendConsultingConfirmation(emailParams)
//       }
//       emailSent = true
//     } catch (emailErr) {
//       console.error(
//         '[admin/confirm-payment] Confirmation email failed:',
//         emailErr,
//       )
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         emailSent,
//         message: 'Payment confirmed and enrollment activated.',
//         enrollment: buildResponse(enrollment),
//       },
//       { status: 200 },
//     )
//   } catch (error: any) {
//     console.error('[admin/confirm-payment] Error:', error)

//     if (error.code === 11000 && error.keyPattern?.paymentReference) {
//       return NextResponse.json(
//         { error: 'Payment reference already used on another enrollment.' },
//         { status: 409 },
//       )
//     }

//     return NextResponse.json(
//       {
//         error: 'Failed to confirm payment.',
//         details:
//           process.env.NODE_ENV === 'development' ? error.message : undefined,
//       },
//       { status: 500 },
//     )
//   }
// }

// // ─── Helper ───────────────────────────────────────────────────────────────────

// function buildResponse(enrollment: any) {
//   return {
//     enrollmentReference: enrollment.enrollmentReference,
//     name: enrollment.name,
//     email: enrollment.email,
//     productType: enrollment.productType,
//     selectedSession: enrollment.selectedSession,
//     accessTier: enrollment.accessTier,
//     bookingStatus: enrollment.bookingStatus,
//     paymentWindowStatus: enrollment.paymentWindowStatus,
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Waitlist from '@/models/Waitlist'
import { getAccessTier, getPrice, isValidProductType } from '@/lib/pricing'
import { verifyAdminAuth } from '@/lib/adminAuth'
import {
  sendVirtualAccessConfirmation,
  sendFullAccessConfirmation,
  sendConsultingConfirmation,
} from '@/lib/email'

/**
 * POST /api/admin/confirm-payment
 *
 * Protected admin-only endpoint. Marks a manual reservation as paid
 * and dispatches the appropriate confirmation email with credentials.
 *
 * This is intentionally separate from /api/payment/verify (Paystack).
 * It is called by an admin after verifying receipt of payment via
 * bank transfer, Payoneer, or any other manual channel.
 *
 * Authentication: same verifyAdminAuth used across all admin routes.
 *   Authorization: Bearer <ADMIN_PASSWORD>
 *
 * Body:
 *   enrollmentReference  string  required
 *   paymentReference     string  required  — your internal payment note / transaction ID
 *   productType          string  optional  — override if different from reservation
 *   sessionId            string  optional  — override assigned session if needed
 *
 * Responses:
 *   200  { success, emailSent, enrollment }
 *   400  missing fields
 *   401  missing or invalid credentials
 *   404  enrollment not found
 *   409  already confirmed
 *   500  unexpected error
 */
export async function POST(request: NextRequest) {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const authError = verifyAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { enrollmentReference, paymentReference, productType, sessionId } =
      body

    if (!enrollmentReference || !paymentReference) {
      return NextResponse.json(
        {
          error: 'Missing required fields.',
          details:
            'enrollmentReference and paymentReference are both required.',
        },
        { status: 400 },
      )
    }

    if (productType && !isValidProductType(productType)) {
      return NextResponse.json(
        { error: 'Invalid product type.' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const enrollment = await Enrollment.findOne({ enrollmentReference })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found.' },
        { status: 404 },
      )
    }

    // ── Idempotency guard ──────────────────────────────────────────────────
    if (enrollment.paymentStatus === 'success') {
      return NextResponse.json(
        {
          success: true,
          alreadyConfirmed: true,
          message: 'This enrollment is already confirmed.',
          enrollment: buildResponse(enrollment),
        },
        { status: 200 },
      )
    }

    // ── Resolve final product type and access tier ─────────────────────────
    const finalProductType = productType ?? enrollment.productType
    if (!finalProductType || !isValidProductType(finalProductType)) {
      return NextResponse.json(
        {
          error: 'Cannot determine product type.',
          details:
            'The enrollment has no productType set. Pass productType in the request body.',
        },
        { status: 400 },
      )
    }

    const accessTier = getAccessTier(finalProductType)!

    // ── Determine session details ──────────────────────────────────────────
    // Use the overridden sessionId if provided; fall back to what was reserved.
    let sessionDetails = enrollment.selectedSession

    if (sessionId && sessionId !== sessionDetails?.sessionId) {
      // Admin is reassigning to a different session — we only have the ID here
      // so we can't fully hydrate session dates without a DB lookup, but the
      // email sender only needs what's already stored or what admin provides.
      // For a full session override, admin should use the session management UI.
      // We'll update the sessionId reference and note it in the response.
      if (sessionDetails) {
        sessionDetails = { ...sessionDetails, sessionId }
      }
    }

    // ── Derive expected amount from product (mirrors payment/verify) ──────
    const expectedAmount = getPrice(finalProductType) ?? 0

    // ── Update the enrollment ──────────────────────────────────────────────
    enrollment.paymentStatus = 'success'
    enrollment.bookingStatus = 'confirmed'
    enrollment.paymentReference = paymentReference
    enrollment.productType = finalProductType
    enrollment.accessTier = accessTier
    enrollment.paymentWindowStatus = 'paid'
    enrollment.expectedAmount = expectedAmount
    enrollment.amountPaid = expectedAmount // required for revenue analytics
    if (sessionDetails) enrollment.selectedSession = sessionDetails

    // ── Invalidate the token via $unset so the sparse index stays clean ────
    await enrollment.save()
    await enrollment.updateOne({ $unset: { reservationToken: '' } })

    // ── Bug #2 fix: mark matching waitlist entry as converted ──────────────
    // If this person was promoted from the waitlist and then paid via a manual
    // channel, the Waitlist entry would otherwise stay in 'notified' status
    // forever, double-counting the seat and potentially blocking the next
    // promotion. We use the session from sessionDetails (which may be
    // admin-overridden), falling back to the resolved session id from body.
    const resolvedSessionId = sessionDetails?.sessionId ?? sessionId ?? null
    if (resolvedSessionId && enrollment.email) {
      Waitlist.findOneAndUpdate(
        {
          sessionId: resolvedSessionId,
          email: enrollment.email,
          status: 'notified',
        },
        {
          status: 'converted',
          convertedAt: new Date(),
        },
      ).catch((err) =>
        console.error(
          '[admin/confirm-payment] Waitlist conversion update failed:',
          err,
        ),
      )
    }

    // ── Dispatch confirmation email ────────────────────────────────────────
    const emailParams = {
      name: enrollment.name,
      email: enrollment.email,
      enrollmentReference: enrollment.enrollmentReference,
      productType: finalProductType,
      sessionDates: sessionDetails?.dates ?? [],
      sessionTime: sessionDetails?.time ?? '',
      sessionVenue: sessionDetails?.venue,
      sessionCity: sessionDetails?.city,
      isTwoDay: sessionDetails?.isTwoDay ?? false,
    }

    let emailSent = false
    try {
      if (accessTier === 'virtual') {
        await sendVirtualAccessConfirmation(emailParams)
      } else if (accessTier === 'full') {
        await sendFullAccessConfirmation(emailParams)
      } else if (accessTier === 'consulting') {
        await sendConsultingConfirmation(emailParams)
      }
      emailSent = true
    } catch (emailErr) {
      console.error(
        '[admin/confirm-payment] Confirmation email failed:',
        emailErr,
      )
    }

    return NextResponse.json(
      {
        success: true,
        emailSent,
        message: 'Payment confirmed and enrollment activated.',
        enrollment: buildResponse(enrollment),
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error('[admin/confirm-payment] Error:', error)

    if (error.code === 11000 && error.keyPattern?.paymentReference) {
      return NextResponse.json(
        { error: 'Payment reference already used on another enrollment.' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to confirm payment.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildResponse(enrollment: any) {
  return {
    enrollmentReference: enrollment.enrollmentReference,
    name: enrollment.name,
    email: enrollment.email,
    productType: enrollment.productType,
    selectedSession: enrollment.selectedSession,
    accessTier: enrollment.accessTier,
    bookingStatus: enrollment.bookingStatus,
    paymentWindowStatus: enrollment.paymentWindowStatus,
  }
}
