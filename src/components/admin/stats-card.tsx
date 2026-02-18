'use client'

import { Users, UserCheck, UserX, Percent, Wifi, Globe } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalLiveRegistered: number
    totalCheckedIn: number
    totalNotCheckedIn: number
    checkInRate: number
    totalVirtual: number
    totalAllAccess: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Live Registered',
      value: stats.totalLiveRegistered,
      icon: Users,
      color: 'border-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Checked In',
      value: stats.totalCheckedIn,
      icon: UserCheck,
      color: 'border-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Not Checked In',
      value: stats.totalNotCheckedIn,
      icon: UserX,
      color: 'border-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Check-in Rate',
      value: `${stats.checkInRate.toFixed(1)}%`,
      icon: Percent,
      color: 'border-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Virtual Access',
      value: stats.totalVirtual,
      icon: Wifi,
      color: 'border-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      label: 'Total All Access',
      value: stats.totalAllAccess,
      icon: Globe,
      color: 'border-neutral-900',
      bgColor: 'bg-neutral-100',
      iconColor: 'text-neutral-900',
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {cards.map((card) => (
        <div
          key={card.label}
          className={`border-l-4 ${card.color} ${card.bgColor} p-5`}
        >
          <div className='mb-3 flex items-center justify-between'>
            <p className='font-mono text-xs font-bold uppercase tracking-wider text-neutral-600'>
              {card.label}
            </p>
            <card.icon
              className={`h-5 w-5 ${card.iconColor}`}
              strokeWidth={2}
            />
          </div>
          <p className={`font-mono text-3xl font-bold ${card.iconColor}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}
