"use client"

import { memo, useState, useCallback, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassButton } from "./glass-button"

export interface TimelineProps {
  currentTime: number
  duration: number
  isPlaying: boolean
  speed: number
  onTimeChange: (time: number) => void
  onPlayPause: () => void
  onSpeedChange: (speed: number) => void
  className?: string
}

const speeds = [1, 2, 5]

export const Timeline = memo(function Timeline({
  currentTime,
  duration,
  isPlaying,
  speed,
  onTimeChange,
  onPlayPause,
  onSpeedChange,
  className,
}: TimelineProps) {
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const formatTime = (time: number) => {
    return time.toFixed(1) + "s"
  }

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      onTimeChange(percentage * duration)
    },
    [duration, onTimeChange]
  )

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      onTimeChange(percentage * duration)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, duration, onTimeChange])

  return (
    <div
      className={cn(
        "flex h-[60px] items-center gap-6 border-t border-white/8",
        "bg-[rgba(26,26,26,0.9)] backdrop-blur-[20px] px-6",
        className
      )}
    >
      {/* Controls */}
      <div className="flex items-center gap-2">
        <GlassButton size="sm" onClick={() => onTimeChange(0)}>
          <SkipBack className="h-4 w-4" />
        </GlassButton>

        <button
          onClick={onPlayPause}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            "bg-gradient-to-br from-accent-blue to-accent-purple",
            "text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]",
            "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "hover:brightness-110 hover:scale-[1.05]",
            "active:scale-[0.95]"
          )}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>

        <GlassButton size="sm" onClick={() => onTimeChange(duration)}>
          <SkipForward className="h-4 w-4" />
        </GlassButton>
      </div>

      {/* Track */}
      <div className="flex-1 flex items-center gap-4">
        <span className="text-[13px] font-mono text-white/60 w-12 text-right">
          {formatTime(currentTime)}
        </span>

        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative flex-1 h-1 bg-white/10 rounded-full cursor-pointer group"
        >
          {/* Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"
            style={{ width: `${progress}%` }}
          />

          {/* Thumb */}
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
              "h-4 w-4 rounded-full bg-white shadow-lg",
              "cursor-grab transition-transform duration-100",
              "group-hover:scale-110",
              isDragging && "scale-125 cursor-grabbing"
            )}
            style={{ left: `${progress}%` }}
          />
        </div>

        <span className="text-[13px] font-mono text-white/60 w-12">
          {formatTime(duration)}
        </span>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-1">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={cn(
              "h-7 min-w-[40px] rounded-lg px-2 text-[13px] font-mono",
              "transition-all duration-150 ease-out",
              speed === s
                ? "bg-accent-blue/20 text-accent-blue"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            )}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
})
