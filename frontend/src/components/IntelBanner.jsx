import React from 'react';
import { AlertCircle, Activity, Scissors, CheckCircle, X } from 'lucide-react';

export default function IntelBanner({ topBridgeNode, simulationResult, onCloseBridge, onCloseSimulation }) {
  if (!topBridgeNode && !simulationResult) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-auto flex flex-col gap-2">
      {/* Centrality Bridge Alert */}
      {topBridgeNode && (
        <div className="glass-panel border-l-4 border-l-red-500 border border-white/10 rounded-xl p-4 shadow-2xl bg-[#0e1628]/95 animate-slideUp flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 mt-0.5">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-red-400">
                  Critical Network Bottleneck Identified
                </span>
                <span className="text-[10px] bg-red-500/20 text-red-300 font-mono px-2 py-0.5 rounded border border-red-500/30">
                  Betweenness: {topBridgeNode.betweenness}
                </span>
              </div>
              <h4 className="font-bold text-white text-sm mt-0.5">
                {topBridgeNode.name}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {topBridgeNode.reason || "Acts as the single point of failure and communications bridge connecting regional extortion nodes to syndicate leadership."}
              </p>
            </div>
          </div>
          <button onClick={onCloseBridge} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Simulation Result Briefing */}
      {simulationResult && (
        <div className={`glass-panel border-l-4 rounded-xl p-4 shadow-2xl bg-[#0e1628]/95 animate-slideUp flex items-start justify-between ${
          simulationResult.shattered ? 'border-l-red-500' : 'border-l-sky-500'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg mt-0.5 ${
              simulationResult.shattered ? 'bg-red-500/20 text-red-400' : 'bg-sky-500/20 text-sky-400'
            }`}>
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono uppercase tracking-wider ${
                  simulationResult.shattered ? 'text-red-400' : 'text-sky-400'
                }`}>
                  {simulationResult.shattered ? 'Network Shattered' : 'Arrest Impact Analysis'}
                </span>
                <span className="text-[10px] bg-white/10 text-white font-mono px-2 py-0.5 rounded border border-white/10">
                  {simulationResult.components_before} → {simulationResult.components_after} Components
                </span>
              </div>
              <h4 className="font-bold text-white text-sm mt-0.5">
                Target: {simulationResult.arrested_node?.display_name || simulationResult.arrested_node?.name || 'Arrested Node'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {simulationResult.tactical_summary}
              </p>
            </div>
          </div>
          <button onClick={onCloseSimulation} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
