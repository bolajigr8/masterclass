// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import {
//   LogOut,
//   RefreshCw,
//   Calendar,
//   ChevronDown,
//   BarChart3,
// } from 'lucide-react'
// import {
//   type AttendeeRecord,
//   type PaginatedResponse,
//   type SessionStats,
//   getAttendees,
//   getCheckedInAttendees,
//   getNotCheckedInAttendees,
//   getSessionStats,
// } from '@/lib/admin/auth'
// import { SESSION_CONFIG, type SessionOption } from '@/lib/session-config'
// import StatsCards from '@/components/admin/stats-card'
// import QRCodeDisplay from '@/components/admin/qr-code-display'
// import AttendanceTable from '@/components/admin/attendance-table'
// import { useAdminAuth } from '@/lib/admin/useAdminAuth'

// // ---------------------------------------------------------------------------
// // Only Signature Live Masterclass sessions require physical check-in.
// // Virtual and Consulting attendees don't attend in person.
// // ---------------------------------------------------------------------------
// const LIVE_SESSIONS: SessionOption[] =
//   SESSION_CONFIG['Signature Live Masterclass'] ?? []

// type ViewMode = 'all' | 'checked-in' | 'not-checked-in'

// export default function AdminDashboard() {
//   const { logout, isLoading: authLoading } = useAdminAuth({
//     redirectIfNotAuth: true,
//   })

//   // ── Session + day selection ─────────────────────────────────────────────
//   const [selectedSession, setSelectedSession] = useState<SessionOption>(
//     LIVE_SESSIONS[0],
//   )
//   const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false)

//   // All Signature sessions are 2-day, so always show the day selector.
//   // Keeping this derived so it works if future sessions are single-day.
//   const isTwoDay = selectedSession?.isTwoDay ?? false
//   const [selectedDay, setSelectedDay] = useState<1 | 2>(1)

//   // ── View mode + pagination ──────────────────────────────────────────────
//   const [viewMode, setViewMode] = useState<ViewMode>('all')
//   const [attendeesPage, setAttendeesPage] = useState(1)
//   const [checkedInPage, setCheckedInPage] = useState(1)
//   const [notCheckedInPage, setNotCheckedInPage] = useState(1)

//   // ── Data ────────────────────────────────────────────────────────────────
//   const [stats, setStats] = useState<SessionStats['stats'] | null>(null)
//   const [attendees, setAttendees] =
//     useState<PaginatedResponse<AttendeeRecord> | null>(null)
//   const [checkedIn, setCheckedIn] =
//     useState<PaginatedResponse<AttendeeRecord> | null>(null)
//   const [notCheckedIn, setNotCheckedIn] =
//     useState<PaginatedResponse<AttendeeRecord> | null>(null)

//   const [isRefreshing, setIsRefreshing] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // ── Fetch ───────────────────────────────────────────────────────────────
//   const fetchData = useCallback(async () => {
//     if (!selectedSession) return

//     setIsRefreshing(true)
//     setError(null)

//     try {
//       const [statsRes, attendeesRes, checkedInRes, notCheckedInRes] =
//         await Promise.all([
//           getSessionStats(selectedSession.sessionId),
//           getAttendees(selectedSession.sessionId, selectedDay, attendeesPage),
//           getCheckedInAttendees(
//             selectedSession.sessionId,
//             selectedDay,
//             checkedInPage,
//           ),
//           getNotCheckedInAttendees(
//             selectedSession.sessionId,
//             selectedDay,
//             notCheckedInPage,
//           ),
//         ])

//       setStats(statsRes.stats)
//       setAttendees(attendeesRes)
//       setCheckedIn(checkedInRes)
//       setNotCheckedIn(notCheckedInRes)
//     } catch (err: any) {
//       setError(err.message || 'Failed to load data. Check your connection.')
//       console.error('[dashboard] fetch error:', err)
//     } finally {
//       setIsRefreshing(false)
//     }
//   }, [
//     selectedSession,
//     selectedDay,
//     attendeesPage,
//     checkedInPage,
//     notCheckedInPage,
//   ])

//   useEffect(() => {
//     if (!authLoading) fetchData()
//   }, [authLoading, fetchData])

//   // ── Handlers ────────────────────────────────────────────────────────────

