import * as React from 'react'

import { cn } from '@/lib/utils'

interface SummaryStatCardProps {
  icon: React.ReactNode
  iconBgClassName: string
  label: string
  value: number | string
  className?: string
  onClick?: () => void
}

function SummaryStatCard({
  icon,
  iconBgClassName,
  label,
  value,
  className,
  onClick,
}: SummaryStatCardProps) {
  return (
    <div
      className={cn(
        'bg-white flex gap-4 rounded-lg py-5 px-4 items-center border border-gray-100',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className,
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-lg shrink-0',
          iconBgClassName,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[#000000] text-sm block mb-1 font-bold">{label}</span>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  )
}

function SummaryStatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg py-5 px-4 border border-gray-100 animate-pulse',
        className,
      )}
    >
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-16 h-6 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}

export { SummaryStatCard, SummaryStatCardSkeleton }
export type { SummaryStatCardProps }
