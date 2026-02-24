'use client'

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Column {
  key: string
  label: string
  render?: (value: any) => React.ReactNode
}

interface MobileOptimizedTableProps {
  columns: Column[]
  data: Record<string, any>[]
  className?: string
}

/**
 * Component that renders a responsive table with card view on mobile
 * On desktop: Traditional table layout
 * On mobile: Card-based layout with data labels
 *
 * @example
 * const columns = [
 *   { key: 'name', label: 'Name' },
 *   { key: 'email', label: 'Email' },
 * ];
 * const data = [
 *   { name: 'John', email: 'john@example.com' },
 * ];
 * return <MobileOptimizedTable columns={columns} data={data} />;
 */
export function MobileOptimizedTable({
  columns,
  data,
  className = '',
}: MobileOptimizedTableProps) {
  const isMobile = useIsMobile()

  // Show loading state until we know the viewport
  if (isMobile === undefined) {
    return null
  }

  if (isMobile) {
    // Card view for mobile
    return (
      <div className="space-y-4">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 space-y-3 bg-card"
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start">
                <span className="font-medium text-sm text-muted-foreground">
                  {column.label}
                </span>
                <span className="text-sm text-right">
                  {column.render ? column.render(row[column.key]) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Traditional table view for desktop
  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            {columns.map((column) => (
              <TableHead key={column.key} className="font-semibold">
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx} className="hover:bg-muted/50">
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render ? column.render(row[column.key]) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
