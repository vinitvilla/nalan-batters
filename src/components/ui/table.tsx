"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface TableProps extends React.ComponentProps<"table"> {
  /**
   * Enable mobile card view on small screens
   * Requires TableRow children to have data-label attributes on TableCell elements
   * @default false
   */
  mobileCardView?: boolean
}

function Table({ className, mobileCardView = false, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full",
        mobileCardView ? "md:overflow-x-auto" : "overflow-x-auto"
      )}
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-sm",
          mobileCardView && "md:border-collapse border-collapse",
          className
        )}
        {...props}
      />
    </div>
  )
}

interface TableHeaderProps extends React.ComponentProps<"thead"> {
  /**
   * Hide header on mobile (when using mobileCardView)
   * @default false
   */
  hideOnMobile?: boolean
}

function TableHeader({ className, hideOnMobile = false, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b",
        hideOnMobile && "hidden md:table-header-group",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

interface TableRowProps extends React.ComponentProps<"tr"> {
  /**
   * Display row as a card on mobile
   * @default false
   */
  mobileCard?: boolean
}

function TableRow({ className, mobileCard = false, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        mobileCard && "md:border-b md:hover:bg-muted/50 block md:table-row border-0 mb-4 md:mb-0 rounded-lg border md:rounded-none md:border-b overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

interface TableCellProps extends React.ComponentProps<"td"> {
  /**
   * Label to show before the value on mobile card view
   * Used with mobileCard variant on parent TableRow
   * @example <TableCell mobileLabel="Name">John Doe</TableCell>
   */
  mobileLabel?: string
}

function TableCell({ className, mobileLabel, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        mobileLabel && "block md:table-cell md:p-2 p-4 before:content-[attr(data-label)] before:font-bold before:block before:text-sm before:text-muted-foreground before:mb-1",
        className
      )}
      data-label={mobileLabel}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
