import { useRef, useCallback } from 'react'

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50,
): SwipeHandlers {
  const startX = useRef(0)
  const startY = useRef(0)
  const swiping = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    swiping.current = false
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current
    // Only count horizontal swipes (ignore vertical scroll)
    if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 20) {
      swiping.current = true
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!swiping.current) return
    const dx = startX.current // we need the final position, but we only stored start
    // We'll use a simpler approach: just track in touchend
  }, [])

  // Simplified: use ref to track final position
  const lastX = useRef(0)

  const handlers: SwipeHandlers = {
    onTouchStart: (e) => {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
      lastX.current = e.touches[0].clientX
      swiping.current = false
    },
    onTouchMove: (e) => {
      lastX.current = e.touches[0].clientX
      const dx = lastX.current - startX.current
      const dy = e.touches[0].clientY - startY.current
      if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 15) {
        swiping.current = true
      }
    },
    onTouchEnd: () => {
      if (!swiping.current) return
      const dx = lastX.current - startX.current
      if (dx > threshold) onSwipeRight()
      else if (dx < -threshold) onSwipeLeft()
    },
  }

  return handlers
}
