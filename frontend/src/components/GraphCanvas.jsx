import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NODE_COLORS = {
  Person:     '#ef4444',
  Object:     '#38bdf8',
  Location:   '#10b981',
  Event:      '#f59e0b',
  BNSSection: '#a855f7',
  FIR:        '#eab308',
  Unknown:    '#94a3b8',
};

// Subtle dot-grid background drawn on canvas before graph
function drawBackground(ctx, width, height) {
  ctx.fillStyle = '#070b14';
  ctx.fillRect(0, 0, width, height);

  const spacing = 28;
  const dotR = 0.8;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.08)';
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotR, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

export default function GraphCanvas({ graphData, selectedNode, onNodeClick, topBridgeNode, isSimulationActive }) {
  const fgRef = useRef();

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-300);
      fgRef.current.d3Force('link').distance(80);
    }
  }, [graphData]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const isSelected  = selectedNode   && selectedNode.id   === node.id;
    const isTopBridge = topBridgeNode  && topBridgeNode.id  === node.id;
    const hasCluster  = isSimulationActive && node.cluster_color;

    let r = node.label === 'Person' ? 9 : node.label === 'FIR' ? 8 : 7;
    if (isSelected)  r = 13;
    if (isTopBridge) r = 14;

    const color = hasCluster
      ? node.cluster_color
      : (NODE_COLORS[node.label] || NODE_COLORS.Unknown);

    // Ambient outer glow
    const glowColor = isTopBridge
      ? 'rgba(239,68,68,0.18)'
      : isSelected
        ? 'rgba(56,189,248,0.18)'
        : `${color}18`;

    ctx.beginPath();
    ctx.arc(node.x, node.y, r + 10, 0, 2 * Math.PI);
    ctx.fillStyle = glowColor;
    ctx.fill();

    // Dashed ring for top bridge node
    if (isTopBridge) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(239,68,68,0.8)';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(56,189,248,0.7)';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    }

    // Main filled node
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    // Slight radial gradient for depth
    const grad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, r * 0.1, node.x, node.y, r);
    grad.addColorStop(0, lighten(color, 0.3));
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();

    // Label
    const label = node.display_name || node.name || node.number || node.label;
    const fontSize = Math.max(10 / globalScale, 2.5);
    ctx.font = `${600} ${fontSize}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const tw = ctx.measureText(label).width;
    const padX = 4, padY = 2;
    const bx = node.x - tw / 2 - padX;
    const by = node.y + r + 3;
    const bw = tw + padX * 2;
    const bh = fontSize + padY * 2;

    // Pill background
    ctx.fillStyle = 'rgba(7,11,20,0.88)';
    roundRect(ctx, bx, by, bw, bh, 3);
    ctx.fill();

    // Text
    ctx.fillStyle = isTopBridge ? '#fca5a5' : isSelected ? '#bae6fd' : '#e2e8f0';
    ctx.fillText(label, node.x, by + bh / 2);
  }, [selectedNode, topBridgeNode, isSimulationActive]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeId="id"
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 16, 0, 2 * Math.PI);
          ctx.fill();
        }}
        onRenderFramePre={drawBackground}
        linkColor={() => 'rgba(100, 120, 160, 0.22)'}
        linkWidth={1.5}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={0.88}
        linkDirectionalArrowColor={() => 'rgba(148,163,184,0.45)'}
        linkLabel={link => `<div style="background:rgba(8,13,24,0.95);padding:4px 9px;border-radius:6px;font-size:10px;color:#38bdf8;border:1px solid rgba(56,189,248,0.28);font-family:'JetBrains Mono',monospace;font-weight:600;">${link.type || 'LINKED'}</div>`}
        onNodeClick={onNodeClick}
        cooldownTicks={120}
        d3AlphaDecay={0.018}
        d3VelocityDecay={0.28}
      />
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function lighten(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((n >> 8)  & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, ( n        & 0xff) + Math.round(255 * amount));
  return `rgb(${r},${g},${b})`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
