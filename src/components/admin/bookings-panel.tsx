'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import {
  type EnrollmentRecord,
  type PaginatedResponse,
  type EnrollmentFilters,
  getEnrollments,
  buildExportUrl,
} from '@/lib/admin/auth'
import { SESSION_CONFIG } from '@/lib/session-config'

const ALL_SESSIONS = Object.entries(SESSION_CONFIG).flatMap(([, sessions]) =>
  sessions.map((s) => ({ value: s.sessionId, label: s.label })),
)

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function fmtNaira(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`
}

function StatusBadge({ enrollment }: { enrollment: EnrollmentRecord }) {
  if (enrollment.cancelledAt) {
    return (
      <span className='inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-red-700'>
        <XCircle className='h-3 w-3' />
        Cancelled
      </span>
    )
  }
  if (
    enrollment.paymentStatus === 'success' &&
    enrollment.bookingStatus === 'confirmed'
  ) {
    return (
      <span className='inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-green-800'>
        <CheckCircle2 className='h-3 w-3' />
        Confirmed
      </span>
    )
  }
  return (
    <span className='inline-flex items-center gap-1 rounded bg-yellow-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-yellow-800'>
      <Clock className='h-3 w-3' />
      Pending
    </span>
  )
}

const TIER_LABEL: Record<string, string> = {
  virtual: 'Virtual',
  full: 'Live',
  consulting: 'Consulting',
}

export default function BookingsPanel() {
  const [filters, setFilters] = useState<EnrollmentFilters>({
    status: 'confirmed',
    sortBy: 'createdAt',
    sortDir: 'desc',
    page: 1,
  })
  const [search, setSearch] = useState('')
  const [data, setData] = useState<PaginatedResponse<EnrollmentRecord> | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getEnrollments({
        ...filters,
        search: search.trim() || undefined,
      })
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateFilter = (key: keyof EnrollmentFilters, value: any) => {
    setFilters((f) => ({ ...f, [key]: value || undefined, page: 1 }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, page: 1 }))
  }

  const exportUrl = buildExportUrl({
    ...filters,
    search: search.trim() || undefined,
  })

  const inputCls =
    'border-2 border-neutral-900 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900'
  const selectCls = `${inputCls} cursor-pointer`

  return (
    <div className='space-y-6'>
      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className='border-4 border-neutral-900 bg-white'>
        <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <Filter className='h-5 w-5 text-white' />
              <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                Bookings
              </h2>
            </div>
            <a
              href={exportUrl}
              className='flex items-center gap-2 border-2 border-white bg-neutral-950 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-neutral-950'
            >
              <Download className='h-4 w-4' />
              Export CSV
            </a>
          </div>
        </div>

        <div className='p-6 space-y-4'>
          {/* Search */}
          <form onSubmit={handleSearch} className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400' />
              <input
                type='text'
                placeholder='Search name, email, or reference…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full border-2 border-neutral-900 bg-neutral-50 pl-9 pr-4 py-2 font-mono text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900'
              />
            </div>
            <button
              type='submit'
              className='border-2 border-neutral-900 bg-neutral-950 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-neutral-800'
            >
              Search
            </button>
            {search && (
              <button
                type='button'
                onClick={() => {
                  setSearch('')
                  setFilters((f) => ({ ...f, page: 1 }))
                }}
                className='border-2 border-neutral-300 bg-white px-3 py-2 text-neutral-600 hover:bg-neutral-100'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </form>

          {/* Filter row */}
          <div className='flex flex-wrap gap-3'>
            <select
              value={filters.status ?? ''}
              onChange={(e) => updateFilter('status', e.target.value)}
              className={selectCls}
            >
              <option value=''>All Statuses</option>
              <option value='confirmed'>Confirmed</option>
              <option value='pending'>Pending</option>
              <option value='cancelled'>Cancelled</option>
            </select>

            <select
              value={filters.tier ?? ''}
              onChange={(e) => updateFilter('tier', e.target.value)}
              className={selectCls}
            >
              <option value=''>All Tiers</option>
              <option value='virtual'>Virtual</option>
              <option value='full'>Live (Signature)</option>
              <option value='consulting'>Consulting</option>
            </select>

            <select
              value={filters.sessionId ?? ''}
              onChange={(e) => updateFilter('sessionId', e.target.value)}
              className={selectCls}
            >
              <option value=''>All Sessions</option>
              {ALL_SESSIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy ?? 'createdAt'}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className={selectCls}
            >
              <option value='createdAt'>Sort: Date Registered</option>
              <option value='amountPaid'>Sort: Amount Paid</option>
              <option value='name'>Sort: Name</option>
            </select>

            <select
              value={filters.sortDir ?? 'desc'}
              onChange={(e) => updateFilter('sortDir', e.target.value)}
              className={selectCls}
            >
              <option value='desc'>Newest First</option>
              <option value='asc'>Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className='border-l-4 border-red-600 bg-red-50 p-4'>
          <p className='font-mono text-sm text-red-900'>{error}</p>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div
        className={`border-4 border-neutral-900 bg-white transition-opacity ${loading ? 'opacity-50' : ''}`}
      >
        {/* Meta */}
        <div className='border-b-2 border-neutral-200 px-6 py-3'>
          <p className='font-mono text-xs text-neutral-500'>
            {data
              ? `${data.meta.totalCount} enrollment${data.meta.totalCount !== 1 ? 's' : ''}`
              : '—'}
          </p>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b-2 border-neutral-900 bg-neutral-100'>
                {[
                  'Name / Email',
                  'Reference',
                  'Product',
                  'Tier',
                  'Amount',
                  'Status',
                  'Session',
                  'Registered',
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
                    colSpan={8}
                    className='px-6 py-12 text-center font-mono text-sm text-neutral-400'
                  >
                    No enrollments match the current filters.
                  </td>
                </tr>
              ) : (
                data?.data.map((e, i) => (
                  <tr
                    key={e._id}
                    className={`border-b border-neutral-200 hover:bg-neutral-50 ${i % 2 === 0 ? '' : 'bg-neutral-50/50'}`}
                  >
                    <td className='px-4 py-3'>
                      <p className='font-mono text-sm font-semibold text-neutral-900'>
                        {e.name}
                      </p>
                      <p className='font-mono text-xs text-neutral-500'>
                        {e.email}
                      </p>
                    </td>
                    <td className='px-4 py-3'>
                      <code className='rounded bg-neutral-100 px-2 py-0.5 font-mono text-[11px] font-bold text-neutral-800'>
                        {e.enrollmentReference}
                      </code>
                    </td>
                    <td className='px-4 py-3 font-mono text-xs text-neutral-600'>
                      {e.productType ?? '—'}
                    </td>
                    <td className='px-4 py-3 font-mono text-xs font-semibold text-neutral-700'>
                      {TIER_LABEL[e.accessTier ?? ''] ?? '—'}
                    </td>
                    <td className='px-4 py-3 font-mono text-xs font-bold text-neutral-900'>
                      {fmtNaira(e.amountPaid)}
                    </td>
                    <td className='px-4 py-3'>
                      <StatusBadge enrollment={e} />
                    </td>
                    <td className='px-4 py-3 font-mono text-xs text-neutral-600'>
                      {e.selectedSession?.city ?? '—'}
                      {e.selectedSession?.dates?.[0] && (
                        <span className='block text-neutral-400'>
                          {fmtDate(e.selectedSession.dates[0])}
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-3 font-mono text-[11px] text-neutral-400'>
                      {fmtDate(e.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className='flex items-center justify-between border-t-2 border-neutral-200 px-6 py-4'>
            <button
              onClick={() => updateFilter('page', (filters.page ?? 1) - 1)}
              disabled={!data.meta.hasPrevPage || loading}
              className='flex items-center gap-2 border-2 border-neutral-900 px-4 py-2 font-mono text-xs font-bold uppercase disabled:opacity-40 hover:bg-neutral-100'
            >
              <ChevronLeft className='h-4 w-4' /> Previous
            </button>
            <span className='font-mono text-xs text-neutral-500'>
              Page {data.meta.page} of {data.meta.totalPages}
            </span>
            <button
              onClick={() => updateFilter('page', (filters.page ?? 1) + 1)}
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