//   const handleSessionChange = (session: SessionOption) => {
//     setSelectedSession(session)
//     setSessionDropdownOpen(false)
//     setSelectedDay(1) // reset to Day 1 on session change
//     setAttendeesPage(1)
//     setCheckedInPage(1)
//     setNotCheckedInPage(1)
//   }

//   const handleDayChange = (day: 1 | 2) => {
//     setSelectedDay(day)
//     setAttendeesPage(1)
//     setCheckedInPage(1)
//     setNotCheckedInPage(1)
//   }

//   // ── Current table data based on view mode ───────────────────────────────
//   const currentView =
//     viewMode === 'all'
//       ? attendees
//       : viewMode === 'checked-in'
//         ? checkedIn
//         : notCheckedIn

//   const currentPageSetter =
//     viewMode === 'all'
//       ? setAttendeesPage
//       : viewMode === 'checked-in'
//         ? setCheckedInPage
//         : setNotCheckedInPage

//   const emptyMessages: Record<ViewMode, string> = {
//     all: 'No registered attendees found for this session.',
//     'checked-in': 'No attendees have checked in yet for this day.',
//     'not-checked-in': 'All registered attendees have checked in for this day.',
//   }

//   const tableTitles: Record<ViewMode, string> = {
//     all: 'All Live Attendees',
//     'checked-in': `Checked In — Day ${selectedDay}`,
//     'not-checked-in': `Not Yet Checked In — Day ${selectedDay}`,
//   }

//   // ── Loading state ───────────────────────────────────────────────────────
//   if (authLoading) {
//     return (
//       <div className='flex min-h-screen items-center justify-center bg-neutral-100'>
//         <div className='h-12 w-12 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
//       </div>
//     )
//   }

//   if (LIVE_SESSIONS.length === 0) {
//     return (
//       <div className='flex min-h-screen items-center justify-center bg-neutral-100 p-6'>
//         <div className='border-4 border-neutral-900 bg-white p-8 text-center'>
//           <p className='font-mono text-sm text-neutral-600'>
//             No live sessions are configured in session-config.ts.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className='min-h-screen bg-neutral-100'>
//       {/* ── Header ──────────────────────────────────────────────────────── */}
//       <header className='border-b-4 border-neutral-900 bg-neutral-950'>
//         <div className='mx-auto max-w-7xl px-6 py-6'>
//           <div className='flex flex-wrap items-center justify-between gap-4'>
//             <div>
//               <h1 className='font-mono text-2xl font-bold uppercase tracking-tight text-white'>
//                 Event Management
//               </h1>
//               <p className='mt-0.5 font-mono text-sm text-neutral-400'>
//                 Trila Masterclass · Admin Dashboard
//               </p>
//             </div>

//             <div className='flex items-center gap-3'>
//               <button
//                 onClick={fetchData}
//                 disabled={isRefreshing}
//                 className='flex items-center gap-2 border-2 border-white bg-neutral-950 px-4 py-2 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-white hover:text-neutral-950 disabled:opacity-50'
//               >
//                 <RefreshCw
//                   className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
//                 />
//                 Refresh
//               </button>

//               <button
//                 onClick={logout}
//                 className='flex items-center gap-2 border-2 border-red-600 bg-red-600 px-4 py-2 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-red-700'
//               >
//                 <LogOut className='h-4 w-4' />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className='mx-auto max-w-7xl px-6 py-8 space-y-8'>
//         {/* ── Session Selector ─────────────────────────────────────────── */}
//         <div className='border-4 border-neutral-900 bg-white'>
//           <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
//             <div className='flex items-center gap-3'>
//               <Calendar className='h-5 w-5 text-white' />
//               <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
//                 Session Selection
//               </h2>
//             </div>
//           </div>

//           <div className='p-6'>
//             <div className='grid gap-4 sm:grid-cols-[1fr_auto]'>
//               {/* Session dropdown */}
//               <div>
//                 <p className='mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
//                   Event City &amp; Date
//                 </p>
//                 <div className='relative'>
//                   <button
//                     onClick={() => setSessionDropdownOpen((o) => !o)}
//                     className='flex w-full items-center justify-between border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-mono text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100'
//                   >
//                     <div className='text-left'>
//                       <span className='font-bold'>{selectedSession.label}</span>
//                       {selectedSession.venue && (
//                         <span className='ml-2 text-neutral-500'>
//                           · {selectedSession.venue}
//                         </span>
//                       )}
//                     </div>
//                     <ChevronDown
//                       className={`h-5 w-5 shrink-0 transition-transform ${sessionDropdownOpen ? 'rotate-180' : ''}`}
//                     />
//                   </button>

