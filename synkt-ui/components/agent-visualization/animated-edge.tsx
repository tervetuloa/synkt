"use client"

import { memo, useId } from "react"
import { cn } from "@/lib/utils"

export type EdgeStatus = "idle" | "active" | "error" | "loop"

export interface AnimatedEdgeProps {
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  status?: EdgeStatus
  className?: string
}

const statusStyles = {
  idle: {
    stroke: "rgba(255, 255, 255, 0.2)",
    strokeDasharray: "5,5",
    particleColor: "transparent",
  },
  active: {
    stroke: "#10b981",
    strokeDasharray: "none",
    particleColor: "#10b981",
  },
  error: {
    stroke: "#ef4444",
    strokeDasharray: "none",
    particleColor: "transparent",
  },
  loop: {
    stroke: "#f59e0b",
    strokeDasharray: "none",
    particleColor: "#f59e0b",
  },
}

export const AnimatedEdge = memo(function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  status = "idle",
  className,
}: AnimatedEdgeProps) {
  const uniqueId = useId()
  const pathId = `path-${id}-${uniqueId}`
  const { stroke, strokeDasharray, particleColor } = statusStyles[status]

  // Calculate distance and direction
  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // Always curve outward from the source to the right, then curve into target
  // This creates a consistent "flow" direction regardless of node positions
  const curvature = Math.max(60, distance * 0.4)
  
  // Control points extend horizontally from source and target
  // This creates smooth S-curves that never flip or mirror
  const controlX1 = sourceX + curvature
  const controlY1 = sourceY
  const controlX2 = targetX - curvature
  const controlY2 = targetY

  const pathD = `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetX} ${targetY}`

  return (
    <g className={className}>
      {/* Glow filter for active/loop states */}
      <defs>
        <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main path - no CSS transitions for instant position updates */}
      <path
        id={pathId}
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        filter={(status === "active" || status === "loop") ? `url(#glow-${uniqueId})` : undefined}
        className={cn(status === "loop" && "animate-pulse")}
      />

      {/* Arrow marker - positioned at exact target */}
      <polygon
        points={`${targetX - 8},${targetY - 4} ${targetX},${targetY} ${targetX - 8},${targetY + 4}`}
        fill={stroke}
      />

      {/* Animated particles for active/loop states */}
      {(status === "active" || status === "loop") && (
        <>
          {[0, 0.33, 0.66].map((offset, i) => (
            <circle
              key={i}
              r={4}
              fill={particleColor}
              filter={`url(#glow-${uniqueId})`}
              className="opacity-0"
              style={{
                offsetPath: `path("${pathD}")`,
                animation: `particle-flow 1.5s ease-in-out ${offset * 1.5}s infinite`,
              }}
            />
          ))}
        </>
      )}
    </g>
  )
})
