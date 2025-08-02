"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface TacticalTableColumn<T = any> {
  key: string
  header: string
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

interface TacticalTableProps<T = any> {
  data: T[]
  columns: TacticalTableColumn<T>[]
  loading?: boolean
  onRowClick?: (row: T) => void
  className?: string
  emptyMessage?: string
}

const TacticalTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  className,
  emptyMessage = "No data available"
}: TacticalTableProps<T>) => {
  if (loading) {
    return (
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-neutral-400 mt-4 font-mono text-sm">LOADING DATA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-neutral-700 hover:bg-neutral-800">
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={cn(
                  "text-neutral-300 font-medium tracking-wider text-xs h-12 px-4",
                  column.headerClassName
                )}
              >
                {column.header.toUpperCase()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="text-center py-8 text-neutral-400 font-mono"
              >
                {emptyMessage.toUpperCase()}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                className={cn(
                  "border-neutral-700 hover:bg-neutral-800 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.key}
                    className={cn(
                      "text-white font-mono text-sm px-4 py-3",
                      column.className
                    )}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
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

export { TacticalTable }