'use client'

import { useState, useEffect, useCallback } from 'react'

import {
  LogOut,
  RefreshCw,
  Calendar,
  ChevronDown,
  BarChart3,
} from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import {
  AttendeeRecord,
  getAttendees,
  getCheckedInAttendees,
  getNotCheckedInAttendees,
  getSessionStats,
  PaginatedResponse,
  SessionStats,
} from '@/lib/admin/auth'
import StatsCards from '@/components/admin/stats-card'
import QRCodeDisplay from '@/components/admin/qr-code-display'
import AttendanceTable from '@/components/admin/attendance-table'

// Predefined sessions (in production, fetch from API)
const SESSIONS = [
  { id: 'session-2025-03-01', label: 'March 1, 2025 - Morning Session' },
  { id: 'session-2025-03-01-pm', label: 'March 1, 2025 - Afternoon Session' },
  { id: 'session-2025-03-15', label: 'March 15, 2025 - Full Day' },
  { id: 'session-2025-04-01', label: 'April 1, 2025 - Weekend Intensive' },
]

type ViewMode = 'all' | 'checked-in' | 'not-checked-in'

export default function AdminDashboard() {
  const { logout, isLoading: authLoading } = useAdminAuth({
    redirectIfNotAuth: true,
  })

  const [selectedSession, setSelectedSession] = useState(SESSIONS[0].id)
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const [stats, setStats] = useState<SessionStats['stats'] | null>(null)
  const [attendees, setAttendees] =
    useState<PaginatedResponse<AttendeeRecord> | null>(null)
  const [checkedIn, setCheckedIn] =
    useState<PaginatedResponse<AttendeeRecord> | null>(null)
  const [notCheckedIn, setNotCheckedIn] =
    useState<PaginatedResponse<AttendeeRecord> | null>(null)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [attendeesPage, setAttendeesPage] = useState(1)
  const [checkedInPage, setCheckedInPage] = useState(1)
  const [notCheckedInPage, setNotCheckedInPage] = useState(1)

  const fetchData = useCallback(async () => {
    if (!selectedSession) return

    setIsRefreshing(true)
    setError(null)

    try {
      const [statsRes, attendeesRes, checkedInRes, notCheckedInRes] =
        await Promise.all([
          getSessionStats(selectedSession),
          getAttendees(selectedSession, attendeesPage),
          getCheckedInAttendees(selectedSession, checkedInPage),
          getNotCheckedInAttendees(selectedSession, notCheckedInPage),
        ])

      setStats(statsRes.stats)
      setAttendees(attendeesRes)
      setCheckedIn(checkedInRes)
      setNotCheckedIn(notCheckedInRes)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
      console.error('Dashboard fetch error:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [selectedSession, attendeesPage, checkedInPage, notCheckedInPage])

  useEffect(() => {
    if (!authLoading) {
      fetchData()
    }
  }, [authLoading, fetchData])

  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId)
    setSessionDropdownOpen(false)
    // Reset pagination
    setAttendeesPage(1)
    setCheckedInPage(1)
    setNotCheckedInPage(1)
  }

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

  if (authLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-100'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-100'>
      {/* Header */}
      <header className='border-b-4 border-neutral-900 bg-neutral-950'>
        <div className='mx-auto max-w-7xl px-6 py-6'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h1 className='font-mono text-2xl font-bold uppercase tracking-tight text-white'>
                Event Management
              </h1>
              <p className='mt-1 font-mono text-sm text-neutral-400'>
                Masterclass Admin Dashboard
              </p>
            </div>

            <div className='flex items-center gap-3'>
              {/* Refresh */}
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

              {/* Logout */}
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

      <div className='mx-auto max-w-7xl px-6 py-8'>
        {/* Session Selector */}
        <div className='mb-8 border-4 border-neutral-900 bg-white'>
          <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
            <div className='flex items-center gap-3'>
              <Calendar className='h-5 w-5 text-white' strokeWidth={2} />
              <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                Session Selection
              </h2>
            </div>
          </div>

          <div className='p-6'>
            <div className='relative'>
              <button
                onClick={() => setSessionDropdownOpen((o) => !o)}
                className='flex w-full items-center justify-between border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-mono text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100'
              >
                <span>
                  {SESSIONS.find((s) => s.id === selectedSession)?.label ||
                    selectedSession}
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${sessionDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {sessionDropdownOpen && (
                <div className='absolute z-20 mt-1 w-full border-2 border-neutral-900 bg-white'>
                  {SESSIONS.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionChange(session.id)}
                      className={`w-full border-b border-neutral-200 px-4 py-3 text-left font-mono text-sm transition-colors last:border-b-0 hover:bg-neutral-100 ${
                        session.id === selectedSession
                          ? 'bg-neutral-950 font-bold text-white hover:bg-neutral-900'
                          : 'text-neutral-900'
                      }`}
                    >
                      {session.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className='mb-8 border-l-4 border-red-600 bg-red-50 p-6'>
            <p className='font-mono text-sm font-medium text-red-900'>
              {error}
            </p>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className='mb-8'>
            <div className='mb-4 flex items-center gap-3'>
              <BarChart3 className='h-5 w-5 text-neutral-900' strokeWidth={2} />
              <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-neutral-900'>
                Session Statistics
              </h2>
            </div>
            <StatsCards stats={stats} />
          </div>
        )}

        {/* QR Code */}
        <div className='mb-8'>
          <QRCodeDisplay sessionId={selectedSession} />
        </div>

        {/* View Mode Tabs */}
        <div className='mb-6 flex gap-2'>
          {[
            { mode: 'all' as ViewMode, label: 'All Attendees' },
            { mode: 'checked-in' as ViewMode, label: 'Checked In' },
            { mode: 'not-checked-in' as ViewMode, label: 'Not Checked In' },
          ].map(({ mode, label }) => (
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

        {/* Attendance Table */}
        {currentView && (
          <AttendanceTable
            data={currentView}
            onPageChange={(page) => currentPageSetter(page)}
            title={
              viewMode === 'all'
                ? 'All Live Attendees'
                : viewMode === 'checked-in'
                  ? 'Checked In Attendees'
                  : 'Not Checked In Attendees'
            }
            emptyMessage={
              viewMode === 'all'
                ? 'No attendees registered for this session'
                : viewMode === 'checked-in'
                  ? 'No attendees have checked in yet'
                  : 'All attendees have checked in'
            }
            isLoading={isRefreshing}
          />
        )}
      </div>
    </div>
  )
}
