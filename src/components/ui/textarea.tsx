import * as React from "react"

import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  /**
   * Ensure adequate touch target on mobile
   * Increases padding on mobile, normalized on desktop
   * @default true
   */
  mobileFriendly?: boolean
}

function Textarea({ className, mobileFriendly = true, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // Mobile-friendly: more padding and min height for easier interaction
        mobileFriendly ? "min-h-20 px-3 py-2.5 md:min-h-16 md:py-2" : "min-h-16 px-3 py-2",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
