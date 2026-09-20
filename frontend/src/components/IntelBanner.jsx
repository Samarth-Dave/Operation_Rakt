import React from 'react';
import { AlertTriangle, Activity, Scissors, X } from 'lucide-react';

export default function IntelBanner({ topBridgeNode, simulationResult, onCloseBridge, onCloseSimulation }) {
  if (!topBridgeNode && !simulationResult) return null;

  return (
    <>
      {topBridgeNode && (
        <div className="intel-banner red">
          <div style={{ width: 30, height: 30, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Activity size={14} color="var(--red)" className="animate-pulse" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--red)' }}>
                CRITICAL NETWORK BOTTLENECK
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', padding: '1px 6px', fontWeight: 700 }}>
                BETWEENNESS: {topBridgeNode.betweenness}
              </span>
            </div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2, letterSpacing: '0.03em' }}>{topBridgeNode.name}</h4>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-2)', lineHeight: 1.5 }}>
              {topBridgeNode.reason || 'SINGLE POINT OF FAILURE CONNECTING REGIONAL EXTORTION NODES TO SYNDICATE LEADERSHIP.'}
            </p>
          </div>
          <button className="icon-btn" onClick={onCloseBridge} aria-label="Dismiss bridge alert">
            <X size={12} />
          </button>
        </div>
      )}

      {simulationResult && (
        <div className={`intel-banner ${simulationResult.shattered ? 'red' : 'sky'}`}>
          <div style={{ width: 30, height: 30, background: simulationResult.shattered ? 'rgba(239,68,68,0.1)' : 'rgba(0,240,255,0.06)', border: `1px solid ${simulationResult.shattered ? 'rgba(239,68,68,0.2)' : 'rgba(0,240,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Scissors size={14} color={simulationResult.shattered ? 'var(--red)' : 'var(--cyan)'} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: simulationResult.shattered ? 'var(--red)' : 'var(--cyan)' }}>
                {simulationResult.shattered ? '⚡ NETWORK SHATTERED' : 'ARREST IMPACT ANALYSIS'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, background: 'rgba(255,255,255,0.05)', color: 'var(--text-1)', border: '1px solid rgba(255,255,255,0.08)', padding: '1px 6px', fontWeight: 700 }}>
                {simulationResult.components_before} → {simulationResult.components_after} COMPONENTS
              </span>
            </div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2, letterSpacing: '0.03em' }}>
              TARGET: {(simulationResult.arrested_node?.display_name || simulationResult.arrested_node?.name || 'ARRESTED NODE').toUpperCase()}
            </h4>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-2)', lineHeight: 1.5 }}>{simulationResult.tactical_summary}</p>
          </div>
          <button className="icon-btn" onClick={onCloseSimulation} aria-label="Dismiss simulation result">
            <X size={12} />
          </button>
        </div>
      )}
    </>
  );
}
