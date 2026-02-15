import { NextResponse } from 'next/server'

type PaystackVerifyResponse = {
  status: boolean
  message: string
  data?: {
    status?: string
    reference?: string
    amount?: number
    currency?: string
    customer?: {
      email?: string
      first_name?: string
      last_name?: string
    }
    paid_at?: string
    channel?: string
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { reference?: string }
  const reference = body.reference

  if (!reference) {
    return NextResponse.json(
      { error: 'Missing payment reference' },
      { status: 400 },
    )
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    return NextResponse.json(
      { error: 'Paystack secret key is not configured' },
      { status: 500 },
    )
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  )

  const data = (await response.json()) as PaystackVerifyResponse

  if (!response.ok || !data.status) {
    return NextResponse.json(
      {
        error: 'Verification failed',
        message: data.message,
      },
      { status: response.status || 500 },
    )
  }

  const transaction = data.data

  return NextResponse.json(
    {
      status: transaction?.status,
      reference: transaction?.reference,
      amount: transaction?.amount,
      currency: transaction?.currency,
      customer: {
        email: transaction?.customer?.email,
        firstName: transaction?.customer?.first_name,
        lastName: transaction?.customer?.last_name,
      },
      paidAt: transaction?.paid_at,
      channel: transaction?.channel,
    },
    { status: 200 },
  )
}