//                   {sessionDropdownOpen && (
//                     <div className='absolute z-20 mt-1 w-full border-2 border-neutral-900 bg-white shadow-lg'>
//                       {LIVE_SESSIONS.map((session) => (
//                         <button
//                           key={session.sessionId}
//                           onClick={() => handleSessionChange(session)}
//                           className={`w-full border-b border-neutral-200 px-4 py-3 text-left font-mono text-sm transition-colors last:border-b-0 hover:bg-neutral-100 ${
//                             session.sessionId === selectedSession.sessionId
//                               ? 'bg-neutral-950 font-bold text-white hover:bg-neutral-900'
//                               : 'text-neutral-900'
//                           }`}
//                         >
//                           <span className='font-bold'>{session.label}</span>
//                           {session.venue && (
//                             <span
//                               className={`ml-2 text-xs ${
//                                 session.sessionId === selectedSession.sessionId
//                                   ? 'text-neutral-400'
//                                   : 'text-neutral-500'
//                               }`}
//                             >
//                               {session.venue}
//                             </span>
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Day selector — always visible since all Signature sessions are 2-day */}
//               {isTwoDay && (
//                 <div>
//                   <p className='mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
//                     Day
//                   </p>
//                   <div className='flex gap-2'>
//                     {([1, 2] as const).map((day) => (
//                       <button
//                         key={day}
//                         onClick={() => handleDayChange(day)}
//                         className={`min-w-20 border-2 px-5 py-3 font-mono text-sm font-bold uppercase transition-colors ${
//                           selectedDay === day
//                             ? 'border-neutral-900 bg-neutral-950 text-white'
//                             : 'border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-100'
//                         }`}
//                       >
//                         Day {day}
//                         <span className='block font-mono text-[9px] font-normal tracking-wide opacity-60'>
//                           {selectedSession.dates[day - 1]
//                             ? new Date(
//                                 selectedSession.dates[day - 1],
//                               ).toLocaleDateString('en-NG', {
//                                 month: 'short',
//                                 day: 'numeric',
//                               })
//                             : ''}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ── Error ───────────────────────────────────────────────────────── */}
//         {error && (
//           <div className='border-l-4 border-red-600 bg-red-50 p-5'>
//             <p className='font-mono text-sm font-medium text-red-900'>
//               {error}
//             </p>
//             <button
//               onClick={fetchData}
//               className='mt-2 font-mono text-xs font-bold uppercase text-red-700 underline underline-offset-2 hover:text-red-900'
//             >
//               Retry
//             </button>
//           </div>
//         )}

//         {/* ── Stats ───────────────────────────────────────────────────────── */}
//         {stats && (
//           <div>
//             <div className='mb-4 flex items-center gap-3'>
//               <BarChart3 className='h-5 w-5 text-neutral-900' />
//               <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-neutral-900'>
//                 Session Statistics
//               </h2>
//             </div>
//             <StatsCards
//               stats={stats}
//               selectedDay={selectedDay}
//               isTwoDay={isTwoDay}
//             />
//           </div>
//         )}

//         {/* ── QR Code — one for each day ───────────────────────────────── */}
//         <div
//           className={`grid gap-6 ${isTwoDay ? 'sm:grid-cols-2' : 'max-w-sm mx-auto w-full'}`}
//         >
//           <QRCodeDisplay
//             sessionId={selectedSession.sessionId}
//             day={1}
//             sessionLabel={selectedSession.label}
//           />
//           {isTwoDay && (
//             <QRCodeDisplay
//               sessionId={selectedSession.sessionId}
//               day={2}
//               sessionLabel={selectedSession.label}
//             />
//           )}
//         </div>

//         {/* ── View Tabs ────────────────────────────────────────────────── */}
//         <div>
//           <div className='mb-6 flex flex-wrap gap-2'>
//             {(
//               [
//                 { mode: 'all' as ViewMode, label: 'All Attendees' },
//                 {
//                   mode: 'checked-in' as ViewMode,
//                   label: `Checked In · Day ${selectedDay}`,
//                 },
//                 {
//                   mode: 'not-checked-in' as ViewMode,
//                   label: `Not Checked In · Day ${selectedDay}`,
//                 },
//               ] as const
//             ).map(({ mode, label }) => (
//               <button
//                 key={mode}
//                 onClick={() => setViewMode(mode)}
//                 className={`border-2 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
//                   viewMode === mode
//                     ? 'border-neutral-900 bg-neutral-950 text-white'
//                     : 'border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-100'
//                 }`}
//               >
//                 {label}
//               </button>
//             ))}
//           </div>

