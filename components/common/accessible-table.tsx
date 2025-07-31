"use client"

import * as React from "react"
import { useRef, useEffect, useState } from "react"
import { 
  KEYBOARD_KEYS, 
  ARIA_STATES, 
  SCREEN_READER_MESSAGES, 
  ScreenReaderAnnouncer,
  generateId 
} from "@/lib/accessibility"
import { cn } from "@/lib/utils"

interface AccessibleTableProps extends React.ComponentProps<"table"> {
  caption?: string
  rowCount?: number
  columnCount?: number
  onRowSelect?: (rowIndex: number) => void
  onCellActivate?: (rowIndex: number, cellIndex: number) => void
  multiSelect?: boolean
  selectedRows?: Set<number>
  sortable?: boolean
  sortColumn?: number
  sortDirection?: 'asc' | 'desc'
  onSort?: (columnIndex: number) => void
}

export function AccessibleTable({
  caption,
  rowCount,
  columnCount,
  onRowSelect,
  onCellActivate,
  multiSelect = false,
  selectedRows = new Set(),
  sortable = false,
  sortColumn,
  sortDirection,
  onSort,
  className,
  children,
  ...props
}: AccessibleTableProps) {
  const tableRef = useRef<HTMLTableElement>(null)
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null)
  const [announcer] = useState(() => ScreenReaderAnnouncer.getInstance())
  const tableId = generateId('table')
  const captionId = generateId('table-caption')

  // Handle keyboard navigation within table
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!tableRef.current || !focusedCell) return

    const rows = tableRef.current.querySelectorAll('tbody tr')
    const currentRow = rows[focusedCell.row] as HTMLTableRowElement
    const cells = currentRow?.querySelectorAll('td, th')
    
    let newFocus = { ...focusedCell }
    let handled = false

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_RIGHT:
        if (focusedCell.col < (cells?.length || 0) - 1) {
          newFocus.col += 1
          handled = true
        }
        break
      case KEYBOARD_KEYS.ARROW_LEFT:
        if (focusedCell.col > 0) {
          newFocus.col -= 1
          handled = true
        }
        break
      case KEYBOARD_KEYS.ARROW_DOWN:
        if (focusedCell.row < rows.length - 1) {
          newFocus.row += 1
          handled = true
        }
        break
      case KEYBOARD_KEYS.ARROW_UP:
        if (focusedCell.row > 0) {
          newFocus.row -= 1
          handled = true
        }
        break
      case KEYBOARD_KEYS.HOME:
        if (event.ctrlKey) {
          newFocus = { row: 0, col: 0 }
        } else {
          newFocus.col = 0
        }
        handled = true
        break
      case KEYBOARD_KEYS.END:
        if (event.ctrlKey) {
          newFocus = { row: rows.length - 1, col: (cells?.length || 1) - 1 }
        } else {
          newFocus.col = (cells?.length || 1) - 1
        }
        handled = true
        break
      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        if (multiSelect && focusedCell.col === 0) {
          // Handle row selection
          onRowSelect?.(focusedCell.row)
          const isSelected = selectedRows.has(focusedCell.row)
          announcer.announce(
            isSelected ? SCREEN_READER_MESSAGES.UNSELECTED : SCREEN_READER_MESSAGES.SELECTED
          )
        } else {
          onCellActivate?.(focusedCell.row, focusedCell.col)
        }
        handled = true
        break
    }

    if (handled) {
      event.preventDefault()
      setFocusedCell(newFocus)
      focusCell(newFocus.row, newFocus.col)
    }
  }

  // Focus a specific cell
  const focusCell = (rowIndex: number, colIndex: number) => {
    if (!tableRef.current) return

    const rows = tableRef.current.querySelectorAll('tbody tr')
    const row = rows[rowIndex] as HTMLTableRowElement
    const cells = row?.querySelectorAll('td, th')
    const cell = cells?.[colIndex] as HTMLTableCellElement

    if (cell) {
      // Find focusable element within cell or focus the cell itself
      const focusableElement = cell.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      
      if (focusableElement) {
        focusableElement.focus()
      } else {
        cell.tabIndex = 0
        cell.focus()
      }

      // Update ARIA attributes
      cell.setAttribute(ARIA_STATES.SELECTED, 'true')
      
      // Clear previous selection
      const allCells = tableRef.current.querySelectorAll('td, th')
      allCells.forEach(c => {
        if (c !== cell) {
          c.setAttribute(ARIA_STATES.SELECTED, 'false')
          ;(c as HTMLElement).tabIndex = -1
        }
      })
    }
  }

  // Handle sort column click
  const handleSortClick = (columnIndex: number) => {
    if (!sortable || !onSort) return
    
    onSort(columnIndex)
    
    const direction = sortColumn === columnIndex && sortDirection === 'asc' ? 'desc' : 'asc'
    announcer.announce(
      direction === 'asc' ? SCREEN_READER_MESSAGES.SORTED_ASC : SCREEN_READER_MESSAGES.SORTED_DESC
    )
  }

  // Initialize focus on first cell
  useEffect(() => {
    if (tableRef.current && !focusedCell) {
      setFocusedCell({ row: 0, col: 0 })
    }
  }, [focusedCell])

  return (
    <div className="relative w-full overflow-x-auto">
      <table
        ref={tableRef}
        id={tableId}
        role="grid"
        aria-labelledby={caption ? captionId : undefined}
        aria-rowcount={rowCount}
        aria-colcount={columnCount}
        aria-multiselectable={multiSelect}
        onKeyDown={handleKeyDown}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {caption && (
          <caption id={captionId} className="mt-4 text-sm text-muted-foreground">
            {caption}
          </caption>
        )}
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              // Pass down table context
              onSortClick: handleSortClick,
              sortColumn,
              sortDirection,
              focusedCell,
              selectedRows,
              multiSelect,
              ...(child.props || {})
            })
          }
          return child
        })}
      </table>
    </div>
  )
}

