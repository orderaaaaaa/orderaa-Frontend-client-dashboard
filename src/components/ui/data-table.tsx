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
import { Checkbox } from '@/components/ui/checkbox'

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
  selectable?: boolean
  selectedIds?: Set<string | number>
  onSelectionChange?: (ids: Set<string | number>) => void
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
  selectable = false,
  selectedIds,
  onSelectionChange,
}: DataTableProps<T>) {
  const allRowIds = data.map((row) => row[keyField] as string | number)
  const allSelected = selectable && allRowIds.length > 0 && selectedIds
    ? allRowIds.every((id) => selectedIds.has(id))
    : false
  const someSelected = selectable && selectedIds
    ? allRowIds.some((id) => selectedIds.has(id)) && !allSelected
    : false

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    if (allSelected) {
      const next = new Set(selectedIds)
      allRowIds.forEach((id) => next.delete(id))
      onSelectionChange(next)
    } else {
      const next = new Set(selectedIds)
      allRowIds.forEach((id) => next.add(id))
      onSelectionChange(next)
    }
  }

  const handleSelectRow = (id: string | number) => {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onSelectionChange(next)
  }

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
          'px-2 py-2 sm:px-4 sm:py-4 border-l border-gray-200 last:border-l-0 whitespace-normal text-xs sm:text-sm max-sm:!w-auto',
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
          'rounded-lg border border-gray-100 shadow-md overflow-x-auto',
          className,
        )}
      >
        <Table className="w-full min-w-max sm:min-w-0 bg-white">
          <TableHeader>
            <TableRow className={cn('bg-[#f1eefa]', headerClassName)}>
              {selectable && (
                <TableHead className="px-2 py-2 sm:px-4 sm:py-4 border-l border-gray-200 w-12 text-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5 mx-auto" />
                </TableHead>
              )}
              {columns.map((col) => renderHeader(col, true))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                {selectable && (
                  <TableCell className="px-2 py-2 sm:px-4 sm:py-3 border-l border-gray-200 w-12 text-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5 mx-auto" />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      'px-2 py-2 sm:px-4 sm:py-3 border-l border-gray-200 last:border-l-0 whitespace-normal max-sm:!w-auto',
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
        'rounded-lg border border-gray-100 shadow-md overflow-x-auto',
        className,
      )}
    >
      <Table className="w-full min-w-max sm:min-w-0 bg-white">
        <TableHeader>
          <TableRow className={cn('bg-[#f1eefa]', headerClassName)}>
            {selectable && (
              <TableHead className="!px-2 !py-2 sm:!px-4 sm:!py-4 border-l border-gray-200 w-12">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
              </TableHead>
            )}
            {columns.map((col) => renderHeader(col))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (emptyMessage || emptyContent) ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                {emptyContent ?? emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const rowId = row[keyField] as string | number
              const isSelected = selectable && selectedIds?.has(rowId)
              const subRowContent = renderSubRow?.(row)
              return (
                <React.Fragment key={String(rowId)}>
                  <TableRow
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-gray-50',
                      isSelected ? 'bg-blue-50/40' : '',
                    )}
                  >
                    {selectable && (
                      <TableCell className="!px-2 !py-2 sm:!px-4 sm:!py-3 border-l border-gray-200 w-12">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={!!isSelected}
                            onCheckedChange={() => handleSelectRow(rowId)}
                          />
                        </div>
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          'px-2 py-2 sm:px-4 sm:py-3 border-l border-gray-200 last:border-l-0 whitespace-normal text-xs sm:text-sm max-sm:!w-auto',
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
                        colSpan={columns.length + (selectable ? 1 : 0)}
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
