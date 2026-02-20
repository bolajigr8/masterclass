'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  MapPin,
  Users,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Zap,
  Info,
} from 'lucide-react'
import {
  type AdminSessionRecord,
  type CreateSessionPayload,
  type UpdateSessionPayload,
  getAdminSessions,
  createSession,
  updateSession,
  archiveSession,
  restoreSession,
  seedSessions,
} from '@/lib/admin/auth'

// ─── Constants ──────────────────────────────────────────────────────────────

const PRODUCT_TYPES = [
  'Virtual Masterclass',
  'Signature Live Masterclass',
  'Private JaaS Consulting',
] as const

type ProductType = (typeof PRODUCT_TYPES)[number]

const PRODUCT_META: Record<
  ProductType,
  { color: string; bg: string; badge: string; desc: string }
> = {
  'Virtual Masterclass': {
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    desc: '4 weekly Zoom sessions — enter all 4 dates',
  },
  'Signature Live Masterclass': {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    desc: '2-day in-person event — enter both days',
  },
  'Private JaaS Consulting': {
    color: 'text-green-700',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-700',
    desc: '1-on-1 Zoom consultation — one representative date',
  },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const inputCls =
  'w-full border-2 border-neutral-900 bg-neutral-50 px-3 py-2.5 font-mono text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400 disabled:opacity-50'

const labelCls =
  'mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500'

function CapacityBar({
  confirmed,
  capacity,
}: {
  confirmed: number
  capacity: number
}) {
  const pct = capacity > 0 ? Math.min(100, (confirmed / capacity) * 100) : 0
  const color =
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'
  return (
    <div className='space-y-1'>
      <div className='h-1.5 w-full rounded-full bg-neutral-200'>
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className='font-mono text-[10px] text-neutral-500'>
        {confirmed} / {capacity} enrolled · {Math.max(0, capacity - confirmed)}{' '}
        remaining
      </p>
    </div>
  )
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Date inputs list ────────────────────────────────────────────────────────

function DatesField({
  dates,
  onChange,
  productType,
}: {
  dates: string[]
  onChange: (dates: string[]) => void
  productType: string
}) {
  const isVirtual = productType === 'Virtual Masterclass'
  const isTwoDay = productType === 'Signature Live Masterclass'
  const expectedCount = isVirtual ? 4 : isTwoDay ? 2 : 1

  // Ensure array always has `expectedCount` slots
  const padded = Array.from({ length: expectedCount }, (_, i) => dates[i] ?? '')

  const update = (idx: number, val: string) => {
    const next = [...padded]
    next[idx] = val
    onChange(next.filter((_, i) => i < expectedCount))
  }

  const dateLabels: Record<string, string[]> = {
    'Virtual Masterclass': [
      'Session 1 date',
      'Session 2 date',
      'Session 3 date',
      'Session 4 date',
    ],
    'Signature Live Masterclass': ['Day 1 date', 'Day 2 date'],
    'Private JaaS Consulting': ['Available from date'],
  }

  const labels =
    dateLabels[productType] ??
    Array.from({ length: expectedCount }, (_, i) => `Date ${i + 1}`)

  return (
    <div className='space-y-2'>
      {padded.map((val, idx) => (
        <div key={idx}>
          <label className={labelCls}>{labels[idx]}</label>
          <input
            type='date'
            value={val}
            onChange={(e) => update(idx, e.target.value)}
            className={inputCls}
            required
          />
        </div>
      ))}
    </div>
  )
}

// ─── Session Form (create or edit) ──────────────────────────────────────────

interface SessionFormProps {
  initial?: AdminSessionRecord | null
  onSave: (record: AdminSessionRecord) => void
  onCancel: () => void
}

function SessionForm({ initial, onSave, onCancel }: SessionFormProps) {
  const isEdit = !!initial

  const [productType, setProductType] = useState<string>(
    initial?.productType ?? 'Signature Live Masterclass',
  )
  const [label, setLabel] = useState(initial?.label ?? '')
  const [dates, setDates] = useState<string[]>(initial?.dates ?? [])
  const [time, setTime] = useState(initial?.time ?? '09:00')
  const [displayTime, setDisplayTime] = useState(initial?.displayTime ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [venue, setVenue] = useState(initial?.venue ?? '')
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 50))
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0))

  const isTwoDay = productType === 'Signature Live Masterclass'
  const isVirtual = productType === 'Virtual Masterclass'

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanDates = dates.filter(Boolean)
    const expectedCount = isVirtual ? 4 : isTwoDay ? 2 : 1

    if (cleanDates.length < expectedCount) {
      setError(
        `Please enter all ${expectedCount} date${expectedCount > 1 ? 's' : ''}.`,
      )
      return
    }
    if (!label.trim()) {
      setError('Label is required.')
      return
    }
    if (!city.trim()) {
      setError('City is required.')
      return
    }
    if (Number(capacity) < 1) {
      setError('Capacity must be at least 1.')
      return
    }

    setSaving(true)
    try {
      let result: AdminSessionRecord
      if (isEdit && initial) {
        const payload: UpdateSessionPayload = {
          label: label.trim(),
          dates: cleanDates,
          time,
          city: city.trim(),
          venue: venue.trim() || undefined,
          isTwoDay,
          capacity: Number(capacity),
          sortOrder: Number(sortOrder),
        }
        if (displayTime.trim()) payload.displayTime = displayTime.trim()
        const res = await updateSession(initial.sessionId, payload)
        result = res.session
      } else {
        const payload: CreateSessionPayload = {
          productType,
          label: label.trim(),
          dates: cleanDates,
          time,
          city: city.trim(),
          venue: venue.trim() || undefined,
          isTwoDay,
          capacity: Number(capacity),
          sortOrder: Number(sortOrder) || undefined,
          displayTime: displayTime.trim() || undefined,
        }
        const res = await createSession(payload)
        result = res.session
      }
      onSave(result)
    } catch (err: any) {
      setError(err.message || 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='border-4 border-neutral-900 bg-white'>
      {/* Form header */}
      <div className='flex items-center justify-between border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
        <div className='flex items-center gap-3'>
          {isEdit ? (
            <Pencil className='h-5 w-5 text-white' />
          ) : (
            <Plus className='h-5 w-5 text-white' />
          )}
          <h3 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
            {isEdit
              ? `Edit Session · ${initial!.sessionId}`
              : 'Create New Session'}
          </h3>
        </div>
        <button
          onClick={onCancel}
          className='text-neutral-400 hover:text-white'
        >
          <X className='h-5 w-5' />
        </button>
      </div>

      <form onSubmit={handleSubmit} className='p-6'>
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Left column */}
          <div className='space-y-5'>
            {/* Product type — only on create */}
            {!isEdit && (
              <div>
                <label className={labelCls}>Product Type</label>
                <select
                  value={productType}
                  onChange={(e) => {
                    setProductType(e.target.value)
                    setDates([])
                  }}
                  className={inputCls}
                >
                  {PRODUCT_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {PRODUCT_META[productType as ProductType] && (
                  <p className='mt-1.5 flex items-center gap-1.5 font-mono text-[10px] text-neutral-500'>
                    <Info className='h-3 w-3' />
                    {PRODUCT_META[productType as ProductType].desc}
                  </p>
                )}
              </div>
            )}

            {/* Label */}
            <div>
              <label className={labelCls}>Display Label</label>
              <input
                type='text'
                placeholder={
                  isTwoDay
                    ? 'Lagos · Mar 14–15, 2026'
                    : isVirtual
                      ? 'Series A — March 2026'
                      : 'Q1 2026 — Available Now'
                }
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={inputCls}
                required
              />
              <p className='mt-1 font-mono text-[10px] text-neutral-400'>
                Shown in the enrollment modal dropdown
              </p>
            </div>

            {/* City + Venue */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className={labelCls}>City</label>
                <input
                  type='text'
                  placeholder={isTwoDay ? 'Lagos' : 'Online (Zoom)'}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>
                  Venue{' '}
                  {!isTwoDay && (
                    <span className='normal-case text-neutral-400'>
                      (optional)
                    </span>
                  )}
                </label>
                <input
                  type='text'
                  placeholder={isTwoDay ? 'Eko Hotel & Suites' : ''}
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Time + displayTime */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className={labelCls}>Start Time (24h)</label>
                <input
                  type='time'
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>
                  Display Time
                  <span className='ml-1 normal-case text-neutral-400'>
                    (auto if blank)
                  </span>
                </label>
                <input
                  type='text'
                  placeholder='9:00 AM WAT'
                  value={displayTime}
                  onChange={(e) => setDisplayTime(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Capacity + Sort order */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className={labelCls}>Capacity</label>
                <input
                  type='number'
                  min='1'
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className={inputCls}
                  required
                />
                {isEdit && initial && (
                  <p className='mt-1 font-mono text-[10px] text-neutral-400'>
                    {initial.confirmedCount} enrolled · min is{' '}
                    {initial.confirmedCount}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Sort Order</label>
                <input
                  type='number'
                  min='0'
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={inputCls}
                />
                <p className='mt-1 font-mono text-[10px] text-neutral-400'>
                  Lower = shown first in dropdown
                </p>
              </div>
            </div>
          </div>

          {/* Right column — dates */}
          <div className='space-y-5'>
            <div>
              <label className={`${labelCls} mb-3`}>Session Dates</label>
              <DatesField
                dates={dates}
                onChange={setDates}
                productType={productType}
              />
            </div>

            {/* Session ID (read-only on edit) */}
            {isEdit && (
              <div>
                <label className={labelCls}>
                  Session ID{' '}
                  <span className='normal-case text-neutral-400'>
                    (immutable)
                  </span>
                </label>
                <div className='border-2 border-neutral-200 bg-neutral-100 px-3 py-2.5'>
                  <code className='font-mono text-sm text-neutral-600'>
                    {initial!.sessionId}
                  </code>
                </div>
                <p className='mt-1 font-mono text-[10px] text-neutral-400'>
                  Embedded in QR codes and enrollment records — cannot be
                  changed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className='mt-5 flex items-start gap-2 border-l-4 border-red-600 bg-red-50 px-4 py-3'>
            <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-red-600' />
            <p className='font-mono text-sm text-red-800'>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className='mt-6 flex items-center justify-end gap-3 border-t-2 border-neutral-100 pt-6'>
          <button
            type='button'
            onClick={onCancel}
            className='border-2 border-neutral-300 bg-white px-6 py-2.5 font-mono text-xs font-bold uppercase text-neutral-700 hover:bg-neutral-100'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={saving}
            className='flex items-center gap-2 border-2 border-neutral-900 bg-neutral-950 px-8 py-2.5 font-mono text-xs font-bold uppercase text-white hover:bg-neutral-800 disabled:opacity-50'
          >
            {saving ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Save className='h-4 w-4' />
            )}
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Session'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Session Card ────────────────────────────────────────────────────────────

function SessionCard({
  session,
  onEdit,
  onArchive,
  onRestore,
}: {
  session: AdminSessionRecord
  onEdit: (s: AdminSessionRecord) => void
  onArchive: (s: AdminSessionRecord) => void
  onRestore: (s: AdminSessionRecord) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isArchived = !session.isActive

  return (
    <div
      className={`border-2 bg-white transition-all ${isArchived ? 'border-neutral-200 opacity-60' : 'border-neutral-900'}`}
    >
      {/* Card header */}
      <div
        className='flex cursor-pointer items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50'
        onClick={() => setExpanded((e) => !e)}
      >
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-mono text-sm font-bold text-neutral-900'>
              {session.label}
            </span>
            {isArchived && (
              <span className='rounded bg-neutral-200 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-neutral-500'>
                Archived
              </span>
            )}
            {session.isFull && !isArchived && (
              <span className='rounded bg-red-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-red-700'>
                Full
              </span>
            )}
          </div>
          <div className='mt-1 flex flex-wrap items-center gap-3'>
            <span className='flex items-center gap-1 font-mono text-xs text-neutral-500'>
              <MapPin className='h-3 w-3' /> {session.city}
              {session.venue && ` · ${session.venue}`}
            </span>
            <span className='flex items-center gap-1 font-mono text-xs text-neutral-500'>
              <Clock className='h-3 w-3' /> {session.displayTime}
            </span>
            <span className='flex items-center gap-1 font-mono text-xs text-neutral-500'>
              <Users className='h-3 w-3' /> {session.confirmedCount} /{' '}
              {session.capacity}
            </span>
          </div>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          {/* Quick actions — stop propagation so they don't toggle expand */}
          {!isArchived ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(session)
                }}
                className='flex items-center text-neutral-500 gap-1.5 border-2 border-neutral-900 px-3 py-1.5 font-mono text-[10px] font-bold uppercase hover:bg-neutral-100
                
                
                '
              >
                <Pencil className='h-3 w-3' /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive(session)
                }}
                className='flex items-center gap-1.5 border-2 border-neutral-300 px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
              >
                <Archive className='h-3 w-3' /> Archive
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRestore(session)
              }}
              className='flex items-center gap-1.5 border-2 border-green-600 px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-green-700 hover:bg-green-50'
            >
              <RotateCcw className='h-3 w-3' /> Restore
            </button>
          )}
          {expanded ? (
            <ChevronUp className='h-4 w-4 text-neutral-400' />
          ) : (
            <ChevronDown className='h-4 w-4 text-neutral-400' />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className='border-t-2 border-neutral-100 px-5 py-4 space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <p className={labelCls}>Session Dates</p>
              <div className='space-y-1'>
                {session.dates.map((d, i) => (
                  <p key={i} className='font-mono text-sm text-neutral-700'>
                    {session.isTwoDay
                      ? `Day ${i + 1}: `
                      : session.dates.length > 1
                        ? `Session ${i + 1}: `
                        : ''}
                    {fmtDate(d)}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className={labelCls}>Capacity</p>
              <CapacityBar
                confirmed={session.confirmedCount}
                capacity={session.capacity}
              />
              {session.waitlistCount > 0 && (
                <p className='mt-1 font-mono text-xs text-neutral-500'>
                  {session.waitlistCount} on waitlist
                </p>
              )}
            </div>
          </div>
          <div className='grid gap-3 sm:grid-cols-3'>
            <div>
              <p className={labelCls}>Session ID</p>
              <code className='font-mono text-xs text-neutral-600'>
                {session.sessionId}
              </code>
            </div>
            <div>
              <p className={labelCls}>Sort Order</p>
              <p className='font-mono text-sm text-neutral-700'>
                {session.sortOrder}
              </p>
            </div>
            <div>
              <p className={labelCls}>Two-Day Event</p>
              <p className='font-mono text-sm text-neutral-700'>
                {session.isTwoDay ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main SchedulesPanel ─────────────────────────────────────────────────────

export default function SchedulesPanel() {
  const [grouped, setGrouped] = useState<Record<string, AdminSessionRecord[]>>(
    {},
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminSessionRecord | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [seedState, setSeedState] = useState<'idle' | 'running' | 'done'>(
    'idle',
  )
  const [seedMsg, setSeedMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [confirmArchive, setConfirmArchive] =
    useState<AdminSessionRecord | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminSessions()
      setGrouped(res.sessions)
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSaved = (record: AdminSessionRecord) => {
    setShowForm(false)
    setEditTarget(null)
    setSuccessMsg(
      editTarget
        ? `Session "${record.label}" updated.`
        : `Session "${record.label}" created successfully.`,
    )
    setTimeout(() => setSuccessMsg(''), 4000)
    fetchData()
  }

  const handleEdit = (session: AdminSessionRecord) => {
    setEditTarget(session)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleArchiveConfirm = async () => {
    if (!confirmArchive) return
    try {
      await archiveSession(confirmArchive.sessionId)
      setSuccessMsg(`"${confirmArchive.label}" archived.`)
      setTimeout(() => setSuccessMsg(''), 4000)
      setConfirmArchive(null)
      fetchData()
    } catch (err: any) {
      setError(err.message)
      setConfirmArchive(null)
    }
  }

  const handleRestore = async (session: AdminSessionRecord) => {
    try {
      await restoreSession(session.sessionId)
      setSuccessMsg(`"${session.label}" restored.`)
      setTimeout(() => setSuccessMsg(''), 4000)
      fetchData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSeed = async () => {
    setSeedState('running')
    try {
      const res = await seedSessions()
      setSeedMsg(res.message)
      setSeedState('done')
      fetchData()
      setTimeout(() => setSeedState('idle'), 6000)
    } catch (err: any) {
      setError(err.message)
      setSeedState('idle')
    }
  }

  const allSessions = Object.values(grouped).flat()
  const activeSessions = allSessions.filter((s) => s.isActive)
  const archivedSessions = allSessions.filter((s) => !s.isActive)

  return (
    <div className='space-y-6'>
      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-neutral-900'>
            Masterclass Schedules
          </h2>
          <p className='font-mono text-xs text-neutral-500'>
            {activeSessions.length} active session
            {activeSessions.length !== 1 ? 's' : ''} across{' '}
            {PRODUCT_TYPES.length} products
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {/* Seed button — only show if DB is empty */}
          {allSessions.length === 0 && seedState === 'idle' && (
            <button
              onClick={handleSeed}
              className='flex items-center gap-2 border-2 border-amber-600 bg-amber-50 px-4 py-2 font-mono text-xs font-bold uppercase text-amber-800 hover:bg-amber-100'
            >
              <Zap className='h-4 w-4' /> Seed from config
            </button>
          )}
          {seedState === 'running' && (
            <span className='flex items-center gap-2 font-mono text-xs text-neutral-500'>
              <Loader2 className='h-4 w-4 animate-spin' /> Seeding…
            </span>
          )}
          {!showForm && (
            <button
              onClick={() => {
                setEditTarget(null)
                setShowForm(true)
              }}
              className='flex items-center gap-2 border-2 border-neutral-900 bg-neutral-950 px-5 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-neutral-800'
            >
              <Plus className='h-4 w-4' /> New Session
            </button>
          )}
        </div>
      </div>

      {/* ── Notifications ──────────────────────────────────────────────── */}
      {successMsg && (
        <div className='flex items-center gap-3 border-l-4 border-green-600 bg-green-50 px-4 py-3'>
          <CheckCircle2 className='h-4 w-4 text-green-600' />
          <p className='font-mono text-sm text-green-800'>{successMsg}</p>
        </div>
      )}
      {seedState === 'done' && seedMsg && (
        <div className='flex items-center gap-3 border-l-4 border-amber-600 bg-amber-50 px-4 py-3'>
          <Zap className='h-4 w-4 text-amber-600' />
          <p className='font-mono text-sm text-amber-800'>{seedMsg}</p>
        </div>
      )}
      {error && (
        <div className='flex items-start gap-3 border-l-4 border-red-600 bg-red-50 px-4 py-3'>
          <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-red-600' />
          <div>
            <p className='font-mono text-sm text-red-800'>{error}</p>
            <button
              onClick={() => setError(null)}
              className='mt-1 font-mono text-[10px] text-red-500 underline'
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Archive confirm dialog ──────────────────────────────────────── */}
      {confirmArchive && (
        <div className='border-4 border-amber-600 bg-amber-50 p-5'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-700' />
            <div className='flex-1'>
              <p className='font-mono text-sm font-bold text-amber-900'>
                Archive "{confirmArchive.label}"?
              </p>
              <p className='mt-1 font-mono text-xs text-amber-700'>
                This session will disappear from the enrollment modal. The{' '}
                {confirmArchive.confirmedCount} existing enrollments are
                preserved. You can restore it later.
              </p>
              <div className='mt-3 flex gap-3'>
                <button
                  onClick={handleArchiveConfirm}
                  className='border-2 border-amber-700 bg-amber-700 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-amber-800'
                >
                  Archive
                </button>
                <button
                  onClick={() => setConfirmArchive(null)}
                  className='border-2 border-neutral-300 bg-white px-4 py-2 font-mono text-xs font-bold uppercase text-neutral-700 hover:bg-neutral-100'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit form ──────────────────────────────────────────── */}
      {showForm && (
        <SessionForm
          initial={editTarget}
          onSave={handleSaved}
          onCancel={() => {
            setShowForm(false)
            setEditTarget(null)
          }}
        />
      )}

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <div className='flex items-center justify-center border-4 border-neutral-900 bg-white py-20'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!loading && allSessions.length === 0 && !showForm && (
        <div className='border-4 border-dashed border-neutral-300 bg-white py-20 text-center'>
          <Calendar className='mx-auto mb-4 h-12 w-12 text-neutral-300' />
          <p className='font-mono text-sm font-bold text-neutral-500'>
            No sessions yet
          </p>
          <p className='mt-1 font-mono text-xs text-neutral-400'>
            Click "Seed from config" to import your existing sessions, or create
            one manually.
          </p>
        </div>
      )}

      {/* ── Sessions by product type ────────────────────────────────────── */}
      {!loading &&
        PRODUCT_TYPES.map((pt) => {
          const sessions = (grouped[pt] ?? []).filter(
            (s) => s.isActive || showArchived,
          )
          if (sessions.length === 0) return null
          const meta = PRODUCT_META[pt]

          return (
            <div key={pt} className='border-4 border-neutral-900 bg-white'>
              {/* Product header */}
              <div
                className={`border-b-4 border-neutral-900 px-6 py-4 ${meta.bg}`}
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <Calendar className={`h-5 w-5 ${meta.color}`} />
                    <div>
                      <h3
                        className={`font-mono text-sm font-bold ${meta.color}`}
                      >
                        {pt}
                      </h3>
                      <p className='font-mono text-xs text-neutral-500'>
                        {sessions.filter((s) => s.isActive).length} active ·{' '}
                        {sessions.filter((s) => !s.isActive).length} archived
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditTarget(null)
                      setShowForm(true)
                    }}
                    className={`flex items-center gap-1.5 border-2 px-3 py-1.5 font-mono text-[10px] font-bold uppercase ${meta.color} border-current hover:opacity-80`}
                  >
                    <Plus className='h-3 w-3' /> Add
                  </button>
                </div>
              </div>

              {/* Session cards */}
              <div className='divide-y-2 divide-neutral-100'>
                {sessions.map((s) => (
                  <SessionCard
                    key={s.sessionId}
                    session={s}
                    onEdit={handleEdit}
                    onArchive={setConfirmArchive}
                    onRestore={handleRestore}
                  />
                ))}
              </div>
            </div>
          )
        })}

      {/* ── Show/hide archived toggle ───────────────────────────────────── */}
      {!loading && archivedSessions.length > 0 && (
        <button
          onClick={() => setShowArchived((v) => !v)}
          className='w-full border-2 border-dashed border-neutral-300 py-3 font-mono text-xs font-bold uppercase text-neutral-400 hover:border-neutral-500 hover:text-neutral-600'
        >
          {showArchived
            ? `Hide ${archivedSessions.length} archived session${archivedSessions.length !== 1 ? 's' : ''}`
            : `Show ${archivedSessions.length} archived session${archivedSessions.length !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  )
}
