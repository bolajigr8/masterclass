'use client'

import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Monitor,
  Briefcase,
} from 'lucide-react'
import type { DayStats } from '@/lib/admin/auth'

interface StatsCardsProps {
  stats: DayStats
  selectedDay: 1 | 2
  isTwoDay: boolean
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  accent?: boolean
  muted?: boolean
}

function StatCard({ label, value, sub, icon, accent, muted }: StatCardProps) {
  return (
    <div
      className={`border-2 p-5 ${
        accent
          ? 'border-neutral-900 bg-neutral-950 text-white'
          : muted
            ? 'border-neutral-300 bg-neutral-50 text-neutral-500'
            : 'border-neutral-900 bg-white text-neutral-900'
      }`}
    >
      <div className='mb-3 flex items-center justify-between'>
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-[0.15em] ${
            accent
              ? 'text-neutral-400'
              : muted
                ? 'text-neutral-400'
                : 'text-neutral-500'
          }`}
        >
          {label}
        </span>
        <span
          className={
            accent
              ? 'text-neutral-400'
              : muted
                ? 'text-neutral-300'
                : 'text-neutral-400'
          }
        >
          {icon}
        </span>
      </div>
      <p
        className={`font-mono text-4xl font-black ${
          accent
            ? 'text-white'
            : muted
              ? 'text-neutral-400'
              : 'text-neutral-900'
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`mt-1 font-mono text-xs ${
            accent
              ? 'text-neutral-400'
              : muted
                ? 'text-neutral-400'
                : 'text-neutral-500'
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  )
}

export default function StatsCards({
  stats,
  selectedDay,
  isTwoDay,
}: StatsCardsProps) {
  const checkedIn =
    selectedDay === 1 ? stats.totalCheckedInDay1 : stats.totalCheckedInDay2
  const notCheckedIn =
    selectedDay === 1
      ? stats.totalNotCheckedInDay1
      : stats.totalNotCheckedInDay2
  const rate = selectedDay === 1 ? stats.checkInRateDay1 : stats.checkInRateDay2

  return (
    <div className='space-y-4'>
      {/* Primary row */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label='Total Registered'
          value={stats.totalLiveRegistered}
          sub='Full-access confirmed'
          icon={<Users className='h-5 w-5' />}
        />
        <StatCard
          label={`Checked In${isTwoDay ? ` · Day ${selectedDay}` : ''}`}
          value={checkedIn}
          sub={`${rate}% check-in rate`}
          icon={<UserCheck className='h-5 w-5' />}
          accent
        />
        <StatCard
          label={`Not Checked In${isTwoDay ? ` · Day ${selectedDay}` : ''}`}
          value={notCheckedIn}
          sub='Still outstanding'
          icon={<UserX className='h-5 w-5' />}
        />
        <StatCard
          label='Check-In Rate'
          value={`${rate}%`}
          sub={`Day ${selectedDay}`}
          icon={<TrendingUp className='h-5 w-5' />}
        />
      </div>

      {/* Secondary row — only show 2-day comparison and other tiers if relevant */}
      {(isTwoDay || stats.totalVirtual > 0 || stats.totalConsulting > 0) && (
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {isTwoDay && (
            <>
              <StatCard
                label='Day 1 Checked In'
                value={stats.totalCheckedInDay1}
                sub={`${stats.checkInRateDay1}%`}
                icon={<UserCheck className='h-4 w-4' />}
                muted={selectedDay !== 1}
                accent={selectedDay === 1}
              />
              <StatCard
                label='Day 2 Checked In'
                value={stats.totalCheckedInDay2}
                sub={`${stats.checkInRateDay2}%`}
                icon={<UserCheck className='h-4 w-4' />}
                muted={selectedDay !== 2}
                accent={selectedDay === 2}
              />
            </>
          )}
          {stats.totalVirtual > 0 && (
            <StatCard
              label='Virtual Access'
              value={stats.totalVirtual}
              sub='Online attendees'
              icon={<Monitor className='h-4 w-4' />}
              muted
            />
          )}
          {stats.totalConsulting > 0 && (
            <StatCard
              label='Consulting'
              value={stats.totalConsulting}
              sub='1-on-1 sessions'
              icon={<Briefcase className='h-4 w-4' />}
              muted
            />
          )}
        </div>
      )}
    </div>
  )
}
