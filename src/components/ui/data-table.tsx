'use client'

import * as React from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

interface DataTableColumn<T> {
  key: string
  header: string
  render?: (value: unknown, row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyField?: string
  headerClassName?: string
  isLoading?: boolean
  skeletonRows?: number
  className?: string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  emptyContent?: React.ReactNode
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: string) => void
  renderSubRow?: (row: T) => React.ReactNode | null
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  headerClassName,
  isLoading = false,
  skeletonRows = 5,
  className,
  onRowClick,
  emptyMessage,
  emptyContent,
  sortBy,
  sortOrder,
  onSort,
  renderSubRow,
}: DataTableProps<T>) {
  const renderSortIcon = (col: DataTableColumn<T>) => {
    if (!col.sortable || !onSort) return null
    if (sortBy !== col.key) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 shrink-0" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 shrink-0" />
    )
  }

  const renderHeader = (col: DataTableColumn<T>, isSkeleton?: boolean) => {
    const isSortable = col.sortable && onSort
    return (
      <TableHead
        key={col.key}
        className={cn(
          'px-2 py-2 sm:px-4 sm:py-4 border-l border-gray-200 last:border-l-0 whitespace-normal text-xs sm:text-sm',
          isSkeleton ? 'font-medium text-gray-700' : 'font-bold',
          isSortable && 'cursor-pointer hover:bg-gray-100 transition-colors select-none',
          isSortable && sortBy === col.key && 'text-primary',
          col.headerClassName,
          col.className,
        )}
        onClick={isSortable ? () => onSort(col.key) : undefined}
      >
        <div className={cn('flex items-center gap-1.5', isSortable && 'justify-center')}>
          <span>{col.header}</span>
          {renderSortIcon(col)}
        </div>
      </TableHead>
    )
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-white rounded-lg border border-gray-100 shadow-md overflow-x-auto',
          className,
        )}
      >
        <Table className="w-full min-w-0">
          <TableHeader>
            <TableRow className={cn('bg-[#f1eefa]', headerClassName)}>
              {columns.map((col) => renderHeader(col, true))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      'px-2 py-2 sm:px-4 sm:py-3 border-l border-gray-200 last:border-l-0 whitespace-normal',
                      col.className,
                    )}
                  >
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full max-w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-100 shadow-md overflow-x-auto',
        className,
      )}
    >
      <Table className="w-full min-w-0">
        <TableHeader>
          <TableRow className={cn('bg-[#f1eefa]', headerClassName)}>
            {columns.map((col) => renderHeader(col))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (emptyMessage || emptyContent) ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                {emptyContent ?? emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const subRowContent = renderSubRow?.(row)
              return (
                <React.Fragment key={String(row[keyField])}>
                  <TableRow
                    onClick={() => onRowClick?.(row)}
                    className={cn(onRowClick && 'cursor-pointer hover:bg-gray-50')}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          'px-2 py-2 sm:px-4 sm:py-3 border-l border-gray-200 last:border-l-0 whitespace-normal text-xs sm:text-sm',
                          col.className,
                        )}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                  {subRowContent && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="p-0 border-l-0"
                      >
                        {subRowContent}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export { DataTable }
export type { DataTableColumn, DataTableProps }
