'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LogOut,
  RefreshCw,
  Calendar,
  ChevronDown,
  BarChart3,
} from 'lucide-react'
import {
  type AttendeeRecord,
  type PaginatedResponse,
  type SessionStats,
  getAttendees,
  getCheckedInAttendees,
  getNotCheckedInAttendees,
  getSessionStats,
} from '@/lib/admin/auth'
import { SESSION_CONFIG, type SessionOption } from '@/lib/session-config'
import StatsCards from '@/components/admin/stats-card'
import QRCodeDisplay from '@/components/admin/qr-code-display'
import AttendanceTable from '@/components/admin/attendance-table'
import { useAdminAuth } from '@/lib/admin/useAdminAuth'

// ---------------------------------------------------------------------------
// Only Signature Live Masterclass sessions require physical check-in.
// Virtual and Consulting attendees don't attend in person.
// ---------------------------------------------------------------------------
const LIVE_SESSIONS: SessionOption[] =
  SESSION_CONFIG['Signature Live Masterclass'] ?? []

type ViewMode = 'all' | 'checked-in' | 'not-checked-in'

export default function AdminDashboard() {
  const { logout, isLoading: authLoading } = useAdminAuth({
    redirectIfNotAuth: true,
  })

  // ── Session + day selection ─────────────────────────────────────────────
  const [selectedSession, setSelectedSession] = useState<SessionOption>(
    LIVE_SESSIONS[0],
  )
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false)

  // All Signature sessions are 2-day, so always show the day selector.
  // Keeping this derived so it works if future sessions are single-day.
  const isTwoDay = selectedSession?.isTwoDay ?? false
  const [selectedDay, setSelectedDay] = useState<1 | 2>(1)

  // ── View mode + pagination ──────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [attendeesPage, setAttendeesPage] = useState(1)
  const [checkedInPage, setCheckedInPage] = useState(1)
  const [notCheckedInPage, setNotCheckedInPage] = useState(1)

  // ── Data ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<SessionStats['stats'] | null>(null)
  const [attendees, setAttendees] =
    useState<PaginatedResponse<AttendeeRecord> | null>(null)
  const [checkedIn, setCheckedIn] =
    useState<PaginatedResponse<AttendeeRecord> | null>(null)
  const [notCheckedIn, setNotCheckedIn] =
    useState<PaginatedResponse<AttendeeRecord> | null>(null)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!selectedSession) return

    setIsRefreshing(true)
    setError(null)

    try {
      const [statsRes, attendeesRes, checkedInRes, notCheckedInRes] =
        await Promise.all([
          getSessionStats(selectedSession.sessionId),
          getAttendees(selectedSession.sessionId, selectedDay, attendeesPage),
          getCheckedInAttendees(
            selectedSession.sessionId,
            selectedDay,
            checkedInPage,
          ),
          getNotCheckedInAttendees(
            selectedSession.sessionId,
            selectedDay,
            notCheckedInPage,
          ),
        ])

      setStats(statsRes.stats)
      setAttendees(attendeesRes)
      setCheckedIn(checkedInRes)
      setNotCheckedIn(notCheckedInRes)
    } catch (err: any) {
      setError(err.message || 'Failed to load data. Check your connection.')
      console.error('[dashboard] fetch error:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [
    selectedSession,
    selectedDay,
    attendeesPage,
    checkedInPage,
    notCheckedInPage,
  ])

  useEffect(() => {
    if (!authLoading) fetchData()
  }, [authLoading, fetchData])

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSessionChange = (session: SessionOption) => {
    setSelectedSession(session)
    setSessionDropdownOpen(false)
    setSelectedDay(1) // reset to Day 1 on session change
    setAttendeesPage(1)
    setCheckedInPage(1)
    setNotCheckedInPage(1)
  }

  const handleDayChange = (day: 1 | 2) => {
    setSelectedDay(day)
    setAttendeesPage(1)
    setCheckedInPage(1)
    setNotCheckedInPage(1)
  }

  // ── Current table data based on view mode ───────────────────────────────
  const currentView =
    viewMode === 'all'
      ? attendees
      : viewMode === 'checked-in'
        ? checkedIn
        : notCheckedIn

  const currentPageSetter =
    viewMode === 'all'
      ? setAttendeesPage
      : viewMode === 'checked-in'
        ? setCheckedInPage
        : setNotCheckedInPage

  const emptyMessages: Record<ViewMode, string> = {
    all: 'No registered attendees found for this session.',
    'checked-in': 'No attendees have checked in yet for this day.',
    'not-checked-in': 'All registered attendees have checked in for this day.',
  }

  const tableTitles: Record<ViewMode, string> = {
    all: 'All Live Attendees',
    'checked-in': `Checked In — Day ${selectedDay}`,
    'not-checked-in': `Not Yet Checked In — Day ${selectedDay}`,
  }

  // ── Loading state ───────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-100'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
      </div>
    )
  }

  if (LIVE_SESSIONS.length === 0) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-100 p-6'>
        <div className='border-4 border-neutral-900 bg-white p-8 text-center'>
          <p className='font-mono text-sm text-neutral-600'>
            No live sessions are configured in session-config.ts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-100'>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className='border-b-4 border-neutral-900 bg-neutral-950'>
        <div className='mx-auto max-w-7xl px-6 py-6'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h1 className='font-mono text-2xl font-bold uppercase tracking-tight text-white'>
                Event Management
              </h1>
              <p className='mt-0.5 font-mono text-sm text-neutral-400'>
                Trila Masterclass · Admin Dashboard
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className='flex items-center gap-2 border-2 border-white bg-neutral-950 px-4 py-2 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-white hover:text-neutral-950 disabled:opacity-50'
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>

              <button
                onClick={logout}
                className='flex items-center gap-2 border-2 border-red-600 bg-red-600 px-4 py-2 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-red-700'
              >
                <LogOut className='h-4 w-4' />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-7xl px-6 py-8 space-y-8'>
        {/* ── Session Selector ─────────────────────────────────────────── */}
        <div className='border-4 border-neutral-900 bg-white'>
          <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
            <div className='flex items-center gap-3'>
              <Calendar className='h-5 w-5 text-white' />
              <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                Session Selection
              </h2>
            </div>
          </div>

          <div className='p-6'>
            <div className='grid gap-4 sm:grid-cols-[1fr_auto]'>
              {/* Session dropdown */}
              <div>
                <p className='mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
                  Event City &amp; Date
                </p>
                <div className='relative'>
                  <button
                    onClick={() => setSessionDropdownOpen((o) => !o)}
                    className='flex w-full items-center justify-between border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-mono text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100'
                  >
                    <div className='text-left'>
                      <span className='font-bold'>{selectedSession.label}</span>
                      {selectedSession.venue && (
                        <span className='ml-2 text-neutral-500'>
                          · {selectedSession.venue}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform ${sessionDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {sessionDropdownOpen && (
                    <div className='absolute z-20 mt-1 w-full border-2 border-neutral-900 bg-white shadow-lg'>
                      {LIVE_SESSIONS.map((session) => (
                        <button
                          key={session.sessionId}
                          onClick={() => handleSessionChange(session)}
                          className={`w-full border-b border-neutral-200 px-4 py-3 text-left font-mono text-sm transition-colors last:border-b-0 hover:bg-neutral-100 ${
                            session.sessionId === selectedSession.sessionId
                              ? 'bg-neutral-950 font-bold text-white hover:bg-neutral-900'
                              : 'text-neutral-900'
                          }`}
                        >
                          <span className='font-bold'>{session.label}</span>
                          {session.venue && (
                            <span
                              className={`ml-2 text-xs ${
                                session.sessionId === selectedSession.sessionId
                                  ? 'text-neutral-400'
                                  : 'text-neutral-500'
                              }`}
                            >
                              {session.venue}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Day selector — always visible since all Signature sessions are 2-day */}
              {isTwoDay && (
                <div>
                  <p className='mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
                    Day
                  </p>
                  <div className='flex gap-2'>
                    {([1, 2] as const).map((day) => (
                      <button
                        key={day}
                        onClick={() => handleDayChange(day)}
                        className={`min-w-20 border-2 px-5 py-3 font-mono text-sm font-bold uppercase transition-colors ${
                          selectedDay === day
                            ? 'border-neutral-900 bg-neutral-950 text-white'
                            : 'border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-100'
                        }`}
                      >
                        Day {day}
                        <span className='block font-mono text-[9px] font-normal tracking-wide opacity-60'>
                          {selectedSession.dates[day - 1]
                            ? new Date(
                                selectedSession.dates[day - 1],
                              ).toLocaleDateString('en-NG', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <div className='border-l-4 border-red-600 bg-red-50 p-5'>
            <p className='font-mono text-sm font-medium text-red-900'>
              {error}
            </p>
            <button
              onClick={fetchData}
              className='mt-2 font-mono text-xs font-bold uppercase text-red-700 underline underline-offset-2 hover:text-red-900'
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        {stats && (
          <div>
            <div className='mb-4 flex items-center gap-3'>
              <BarChart3 className='h-5 w-5 text-neutral-900' />
              <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-neutral-900'>
                Session Statistics
              </h2>
            </div>
            <StatsCards
              stats={stats}
              selectedDay={selectedDay}
              isTwoDay={isTwoDay}
            />
          </div>
        )}

        {/* ── QR Code — one for each day ───────────────────────────────── */}
        <div className={`grid gap-6 ${isTwoDay ? 'lg:grid-cols-2' : ''}`}>
          <QRCodeDisplay
            sessionId={selectedSession.sessionId}
            day={1}
            sessionLabel={selectedSession.label}
          />
          {isTwoDay && (
            <QRCodeDisplay
              sessionId={selectedSession.sessionId}
              day={2}
              sessionLabel={selectedSession.label}
            />
          )}
        </div>

        {/* ── View Tabs ────────────────────────────────────────────────── */}
        <div>
          <div className='mb-6 flex flex-wrap gap-2'>
            {(
              [
                { mode: 'all' as ViewMode, label: 'All Attendees' },
                {
                  mode: 'checked-in' as ViewMode,
                  label: `Checked In · Day ${selectedDay}`,
                },
                {
                  mode: 'not-checked-in' as ViewMode,
                  label: `Not Checked In · Day ${selectedDay}`,
                },
              ] as const
            ).map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`border-2 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                  viewMode === mode
                    ? 'border-neutral-900 bg-neutral-950 text-white'
                    : 'border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Attendance Table ─────────────────────────────────────── */}
          {currentView ? (
            <AttendanceTable
              data={currentView}
              selectedDay={selectedDay}
              isTwoDay={isTwoDay}
              title={tableTitles[viewMode]}
              emptyMessage={emptyMessages[viewMode]}
              isLoading={isRefreshing}
              onPageChange={(page) => currentPageSetter(page)}
            />
          ) : isRefreshing ? (
            <div className='flex items-center justify-center border-4 border-neutral-900 bg-white py-16'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
