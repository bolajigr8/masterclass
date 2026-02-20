'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertTriangle, Loader2, Users } from 'lucide-react'
import { sendNotification, type NotifyPayload } from '@/lib/admin/auth'
import { SESSION_CONFIG } from '@/lib/session-config'

const ALL_SESSIONS = Object.entries(SESSION_CONFIG).flatMap(([, sessions]) =>
  sessions.map((s) => ({ value: s.sessionId, label: s.label })),
)

type SendState = 'idle' | 'sending' | 'success' | 'error'

const inputCls =
  'w-full border-2 border-neutral-900 bg-neutral-50 px-3 py-2.5 font-mono text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400'

const selectCls =
  'border-2 border-neutral-900 bg-neutral-50 px-3 py-2.5 font-mono text-xs text-neutral-900 focus:outline-none'

const labelCls =
  'mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'

export default function NotifyPanel() {
  const [subject, setSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [senderName, setSenderName] = useState('The Trila Masterclass Team')

  // Audience filter
  const [status, setStatus] = useState('confirmed')
  const [tier, setTier] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [customRefs, setCustomRefs] = useState('')

  const [sendState, setSendState] = useState<SendState>('idle')
  const [sentCount, setSentCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSend = async () => {
    if (!subject.trim() || !messageBody.trim()) return

    setSendState('sending')
    setErrorMsg('')

    const payload: NotifyPayload = {
      subject: subject.trim(),
      messageBody: messageBody.trim(),
      senderName: senderName.trim() || undefined,
      filter: {
        status: status || undefined,
        tier: (tier as any) || undefined,
        sessionId: sessionId || undefined,
        enrollmentReferences: customRefs.trim()
          ? customRefs
              .split(/[\n,]+/)
              .map((r) => r.trim().toUpperCase())
              .filter(Boolean)
          : undefined,
      },
    }

    try {
      const result = await sendNotification(payload)
      setSentCount(result.sent)
      setSendState('success')
    } catch (err: any) {
      setErrorMsg(err.message || 'Send failed. Please try again.')
      setSendState('error')
    }
  }

  const reset = () => {
    setSendState('idle')
    setSubject('')
    setMessageBody('')
    setCustomRefs('')
    setSentCount(0)
    setErrorMsg('')
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (sendState === 'success') {
    return (
      <div className='flex flex-col items-center justify-center border-4 border-neutral-900 bg-white py-20'>
        <CheckCircle2 className='mb-4 h-14 w-14 text-green-500' />
        <h2 className='mb-2 font-mono text-2xl font-black text-neutral-900'>
          Sent to {sentCount} Recipient{sentCount !== 1 ? 's' : ''}
        </h2>
        <p className='mb-8 font-mono text-sm text-neutral-500'>
          Your notification email has been dispatched via SendGrid.
        </p>
        <button
          onClick={reset}
          className='border-2 border-neutral-900 bg-neutral-950 px-8 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800'
        >
          Send Another
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='border-4 border-neutral-900 bg-white'>
        <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <Send className='h-5 w-5 text-white' />
            <div>
              <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                Send Notification Email
              </h2>
              <p className='font-mono text-xs text-neutral-400'>
                Compose and send a branded email to a filtered set of enrollees
              </p>
            </div>
          </div>
        </div>

        <div className='grid gap-8 p-6 lg:grid-cols-[1fr_380px]'>
          {/* ── Left: Compose ───────────────────────────────────────────── */}
          <div className='space-y-5'>
            <div>
              <label className={labelCls}>Email Subject</label>
              <input
                type='text'
                placeholder='e.g. Important update about your upcoming session'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Message Body
                <span className='ml-2 normal-case text-neutral-400'>
                  — Use{' '}
                  <code className='font-bold text-neutral-600'>{'{name}'}</code>{' '}
                  to personalise each email
                </span>
              </label>
              <textarea
                rows={10}
                placeholder={`Hi {name},\n\nWe wanted to share an update about your upcoming Trila Masterclass session.\n\n...`}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className={`${inputCls} resize-y`}
              />
              <p className='mt-1.5 font-mono text-[10px] text-neutral-400'>
                Plain text only. Line breaks are preserved. {'{name}'} is
                replaced with the recipient's first name at send time.
              </p>
            </div>

            <div>
              <label className={labelCls}>Sender Name</label>
              <input
                type='text'
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* ── Right: Audience + Send ───────────────────────────────────── */}
          <div className='space-y-5'>
            <div className='border-2 border-neutral-200 bg-neutral-50 p-5 space-y-4'>
              <div className='flex items-center gap-2 border-b border-neutral-200 pb-3'>
                <Users className='h-4 w-4 text-neutral-600' />
                <h3 className='font-mono text-xs font-bold uppercase tracking-wider text-neutral-700'>
                  Audience Filter
                </h3>
              </div>

              <div>
                <label className={labelCls}>Enrollment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`${selectCls} w-full`}
                >
                  <option value='confirmed'>Confirmed (paid)</option>
                  <option value='pending'>Pending (unpaid)</option>
                  <option value='cancelled'>Cancelled</option>
                  <option value=''>All Statuses</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Access Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className={`${selectCls} w-full`}
                >
                  <option value=''>All Tiers</option>
                  <option value='virtual'>Virtual Masterclass</option>
                  <option value='full'>Signature Live</option>
                  <option value='consulting'>Consulting</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Specific Session</label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className={`${selectCls} w-full`}
                >
                  <option value=''>All Sessions</option>
                  {ALL_SESSIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Target Specific References
                  <span className='ml-1 normal-case text-neutral-400'>
                    (optional, overrides above)
                  </span>
                </label>
                <textarea
                  rows={3}
                  placeholder={'ENR-1234567890-ABCD\nENR-0987654321-EFGH'}
                  value={customRefs}
                  onChange={(e) => setCustomRefs(e.target.value)}
                  className={`${inputCls} resize-none text-xs`}
                />
                <p className='mt-1 font-mono text-[10px] text-neutral-400'>
                  One reference per line, or comma-separated. Filters above are
                  ignored.
                </p>
              </div>
            </div>

            {/* Error */}
            {sendState === 'error' && (
              <div className='flex items-start gap-2 border-l-4 border-red-600 bg-red-50 px-4 py-3'>
                <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-red-600' />
                <p className='font-mono text-xs text-red-800'>{errorMsg}</p>
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={
                sendState === 'sending' ||
                !subject.trim() ||
                !messageBody.trim()
              }
              className='flex w-full items-center justify-center gap-3 border-2 border-neutral-900 bg-neutral-950 px-6 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {sendState === 'sending' ? (
                <>
                  <Loader2 className='h-5 w-5 animate-spin' />
                  Sending…
                </>
              ) : (
                <>
                  <Send className='h-5 w-5' />
                  Send Notification
                </>
              )}
            </button>

            <p className='text-center font-mono text-[10px] text-neutral-400'>
              Emails are sent via SendGrid in batches of 100. Max 2,000
              recipients per send.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
