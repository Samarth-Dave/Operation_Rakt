import React from 'react';
import { Shield, Activity, Scissors, RotateCcw, Upload, Database, Layers, CheckCircle2 } from 'lucide-react';

export default function ControlPanel({
  onOpenUpload,
  onSeedDatabase,
  onResetDatabase,
  onAnalyzeCentrality,
  isSimulationActive,
  onToggleSimulation,
  onResetSimulation,
  isAnalyzing,
  isSeeding,
  simulationResult,
  stats
}) {
  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-3 max-w-sm pointer-events-auto">
      {/* Title / Branding Badge */}
      <div className="glass-panel rounded-2xl p-4 shadow-2xl border border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-base tracking-wide text-white leading-tight">
                OPERATION RAKT
              </h1>
              <span className="text-[10px] text-sky-400 font-mono tracking-wider font-semibold uppercase">
                AI Criminal Syndicate Intelligence
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            NEO4J LIVE
          </div>
        </div>

        {/* Live Network Stats */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10 text-center">
          <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Nodes</span>
            <span className="font-mono font-bold text-sm text-white">{stats.totalNodes}</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Relationships</span>
            <span className="font-mono font-bold text-sm text-sky-400">{stats.totalLinks}</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">BNS Tags</span>
            <span className="font-mono font-bold text-sm text-purple-400">2023</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenUpload}
              className="btn-primary text-xs justify-center py-2 shadow-sky-600/20"
            >
              <Upload className="w-3.5 h-3.5" /> Ingest FIR
            </button>
            <button
              onClick={onAnalyzeCentrality}
              disabled={isAnalyzing}
              className="btn-secondary text-xs justify-center py-2 text-sky-300 border-sky-500/30 hover:border-sky-500/60"
            >
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              {isAnalyzing ? 'Computing GDS...' : 'Analyze Network'}
            </button>
          </div>

          {/* Simulate Arrest Toggle */}
          <div className={`p-2.5 rounded-xl border transition duration-200 flex flex-col gap-2 ${
            isSimulationActive
              ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-900/20'
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-white">
                <Scissors className={`w-3.5 h-3.5 ${isSimulationActive ? 'text-red-400' : 'text-slate-400'}`} />
                Simulate Arrest
              </span>
              <button
                onClick={onToggleSimulation}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  isSimulationActive ? 'bg-red-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isSimulationActive ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {isSimulationActive && (
              <div className="text-[11px] text-red-200 bg-black/40 p-2 rounded border border-red-500/20 flex flex-col gap-1.5">
                <span>⚡ Click any node to sever its links and compute network fragmentation.</span>
                {simulationResult && (
                  <button
                    onClick={onResetSimulation}
                    className="flex items-center justify-center gap-1 text-[10px] text-slate-300 hover:text-white py-1 bg-white/10 rounded transition"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Simulation
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Database Seed & Reset Utility */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={onSeedDatabase}
              disabled={isSeeding}
              className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              <Database className="w-3 h-3 text-sky-400" />
              {isSeeding ? 'Seeding...' : 'Reseed 4 Mock FIRs'}
            </button>
            <button
              onClick={onResetDatabase}
              className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3 text-red-400" /> Wipe DB
            </button>
          </div>
        </div>
      </div>

      {/* POLE Legend */}
      <div className="glass-panel rounded-xl p-3 shadow-lg border border-white/5 flex flex-wrap gap-2 text-[11px]">
        <span className="badge badge-person">● Person</span>
        <span className="badge badge-object">● Object</span>
        <span className="badge badge-location">● Location</span>
        <span className="badge badge-event">● Event</span>
        <span className="badge badge-bns">● BNS 2023</span>
        <span className="badge badge-fir">● FIR Doc</span>
      </div>
    </div>
  );
}
