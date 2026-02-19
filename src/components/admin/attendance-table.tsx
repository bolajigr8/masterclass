'use client'

import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import type { AttendeeRecord, PaginatedResponse } from '@/lib/admin/auth'

interface AttendanceTableProps {
  data: PaginatedResponse<AttendeeRecord>
  selectedDay: 1 | 2
  isTwoDay: boolean
  title: string
  emptyMessage: string
  isLoading: boolean
  onPageChange: (page: number) => void
}

function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function CheckInBadge({
  checked,
  at,
  label,
}: {
  checked: boolean
  at?: string
  label: string
}) {
  return (
    <div className='flex flex-col gap-0.5'>
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
          checked ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'
        }`}
      >
        {checked ? (
          <CheckCircle2 className='h-3 w-3' />
        ) : (
          <XCircle className='h-3 w-3' />
        )}
        {label}: {checked ? 'Yes' : 'No'}
      </div>
      {checked && at && (
        <div className='flex items-center gap-1 font-mono text-[10px] text-neutral-500'>
          <Clock className='h-2.5 w-2.5' />
          {formatDateTime(at)}
        </div>
      )}
    </div>
  )
}

export default function AttendanceTable({
  data,
  selectedDay,
  isTwoDay,
  title,
  emptyMessage,
  isLoading,
  onPageChange,
}: AttendanceTableProps) {
  const { meta } = data

  return (
    <div
      className={`border-4 border-neutral-900 bg-white transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Table header */}
      <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
            {title}
          </h2>
          <span className='font-mono text-xs text-neutral-400'>
            {meta.totalCount} attendee{meta.totalCount !== 1 ? 's' : ''}
            {meta.totalPages > 1 &&
              ` · Page ${meta.page} of ${meta.totalPages}`}
          </span>
        </div>
      </div>

      {data.data.length === 0 ? (
        <div className='px-6 py-12 text-center'>
          <p className='font-mono text-sm text-neutral-400'>{emptyMessage}</p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b-2 border-neutral-900 bg-neutral-100'>
                {[
                  'Name',
                  'Email',
                  'Phone',
                  'Reference',
                  isTwoDay ? 'Day 1 Check-In' : 'Check-In',
                  ...(isTwoDay ? ['Day 2 Check-In'] : []),
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
              {data.data.map((attendee, i) => (
                <tr
                  key={attendee._id}
                  className={`border-b border-neutral-200 transition-colors hover:bg-neutral-50 ${
                    i % 2 === 0 ? '' : 'bg-neutral-50/50'
                  }`}
                >
                  <td className='px-4 py-3'>
                    <p className='font-mono text-sm font-semibold text-neutral-900'>
                      {attendee.name}
                    </p>
                    {attendee.productType && (
                      <p className='font-mono text-[10px] text-neutral-400'>
                        {attendee.productType}
                      </p>
                    )}
                  </td>

                  <td className='px-4 py-3 font-mono text-xs text-neutral-600'>
                    {attendee.email}
                  </td>

                  <td className='px-4 py-3 font-mono text-xs text-neutral-600'>
                    {attendee.phone}
                  </td>

                  <td className='px-4 py-3'>
                    <code className='rounded bg-neutral-100 px-2 py-0.5 font-mono text-[11px] font-bold text-neutral-800'>
                      {attendee.enrollmentReference}
                    </code>
                  </td>

                  {/* Day 1 check-in */}
                  <td className='px-4 py-3'>
                    <CheckInBadge
                      checked={attendee.checkedInDay1}
                      at={attendee.checkedInDay1At}
                      label='D1'
                    />
                  </td>

                  {/* Day 2 check-in — only shown for 2-day sessions */}
                  {isTwoDay && (
                    <td className='px-4 py-3'>
                      <CheckInBadge
                        checked={attendee.checkedInDay2}
                        at={attendee.checkedInDay2At}
                        label='D2'
                      />
                    </td>
                  )}

                  <td className='px-4 py-3 font-mono text-[11px] text-neutral-400'>
                    {formatDateTime(attendee.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className='flex items-center justify-between border-t-2 border-neutral-200 px-6 py-4'>
          <button
            onClick={() => onPageChange(meta.page - 1)}
            disabled={!meta.hasPrevPage || isLoading}
            className='flex items-center gap-2 border-2 border-neutral-900 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
          >
            <ChevronLeft className='h-4 w-4' />
            Previous
          </button>

          <span className='font-mono text-xs text-neutral-500'>
            {(meta.page - 1) * meta.limit + 1}–
            {Math.min(meta.page * meta.limit, meta.totalCount)} of{' '}
            {meta.totalCount}
          </span>

          <button
            onClick={() => onPageChange(meta.page + 1)}
            disabled={!meta.hasNextPage || isLoading}
            className='flex items-center gap-2 border-2 border-neutral-900 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide text-neutral-900 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
          >
            Next
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  )
}
