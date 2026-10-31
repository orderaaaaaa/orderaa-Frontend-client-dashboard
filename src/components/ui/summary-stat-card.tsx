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
          'flex items-center justify-center size-10 sm:size-12 rounded-lg shrink-0',
          iconBgClassName,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col min-w-0 text-start">
        <span className="block mb-1 text-sm font-medium text-muted-foreground">{label}</span>
        <div className="text-xl sm:text-2xl font-bold break-words text-foreground">{value}</div>
      </div>
    </>
  )

  const baseClassName =
    'bg-card text-card-foreground flex flex-col gap-3 rounded-xl py-4 px-4 items-start border border-border shadow-soft sm:flex-row sm:items-center sm:gap-4 sm:py-5'

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(
          baseClassName,
          'w-full cursor-pointer hover:shadow-elevated transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
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
        'bg-card rounded-xl py-4 px-4 border border-border shadow-soft animate-pulse sm:py-5',
        className,
      )}
    >
      <div className="flex gap-4 items-center">
        <div className="size-10 sm:size-12 bg-muted rounded-lg shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="w-24 h-4 bg-muted rounded" />
          <div className="w-16 h-6 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

export { SummaryStatCard, SummaryStatCardSkeleton }
export type { SummaryStatCardProps }
