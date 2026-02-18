'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  Check,
} from 'lucide-react'
import { AttendeeRecord, PaginatedResponse } from '@/lib/admin/auth'

interface AttendanceTableProps {
  data: PaginatedResponse<AttendeeRecord>
  onPageChange: (page: number) => void
  title: string
  emptyMessage?: string
  isLoading?: boolean
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export default function AttendanceTable({
  data,
  onPageChange,
  title,
  emptyMessage = 'No attendees found',
  isLoading,
}: AttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedRef, setCopiedRef] = useState<string | null>(null)

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data.data

    const query = searchQuery.toLowerCase()
    return data.data.filter(
      (attendee) =>
        attendee.name.toLowerCase().includes(query) ||
        attendee.email.toLowerCase().includes(query) ||
        attendee.enrollmentReference.toLowerCase().includes(query) ||
        attendee.phone.includes(query),
    )
  }, [data.data, searchQuery])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedRef(id)
      setTimeout(() => setCopiedRef(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Enrollment Ref',
      'Product',
      'Access Tier',
      'Checked In',
      'Checked In At',
      'Registered At',
    ]

    const rows = filteredData.map((a) => [
      a.name,
      a.email,
      a.phone,
      a.enrollmentReference,
      a.productType,
      a.accessTier,
      a.checkedIn ? 'Yes' : 'No',
      a.checkedInAt ? formatDate(a.checkedInAt) : '',
      formatDate(a.createdAt),
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='border-4 border-neutral-900 bg-white'>
      {/* Header */}
      <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h3 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
              {title}
            </h3>
            <p className='mt-1 font-mono text-xs text-neutral-400'>
              {data.meta.totalCount} total records
            </p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search...'
                className='w-64 border-2 border-neutral-700 bg-neutral-900 py-2 pl-10 pr-4 font-mono text-sm text-white placeholder:text-neutral-500 focus:border-white focus:outline-none'
              />
            </div>

            {/* Export */}
            <button
              onClick={exportToCSV}
              className='flex items-center gap-2 border-2 border-white bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white'
            >
              <Download className='h-4 w-4' />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
          </div>
        ) : filteredData.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center gap-3'>
            <XCircle className='h-12 w-12 text-neutral-400' strokeWidth={1.5} />
            <p className='font-mono text-sm text-neutral-500'>{emptyMessage}</p>
          </div>
        ) : (
          <table className='w-full'>
            <thead>
              <tr className='border-b-2 border-neutral-900 bg-neutral-100'>
                <th className='px-6 py-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'>
                  Name
                </th>
                <th className='px-6 py-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'>
                  Email
                </th>
                <th className='px-6 py-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'>
                  Phone
                </th>
                <th className='px-6 py-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'>
                  Enrollment Ref
                </th>
                <th className='px-6 py-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'>
                  Product
                </th>
                <th className='px-6 py-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'>
                  Access
                </th>
                <th className='px-6 py-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'>
                  Status
                </th>
                <th className='px-6 py-3 text-left font-mono text-xs font-bold uppercase tracking-wider text-neutral-900'>
                  Checked In At
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((attendee, idx) => (
                <tr
                  key={attendee._id}
                  className={`border-b border-neutral-200 transition-colors hover:bg-neutral-50 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                  }`}
                >
                  <td className='px-6 py-4 font-mono text-sm font-medium text-neutral-900'>
                    {attendee.name}
                  </td>
                  <td className='px-6 py-4 font-mono text-sm text-neutral-600'>
                    {attendee.email}
                  </td>
                  <td className='px-6 py-4 font-mono text-sm text-neutral-600'>
                    {attendee.phone}
                  </td>
                  <td className='px-6 py-4'>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          attendee.enrollmentReference,
                          attendee._id,
                        )
                      }
                      className='group flex items-center gap-2 font-mono text-xs text-neutral-700 transition-colors hover:text-neutral-950'
                    >
                      <span>{attendee.enrollmentReference}</span>
                      {copiedRef === attendee._id ? (
                        <Check className='h-3 w-3 text-green-600' />
                      ) : (
                        <Copy className='h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100' />
                      )}
                    </button>
                  </td>
                  <td className='px-6 py-4 font-mono text-xs text-neutral-600'>
                    {attendee.productType}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex items-center border px-2 py-1 font-mono text-xs font-bold uppercase tracking-wider ${
                        attendee.accessTier === 'full'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-cyan-600 bg-cyan-50 text-cyan-700'
                      }`}
                    >
                      {attendee.accessTier}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    {attendee.checkedIn ? (
                      <div className='flex items-center gap-2 text-green-600'>
                        <CheckCircle2 className='h-4 w-4' strokeWidth={2} />
                        <span className='font-mono text-xs font-bold uppercase'>
                          In
                        </span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2 text-neutral-400'>
                        <XCircle className='h-4 w-4' strokeWidth={2} />
                        <span className='font-mono text-xs font-bold uppercase'>
                          Pending
                        </span>
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 font-mono text-xs text-neutral-500'>
                    {attendee.checkedInAt
                      ? formatDate(attendee.checkedInAt)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && filteredData.length > 0 && (
        <div className='border-t-2 border-neutral-900 bg-neutral-100 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <p className='font-mono text-xs text-neutral-600'>
              Page {data.meta.page} of {data.meta.totalPages} • Showing{' '}
              {filteredData.length} of {data.meta.totalCount} records
            </p>

            <div className='flex items-center gap-2'>
              <button
                onClick={() => onPageChange(data.meta.page - 1)}
                disabled={!data.meta.hasPrevPage}
                className='flex items-center gap-1 border-2 border-neutral-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-neutral-900 transition-colors hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-900'
              >
                <ChevronLeft className='h-4 w-4' />
                Prev
              </button>

              <button
                onClick={() => onPageChange(data.meta.page + 1)}
                disabled={!data.meta.hasNextPage}
                className='flex items-center gap-1 border-2 border-neutral-900 bg-white px-3 py-2 font-mono text-xs font-bold uppercase text-neutral-900 transition-colors hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-900'
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
