import React from 'react';
import { ShieldAlert, User, MapPin, Box, Calendar, FileText, Bookmark, X, Activity, Scissors } from 'lucide-react';
import ChainOfCustodyPanel from './ChainOfCustodyPanel';

const ICON_MAP = {
  Person:     <User     size={14} color="#f87171" />,
  Object:     <Box      size={14} color="#00f0ff" />,
  Location:   <MapPin   size={14} color="#34d399" />,
  Event:      <Calendar size={14} color="#fbbf24" />,
  BNSSection: <Bookmark size={14} color="#c084fc" />,
  FIR:        <FileText size={14} color="#fde047" />,
};

const BADGE_MAP = {
  Person: 'badge-person', Object: 'badge-object', Location: 'badge-location',
  Event: 'badge-event', BNSSection: 'badge-bns', FIR: 'badge-fir',
};

const ICON_BG = {
  Person: 'rgba(239,68,68,0.1)', Object: 'rgba(0,240,255,0.08)',
  Location: 'rgba(16,185,129,0.1)', Event: 'rgba(245,158,11,0.1)',
  BNSSection: 'rgba(168,85,247,0.1)', FIR: 'rgba(234,179,8,0.1)',
};

export default function NodeDetail({ node, centralityScore, onClose, onSimulateArrest, graphData }) {
  if (!node) return null;

  const label = node.label || (node.labels && node.labels.length > 0 ? node.labels[0] : 'Unknown');
  const displayName = node.display_name || node.name || node.number || 'Unnamed Node';
  const badgeClass = BADGE_MAP[label] || 'badge-unknown';
  const icon = ICON_MAP[label] || <ShieldAlert size={14} color="#5a6a80" />;
  const iconBg = ICON_BG[label] || 'rgba(148,163,184,0.1)';

  const confPct = node.confidence !== undefined ? Math.round(node.confidence * 100) : null;
  const confColor = confPct >= 85 ? 'var(--emerald)' : confPct >= 60 ? 'var(--amber)' : 'var(--red)';

  // Find linked FIRs and BNS sections from graph data
  const linkedFirs = [];
  const linkedBns = [];
  if (graphData && graphData.links && graphData.nodes) {
    const nodeId = node.id;
    // Find all links involving this node
    graphData.links.forEach(link => {
      const src = typeof link.source === 'object' ? link.source.id : link.source;
      const tgt = typeof link.target === 'object' ? link.target.id : link.target;

      if (src === nodeId || tgt === nodeId) {
        const otherId = src === nodeId ? tgt : src;
        const otherNode = graphData.nodes.find(n => n.id === otherId);
        if (otherNode) {
          if (otherNode.label === 'FIR') {
            linkedFirs.push(otherNode.number || otherNode.display_name || `FIR-${otherId}`);
          }
          if (otherNode.label === 'BNSSection') {
            linkedBns.push(`S.${otherNode.section || ''} ${otherNode.title || otherNode.display_name || ''}`);
          }
        }
      }
    });
  }

  return (
    <div className="node-detail animate-fadeIn">
      {/* Header */}
      <div className="node-detail-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, background: iconBg, border: '1px solid rgba(0,240,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <span className={`badge ${badgeClass}`}>{label}</span>
                {node.role && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '1px 6px', background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {node.role}
                  </span>
                )}
              </div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.3, letterSpacing: '0.02em' }}>{displayName}</h3>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close node detail" id="btn-close-node-detail">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="node-detail-body">

        {/* Centrality */}
        {centralityScore && (
          <div className="centrality-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--cyan)' }}>
                <Activity size={10} /> GDS CENTRALITY
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', padding: '1px 6px', fontWeight: 700, letterSpacing: '0.08em' }}>
                HIGH RISK
              </span>
            </div>
            <div className="centrality-grid">
              <div className="centrality-metric">
                <span className="metric-label">Betweenness</span>
                <span className="metric-value">{centralityScore.betweenness}</span>
              </div>
              <div className="centrality-metric">
                <span className="metric-label">PageRank</span>
                <span className="metric-value">{centralityScore.pagerank}</span>
              </div>
            </div>
          </div>
        )}

        {/* Linked FIRs */}
        {linkedFirs.length > 0 && (
          <div className="prop-row" style={{ flexDirection: 'column', gap: 4 }}>
            <span className="prop-label">LINKED FIR(S)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {linkedFirs.map((fir, i) => (
                <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 6px', background: 'rgba(234,179,8,0.08)', color: '#fde047', border: '1px solid rgba(234,179,8,0.2)', fontWeight: 600 }}>
                  {fir}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Linked BNS Sections */}
        {linkedBns.length > 0 && (
          <div className="prop-row" style={{ flexDirection: 'column', gap: 4 }}>
            <span className="prop-label">BNS SECTIONS</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {linkedBns.map((bns, i) => (
                <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 6px', background: 'rgba(168,85,247,0.08)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)', fontWeight: 600 }}>
                  {bns}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {node.description && (
          <div style={{ background: 'rgba(0,240,255,0.02)', border: '1px solid rgba(0,240,255,0.05)', padding: '8px 10px' }}>
            <div className="section-header">IDENTIFYING INTEL</div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', lineHeight: 1.6 }}>{node.description}</p>
          </div>
        )}

        {/* Property rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {node.phone && (
            <div className="prop-row">
              <span className="prop-label">PHONE</span>
              <span className="prop-value" style={{ color: 'var(--cyan)' }}>{node.phone}</span>
            </div>
          )}
          {node.identifier && (
            <div className="prop-row">
              <span className="prop-label">REG / ID</span>
              <span className="prop-value" style={{ color: 'var(--cyan)' }}>{node.identifier}</span>
            </div>
          )}
          {confPct !== null && (
            <div className="prop-row" style={{ flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="prop-label">EXTRACTION CONFIDENCE</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: confColor }}>{confPct}%</span>
              </div>
              <div className="conf-bar-track">
                <div className="conf-bar-fill" style={{ width: `${confPct}%`, background: `linear-gradient(90deg, ${confColor}, var(--emerald))` }} />
              </div>
            </div>
          )}
          {node.cluster_id !== undefined && (
            <div className="prop-row">
              <span className="prop-label">COMPONENT CLUSTER</span>
              <span className="cluster-chip" style={{ background: node.cluster_color || 'var(--red)' }}>
                CLUSTER #{node.cluster_id + 1}
              </span>
            </div>
          )}
        </div>

        {/* Blockchain Chain of Custody for Evidence/Objects */}
        {(label === 'Object' || label === 'Evidence') && (
          <ChainOfCustodyPanel evidenceId={node.id} />
        )}

      </div>

      {/* Footer - Only show Tactical Arrest for Persons */}
      {label === 'Person' && (
        <div className="node-detail-footer">
          <button
            id="btn-simulate-arrest-node"
            className="btn btn-danger btn-full"
            onClick={() => onSimulateArrest(node.id)}
          >
            <Scissors size={12} /> SIMULATE TACTICAL ARREST
          </button>
        </div>
      )}
    </div>
  );
}
