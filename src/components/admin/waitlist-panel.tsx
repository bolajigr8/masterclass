'use client'

import { useState, useEffect } from 'react'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getWaitlist,
  type WaitlistRecord,
  type PaginatedResponse,
} from '@/lib/admin/auth'
import { SESSION_CONFIG } from '@/lib/session-config'

const ALL_LIVE_SESSIONS = Object.entries(SESSION_CONFIG).flatMap(
  ([, sessions]) =>
    sessions.map((s) => ({ value: s.sessionId, label: s.label })),
)

function StatusBadge({ status }: { status: WaitlistRecord['status'] }) {
  const map: Record<WaitlistRecord['status'], string> = {
    waiting: 'bg-yellow-100 text-yellow-800',
    notified: 'bg-blue-100 text-blue-800',
    converted: 'bg-green-100 text-green-800',
    expired: 'bg-neutral-100 text-neutral-500',
    removed: 'bg-red-100 text-red-700',
  }
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${map[status]}`}
    >
      {status}
    </span>
  )
}

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function WaitlistPanel() {
  const [sessionId, setSessionId] = useState(ALL_LIVE_SESSIONS[0]?.value ?? '')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedResponse<WaitlistRecord> | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    try {
      const result = await getWaitlist(
        sessionId,
        statusFilter || undefined,
        page,
      )
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [sessionId, statusFilter, page])

  const selCls =
    'border-2 border-neutral-900 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-900 focus:outline-none'

  return (
    <div className='space-y-6'>
      <div className='border-4 border-neutral-900 bg-white'>
        <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <Clock className='h-5 w-5 text-white' />
            <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
              Waitlist Manager
            </h2>
          </div>
        </div>
        <div className='flex flex-wrap gap-3 p-6'>
          <select
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value)
              setPage(1)
            }}
            className={selCls}
          >
            {ALL_LIVE_SESSIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className={selCls}
          >
            <option value=''>All Statuses</option>
            <option value='waiting'>Waiting</option>
            <option value='notified'>Notified</option>
            <option value='converted'>Converted</option>
            <option value='expired'>Expired</option>
            <option value='removed'>Removed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className='border-l-4 border-red-600 bg-red-50 p-4'>
          <p className='font-mono text-sm text-red-900'>{error}</p>
        </div>
      )}

      <div
        className={`border-4 border-neutral-900 bg-white transition-opacity ${loading ? 'opacity-50' : ''}`}
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b-2 border-neutral-900 bg-neutral-100'>
                {[
                  'Pos',
                  'Name / Email',
                  'Phone',
                  'Status',
                  'Notified At',
                  'Expires At',
                  'Joined',
                ].map((h) => (
                  <th
                    key={h}
                    className='px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-600'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-12 text-center font-mono text-sm text-neutral-400'
                  >
                    No waitlist entries for this session.
                  </td>
                </tr>
              ) : (
                data?.data.map((w, i) => (
                  <tr
                    key={w._id}
                    className={`border-b border-neutral-200 hover:bg-neutral-50 ${i % 2 === 0 ? '' : 'bg-neutral-50/50'}`}
                  >
                    <td className='px-4 py-3 font-mono text-sm font-black text-neutral-900'>
                      #{w.position}
                    </td>
                    <td className='px-4 py-3'>
                      <p className='font-mono text-sm font-semibold text-neutral-900'>
                        {w.name}
                      </p>
                      <p className='font-mono text-xs text-neutral-500'>
                        {w.email}
                      </p>
                    </td>
                    <td className='px-4 py-3 font-mono text-xs text-neutral-600'>
                      {w.phone}
                    </td>
                    <td className='px-4 py-3'>
                      <StatusBadge status={w.status} />
                    </td>
                    <td className='px-4 py-3 font-mono text-[11px] text-neutral-500'>
                      {fmtDate(w.notifiedAt)}
                    </td>
                    <td className='px-4 py-3 font-mono text-[11px] text-neutral-500'>
                      {fmtDate(w.confirmationExpiresAt)}
                    </td>
                    <td className='px-4 py-3 font-mono text-[11px] text-neutral-400'>
                      {fmtDate(w.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.meta.totalPages > 1 && (
          <div className='flex items-center justify-between border-t-2 border-neutral-200 px-6 py-4'>
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!data.meta.hasPrevPage || loading}
              className='flex items-center gap-2 border-2 border-neutral-900 px-4 py-2 font-mono text-xs font-bold uppercase disabled:opacity-40 hover:bg-neutral-100'
            >
              <ChevronLeft className='h-4 w-4' /> Previous
            </button>
            <span className='font-mono text-xs text-neutral-500'>
              Page {data.meta.page} of {data.meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.meta.hasNextPage || loading}
              className='flex items-center gap-2 border-2 border-neutral-900 px-4 py-2 font-mono text-xs font-bold uppercase disabled:opacity-40 hover:bg-neutral-100'
            >
              Next <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
