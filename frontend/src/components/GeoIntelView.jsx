import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getLocationCoords } from '../data/locationCoordinates';
import { Layers, Radio } from 'lucide-react';

/**
 * GeoIntelView — Tactical Geospatial Intelligence Display.
 * Visualizes Location nodes on Esri dark-matter map with curved tactical syndicate corridors.
 */
export default function GeoIntelView({ graphData, selectedNode, onNodeClick, topBridgeNode }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const svgOverlayRef = useRef(null);
  const markersRef = useRef([]);

  const [activeCluster, setActiveCluster] = useState('all'); // 'all' | 'mumbai' | 'delhi'
  const [showArcs, setShowArcs] = useState(true);

  // Extract location nodes and resolve coords
  const locationNodes = useMemo(() => {
    if (!graphData || !graphData.nodes) return [];
    return graphData.nodes
      .filter((n) => {
        const lbl = (n.label || n.type || '').toLowerCase();
        return lbl === 'location';
      })
      .map((node) => {
        const name = node.display_name || node.name || node.number || node.label || 'Unknown Location';
        const coords = getLocationCoords(name);
        return { ...node, coords, displayName: name };
      })
      .filter((n) => n.coords !== null);
  }, [graphData]);

  // Derive syndicate corridors/arcs between locations
  const corridorArcs = useMemo(() => {
    if (!graphData || !graphData.links || locationNodes.length < 2) return [];

    const locMap = new Map();
    locationNodes.forEach((loc) => locMap.set(loc.id, loc));

    const arcs = [];
    const seen = new Set();

    // 1. Direct links between locations
    graphData.links.forEach((link) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;

      if (locMap.has(sourceId) && locMap.has(targetId) && sourceId !== targetId) {
        const key = [sourceId, targetId].sort().join(':::');
        if (!seen.has(key)) {
          seen.add(key);
          arcs.push({
            from: locMap.get(sourceId),
            to: locMap.get(targetId),
            reason: link.label || link.type || 'DIRECT_LINK',
            isInterstate: false,
          });
        }
      }
    });

    // 2. Links through intermediate Person or Event nodes
    const nodeMap = new Map();
    graphData.nodes.forEach((n) => nodeMap.set(n.id, n));

    const personToLocs = new Map();
    graphData.links.forEach((link) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;

      const sNode = nodeMap.get(sourceId);
      const tNode = nodeMap.get(targetId);

      if (sNode && tNode) {
        const sLabel = (sNode.label || sNode.type || '').toLowerCase();
        const tLabel = (tNode.label || tNode.type || '').toLowerCase();

        if (sLabel === 'person' && tLabel === 'location') {
          if (!personToLocs.has(sNode.id)) personToLocs.set(sNode.id, []);
          personToLocs.get(sNode.id).push({ loc: tNode, person: sNode });
        } else if (tLabel === 'person' && sLabel === 'location') {
          if (!personToLocs.has(tNode.id)) personToLocs.set(tNode.id, []);
          personToLocs.get(tNode.id).push({ loc: sNode, person: tNode });
        }
      }
    });

    personToLocs.forEach((locList, personId) => {
      if (locList.length >= 2) {
        const pNode = nodeMap.get(personId);
        for (let i = 0; i < locList.length; i++) {
          for (let j = i + 1; j < locList.length; j++) {
            const lA = locList[i].loc;
            const lB = locList[j].loc;
            if (lA.id !== lB.id) {
              const key = [lA.id, lB.id].sort().join(':::');
              if (!seen.has(key)) {
                seen.add(key);
                const locAObj = locMap.get(lA.id);
                const locBObj = locMap.get(lB.id);
                if (locAObj && locBObj) {
                  const isInter = Math.abs(locAObj.coords[0] - locBObj.coords[0]) > 2;
                  arcs.push({
                    from: locAObj,
                    to: locBObj,
                    reason: `Operated by ${pNode?.display_name || pNode?.name || 'Syndicate Operative'}`,
                    isInterstate: isInter,
                  });
                }
              }
            }
          }
        }
      }
    });

    // 3. Sequential collection corridor fallback between Mumbai locations if no direct links found
    if (arcs.length === 0 && locationNodes.length >= 2) {
      for (let i = 0; i < locationNodes.length - 1; i++) {
        arcs.push({
          from: locationNodes[i],
          to: locationNodes[i + 1],
          reason: 'Extortion Collection Route',
          isInterstate: false,
        });
      }
    }

    return arcs;
  }, [graphData, locationNodes]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.14, 72.85],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Esri World Dark Gray Base (tactical dark theme, 100% free, no API key required)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: false,
      }).addTo(map);

      // Esri World Dark Gray Reference (clean tactical labels & boundaries)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: false,
      }).addTo(map);

      // Create SVG overlay for curved tactical arcs
      const svg = L.svg().addTo(map);
      svgOverlayRef.current = svg;

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Invalidate map size so tiles calculate full container width immediately
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        // Fit bounds to location nodes if available
        if (locationNodes.length > 0) {
          const bounds = L.latLngBounds(locationNodes.map((n) => n.coords));
          mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 13 });
        }
      }
    }, 150);

    // Clean existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Plot location markers
    locationNodes.forEach((loc) => {
      const isSelected = selectedNode && selectedNode.id === loc.id;
      const name = loc.displayName || loc.name || 'LOCATION';
      const isDelhi = name.toLowerCase().includes('delhi');
      const accentColor = isSelected ? '#ffffff' : isDelhi ? '#ef4444' : '#00f0ff';

      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          cursor: pointer;
        ">
          <!-- Outer pulsing ring -->
          <div style="
            position: absolute;
            width: 26px;
            height: 26px;
            border: 1.5px solid ${accentColor};
            opacity: 0.8;
            animation: livePing 2s infinite;
          "></div>
          <!-- Center targeting square -->
          <div style="
            width: 12px;
            height: 12px;
            background: ${accentColor};
            box-shadow: 0 0 12px ${accentColor};
            border: 1.5px solid #000;
          "></div>
          <!-- Monospace tactical label -->
          <div style="
            position: absolute;
            left: 22px;
            top: -4px;
            white-space: nowrap;
            background: rgba(2, 4, 8, 0.95);
            border: 1px solid ${accentColor};
            padding: 3px 7px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: 700;
            color: ${accentColor};
            letter-spacing: 0.08em;
            text-transform: uppercase;
            pointer-events: auto;
            box-shadow: 0 4px 14px rgba(0,0,0,0.9);
          ">
            ${name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'tactical-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(loc.coords, { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        if (onNodeClick) onNodeClick(loc);
      });

      markersRef.current.push(marker);
    });

    // Render SVG curved arcs
    const drawArcs = () => {
      if (!svgOverlayRef.current || !mapInstanceRef.current) return;
      const svgElement = svgOverlayRef.current._rootGroup;
      if (!svgElement) return;

      // Clear existing arc paths
      const existingPaths = svgElement.querySelectorAll('.tactical-arc-path');
      existingPaths.forEach((p) => p.remove());

      if (!showArcs) return;

      corridorArcs.forEach((arc) => {
        const p1 = map.latLngToLayerPoint(arc.from.coords);
        const p2 = map.latLngToLayerPoint(arc.to.coords);

        // Compute curved bezier control point
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Curvature offset perpendicular to the line
        const curvature = Math.min(dist * 0.25, 80);
        const mx = (p1.x + p2.x) / 2 - (dy / (dist || 1)) * curvature;
        const my = (p1.y + p2.y) / 2 + (dx / (dist || 1)) * curvature;

        const pathD = `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;

        const strokeColor = arc.isInterstate ? '#ef4444' : '#00f0ff';

        // Glow path
        const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowPath.setAttribute('d', pathD);
        glowPath.setAttribute('stroke', strokeColor);
        glowPath.setAttribute('stroke-width', '5');
        glowPath.setAttribute('stroke-opacity', '0.3');
        glowPath.setAttribute('fill', 'none');
        glowPath.setAttribute('class', 'tactical-arc-path');
        svgElement.appendChild(glowPath);

        // Core tactical path with dashes
        const corePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        corePath.setAttribute('d', pathD);
        corePath.setAttribute('stroke', strokeColor);
        corePath.setAttribute('stroke-width', '2');
        corePath.setAttribute('stroke-dasharray', '6, 4');
        corePath.setAttribute('stroke-opacity', '0.9');
        corePath.setAttribute('fill', 'none');
        corePath.setAttribute('class', 'tactical-arc-path');
        svgElement.appendChild(corePath);
      });
    };

    drawArcs();
    map.on('move', drawArcs);
    map.on('zoom', drawArcs);

    return () => {
      clearTimeout(resizeTimer);
      map.off('move', drawArcs);
      map.off('zoom', drawArcs);
    };
  }, [locationNodes, corridorArcs, selectedNode, showArcs, onNodeClick]);

  // Fly to cluster
  const flyTo = (target) => {
    if (!mapInstanceRef.current) return;
    setActiveCluster(target);
    if (target === 'mumbai') {
      mapInstanceRef.current.flyTo([19.14, 72.85], 13, { duration: 1.2 });
    } else if (target === 'delhi') {
      mapInstanceRef.current.flyTo([28.63, 77.22], 12, { duration: 1.2 });
    } else {
      if (locationNodes.length > 0) {
        const bounds = L.latLngBounds(locationNodes.map((n) => n.coords));
        mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 13, duration: 1.2 });
      } else {
        mapInstanceRef.current.flyTo([19.14, 72.85], 11, { duration: 1.2 });
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden font-mono" style={{ background: '#020408' }}>
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* Tactical HUD Header Banner on Map */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 14,
          zIndex: 1000,
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          background: 'rgba(2, 4, 8, 0.94)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.9)',
          maxWidth: 340,
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radio size={14} style={{ color: 'var(--cyan)' }} className="animate-pulse" />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>
              GEOSPATIAL INTEL // 2D TACTICAL
            </span>
          </div>
          <span
            style={{
              fontSize: 9,
              padding: '2px 6px',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--emerald)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            TACTICAL DARK
          </span>
        </div>

        <div style={{ fontSize: 10, lineHeight: 1.4, color: 'var(--text-2)' }}>
          Plotting {locationNodes.length} syndicate locations and {corridorArcs.length} transit/hawala corridors across Mumbai & interstate jurisdictions.
        </div>

        {/* Tactical Cluster Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 4 }}>
          <button
            onClick={() => flyTo('all')}
            style={{
              padding: '4px 6px',
              fontSize: 9,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              background: activeCluster === 'all' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 0, 0, 0.6)',
              border: `1px solid ${activeCluster === 'all' ? 'var(--cyan)' : 'rgba(0, 240, 255, 0.15)'}`,
              color: activeCluster === 'all' ? 'var(--cyan)' : 'var(--text-3)',
              cursor: 'pointer',
            }}
          >
            ALL CORRIDORS
          </button>
          <button
            onClick={() => flyTo('mumbai')}
            style={{
              padding: '4px 6px',
              fontSize: 9,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              background: activeCluster === 'mumbai' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 0, 0, 0.6)',
              border: `1px solid ${activeCluster === 'mumbai' ? 'var(--cyan)' : 'rgba(0, 240, 255, 0.15)'}`,
              color: activeCluster === 'mumbai' ? 'var(--cyan)' : 'var(--text-3)',
              cursor: 'pointer',
            }}
          >
            MUMBAI METRO
          </button>
          <button
            onClick={() => flyTo('delhi')}
            style={{
              padding: '4px 6px',
              fontSize: 9,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              background: activeCluster === 'delhi' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.6)',
              border: `1px solid ${activeCluster === 'delhi' ? 'var(--red)' : 'rgba(239, 68, 68, 0.25)'}`,
              color: activeCluster === 'delhi' ? 'var(--red)' : 'var(--text-3)',
              cursor: 'pointer',
            }}
          >
            DELHI HQ
          </button>
        </div>
      </div>

      {/* Map Utility Controls (Zoom + Arc Toggle) */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          right: 14,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          style={{
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            background: 'rgba(2, 4, 8, 0.95)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: 'var(--cyan)',
            cursor: 'pointer',
          }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          style={{
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            background: 'rgba(2, 4, 8, 0.95)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: 'var(--cyan)',
            cursor: 'pointer',
          }}
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => setShowArcs(!showArcs)}
          style={{
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: showArcs ? 'rgba(0, 240, 255, 0.2)' : 'rgba(2, 4, 8, 0.95)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: showArcs ? 'var(--cyan)' : 'var(--text-3)',
            cursor: 'pointer',
          }}
          title="Toggle Syndicate Arcs"
        >
          <Layers size={14} />
        </button>
      </div>

      {/* Legend strip at bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 1000,
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: 'rgba(2, 4, 8, 0.9)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, textTransform: 'uppercase', fontWeight: 700, color: '#fff' }}>
          <div style={{ width: 8, height: 8, background: 'var(--cyan)', border: '1px solid #000' }} />
          <span>MUMBAI POI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, textTransform: 'uppercase', fontWeight: 700, color: '#fff' }}>
          <div style={{ width: 8, height: 8, background: 'var(--red)', border: '1px solid #000' }} />
          <span>INTERSTATE HQ (DELHI)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, textTransform: 'uppercase', fontWeight: 700, color: 'var(--cyan-dim)' }}>
          <span style={{ letterSpacing: '0.15em' }}>---</span>
          <span>HAWALA / COLLECTION ARC</span>
        </div>
      </div>
    </div>
  );
}
