import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// Color map for POLE types
const NODE_COLORS = {
  Person: '#ef4444',     // Crimson
  Object: '#38bdf8',     // Cyan
  Location: '#10b981',   // Emerald
  Event: '#f59e0b',      // Amber
  BNSSection: '#a855f7', // Purple
  FIR: '#eab308',        // Gold
  Unknown: '#94a3b8'
};

export default function GraphCanvas({
  graphData,
  selectedNode,
  onNodeClick,
  topBridgeNode,
  isSimulationActive,
  simulationResult,
  onNodeHover
}) {
  const fgRef = useRef();

  // Resize graph on window resize
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-280);
      fgRef.current.d3Force('link').distance(70);
    }
  }, [graphData]);

  // Custom node drawing function for high-tech aesthetic
  const paintNode = useCallback((node, ctx, globalScale) => {
    const isSelected = selectedNode && selectedNode.id === node.id;
    const isTopBridge = topBridgeNode && topBridgeNode.id === node.id;
    const hasClusterColor = isSimulationActive && node.cluster_color;

    // Node radius based on importance
    let r = 7;
    if (node.label === 'Person') r = 9;
    if (node.label === 'FIR') r = 8;
    if (isSelected) r = 12;
    if (isTopBridge) r = 13;

    // Node base color
    let color = hasClusterColor
      ? node.cluster_color
      : (NODE_COLORS[node.label] || NODE_COLORS.Unknown);

    // Glowing halo for top bridge node or selected node
    if (isTopBridge) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 7, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI, false);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2 / globalScale;
      ctx.setLineDash([4, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 5, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Main node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.2 / globalScale;
    ctx.stroke();

    // Node text label
    const label = node.display_name || node.name || node.number || `${node.label}`;
    const fontSize = Math.max(10 / globalScale, 3);
    ctx.font = `${fontSize}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Label background pill for readability
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth + 6, fontSize + 4];
    ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
    ctx.fillRect(
      node.x - bckgDimensions[0] / 2,
      node.y + r + 2,
      bckgDimensions[0],
      bckgDimensions[1]
    );

    // Label text
    ctx.fillStyle = isTopBridge ? '#fca5a5' : '#e2e8f0';
    ctx.fillText(label, node.x, node.y + r + 2 + fontSize / 2 + 1);
  }, [selectedNode, topBridgeNode, isSimulationActive]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#070a12]">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeId="id"
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        linkColor={() => 'rgba(148, 163, 184, 0.25)'}
        linkWidth={1.5}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.9}
        linkDirectionalArrowColor={() => 'rgba(148, 163, 184, 0.4)'}
        linkLabel={(link) => `<div style="background: rgba(15,23,42,0.9); padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #38bdf8; border: 1px solid rgba(56,189,248,0.3);">${link.type || 'LINKED'}</div>`}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
}
