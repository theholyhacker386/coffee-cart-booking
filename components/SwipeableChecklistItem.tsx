'use client'

import { useRef, useState, useCallback } from 'react'
import { Check } from 'lucide-react'

interface SwipeableChecklistItemProps {
  id: string
  text: string
  completed: boolean
  completedBy?: string | null
  onComplete: (id: string) => void
  onUncomplete?: (id: string) => void
}

export default function SwipeableChecklistItem({
  id,
  text,
  completed,
  onComplete,
  onUncomplete,
}: SwipeableChecklistItemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const startXRef = useRef(0)
  const isDraggingRef = useRef(false)

  const THRESHOLD_PERCENT = 0.4 // 40% of width to trigger complete

  const getContainerWidth = useCallback(() => {
    return containerRef.current?.offsetWidth || 300
  }, [])

  // ---- Touch handlers ----
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (completed) return
    startXRef.current = e.touches[0].clientX
    isDraggingRef.current = true
    setIsDragging(true)
  }, [completed])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current || completed) return
    const deltaX = e.touches[0].clientX - startXRef.current
    // Only allow left swipe (negative values)
    if (deltaX < 0) {
      setTranslateX(deltaX)
    }
  }, [completed])

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current || completed) return
    isDraggingRef.current = false
    setIsDragging(false)

    const width = getContainerWidth()
    const threshold = width * THRESHOLD_PERCENT

    if (Math.abs(translateX) > threshold) {
      // Swiped past threshold — animate off screen and complete
      setIsAnimatingOut(true)
      setTranslateX(-width)
      setTimeout(() => {
        onComplete(id)
      }, 400)
    } else {
      // Spring back
      setTranslateX(0)
    }
  }, [completed, translateX, getContainerWidth, id, onComplete])

  // ---- Mouse handlers (desktop support) ----
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (completed) return
    startXRef.current = e.clientX
    isDraggingRef.current = true
    setIsDragging(true)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return
      const deltaX = moveEvent.clientX - startXRef.current
      if (deltaX < 0) {
        setTranslateX(deltaX)
      }
    }

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      setIsDragging(false)

      const width = getContainerWidth()
      const threshold = width * THRESHOLD_PERCENT

      if (Math.abs(translateX) > threshold) {
        setIsAnimatingOut(true)
        setTranslateX(-width)
        setTimeout(() => {
          onComplete(id)
        }, 400)
      } else {
        setTranslateX(0)
      }

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [completed, translateX, getContainerWidth, id, onComplete])

  // Handle tap on completed items to uncomplete
  const handleTap = useCallback(() => {
    if (completed && onUncomplete) {
      onUncomplete(id)
    }
  }, [completed, onUncomplete, id])

  // Calculate how much green to reveal
  const swipeProgress = Math.min(Math.abs(translateX) / getContainerWidth(), 1)

  if (isAnimatingOut) {
    return (
      <div
        ref={containerRef}
        className="checklist-item-complete relative overflow-hidden rounded-xl mb-2"
      >
        {/* Green background revealed behind */}
        <div className="absolute inset-0 bg-emerald-600 flex items-center justify-end pr-6">
          <Check className="w-6 h-6 text-white" />
        </div>
        {/* Foreground card sliding out */}
        <div
          className="relative bg-gray-800 border border-gray-700/50 rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center flex-shrink-0" />
          <span className="text-sm text-gray-200">{text}</span>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div
        ref={containerRef}
        onClick={handleTap}
        className="relative overflow-hidden rounded-xl mb-2 cursor-pointer"
      >
        <div className="relative bg-emerald-950/30 border border-emerald-800/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm text-gray-400 line-through">{text}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl mb-2 select-none"
    >
      {/* Green background revealed on swipe */}
      <div
        className="absolute inset-0 rounded-xl flex items-center justify-end pr-6 transition-opacity"
        style={{
          background: `linear-gradient(90deg, rgba(16, 185, 129, ${0.2 + swipeProgress * 0.8}) 0%, rgba(5, 150, 105, ${0.3 + swipeProgress * 0.7}) 100%)`,
          opacity: swipeProgress > 0 ? 1 : 0,
        }}
      >
        <Check
          className="w-6 h-6 text-white transition-transform"
          style={{
            transform: `scale(${0.5 + swipeProgress * 0.5})`,
            opacity: swipeProgress,
          }}
        />
      </div>

      {/* Foreground card */}
      <div
        className="relative bg-gray-800/90 border border-gray-700/50 rounded-xl px-4 py-3 flex items-center gap-3 min-h-[48px] touch-pan-y"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 300ms ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Desktop only: clickable circle to mark done */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!completed) {
              setIsAnimatingOut(true)
              setTranslateX(-(getContainerWidth()))
              setTimeout(() => {
                onComplete(id)
              }, 400)
            }
          }}
          className="hidden md:flex w-8 h-8 rounded-full border-2 border-gray-500 items-center justify-center flex-shrink-0 hover:border-emerald-400 hover:bg-emerald-400/10 transition-colors active:scale-90"
          aria-label="Mark as done"
        />
        {/* Mobile: just a visual circle (swipe to complete) */}
        <div className="md:hidden w-5 h-5 rounded-full border-2 border-gray-500 flex-shrink-0" />
        <span className="text-sm text-gray-200">{text}</span>
      </div>
    </div>
  )
}
