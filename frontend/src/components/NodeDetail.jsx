import React from 'react';
import { ShieldAlert, User, MapPin, Box, Calendar, FileText, Bookmark, ExternalLink, X, Activity, Scissors } from 'lucide-react';

export default function NodeDetail({ node, centralityScore, onClose, onSimulateArrest }) {
  if (!node) return null;

  const getIcon = () => {
    switch (node.label) {
      case 'Person': return <User className="w-5 h-5 text-red-400" />;
      case 'Object': return <Box className="w-5 h-5 text-sky-400" />;
      case 'Location': return <MapPin className="w-5 h-5 text-emerald-400" />;
      case 'Event': return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'BNSSection': return <Bookmark className="w-5 h-5 text-purple-400" />;
      case 'FIR': return <FileText className="w-5 h-5 text-yellow-400" />;
      default: return <ShieldAlert className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBadgeClass = () => {
    switch (node.label) {
      case 'Person': return 'badge-person';
      case 'Object': return 'badge-object';
      case 'Location': return 'badge-location';
      case 'Event': return 'badge-event';
      case 'BNSSection': return 'badge-bns';
      case 'FIR': return 'badge-fir';
      default: return 'badge-person';
    }
  };

  const isPerson = node.label === 'Person';

  return (
    <div className="glass-panel w-96 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-sm animate-fadeIn border border-white/10">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`badge ${getBadgeClass()}`}>{node.label}</span>
              {node.role && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-medium uppercase border border-red-500/30">
                  {node.role}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base text-white mt-1 leading-tight">
              {node.display_name || node.name || node.number || 'Unnamed Node'}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Centrality Insight if available */}
      {centralityScore && (
        <div className="bg-sky-950/40 border border-sky-500/30 rounded-lg p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-sky-300 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> GDS Centrality
            </span>
            <span>Ranked High</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-black/30 p-2 rounded border border-white/5">
              <span className="text-[11px] text-slate-400 block">Betweenness</span>
              <span className="text-sm font-mono font-bold text-sky-200">
                {centralityScore.betweenness}
              </span>
            </div>
            <div className="bg-black/30 p-2 rounded border border-white/5">
              <span className="text-[11px] text-slate-400 block">PageRank</span>
              <span className="text-sm font-mono font-bold text-sky-200">
                {centralityScore.pagerank}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Node Properties */}
      <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
        {node.description && (
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
            <span className="text-xs text-slate-400 block mb-1 font-medium">Description / Identifying Info</span>
            <p className="text-slate-200 text-xs leading-relaxed">{node.description}</p>
          </div>
        )}

        {node.phone && (
          <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded">
            <span className="text-slate-400">Phone:</span>
            <span className="font-mono text-white">{node.phone}</span>
          </div>
        )}

        {node.identifier && (
          <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded">
            <span className="text-slate-400">Reg / ID:</span>
            <span className="font-mono text-sky-300 font-semibold">{node.identifier}</span>
          </div>
        )}

        {node.confidence !== undefined && (
          <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded">
            <span className="text-slate-400">Extraction Confidence:</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {(node.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {node.cluster_id !== undefined && (
          <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded">
            <span className="text-slate-400">Component Cluster:</span>
            <span
              className="font-mono font-bold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: node.cluster_color || '#ef4444' }}
            >
              Cluster #{node.cluster_id + 1}
            </span>
          </div>
        )}
      </div>

      {/* Tactical Actions */}
      <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
        <button
          onClick={() => onSimulateArrest(node.id)}
          className="w-full btn-danger text-xs justify-center py-2.5"
        >
          <Scissors className="w-3.5 h-3.5" />
          Simulate Tactical Arrest on This Node
        </button>
      </div>
    </div>
  );
}
