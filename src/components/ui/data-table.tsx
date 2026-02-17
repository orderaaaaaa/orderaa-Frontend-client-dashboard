'use client'

import * as React from 'react'

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
}: DataTableProps<T>) {
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
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    'px-2 py-2 sm:px-4 sm:py-4 font-medium text-gray-700 border-l border-gray-200 last:border-l-0 whitespace-normal text-xs sm:text-sm',
                    col.headerClassName,
                    col.className,
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
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
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'px-2 py-2 sm:px-4 sm:py-4 font-bold border-l border-gray-200 last:border-l-0 whitespace-normal text-xs sm:text-sm',
                  col.headerClassName,
                  col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && emptyMessage ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={String(row[keyField])}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export { DataTable }
export type { DataTableColumn, DataTableProps }