//           {/* ── Attendance Table ─────────────────────────────────────── */}
//           {currentView ? (
//             <AttendanceTable
//               data={currentView}
//               selectedDay={selectedDay}
//               isTwoDay={isTwoDay}
//               title={tableTitles[viewMode]}
//               emptyMessage={emptyMessages[viewMode]}
//               isLoading={isRefreshing}
//               onPageChange={(page) => currentPageSetter(page)}
//             />
//           ) : isRefreshing ? (
//             <div className='flex items-center justify-center border-4 border-neutral-900 bg-white py-16'>
//               <div className='h-8 w-8 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LogOut,
  RefreshCw,
  Calendar,
  ChevronDown,
  Users,
  TrendingUp,
  Send,
  Clock,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react'
import {
  type AttendeeRecord,
  type PaginatedResponse,
  type SessionStats,
  type AdminSessionRecord,
  getAttendees,
  getCheckedInAttendees,
  getNotCheckedInAttendees,
  getSessionStats,
  getAdminSessions,
} from '@/lib/admin/auth'
import StatsCards from '@/components/admin/stats-card'
import QRCodeDisplay from '@/components/admin/qr-code-display'
import AttendanceTable from '@/components/admin/attendance-table'
import { useAdminAuth } from '@/lib/admin/useAdminAuth'
import BookingsPanel from './bookings-panel'
import RevenuePanel from './revenue-panel'
import WaitlistPanel from './waitlist-panel'
import NotifyPanel from './notify-panel'
import SchedulesPanel from './shedules-panel'

// ─── Types ───────────────────────────────────────────────────────────────────

type MainTab =
  | 'checkin'
  | 'bookings'
  | 'revenue'
  | 'waitlist'
  | 'notify'
  | 'schedules'
