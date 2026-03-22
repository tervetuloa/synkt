"use client"

import { memo, useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { RotateCcw, Grid3X3, Maximize2 } from "lucide-react"
import { AgentNode, type AgentNodeProps } from "./agent-node"
import { AnimatedEdge, type EdgeStatus } from "./animated-edge"
import { GlassButton } from "./glass-button"

export interface GraphNode extends AgentNodeProps {
  x: number
  y: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  status: EdgeStatus
}

export interface GraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNodeId: string | null
  onNodeSelect: (nodeId: string) => void
  onNodesChange?: (nodes: GraphNode[]) => void
  className?: string
}

export const GraphCanvas = memo(function GraphCanvas({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  onNodesChange,
  className,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 })
  const [initialNodePos, setInitialNodePos] = useState({ x: 0, y: 0 })

  // Get node position for edge calculation
  const getNodePosition = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return { x: 0, y: 0 }
    return {
      x: node.x + 140, // Half of node width
      y: node.y + 40, // Approximate center height
    }
  }, [nodes])

  // Handle canvas panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-node-handle]')) {
      // Start node drag
      const nodeElement = target.closest('[data-node]')
      if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-node-id')
        if (nodeId) {
          const node = nodes.find(n => n.id === nodeId)
          if (node) {
            e.stopPropagation()
            setDraggingNodeId(nodeId)
            setNodeDragStart({ x: e.clientX, y: e.clientY })
            setInitialNodePos({ x: node.x, y: node.y })
          }
        }
      }
      return
    }
    
    if (target.closest('[data-node]')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }, [offset, nodes])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNodeId && onNodesChange) {
      const deltaX = (e.clientX - nodeDragStart.x) / scale
      const deltaY = (e.clientY - nodeDragStart.y) / scale
      const updatedNodes = nodes.map(n => 
        n.id === draggingNodeId 
          ? { ...n, x: initialNodePos.x + deltaX, y: initialNodePos.y + deltaY }
          : n
      )
      onNodesChange(updatedNodes)
      return
    }
    
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [isDragging, dragStart, draggingNodeId, nodeDragStart, initialNodePos, scale, nodes, onNodesChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDraggingNodeId(null)
  }, [])

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prev) => Math.max(0.5, Math.min(2, prev * delta)))
  }, [])

  // Center graph on mount
  useEffect(() => {
    if (canvasRef.current && nodes.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect()
      const avgX = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length
      const avgY = nodes.reduce((sum, n) => sum + n.y, 0) / nodes.length
      setOffset({
        x: rect.width / 2 - avgX - 140,
        y: rect.height / 2 - avgY - 40,
      })
    }
  }, [])

  // Layout functions
  const resetView = useCallback(() => {
    if (canvasRef.current && nodes.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect()
      const avgX = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length
      const avgY = nodes.reduce((sum, n) => sum + n.y, 0) / nodes.length
      setOffset({
        x: rect.width / 2 - avgX - 140,
        y: rect.height / 2 - avgY - 40,
      })
      setScale(1)
    }
  }, [nodes])

  const arrangeGrid = useCallback(() => {
    if (!onNodesChange) return
    const cols = Math.ceil(Math.sqrt(nodes.length))
    const spacing = { x: 320, y: 180 }
    const updatedNodes = nodes.map((node, i) => ({
      ...node,
      x: (i % cols) * spacing.x,
      y: Math.floor(i / cols) * spacing.y,
    }))
    onNodesChange(updatedNodes)
    setTimeout(resetView, 50)
  }, [nodes, onNodesChange, resetView])

  const fitToView = useCallback(() => {
    if (!canvasRef.current || nodes.length === 0) return
    const rect = canvasRef.current.getBoundingClientRect()
    const minX = Math.min(...nodes.map(n => n.x))
    const maxX = Math.max(...nodes.map(n => n.x + 280))
    const minY = Math.min(...nodes.map(n => n.y))
    const maxY = Math.max(...nodes.map(n => n.y + 80))
    
    const contentWidth = maxX - minX + 100
    const contentHeight = maxY - minY + 100
    const newScale = Math.min(
      rect.width / contentWidth,
      rect.height / contentHeight,
      1.5
    )
    
    setScale(Math.max(0.5, newScale))
    setOffset({
      x: (rect.width - contentWidth * newScale) / 2 - minX * newScale,
      y: (rect.height - contentHeight * newScale) / 2 - minY * newScale,
    })
  }, [nodes])

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative flex-1 overflow-hidden bg-[#121212] cursor-grab",
        isDragging && "cursor-grabbing",
        draggingNodeId && "cursor-grabbing",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * scale}px ${40 * scale}px`,
          backgroundPosition: `${offset.x}px ${offset.y}px`,
        }}
      />

      {/* Graph content layer - both edges and nodes share the same transform */}
      <div
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Edges SVG - positioned at 0,0 within the transformed container */}
        <svg
          className="absolute pointer-events-none overflow-visible"
          style={{
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            overflow: "visible",
          }}
        >
          {edges.map((edge) => {
            const sourcePos = getNodePosition(edge.source)
            const targetPos = getNodePosition(edge.target)
            return (
              <AnimatedEdge
                key={edge.id}
                id={edge.id}
                sourceX={sourcePos.x}
                sourceY={sourcePos.y}
                targetX={targetPos.x}
                targetY={targetPos.y}
                status={edge.status}
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            data-node
            data-node-id={node.id}
            className={cn(
              "absolute",
              draggingNodeId === node.id ? "z-50" : "transition-shadow duration-200"
            )}
            style={{ 
              left: node.x, 
              top: node.y,
              willChange: draggingNodeId === node.id ? "transform" : "auto"
            }}
          >
            <AgentNode
              {...node}
              isSelected={selectedNodeId === node.id}
              onClick={() => onNodeSelect(node.id)}
              draggable={!!onNodesChange}
            />
          </div>
        ))}
      </div>

      {/* Layout controls - Bottom left */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[rgba(36,36,36,0.9)] backdrop-blur-xl p-1">
          <GlassButton size="sm" onClick={resetView} title="Reset View">
            <RotateCcw className="h-4 w-4" />
          </GlassButton>
          <GlassButton size="sm" onClick={arrangeGrid} title="Arrange Grid">
            <Grid3X3 className="h-4 w-4" />
          </GlassButton>
          <GlassButton size="sm" onClick={fitToView} title="Fit to View">
            <Maximize2 className="h-4 w-4" />
          </GlassButton>
        </div>
        <div className="text-[13px] font-mono text-white/40 px-2">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  )
})
