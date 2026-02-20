'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, MapPin, RefreshCw } from 'lucide-react'
import { getRevenueAnalytics, type RevenueAnalytics } from '@/lib/admin/auth'

function fmtNaira(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`
  return `₦${n.toLocaleString('en-NG')}`
}

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

/** Simple bar chart using pure HTML/CSS — no external chart library needed */
function BarChart({
  data,
  valueKey,
  labelKey = 'date',
  color = '#171717',
  formatValue = String,
}: {
  data: Record<string, any>[]
  valueKey: string
  labelKey?: string
  color?: string
  formatValue?: (v: number) => string
}) {
  if (!data || data.length === 0)
    return (
      <p className='py-8 text-center font-mono text-xs text-neutral-400'>
        No data for this period.
      </p>
    )

  const max = Math.max(...data.map((d) => d[valueKey] ?? 0), 1)

  // Show last 30 points max
  const visible = data.slice(-30)

  return (
    <div className='space-y-2'>
      <div className='flex items-end gap-0.5 h-32'>
        {visible.map((item, i) => {
          const val = item[valueKey] ?? 0
          const pct = (val / max) * 100
          return (
            <div
              key={i}
              className='group relative flex-1 flex flex-col justify-end'
              title={`${item[labelKey]}: ${formatValue(val)}`}
            >
              <div
                className='w-full rounded-t-sm transition-all group-hover:opacity-80'
                style={{
                  height: `${Math.max(pct, val > 0 ? 4 : 0)}%`,
                  backgroundColor: color,
                }}
              />
              {val > 0 && (
                <div className='absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-1 font-mono text-[10px] text-white group-hover:block z-10'>
                  {formatValue(val)}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {/* X-axis labels — show first, middle, last */}
      <div className='flex justify-between font-mono text-[9px] text-neutral-400'>
        <span>{visible[0]?.[labelKey]?.slice(5)}</span>
        <span>
          {visible[Math.floor(visible.length / 2)]?.[labelKey]?.slice(5)}
        </span>
        <span>{visible[visible.length - 1]?.[labelKey]?.slice(5)}</span>
      </div>
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
      const result = await getRevenueAnalytics(d)
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(days)
  }, [days])

  const tierColors: Record<string, string> = {
    virtual: '#2563eb',
    full: '#d4a422',
    consulting: '#16a34a',
  }
  const tierLabels: Record<string, string> = {
    virtual: 'Virtual Masterclass',
    full: 'Signature Live',
    consulting: 'Consulting',
  }

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

      {data && (
        <>
          {/* Summary cards */}
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

          {/* Bookings over time chart */}
          <div className='border-4 border-neutral-900 bg-white'>
            <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
              <div className='flex items-center gap-3'>
                <BarChart3 className='h-5 w-5 text-white' />
                <h3 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                  Bookings Over Time
                </h3>
              </div>
            </div>
            <div className='p-6'>
              <BarChart
                data={data.timeSeries}
                valueKey='count'
                formatValue={String}
                color='#171717'
              />
            </div>
          </div>

          {/* Revenue over time chart */}
          <div className='border-4 border-neutral-900 bg-white'>
            <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
              <div className='flex items-center gap-3'>
                <TrendingUp className='h-5 w-5 text-white' />
                <h3 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                  Revenue Over Time
                </h3>
              </div>
            </div>
            <div className='p-6'>
              <BarChart
                data={data.timeSeries}
                valueKey='revenue'
                formatValue={fmtNaira}
                color='#2563eb'
              />
            </div>
          </div>

          {/* Revenue by tier + Geographic side by side */}
          <div className='grid gap-6 lg:grid-cols-2'>
            {/* By tier */}
            <div className='border-4 border-neutral-900 bg-white'>
              <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
                <h3 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                  Revenue by Tier
                </h3>
              </div>
              <div className='p-6 space-y-4'>
                {Object.entries(data.revenueByTier).map(([tier, stats]) => {
                  const pct =
                    data.summary.totalRevenue > 0
                      ? (
                          (stats.revenue / data.summary.totalRevenue) *
                          100
                        ).toFixed(1)
                      : '0'
                  return (
                    <div key={tier}>
                      <div className='mb-1 flex justify-between font-mono text-xs'>
                        <span className='font-semibold text-neutral-700'>
                          {tierLabels[tier] ?? tier}
                        </span>
                        <span className='text-neutral-500'>
                          {fmtNaira(stats.revenue)} ({stats.count})
                        </span>
                      </div>
                      <div className='h-2 w-full rounded-full bg-neutral-200'>
                        <div
                          className='h-2 rounded-full transition-all'
                          style={{
                            width: `${pct}%`,
                            backgroundColor: tierColors[tier] ?? '#999',
                          }}
                        />
                      </div>
                      <p className='mt-0.5 text-right font-mono text-[10px] text-neutral-400'>
                        {pct}%
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Geographic */}
            <div className='border-4 border-neutral-900 bg-white'>
              <div className='border-b-4 border-neutral-900 bg-neutral-950 px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <MapPin className='h-5 w-5 text-white' />
                  <h3 className='font-mono text-sm font-bold uppercase tracking-wider text-white'>
                    Geographic Distribution
                  </h3>
                </div>
              </div>
              <div className='p-6 space-y-3'>
                {data.geographic.length === 0 ? (
                  <p className='font-mono text-xs text-neutral-400'>
                    No geographic data yet.
                  </p>
                ) : (
                  data.geographic.map((g, i) => (
                    <div
                      key={g.city}
                      className='flex items-center justify-between border-b border-neutral-100 pb-3 last:border-0 last:pb-0'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='font-mono text-[11px] font-bold text-neutral-400'>
                          #{i + 1}
                        </span>
                        <div className='flex items-center gap-2'>
                          <MapPin className='h-3.5 w-3.5 text-neutral-500' />
                          <span className='font-mono text-sm font-semibold text-neutral-800'>
                            {g.city}
                          </span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-mono text-sm font-bold text-neutral-900'>
                          {g.count} attendee{g.count !== 1 ? 's' : ''}
                        </p>
                        <p className='font-mono text-xs text-neutral-500'>
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
