'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, MapPin, RefreshCw } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { getRevenueAnalytics, type RevenueAnalytics } from '@/lib/admin/auth'

function fmtNaira(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString('en-NG')}`
}

const GOLD = '#d4a422'
const BLUE = '#2563eb'
const GREEN = '#16a34a'

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div
      className={`border-2 p-5 ${accent ? 'border-neutral-900 bg-neutral-950' : 'border-neutral-900 bg-white'}`}
    >
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.15em] mb-3 ${accent ? 'text-neutral-400' : 'text-neutral-500'}`}
      >
        {label}
      </p>
      <p
        className={`font-mono text-3xl font-black ${accent ? 'text-white' : 'text-neutral-900'}`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`mt-1 font-mono text-xs ${accent ? 'text-neutral-400' : 'text-neutral-500'}`}
        >
          {sub}
        </p>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #2a2a2a',
        padding: '8px 14px',
        fontFamily: 'monospace',
        borderRadius: 2,
      }}
    >
      <p
        style={{
          color: '#666',
          fontSize: 10,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </p>
      <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>
        {formatter(payload[0].value)}
      </p>
    </div>
  )
}

export default function RevenuePanel() {
  const [days, setDays] = useState(90)
  const [data, setData] = useState<RevenueAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (d: number) => {
    setLoading(true)
    setError(null)
    try {
      setData(await getRevenueAnalytics(d))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(days)
  }, [days])

  const hasTimeSeriesData = data?.timeSeries.some(
    (p) => p.count > 0 || p.revenue > 0,
  )

  const visibleSeries = (() => {
    if (!data?.timeSeries) return []
    const firstNonZero = data.timeSeries.findIndex(
      (p) => p.count > 0 || p.revenue > 0,
    )
    const start =
      firstNonZero === -1
        ? Math.max(0, data.timeSeries.length - 14)
        : Math.max(0, firstNonZero - 2)
    return data.timeSeries.slice(start)
  })()

  const tierColors: Record<string, string> = {
    virtual: BLUE,
    full: GOLD,
    consulting: GREEN,
  }
  const tierLabels: Record<string, string> = {
    virtual: 'Virtual Masterclass',
    full: 'Signature Live',
    consulting: 'Consulting',
  }

  const axisTick = { fontFamily: 'monospace', fontSize: 10, fill: '#888' }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <TrendingUp className='h-5 w-5 text-neutral-900' />
          <h2 className='font-mono text-sm font-bold uppercase tracking-wider text-neutral-900'>
            Revenue Analytics
          </h2>
        </div>
        <div className='flex items-center gap-3'>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className='border-2 border-neutral-900 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-900 focus:outline-none'
          >
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
          <button
            onClick={() => fetchData(days)}
            disabled={loading}
            className='flex items-center gap-2 border-2 border-neutral-900 bg-neutral-950 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-neutral-800 disabled:opacity-40'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{' '}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className='border-l-4 border-red-600 bg-red-50 p-4'>
          <p className='font-mono text-sm text-red-900'>{error}</p>
        </div>
      )}

      {data && !hasTimeSeriesData && data.summary.totalConfirmed > 0 && (
        <div className='border-l-4 border-yellow-500 bg-yellow-50 p-4'>
          <p className='font-mono text-sm text-yellow-900'>
            {data.summary.totalConfirmed} confirmed enrollment
            {data.summary.totalConfirmed !== 1 ? 's' : ''} exist outside this
            window.{' '}
            <button
              className='underline font-bold'
              onClick={() => setDays(365)}
            >
              Switch to Last year
            </button>
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Summary cards — white, unchanged */}
          <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
            <SummaryCard
              label='Total Revenue'
              value={fmtNaira(data.summary.totalRevenue)}
              accent
            />
            <SummaryCard
              label='Confirmed'
              value={String(data.summary.totalConfirmed)}
              sub='enrollments'
            />
            <SummaryCard
              label='Pending'
              value={String(data.summary.totalPending)}
              sub='awaiting payment'
            />
            <SummaryCard
              label='Avg Order'
              value={fmtNaira(data.summary.averageOrderValue)}
            />
            <SummaryCard
              label='Conversion'
              value={`${data.summary.conversionRate}%`}
              sub='paid/started'
            />
          </div>

          {/* ── Bookings Over Time — dark chart panel ── */}
          <div className='overflow-hidden rounded-sm border-2 border-neutral-900'>
            {/* header strip — same dark as summary accent card */}
            <div className='flex items-center gap-3 bg-neutral-950 px-6 py-4'>
              <BarChart3 className='h-4 w-4 text-neutral-400' />
              <span className='font-mono text-xs font-bold uppercase tracking-widest text-white'>
                Bookings Over Time
              </span>
            </div>
            {/* chart body */}
            <div style={{ background: '#111', padding: '24px 16px 16px 16px' }}>
              {!hasTimeSeriesData ? (
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      color: '#333',
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                  >
                    No bookings in this period
                  </span>
                </div>
              ) : (
                <ResponsiveContainer width='100%' height={200}>
                  <BarChart
                    data={visibleSeries}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                    barCategoryGap='35%'
                  >
                    <CartesianGrid vertical={false} stroke='#1e1e1e' />
                    <XAxis
                      dataKey='date'
                      tickFormatter={(v) => v.slice(5)}
                      tick={axisTick}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={axisTick}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <Tooltip
                      content={
                        <CustomTooltip
                          formatter={(v: number) => v.toString()}
                        />
                      }
                      cursor={{ fill: '#ffffff06' }}
                    />
                    <Bar dataKey='count' radius={[3, 3, 0, 0]} maxBarSize={28}>
                      {visibleSeries.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.count > 0 ? '#e5e5e5' : '#1e1e1e'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Revenue Over Time — dark chart panel ── */}
          <div className='overflow-hidden rounded-sm border-2 border-neutral-900'>
            <div className='flex items-center gap-3 bg-neutral-950 px-6 py-4'>
              <TrendingUp className='h-4 w-4' style={{ color: GOLD }} />
              <span className='font-mono text-xs font-bold uppercase tracking-widest text-white'>
                Revenue Over Time
              </span>
            </div>
            <div style={{ background: '#111', padding: '24px 16px 16px 16px' }}>
              {!hasTimeSeriesData ? (
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      color: '#333',
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                  >
                    No revenue in this period
                  </span>
                </div>
              ) : (
                <ResponsiveContainer width='100%' height={200}>
                  <BarChart
                    data={visibleSeries}
                    margin={{ top: 4, right: 8, left: -4, bottom: 0 }}
                    barCategoryGap='35%'
                  >
                    <CartesianGrid vertical={false} stroke='#1e1e1e' />
                    <XAxis
                      dataKey='date'
                      tickFormatter={(v) => v.slice(5)}
                      tick={axisTick}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => fmtNaira(v)}
                      tick={axisTick}
                      tickLine={false}
                      axisLine={false}
                      width={54}
                    />
                    <Tooltip
                      content={<CustomTooltip formatter={fmtNaira} />}
                      cursor={{ fill: '#ffffff06' }}
                    />
                    <Bar
                      dataKey='revenue'
                      radius={[3, 3, 0, 0]}
                      maxBarSize={28}
                    >
                      {visibleSeries.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.revenue > 0 ? GOLD : '#1e1e1e'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Revenue by Tier + Geographic — white, unchanged ── */}
          <div className='grid gap-6 lg:grid-cols-2'>
            <div className='border-2 border-neutral-900 bg-white'>
              <div className='border-b-2 border-neutral-900 bg-neutral-950 px-6 py-4'>
                <h3 className='font-mono text-xs font-bold uppercase tracking-widest text-white'>
                  Revenue by Tier
                </h3>
              </div>
              <div className='p-6 space-y-5'>
                {Object.entries(data.revenueByTier).length === 0 ? (
                  <p className='font-mono text-xs text-neutral-400'>
                    No tier data yet.
                  </p>
                ) : (
                  Object.entries(data.revenueByTier).map(([tier, stats]) => {
                    const pct =
                      data.summary.totalRevenue > 0
                        ? (
                            (stats.revenue / data.summary.totalRevenue) *
                            100
                          ).toFixed(1)
                        : '0'
                    return (
                      <div key={tier}>
                        <div className='mb-2 flex justify-between font-mono text-xs'>
                          <div className='flex items-center gap-2'>
                            <div
                              className='h-2 w-2 rounded-full'
                              style={{
                                backgroundColor: tierColors[tier] ?? '#999',
                              }}
                            />
                            <span className='font-semibold text-neutral-700'>
                              {tierLabels[tier] ?? tier}
                            </span>
                          </div>
                          <span className='text-neutral-500'>
                            {fmtNaira(stats.revenue)}{' '}
                            <span className='text-neutral-300'>
                              ×{stats.count}
                            </span>
                          </span>
                        </div>
                        <div className='h-1.5 w-full rounded-full bg-neutral-100'>
                          <div
                            className='h-1.5 rounded-full transition-all duration-500'
                            style={{
                              width: `${pct}%`,
                              backgroundColor: tierColors[tier] ?? '#999',
                            }}
                          />
                        </div>
                        <p className='mt-1 text-right font-mono text-[9px] text-neutral-300'>
                          {pct}%
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div className='border-2 border-neutral-900 bg-white'>
              <div className='border-b-2 border-neutral-900 bg-neutral-950 px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <MapPin className='h-4 w-4 text-white' />
                  <h3 className='font-mono text-xs font-bold uppercase tracking-widest text-white'>
                    Geographic Distribution
                  </h3>
                </div>
              </div>
              <div className='p-6 space-y-0'>
                {data.geographic.length === 0 ? (
                  <p className='font-mono text-xs text-neutral-400'>
                    No geographic data yet.
                  </p>
                ) : (
                  data.geographic.map((g, i) => (
                    <div
                      key={g.city}
                      className='flex items-center justify-between py-3 border-b border-neutral-100 last:border-0'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='font-mono text-[10px] font-bold text-neutral-300 w-4'>
                          {i + 1}
                        </span>
                        <div className='flex items-center gap-2'>
                          <MapPin className='h-3 w-3 text-neutral-400' />
                          <span className='font-mono text-sm font-semibold text-neutral-800'>
                            {g.city}
                          </span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-mono text-sm font-bold text-neutral-900'>
                          {g.count}{' '}
                          <span className='font-normal text-neutral-400 text-xs'>
                            attendee{g.count !== 1 ? 's' : ''}
                          </span>
                        </p>
                        <p
                          className='font-mono text-xs font-bold'
                          style={{ color: GOLD }}
                        >
                          {fmtNaira(g.revenue)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {loading && !data && (
        <div className='flex items-center justify-center py-24'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent' />
        </div>
      )}
    </div>
  )
}
