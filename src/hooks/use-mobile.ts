import * as React from "react"

// Tailwind breakpoints - keep in sync with tailwind.config.ts
const BREAKPOINTS = {
  sm: 640,
  md: 768,    // Mobile breakpoint
  lg: 1024,   // Tablet/Desktop breakpoint
  xl: 1280,
  '2xl': 1536,
}

/**
 * Hook to detect if viewport is in mobile range (< 768px)
 * Useful for showing/hiding mobile-specific UI
 *
 * @example
 * const isMobile = useIsMobile();
 * return isMobile ? <MobileMenu /> : <DesktopMenu />;
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.md)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * Hook to detect if viewport is tablet range (768px - 1023px)
 *
 * @example
 * const isTablet = useIsTablet();
 * return isTablet ? <TabletLayout /> : null;
 */
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`)
    const onChange = () => {
      setIsTablet(window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg)
    }
    mql.addEventListener("change", onChange)
    setIsTablet(window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

/**
 * Hook to detect if viewport is desktop range (>= 1024px)
 *
 * @example
 * const isDesktop = useIsDesktop();
 * return isDesktop ? <DesktopNavigation /> : null;
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`)
    const onChange = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.lg)
    }
    mql.addEventListener("change", onChange)
    setIsDesktop(window.innerWidth >= BREAKPOINTS.lg)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isDesktop
}

/**
 * Hook to detect if device is in landscape orientation
 * Useful for handling fixed headers/footers on mobile landscape
 *
 * @example
 * const isLandscape = useIsLandscape();
 * return isLandscape ? <CompactHeader /> : <NormalHeader />;
 */
export function useIsLandscape() {
  const [isLandscape, setIsLandscape] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape)')
    const onChange = () => {
      setIsLandscape(window.matchMedia('(orientation: landscape)').matches)
    }
    mql.addEventListener("change", onChange)
    setIsLandscape(window.matchMedia('(orientation: landscape)').matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isLandscape
}

/**
 * Get the current breakpoint name based on viewport width
 * Returns 'mobile', 'tablet', 'desktop', or 'large'
 *
 * @example
 * const breakpoint = useCurrentBreakpoint();
 * console.log(breakpoint); // 'mobile' | 'tablet' | 'desktop' | 'large'
 */
export function useCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' | 'large' | undefined {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop' | 'large' | undefined>(undefined)

  React.useEffect(() => {
    const getBreakpoint = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.md) return 'mobile'
      if (width < BREAKPOINTS.lg) return 'tablet'
      if (width < BREAKPOINTS.xl) return 'desktop'
      return 'large'
    }

    setBreakpoint(getBreakpoint())

    const handleResize = () => {
      setBreakpoint(getBreakpoint())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}
