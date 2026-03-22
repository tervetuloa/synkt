"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Header } from "@/components/agent-visualization/header"
import { GraphCanvas, type GraphNode, type GraphEdge } from "@/components/agent-visualization/graph-canvas"
import { CostPanel } from "@/components/agent-visualization/cost-panel"
import { Timeline } from "@/components/agent-visualization/timeline"
import { DetailsPanel } from "@/components/agent-visualization/details-panel"
import { type AgentStatus } from "@/components/agent-visualization/agent-node"
import { type EdgeStatus } from "@/components/agent-visualization/animated-edge"

// Demo data
const initialNodes: GraphNode[] = [
  { id: "orchestrator", name: "Orchestrator", type: "executor", status: "completed", cost: 0.012, x: 400, y: 50 },
  { id: "researcher", name: "Research Agent", type: "research", status: "active", cost: 0.042, x: 100, y: 200 },
  { id: "analyzer", name: "Data Analyzer", type: "analyzer", status: "active", cost: 0.028, x: 400, y: 200 },
  { id: "writer", name: "Content Writer", type: "writer", status: "idle", cost: 0.000, x: 700, y: 200 },
  { id: "reviewer", name: "Quality Reviewer", type: "analyzer", status: "idle", cost: 0.000, x: 400, y: 380 },
  { id: "publisher", name: "Publisher", type: "executor", status: "idle", cost: 0.000, x: 700, y: 380 },
]

const initialEdges: GraphEdge[] = [
  { id: "e1", source: "orchestrator", target: "researcher", status: "active" },
  { id: "e2", source: "orchestrator", target: "analyzer", status: "active" },
  { id: "e3", source: "orchestrator", target: "writer", status: "idle" },
  { id: "e4", source: "researcher", target: "analyzer", status: "active" },
  { id: "e5", source: "analyzer", target: "writer", status: "idle" },
  { id: "e6", source: "writer", target: "reviewer", status: "idle" },
  { id: "e7", source: "reviewer", target: "publisher", status: "idle" },
  { id: "e8", source: "reviewer", target: "writer", status: "idle" },
]

// Simulation timeline: what happens at each time step
const timeline: { time: number; nodeUpdates: Record<string, AgentStatus>; edgeUpdates: Record<string, EdgeStatus> }[] = [
  { time: 0, nodeUpdates: { orchestrator: "active" }, edgeUpdates: {} },
  { time: 0.5, nodeUpdates: { orchestrator: "completed", researcher: "active", analyzer: "active" }, edgeUpdates: { e1: "active", e2: "active" } },
  { time: 1.5, nodeUpdates: {}, edgeUpdates: { e4: "active" } },
  { time: 2.5, nodeUpdates: { researcher: "completed" }, edgeUpdates: {} },
  { time: 3.0, nodeUpdates: { analyzer: "completed", writer: "active" }, edgeUpdates: { e3: "active", e5: "active" } },
  { time: 4.0, nodeUpdates: { writer: "completed", reviewer: "active" }, edgeUpdates: { e6: "active" } },
  { time: 4.5, nodeUpdates: { reviewer: "error" }, edgeUpdates: { e8: "error" } },
  { time: 5.0, nodeUpdates: { reviewer: "completed", writer: "active" }, edgeUpdates: { e8: "loop" } },
  { time: 5.5, nodeUpdates: { writer: "completed", publisher: "active" }, edgeUpdates: { e7: "active" } },
  { time: 6.0, nodeUpdates: { publisher: "completed" }, edgeUpdates: {} },
]

export default function AgentVisualizationDashboard() {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes)
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const duration = 6.0
  
  // Track if panel is in transition to prevent instant open
  const panelMountedRef = useRef(false)

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) || null : null

  // Calculate totals
  const totalCost = nodes.reduce((sum, n) => sum + n.cost, 0)
  const totalTokens = Math.round(totalCost * 1000) // Simulated
  const latency = currentTime

  // Apply timeline updates based on current time
  useEffect(() => {
    const applicableUpdates = timeline.filter((t) => t.time <= currentTime)
    
    setNodes((prev) => {
      const updated = [...prev]
      applicableUpdates.forEach((update) => {
        Object.entries(update.nodeUpdates).forEach(([nodeId, status]) => {
          const idx = updated.findIndex((n) => n.id === nodeId)
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], status }
            // Simulate cost increase for active/completed nodes
            if (status === "active" || status === "completed") {
              const baseCost = initialNodes.find((n) => n.id === nodeId)?.cost || 0
              updated[idx].cost = baseCost > 0 ? baseCost : Math.random() * 0.05
            }
          }
        })
      })
      return updated
    })

    setEdges((prev) => {
      const updated = [...prev]
      applicableUpdates.forEach((update) => {
        Object.entries(update.edgeUpdates).forEach(([edgeId, status]) => {
          const idx = updated.findIndex((e) => e.id === edgeId)
          if (idx !== -1) {
            updated[idx] = { ...updated[idx], status }
          }
        })
      })
      return updated
    })
  }, [currentTime])

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1 * speed
        if (next >= duration) {
          setIsPlaying(false)
          return duration
        }
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, speed])

  // Mark panel as mounted after first render
  useEffect(() => {
    panelMountedRef.current = true
  }, [])

  const handleNodeSelect = useCallback((nodeId: string) => {
    // Set selected node first
    setSelectedNodeId(nodeId)
    // Then open panel with a slight delay to ensure CSS transition triggers
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsPanelOpen(true)
      })
    })
  }, [])

  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false)
    // Clear selection after transition completes
    setTimeout(() => setSelectedNodeId(null), 300)
  }, [])

  const handlePlayPause = useCallback(() => {
    if (currentTime >= duration) {
      setCurrentTime(0)
    }
    setIsPlaying((prev) => !prev)
  }, [currentTime])

  const handleTimeChange = useCallback((time: number) => {
    setCurrentTime(time)
    setIsPlaying(false)
  }, [])

  const handleRefresh = useCallback(() => {
    setCurrentTime(0)
    setIsPlaying(false)
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [])

  const handleNodesChange = useCallback((updatedNodes: GraphNode[]) => {
    setNodes(updatedNodes)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-[#121212]">
      {/* Header */}
      <Header
        title="Agent Workflow"
        isConnected={true}
        onRefresh={handleRefresh}
      />

      {/* Main content */}
      <div className="relative flex-1 flex flex-col">
        {/* Canvas */}
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          onNodesChange={handleNodesChange}
        />

        {/* Floating cost panel */}
        <div className="absolute top-6 right-6">
          <CostPanel
            totalCost={totalCost}
            tokens={totalTokens}
            latency={latency}
          />
        </div>

        {/* Details panel - always rendered, visibility controlled by isOpen */}
        <DetailsPanel
          agent={selectedNode}
          isOpen={isPanelOpen}
          onClose={handlePanelClose}
        />
      </div>

      {/* Timeline */}
      <Timeline
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        speed={speed}
        onTimeChange={handleTimeChange}
        onPlayPause={handlePlayPause}
        onSpeedChange={setSpeed}
      />
    </div>
  )
}
