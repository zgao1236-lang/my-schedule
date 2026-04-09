import { useRef } from 'react'

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
  const lastX = useRef(0)
  const swiping = useRef(false)

  return {
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
}
