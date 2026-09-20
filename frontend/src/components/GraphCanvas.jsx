import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NODE_COLORS = {
  Person:     '#ef4444',
  Object:     '#00f0ff',
  Location:   '#10b981',
  Event:      '#f59e0b',
  BNSSection: '#a855f7',
  FIR:        '#eab308',
  Unknown:    '#5a6a80',
};

// Tactical grid background with scan-lines
function drawBackground(ctx, width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height)) return;

  // Base void
  ctx.fillStyle = '#050a12';
  ctx.fillRect(0, 0, width, height);

  // Grid lines (subtle)
  const gridSpacing = 60;
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < width; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Cross-hair at every grid intersection (very subtle)
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 0.5;
  const crossSize = 3;
  for (let x = 0; x < width; x += gridSpacing) {
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x - crossSize, y);
      ctx.lineTo(x + crossSize, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - crossSize);
      ctx.lineTo(x, y + crossSize);
      ctx.stroke();
    }
  }
}

export default function GraphCanvas({
  graphData, selectedNode, onNodeClick, topBridgeNode,
  isSimulationActive, simulationResult, detectionMode
}) {
  const fgRef = useRef();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Find neighbor nodes and links for click-to-focus isolation
  const { connectedNodeIds, connectedLinkSet } = useMemo(() => {
    if (!selectedNode || !graphData || !graphData.links) {
      return { connectedNodeIds: null, connectedLinkSet: null };
    }
    const nodes = new Set([selectedNode.id]);
    const links = new Set();
    graphData.links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source?.id : l.source;
      const t = typeof l.target === 'object' ? l.target?.id : l.target;
      if (s === selectedNode.id) {
        if (t !== undefined) nodes.add(t);
        links.add(l);
      } else if (t === selectedNode.id) {
        if (s !== undefined) nodes.add(s);
        links.add(l);
      }
    });
    return { connectedNodeIds: nodes, connectedLinkSet: links };
  }, [selectedNode, graphData]);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge')?.strength(-300);
      fgRef.current.d3Force('link')?.distance(80);
    }
  }, [graphData]);

  // Click-to-focus camera centering
  useEffect(() => {
    if (
      selectedNode &&
      Number.isFinite(selectedNode.x) &&
      Number.isFinite(selectedNode.y) &&
      fgRef.current
    ) {
      fgRef.current.centerAt(selectedNode.x, selectedNode.y, 700);
      fgRef.current.zoom(1.8, 700);
    }
  }, [selectedNode]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    // CRITICAL: Guard against non-finite coordinates during initial physics ticks
    if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y)) {
      return;
    }

    const scale = Number.isFinite(globalScale) && globalScale > 0 ? globalScale : 1;
    const isSelected  = selectedNode   && selectedNode.id   === node.id;
    const isTopBridge = topBridgeNode  && topBridgeNode.id  === node.id;
    const hasCluster  = isSimulationActive && node.cluster_color;
    const isDimmed    = connectedNodeIds && !connectedNodeIds.has(node.id);

    let r = node.label === 'Person' ? 8 : node.label === 'FIR' ? 7 : 6;
    if (isSelected)  r = 12;
    if (isTopBridge) r = 13;
    if (!Number.isFinite(r) || r <= 0) r = 6;

    const color = hasCluster
      ? node.cluster_color
      : (NODE_COLORS[node.label] || NODE_COLORS.Unknown);

    ctx.save();
    try {
      if (isDimmed) {
        ctx.globalAlpha = 0.15;
      }

      // Outer glow
      const glowColor = isTopBridge
        ? 'rgba(239,68,68,0.2)'
        : isSelected
          ? 'rgba(0,240,255,0.2)'
          : `${color}15`;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 8, 0, 2 * Math.PI);
      ctx.fillStyle = glowColor;
      ctx.fill();

      // Tactical ring for bridge/selected
      if (isTopBridge) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(239,68,68,0.7)';
        ctx.lineWidth = 1.5 / scale;
        ctx.setLineDash([3, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0,240,255,0.6)';
        ctx.lineWidth = 1.5 / scale;
        ctx.stroke();
      }

      // Main node fill (radial gradient with finite verification)
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);

      const x0 = node.x - r * 0.3;
      const y0 = node.y - r * 0.3;
      const r0 = Math.max(0.1, r * 0.1);
      const r1 = Math.max(r0 + 0.1, r);

      if (Number.isFinite(x0) && Number.isFinite(y0) && Number.isFinite(r0) && Number.isFinite(r1)) {
        try {
          const grad = ctx.createRadialGradient(x0, y0, r0, node.x, node.y, r1);
          grad.addColorStop(0, lighten(color, 0.25));
          grad.addColorStop(1, color);
          ctx.fillStyle = grad;
        } catch {
          ctx.fillStyle = color;
        }
      } else {
        ctx.fillStyle = color;
      }

      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 0.8 / scale;
      ctx.stroke();

      // Detection mode reticle brackets
      if (detectionMode) {
        const bSize = r + 6;
        const bLen = 5;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.lineWidth = 1 / scale;

        // Top-left bracket
        ctx.beginPath();
        ctx.moveTo(node.x - bSize, node.y - bSize + bLen);
        ctx.lineTo(node.x - bSize, node.y - bSize);
        ctx.lineTo(node.x - bSize + bLen, node.y - bSize);
        ctx.stroke();

        // Top-right bracket
        ctx.beginPath();
        ctx.moveTo(node.x + bSize - bLen, node.y - bSize);
        ctx.lineTo(node.x + bSize, node.y - bSize);
        ctx.lineTo(node.x + bSize, node.y - bSize + bLen);
        ctx.stroke();

        // Bottom-right bracket
        ctx.beginPath();
        ctx.moveTo(node.x + bSize, node.y + bSize - bLen);
        ctx.lineTo(node.x + bSize, node.y + bSize);
        ctx.lineTo(node.x + bSize - bLen, node.y + bSize);
        ctx.stroke();

        // Bottom-left bracket
        ctx.beginPath();
        ctx.moveTo(node.x - bSize + bLen, node.y + bSize);
        ctx.lineTo(node.x - bSize, node.y + bSize);
        ctx.lineTo(node.x - bSize, node.y + bSize - bLen);
        ctx.stroke();

        // Tiny ID label above reticle
        const idText = `${(node.label || 'UNK').substring(0, 3).toUpperCase()}-${String(node.id).slice(-3)}`;
        const idFontSize = Math.max(7 / scale, 2);
        ctx.font = `600 ${idFontSize}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.fillText(idText, node.x, node.y - bSize - 3);
      }

      // Label
      const label = node.display_name || node.name || node.number || node.label;
      if (label) {
        const fontSize = Math.max(9 / scale, 2.2);
        ctx.font = `600 ${fontSize}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const tw = ctx.measureText(label).width;
        const padX = 3, padY = 1;
        const bx = node.x - tw / 2 - padX;
        const by = node.y + r + 3;
        const bw = tw + padX * 2;
        const bh = fontSize + padY * 2;

        if (Number.isFinite(bx) && Number.isFinite(by) && Number.isFinite(bw) && Number.isFinite(bh)) {
          // Sharp rectangle label background (no rounding)
          ctx.fillStyle = 'rgba(5, 10, 18, 0.9)';
          ctx.fillRect(bx, by, bw, bh);

          // Thin border on label
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
          ctx.lineWidth = 0.5 / scale;
          ctx.strokeRect(bx, by, bw, bh);

          // Text
          ctx.fillStyle = isTopBridge ? '#fca5a5' : isSelected ? '#00f0ff' : '#c0cad8';
          ctx.fillText(label, node.x, by + bh / 2);
        }
      }
    } finally {
      ctx.restore();
    }
  }, [selectedNode, topBridgeNode, isSimulationActive, detectionMode, connectedNodeIds]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeId="id"
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y)) return;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 16, 0, 2 * Math.PI);
          ctx.fill();
        }}
        onRenderFramePre={drawBackground}
        linkColor={link => {
          if (!connectedLinkSet) return 'rgba(0, 240, 255, 0.10)';
          return connectedLinkSet.has(link) ? 'rgba(0, 240, 255, 0.75)' : 'rgba(0, 240, 255, 0.02)';
        }}
        linkWidth={link => {
          if (!connectedLinkSet) return 1.2;
          return connectedLinkSet.has(link) ? 2.4 : 0.5;
        }}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={0.88}
        linkDirectionalArrowColor={link => {
          if (!connectedLinkSet) return 'rgba(0, 240, 255, 0.3)';
          return connectedLinkSet.has(link) ? 'rgba(0, 240, 255, 0.9)' : 'rgba(0, 240, 255, 0.05)';
        }}
        linkLabel={link => `<div style="background:rgba(5,10,18,0.96);padding:3px 8px;font-size:9px;color:#00f0ff;border:1px solid rgba(0,240,255,0.2);font-family:'JetBrains Mono',monospace;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${link.type || 'LINKED'}</div>`}
        onNodeClick={onNodeClick}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        cooldownTicks={120}
        d3AlphaDecay={0.018}
        d3VelocityDecay={0.28}
      />
      <button
        className="btn"
        style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, padding: '6px 12px', fontSize: '10px' }}
        onClick={() => fgRef.current?.zoomToFit(400)}
      >
        ⌖ RECENTER GRAPH
      </button>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function lighten(hex, amount) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex || '#ffffff';
  try {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6 && cleanHex.length !== 3) return hex;
    const n = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex, 16);
    const r = Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * amount));
    const g = Math.min(255, ((n >> 8)  & 0xff) + Math.round(255 * amount));
    const b = Math.min(255, ( n        & 0xff) + Math.round(255 * amount));
    return `rgb(${r},${g},${b})`;
  } catch {
    return hex;
  }
}