type CheckInView = 'all' | 'checked-in' | 'not-checked-in'

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { logout, isLoading: authLoading } = useAdminAuth({
    redirectIfNotAuth: true,
  })

  // ── Global tab ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MainTab>('checkin')

  // ── Live sessions loaded from DB (replaces static SESSION_CONFIG) ─────────
  const [liveSessions, setLiveSessions] = useState<AdminSessionRecord[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  // ── Check-in tab ──────────────────────────────────────────────────────────
  const [selectedSession, setSelectedSession] =
    useState<AdminSessionRecord | null>(null)
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false)
  const isTwoDay = selectedSession?.isTwoDay ?? false

  const [selectedDay, setSelectedDay] = useState<1 | 2>(1)
  const [checkInView, setCheckInView] = useState<CheckInView>('all')
  const [attendeesPage, setAttendeesPage] = useState(1)
  const [checkedInPage, setCheckedInPage] = useState(1)
  const [notCheckedPage, setNotCheckedPage] = useState(1)

  const [stats, setStats] = useState<SessionStats['stats'] | null>(null)
  const [attendees, setAttendees] =
    useState<PaginatedResponse<AttendeeRecord> | null>(null)
  const [checkedIn, setCheckedIn] =
    useState<PaginatedResponse<AttendeeRecord> | null>(null)
  const [notCheckedIn, setNotCheckedIn] =
    useState<PaginatedResponse<AttendeeRecord> | null>(null)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [checkInError, setCheckInError] = useState<string | null>(null)

  // ── Load live sessions from DB ────────────────────────────────────────────
  const loadLiveSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const res = await getAdminSessions()
      // Check-in tab only shows Signature Live sessions (the two-day ones)
      const sigSessions = (
        res.sessions['Signature Live Masterclass'] ?? []
      ).filter((s) => s.isActive)
      setLiveSessions(sigSessions)
      if (sigSessions.length > 0 && !selectedSession) {
        setSelectedSession(sigSessions[0])
      }
    } catch {
      // Non-fatal — check-in tab will show an empty state
    } finally {
      setSessionsLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!authLoading) loadLiveSessions()
  }, [authLoading, loadLiveSessions])

  // Re-sync selected session when sessions list changes (e.g. after Schedules edit)
  useEffect(() => {
    if (activeTab === 'checkin' && !sessionsLoading) loadLiveSessions()
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch check-in data ───────────────────────────────────────────────────
  const fetchCheckInData = useCallback(async () => {
    if (!selectedSession || activeTab !== 'checkin') return
    setIsRefreshing(true)
    setCheckInError(null)
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
            notCheckedPage,
          ),
        ])
      setStats(statsRes.stats)
      setAttendees(attendeesRes)
      setCheckedIn(checkedInRes)
      setNotCheckedIn(notCheckedInRes)
    } catch (err: any) {
      setCheckInError(err.message || 'Failed to load check-in data.')
    } finally {
      setIsRefreshing(false)
    }
  }, [
    selectedSession,
    selectedDay,
    attendeesPage,
    checkedInPage,
    notCheckedPage,
    activeTab,
  ])

  useEffect(() => {
    if (!authLoading && selectedSession) fetchCheckInData()
  }, [authLoading, fetchCheckInData, selectedSession])

  const handleSessionChange = (session: AdminSessionRecord) => {
    setSelectedSession(session)
    setSessionDropdownOpen(false)
    setSelectedDay(1)
    setAttendeesPage(1)
    setCheckedInPage(1)
    setNotCheckedPage(1)
  }

  const currentCheckInView =
    checkInView === 'all'
      ? attendees
      : checkInView === 'checked-in'
        ? checkedIn
        : notCheckedIn

  const currentPageSetter =
    checkInView === 'all'
      ? setAttendeesPage
      : checkInView === 'checked-in'
        ? setCheckedInPage
        : setNotCheckedPage

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-100'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
      </div>
    )
  }

  // ── Tab definitions ───────────────────────────────────────────────────────
  const tabDefs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'checkin',
      label: 'Check-In',
      icon: <CheckCircle2 className='h-4 w-4' />,
    },
    { id: 'bookings', label: 'Bookings', icon: <Users className='h-4 w-4' /> },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: <TrendingUp className='h-4 w-4' />,
    },
    { id: 'waitlist', label: 'Waitlist', icon: <Clock className='h-4 w-4' /> },
    { id: 'notify', label: 'Notify', icon: <Send className='h-4 w-4' /> },
    {
      id: 'schedules',
      label: 'Schedules',
      icon: <LayoutGrid className='h-4 w-4' />,
    },
  ]

  return (
    <div className='min-h-screen bg-neutral-100'>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className='border-b-4 border-neutral-900 bg-neutral-950'>
        <div className='mx-auto max-w-7xl px-6 py-5'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h1 className='font-mono text-xl font-bold uppercase tracking-tight text-white'>
                Trila · Event Management
              </h1>
              <p className='font-mono text-xs text-neutral-400'>
                Admin Dashboard
              </p>
            </div>
            <div className='flex items-center gap-3'>
              {activeTab === 'checkin' && (
                <button
                  onClick={fetchCheckInData}
                  disabled={isRefreshing}
                  className='flex items-center gap-2 border-2 border-white bg-neutral-950 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-neutral-950 disabled:opacity-40'
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </button>
              )}
              <button
                onClick={logout}
                className='flex items-center gap-2 border-2 border-red-600 bg-red-600 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-red-700'
              >
                <LogOut className='h-4 w-4' />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className='mt-4 flex flex-wrap gap-1'>
            {tabDefs.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === id
                    ? 'border-white text-white'
                    : 'border-transparent text-neutral-500 hover:border-neutral-500 hover:text-neutral-300'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className='mx-auto max-w-7xl px-6 py-8'>
        {/* ── CHECK-IN TAB ───────────────────────────────────────────────── */}
        {activeTab === 'checkin' && (
          <div className='space-y-8'>
            {checkInError && (
              <div className='border-l-4 border-red-600 bg-red-50 p-4'>
                <p className='font-mono text-sm text-red-900'>{checkInError}</p>
              </div>
            )}

            {/* Session selector */}
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
                {sessionsLoading ? (
                  <div className='flex items-center gap-3 font-mono text-sm text-neutral-500'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent' />
                    Loading sessions…
                  </div>
                ) : liveSessions.length === 0 ? (
                  <div className='font-mono text-sm text-neutral-500'>
                    No active Signature Live sessions.{' '}
                    <button
                      onClick={() => setActiveTab('schedules')}
                      className='font-bold text-neutral-900 underline'
                    >
                      Create one in Schedules →
                    </button>
                  </div>
                ) : (
                  <div className='grid gap-4 sm:grid-cols-[1fr_auto]'>
                    {/* Session dropdown */}
                    <div>
                      <p className='mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
                        Event
                      </p>
                      <div className='relative'>
                        <button
                          onClick={() => setSessionDropdownOpen((o) => !o)}
                          className='flex w-full items-center justify-between border-2 border-neutral-900 bg-neutral-50 px-4 py-3 font-mono text-sm font-medium text-neutral-900 hover:bg-neutral-100'
                        >
                          <span className='font-bold'>
                            {selectedSession?.label}
                            {selectedSession?.venue && (
                              <span className='ml-2 font-normal text-neutral-500'>
                                · {selectedSession.venue}
                              </span>
                            )}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 transition-transform ${sessionDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {sessionDropdownOpen && (
                          <div className='absolute z-20 mt-1 w-full border-2 border-neutral-900 bg-white shadow-lg'>
                            {liveSessions.map((s) => (
                              <button
                                key={s.sessionId}
                                onClick={() => handleSessionChange(s)}
                                className={`w-full border-b border-neutral-200 px-4 py-3 text-left font-mono text-sm last:border-0 hover:bg-neutral-100 ${
                                  s.sessionId === selectedSession?.sessionId
                                    ? 'bg-neutral-950 font-bold text-white hover:bg-neutral-900'
                                    : 'text-neutral-900'
                                }`}
                              >
                                {s.label}
                                {s.venue && (
                                  <span className='ml-2 text-xs text-neutral-400'>
                                    {s.venue}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Day picker */}
                    {isTwoDay && selectedSession && (
                      <div>
                        <p className='mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'>
                          Day
                        </p>
                        <div className='flex gap-2'>
                          {([1, 2] as const).map((day) => (
                            <button
                              key={day}
                              onClick={() => {
                                setSelectedDay(day)
                                setAttendeesPage(1)
                                setCheckedInPage(1)
                                setNotCheckedPage(1)
                              }}
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
                                      selectedSession.dates[day - 1] +
                                        'T00:00:00',
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
                )}
              </div>
            </div>

            {/* Stats */}
            {stats && selectedSession && (
              <StatsCards
                stats={stats}
                selectedDay={selectedDay}
                isTwoDay={isTwoDay}
              />
            )}

            {/* QR codes */}
            {selectedSession && (
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
            )}

            {/* Attendance table */}
            {selectedSession && (
              <div>
                <div className='mb-6 flex flex-wrap gap-2'>
                  {[
                    { mode: 'all' as CheckInView, label: 'All Attendees' },
                    {
                      mode: 'checked-in' as CheckInView,
                      label: `Checked In · Day ${selectedDay}`,
                    },
                    {
                      mode: 'not-checked-in' as CheckInView,
                      label: `Not Checked In · Day ${selectedDay}`,
                    },
                  ].map(({ mode, label }) => (
                    <button
                      key={mode}
                      onClick={() => setCheckInView(mode)}
                      className={`border-2 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                        checkInView === mode
                          ? 'border-neutral-900 bg-neutral-950 text-white'
                          : 'border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {currentCheckInView ? (
                  <AttendanceTable
                    data={currentCheckInView}
                    selectedDay={selectedDay}
                    isTwoDay={isTwoDay}
                    title={
                      checkInView === 'all'
                        ? 'All Live Attendees'
                        : checkInView === 'checked-in'
                          ? `Checked In — Day ${selectedDay}`
                          : `Not Yet Checked In — Day ${selectedDay}`
                    }
                    emptyMessage={
                      checkInView === 'all'
                        ? 'No attendees for this session.'
                        : checkInView === 'checked-in'
                          ? 'No check-ins yet for this day.'
                          : 'All attendees have checked in.'
                    }
                    isLoading={isRefreshing}
                    onPageChange={(p) => currentPageSetter(p)}
                  />
                ) : isRefreshing ? (
                  <div className='flex items-center justify-center border-4 border-neutral-900 bg-white py-16'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* ── OTHER TABS ─────────────────────────────────────────────────── */}
        {activeTab === 'bookings' && <BookingsPanel />}
        {activeTab === 'revenue' && <RevenuePanel />}
        {activeTab === 'waitlist' && <WaitlistPanel />}
        {activeTab === 'notify' && <NotifyPanel />}
        {activeTab === 'schedules' && <SchedulesPanel />}
      </div>
    </div>
  )
}
