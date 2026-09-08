import React from 'react';
import { AlertTriangle, Activity, Scissors, X } from 'lucide-react';

export default function IntelBanner({ topBridgeNode, simulationResult, onCloseBridge, onCloseSimulation }) {
  if (!topBridgeNode && !simulationResult) return null;

  return (
    <>
      {topBridgeNode && (
        <div className="intel-banner red">
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Activity size={16} color="var(--red)" className="animate-pulse" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--red)' }}>
                Critical Network Bottleneck
              </span>
              <span style={{ fontSize: 9, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                Betweenness: {topBridgeNode.betweenness}
              </span>
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{topBridgeNode.name}</h4>
            <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
              {topBridgeNode.reason || 'Acts as the single point of failure connecting regional extortion nodes to syndicate leadership.'}
            </p>
          </div>
          <button className="icon-btn" onClick={onCloseBridge} aria-label="Dismiss bridge alert">
            <X size={14} />
          </button>
        </div>
      )}

      {simulationResult && (
        <div className={`intel-banner ${simulationResult.shattered ? 'red' : 'sky'}`}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: simulationResult.shattered ? 'rgba(239,68,68,0.15)' : 'rgba(56,189,248,0.12)', border: `1px solid ${simulationResult.shattered ? 'rgba(239,68,68,0.25)' : 'rgba(56,189,248,0.22)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Scissors size={16} color={simulationResult.shattered ? 'var(--red)' : 'var(--sky)'} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: simulationResult.shattered ? 'var(--red)' : 'var(--sky)' }}>
                {simulationResult.shattered ? '⚡ Network Shattered' : 'Arrest Impact Analysis'}
              </span>
              <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', color: 'var(--text-1)', border: '1px solid rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {simulationResult.components_before} → {simulationResult.components_after} Components
              </span>
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
              Target: {simulationResult.arrested_node?.display_name || simulationResult.arrested_node?.name || 'Arrested Node'}
            </h4>
            <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{simulationResult.tactical_summary}</p>
          </div>
          <button className="icon-btn" onClick={onCloseSimulation} aria-label="Dismiss simulation result">
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
