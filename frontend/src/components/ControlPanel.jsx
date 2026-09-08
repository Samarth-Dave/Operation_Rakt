import React from 'react';
import { Shield, Activity, Scissors, RotateCcw, Upload, Database } from 'lucide-react';

export default function ControlPanel({
  onOpenUpload, onSeedDatabase, onResetDatabase, onAnalyzeCentrality,
  isSimulationActive, onToggleSimulation, onResetSimulation,
  isAnalyzing, isSeeding, simulationResult, stats
}) {
  return (
    <>
      {/* ── Branding ── */}
      <div className="glass" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-logo">
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <div className="brand-title">OPERATION RAKT</div>
              <div className="brand-sub">AI Criminal Syndicate Intelligence</div>
            </div>
          </div>
          <div className="live-pill">
            <span className="live-dot" />
            LIVE
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-cell">
            <span className="stat-label">Nodes</span>
            <span className="stat-value">{stats.totalNodes}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">Links</span>
            <span className="stat-value" style={{ color: 'var(--sky)' }}>{stats.totalLinks}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">BNS</span>
            <span className="stat-value" style={{ color: 'var(--purple)' }}>2023</span>
          </div>
        </div>
      </div>

      {/* ── Primary Actions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn btn-primary btn-full" onClick={onOpenUpload} id="btn-ingest-fir">
          <Upload size={14} /> Ingest FIR
        </button>
        <button
          className="btn btn-sky btn-full"
          onClick={onAnalyzeCentrality}
          disabled={isAnalyzing}
          id="btn-analyze-network"
        >
          <Activity size={14} />
          {isAnalyzing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="animate-spin" style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(56,189,248,0.3)', borderTopColor: 'var(--sky)', borderRadius: '50%' }} />
              Computing GDS…
            </span>
          ) : 'Analyze Network'}
        </button>
      </div>

      {/* ── Simulate Arrest ── */}
      <div className={`arrest-zone ${isSimulationActive ? 'active' : 'inactive'}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: isSimulationActive ? '#fca5a5' : 'var(--text-2)' }}>
            <Scissors size={14} color={isSimulationActive ? 'var(--red)' : 'var(--text-3)'} />
            Simulate Arrest
          </div>
          <button
            id="toggle-simulate-arrest"
            className={`toggle-track ${isSimulationActive ? 'on' : 'off'}`}
            onClick={onToggleSimulation}
            aria-label="Toggle arrest simulation"
          >
            <div className="toggle-thumb" />
          </button>
        </div>

        {isSimulationActive && (
          <div className="arrest-tip">
            ⚡ Click any node on the canvas to sever its links and compute live network fragmentation.
            {simulationResult && (
              <button
                className="btn btn-ghost btn-sm btn-full"
                style={{ marginTop: 8 }}
                onClick={onResetSimulation}
              >
                <RotateCcw size={12} /> Reset Simulation
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── POLE Legend ── */}
      <div className="glass-sm" style={{ padding: '10px 12px' }}>
        <div className="section-header">POLE Node Legend</div>
        <div className="pole-legend">
          <span className="badge badge-person">● Person</span>
          <span className="badge badge-object">● Object</span>
          <span className="badge badge-location">● Location</span>
          <span className="badge badge-event">● Event</span>
          <span className="badge badge-bns">● BNS 2023</span>
          <span className="badge badge-fir">● FIR Doc</span>
        </div>
      </div>

      {/* ── DB Utilities ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          className="btn btn-ghost btn-sm btn-full"
          onClick={onSeedDatabase}
          disabled={isSeeding}
          id="btn-reseed"
          style={{ justifyContent: 'flex-start' }}
        >
          <Database size={12} color="var(--sky)" />
          {isSeeding ? 'Seeding mock FIRs…' : 'Reseed 4 Mock FIRs'}
        </button>
        <button
          className="btn btn-ghost btn-sm btn-full"
          onClick={onResetDatabase}
          id="btn-wipe-db"
          style={{ justifyContent: 'flex-start', color: 'var(--text-3)' }}
        >
          <RotateCcw size={12} color="var(--red)" /> Wipe Database
        </button>
      </div>
    </>
  );
}
