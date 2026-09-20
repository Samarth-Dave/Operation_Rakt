import React from 'react';
import { Shield, Activity, Scissors, RotateCcw, Upload, Database, Crosshair, Globe, Network, Play } from 'lucide-react';
import RosterPanel from './RosterPanel';

export default function ControlPanel({
  onOpenUpload, onSeedDatabase, onResetDatabase, onAnalyzeCentrality,
  isSimulationActive, onToggleSimulation, onResetSimulation,
  isAnalyzing, isSeeding, simulationResult, stats,
  activeView, onSetActiveView,
  viewMode, onSetViewMode,
  detectionMode, onToggleDetection,
  onPlayDemo,
  graphData, selectedNode, onNodeClick
}) {
  return (
    <>
      {/* ── Branding ── */}
      <div className="glass" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-logo">
              <Shield size={16} color="#fff" />
            </div>
            <div>
              <div className="brand-title">OPERATION RAKT</div>
              <div className="brand-sub">CRIMINAL SYNDICATE INTEL</div>
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
            <span className="stat-value">{stats.totalLinks}</span>
          </div>
          <div className="stat-cell">
            <span className="stat-label">BNS</span>
            <span className="stat-value" style={{ color: 'var(--purple)' }}>2023</span>
          </div>
        </div>
      </div>

      {/* ── View Toggle ── */}
      <div className="view-toggle-group">
        <button
          className={`view-toggle-btn ${activeView === 'network' ? 'active' : ''}`}
          onClick={() => onSetActiveView('network')}
        >
          <Network size={10} /> NETWORK
        </button>
        <button
          className={`view-toggle-btn ${activeView === 'geo' ? 'active' : ''}`}
          onClick={() => onSetActiveView('geo')}
        >
          <Globe size={10} /> GEO INTEL
        </button>
      </div>

      {/* ── Visual Mode Toggle ── */}
      <div className="view-toggle-group">
        <button
          className={`view-toggle-btn ${viewMode === 'normal' ? 'active' : ''}`}
          onClick={() => onSetViewMode('normal')}
        >
          NRM
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'thermal' ? 'active' : ''}`}
          onClick={() => onSetViewMode('thermal')}
        >
          THR
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'nvg' ? 'active' : ''}`}
          onClick={() => onSetViewMode('nvg')}
        >
          NVG
        </button>
      </div>

      {/* ── Primary Actions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button className="btn btn-primary btn-full" onClick={onOpenUpload} id="btn-ingest-fir">
          <Upload size={12} /> INGEST FIR
        </button>
        <button
          className="btn btn-sky btn-full"
          onClick={onAnalyzeCentrality}
          disabled={isAnalyzing}
          id="btn-analyze-network"
        >
          <Activity size={12} />
          {isAnalyzing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="animate-spin" style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid rgba(0,240,255,0.2)', borderTopColor: 'var(--cyan)', }} />
              COMPUTING GDS…
            </span>
          ) : 'ANALYZE NETWORK'}
        </button>
      </div>

      {/* ── Demo Briefing Tour ── */}
      <button
        className="btn btn-ghost btn-full"
        onClick={onPlayDemo}
        id="btn-play-demo"
        style={{
          border: '1px solid rgba(0, 240, 255, 0.3)',
          background: 'rgba(0, 240, 255, 0.06)',
          color: 'var(--cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Play size={11} /> PLAY BRIEFING TOUR
      </button>

      {/* ── Simulate Arrest ── */}
      <div className={`arrest-zone ${isSimulationActive ? 'active' : 'inactive'}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: isSimulationActive ? '#fca5a5' : 'var(--text-2)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Scissors size={12} color={isSimulationActive ? 'var(--red)' : 'var(--text-3)'} />
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
            ⚡ CLICK ANY NODE TO SEVER ITS LINKS AND COMPUTE LIVE NETWORK FRAGMENTATION.
            {simulationResult && (
              <button
                className="btn btn-ghost btn-sm btn-full"
                style={{ marginTop: 6 }}
                onClick={onResetSimulation}
              >
                <RotateCcw size={10} /> RESET SIMULATION
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Detection Mode Toggle ── */}
      <button
        className={`detection-toggle ${detectionMode ? 'active' : ''}`}
        onClick={onToggleDetection}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <Crosshair size={11} /> DETECTION MODE {detectionMode ? '◉' : '○'}
      </button>

      {/* ── POLE Legend ── */}
      <div className="glass-sm" style={{ padding: '8px 10px' }}>
        <div className="section-header">POLE NODE LEGEND</div>
        <div className="pole-legend">
          <span className="badge badge-person">● PERSON</span>
          <span className="badge badge-object">● OBJECT</span>
          <span className="badge badge-location">● LOCATION</span>
          <span className="badge badge-event">● EVENT</span>
          <span className="badge badge-bns">● BNS 2023</span>
          <span className="badge badge-fir">● FIR DOC</span>
        </div>
      </div>

      {/* ── Left Roster Panel ── */}
      <RosterPanel
        graphData={graphData}
        selectedNode={selectedNode}
        onNodeClick={onNodeClick}
      />

      {/* ── DB Utilities ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button
          className="btn btn-ghost btn-sm btn-full"
          onClick={onSeedDatabase}
          disabled={isSeeding}
          id="btn-reseed"
          style={{ justifyContent: 'flex-start' }}
        >
          <Database size={10} color="var(--cyan)" />
          {isSeeding ? 'SEEDING MOCK FIRS…' : 'RESEED 4 MOCK FIRS'}
        </button>
        <button
          className="btn btn-ghost btn-sm btn-full"
          onClick={onResetDatabase}
          id="btn-wipe-db"
          style={{ justifyContent: 'flex-start', color: 'var(--text-3)' }}
        >
          <RotateCcw size={10} color="var(--red)" /> WIPE DATABASE
        </button>
      </div>
    </>
  );
}
