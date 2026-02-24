'use client'

import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"

/**
 * Button component that ensures 44x44px touch target size on mobile
 * Extends the standard Button component with mobile-safe padding
 *
 * WCAG guideline: Touch targets should be at least 44x44px
 *
 * @example
 * <TouchFriendlyButton onClick={handleClick}>
 *   Click Me
 * </TouchFriendlyButton>
 */
export const TouchFriendlyButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    /**
     * If true, adds extra padding for small content to ensure 44x44px minimum
     * @default true
     */
    ensureMinSize?: boolean
  }
>(({ className = '', ensureMinSize = true, ...props }, ref) => {
  // Add padding to ensure 44x44px minimum touch target
  const sizeClasses = ensureMinSize ? 'h-11 px-4 md:h-10 md:px-3' : ''

  return (
    <Button
      ref={ref}
      className={`${sizeClasses} ${className}`}
      {...props}
    />
  )
})

TouchFriendlyButton.displayName = 'TouchFriendlyButton'
