'use client'

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SelectOption {
  value: string
  label: string
}

interface MobileOptimizedSelectProps {
  value?: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  disabled?: boolean
}

/**
 * Select component that renders as a Sheet-based modal on mobile
 * and a traditional Select dropdown on desktop
 *
 * Useful for long select lists on mobile to avoid overflow issues
 *
 * @example
 * const [value, setValue] = useState('');
 * return (
 *   <MobileOptimizedSelect
 *     value={value}
 *     onValueChange={setValue}
 *     options={[
 *       { value: 'opt1', label: 'Option 1' },
 *       { value: 'opt2', label: 'Option 2' },
 *     ]}
 *     placeholder="Select an option"
 *   />
 * );
 */
export function MobileOptimizedSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  label,
  disabled,
}: MobileOptimizedSelectProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  // Show loading state until we know the viewport
  if (isMobile === undefined) {
    return null
  }

  if (isMobile) {
    const selectedOption = options.find((opt) => opt.value === value)

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedOption?.label || placeholder}
          </span>
        </button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="w-full">
            {label && (
              <SheetHeader>
                <SheetTitle>{label}</SheetTitle>
              </SheetHeader>
            )}
            <ScrollArea className="h-[60vh] w-full">
              <div className="space-y-2 p-4">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                      value === option.value
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop: Traditional select dropdown
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-w-[calc(100%-1rem)]">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
