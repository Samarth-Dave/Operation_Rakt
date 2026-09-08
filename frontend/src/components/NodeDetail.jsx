import React from 'react';
import { ShieldAlert, User, MapPin, Box, Calendar, FileText, Bookmark, X, Activity, Scissors } from 'lucide-react';

const ICON_MAP = {
  Person:     <User     size={16} color="#f87171" />,
  Object:     <Box      size={16} color="#38bdf8" />,
  Location:   <MapPin   size={16} color="#34d399" />,
  Event:      <Calendar size={16} color="#fbbf24" />,
  BNSSection: <Bookmark size={16} color="#c084fc" />,
  FIR:        <FileText size={16} color="#fde047" />,
};

const BADGE_MAP = {
  Person: 'badge-person', Object: 'badge-object', Location: 'badge-location',
  Event: 'badge-event', BNSSection: 'badge-bns', FIR: 'badge-fir',
};

const ICON_BG = {
  Person: 'rgba(239,68,68,0.12)', Object: 'rgba(56,189,248,0.12)',
  Location: 'rgba(16,185,129,0.12)', Event: 'rgba(245,158,11,0.12)',
  BNSSection: 'rgba(168,85,247,0.12)', FIR: 'rgba(234,179,8,0.12)',
};

export default function NodeDetail({ node, centralityScore, onClose, onSimulateArrest }) {
  if (!node) return null;

  const label = node.label || 'Unknown';
  const displayName = node.display_name || node.name || node.number || 'Unnamed Node';
  const badgeClass = BADGE_MAP[label] || 'badge-unknown';
  const icon = ICON_MAP[label] || <ShieldAlert size={16} color="#94a3b8" />;
  const iconBg = ICON_BG[label] || 'rgba(148,163,184,0.12)';

  const confPct = node.confidence !== undefined ? Math.round(node.confidence * 100) : null;
  const confColor = confPct >= 85 ? 'var(--emerald)' : confPct >= 60 ? 'var(--amber)' : 'var(--red)';

  return (
    <div className="node-detail animate-fadeIn">
      {/* Header */}
      <div className="node-detail-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span className={`badge ${badgeClass}`}>{label}</span>
                {node.role && (
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 9999, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {node.role}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{displayName}</h3>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close node detail" id="btn-close-node-detail">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="node-detail-body">

        {/* Centrality */}
        {centralityScore && (
          <div className="centrality-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sky)' }}>
                <Activity size={12} /> GDS Centrality Analysis
              </div>
              <span style={{ fontSize: 9, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 7px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.06em' }}>
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

        {/* Description */}
        {node.description && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px' }}>
            <div className="section-header">Description / Identifying Info</div>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{node.description}</p>
          </div>
        )}

        {/* Property rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {node.phone && (
            <div className="prop-row">
              <span className="prop-label">Phone</span>
              <span className="prop-value" style={{ color: 'var(--sky)' }}>{node.phone}</span>
            </div>
          )}
          {node.identifier && (
            <div className="prop-row">
              <span className="prop-label">Reg / ID</span>
              <span className="prop-value" style={{ color: 'var(--sky)' }}>{node.identifier}</span>
            </div>
          )}
          {confPct !== null && (
            <div className="prop-row" style={{ flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="prop-label">Extraction Confidence</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: confColor }}>{confPct}%</span>
              </div>
              <div className="conf-bar-track">
                <div className="conf-bar-fill" style={{ width: `${confPct}%`, background: `linear-gradient(90deg, ${confColor}, var(--emerald))` }} />
              </div>
            </div>
          )}
          {node.cluster_id !== undefined && (
            <div className="prop-row">
              <span className="prop-label">Component Cluster</span>
              <span className="cluster-chip" style={{ background: node.cluster_color || 'var(--red)' }}>
                Cluster #{node.cluster_id + 1}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="node-detail-footer">
        <button
          id="btn-simulate-arrest-node"
          className="btn btn-danger btn-full"
          onClick={() => onSimulateArrest(node.id)}
        >
          <Scissors size={14} /> Simulate Tactical Arrest
        </button>
      </div>
    </div>
  );
}
