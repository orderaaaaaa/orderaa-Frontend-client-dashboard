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
  const content = (
    <>
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-lg shrink-0',
          iconBgClassName,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col min-w-0 text-start">
        <span className="text-[#000000] text-sm block mb-1 font-bold">{label}</span>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </>
  )

  const baseClassName =
    'bg-white flex gap-4 rounded-lg py-5 px-4 items-center border border-gray-100'

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(
          baseClassName,
          'w-full cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          className,
        )}
        onClick={onClick}
      >
        {content}
      </button>
    )
  }

  return <div className={cn(baseClassName, className)}>{content}</div>
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
