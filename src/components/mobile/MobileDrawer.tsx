'use client'

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
}

/**
 * Component that renders as a Sheet on mobile and Dialog on desktop
 * Provides responsive modal/drawer behavior across all viewport sizes
 *
 * @example
 * const [open, setOpen] = useState(false);
 * return (
 *   <MobileDrawer open={open} onOpenChange={setOpen} title="Settings">
 *     <SettingsContent />
 *   </MobileDrawer>
 * );
 */
export function MobileDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
}: MobileDrawerProps) {
  const isMobile = useIsMobile()

  // Show loading state until we know the viewport
  if (isMobile === undefined) {
    return null
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:w-full">
          {title && (
            <SheetHeader>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && <SheetDescription>{description}</SheetDescription>}
            </SheetHeader>
          )}
          <div className="mt-4 overflow-y-auto">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {title && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