interface AccessibleTableHeaderProps extends React.ComponentProps<"thead"> {
  onSortClick?: (columnIndex: number) => void
  sortColumn?: number
  sortDirection?: 'asc' | 'desc'
}

export function AccessibleTableHeader({
  onSortClick,
  sortColumn,
  sortDirection,
  className,
  children,
  ...props
}: AccessibleTableHeaderProps) {
  return (
    <thead
      role="rowgroup"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    >
      {React.Children.map(children, (child, rowIndex) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            role: "row",
            "aria-rowindex": rowIndex + 1,
            onSortClick,
            sortColumn,
            sortDirection,
            ...(child.props || {})
          })
        }
        return child
      })}
    </thead>
  )
}

interface AccessibleTableBodyProps extends React.ComponentProps<"tbody"> {
  selectedRows?: Set<number>
  multiSelect?: boolean
}

export function AccessibleTableBody({
  selectedRows = new Set(),
  multiSelect = false,
  className,
  children,
  ...props
}: AccessibleTableBodyProps) {
  return (
    <tbody
      role="rowgroup"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    >
      {React.Children.map(children, (child, rowIndex) => {
        if (React.isValidElement(child)) {
          const isSelected = selectedRows.has(rowIndex)
          return React.cloneElement(child as React.ReactElement<any>, {
            role: "row",
            "aria-rowindex": rowIndex + 2, // +2 because header is row 1
            "aria-selected": multiSelect ? isSelected : undefined,
            "data-state": isSelected ? "selected" : undefined,
            ...(child.props || {})
          })
        }
        return child
      })}
    </tbody>
  )
}

interface AccessibleTableRowProps extends React.ComponentProps<"tr"> {
  onSortClick?: (columnIndex: number) => void
  sortColumn?: number
  sortDirection?: 'asc' | 'desc'
}

export function AccessibleTableRow({
  onSortClick,
  sortColumn,
  sortDirection,
  className,
  children,
  ...props
}: AccessibleTableRowProps) {
  return (
    <tr
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, colIndex) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            "aria-colindex": colIndex + 1,
            onSortClick: child.type === AccessibleTableHead ? onSortClick : undefined,
            sortColumn,
            sortDirection,
            columnIndex: colIndex,
            ...(child.props || {})
          })
        }
        return child
      })}
    </tr>
  )
}

interface AccessibleTableHeadProps extends React.ComponentProps<"th"> {
  sortable?: boolean
  onSortClick?: (columnIndex: number) => void
  sortColumn?: number
  sortDirection?: 'asc' | 'desc'
  columnIndex?: number
}

export function AccessibleTableHead({
  sortable = false,
  onSortClick,
  sortColumn,
  sortDirection,
  columnIndex = 0,
  className,
  children,
  ...props
}: AccessibleTableHeadProps) {
  const isCurrentSort = sortColumn === columnIndex
  const headId = generateId('table-head')

  const handleClick = () => {
    if (sortable && onSortClick) {
      onSortClick(columnIndex)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (sortable && (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE)) {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <th
      id={headId}
      role="columnheader"
      aria-sort={
        isCurrentSort 
          ? sortDirection === 'asc' ? 'ascending' : 'descending'
          : sortable ? 'none' : undefined
      }
      tabIndex={sortable ? 0 : undefined}
      onClick={sortable ? handleClick : undefined}
      onKeyDown={sortable ? handleKeyDown : undefined}
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        sortable && "cursor-pointer hover:bg-muted/50 keyboard-focus",
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

interface AccessibleTableCellProps extends React.ComponentProps<"td"> {}

export function AccessibleTableCell({
  className,
  children,
  ...props
}: AccessibleTableCellProps) {
  return (
    <td
      role="gridcell"
      tabIndex={-1}
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] keyboard-focus-inset",
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}