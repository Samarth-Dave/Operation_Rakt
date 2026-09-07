import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Edit3, Trash2, Plus, CheckCircle, Database, FileText, ArrowRight, X } from 'lucide-react';

export default function ReviewScreen({ extractionData, onConfirm, onCancel, isCommitting }) {
  const [data, setData] = useState(extractionData);

  const updatePerson = (index, field, value) => {
    const updated = [...data.persons];
    updated[index][field] = value;
    setData({ ...data, persons: updated });
  };

  const removePerson = (index) => {
    const updated = data.persons.filter((_, i) => i !== index);
    setData({ ...data, persons: updated });
  };

  const addPerson = () => {
    setData({
      ...data,
      persons: [
        ...data.persons,
        { name: 'New Suspect', role: 'suspect', description: '', confidence: 1.0 }
      ]
    });
  };

  const getConfidenceBadge = (confidence) => {
    const conf = (confidence || 1.0) * 100;
    if (conf >= 85) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          {conf.toFixed(0)}% HIGH
        </span>
      );
    }
    if (conf >= 60) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          {conf.toFixed(0)}% MEDIUM
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
        {conf.toFixed(0)}% VERIFY
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
      <div className="glass-panel w-full max-w-6xl h-[88vh] rounded-2xl flex flex-col overflow-hidden border border-sky-500/30 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0a0f1d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Human-in-the-Loop Intelligence Verification
                </h2>
                <span className="px-2 py-0.5 rounded text-xs bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30">
                  FIR: {data.fir_number || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and rectify LLM-extracted POLE entities and BNS statutory tags prior to committing to the Neo4j Knowledge Graph.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="btn-secondary text-xs"
              disabled={isCommitting}
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={() => onConfirm(data)}
              className="btn-primary text-xs font-semibold py-2.5 px-4 shadow-lg shadow-sky-500/20"
              disabled={isCommitting}
            >
              {isCommitting ? (
                <>Committing to Neo4j...</>
              ) : (
                <>
                  <Database className="w-4 h-4" /> Commit to Knowledge Graph <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body: Split Screen */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left Column: Original Document */}
          <div className="col-span-5 border-r border-white/10 bg-[#080d1a] p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" /> Scanned Document Narrative
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                OCR Confidence: {((data.ocr_confidence || 1.0) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
              {data.raw_text || 'No raw text provided.'}
            </div>
          </div>

          {/* Right Column: Editable POLE Entities */}
          <div className="col-span-7 bg-[#0b1021] p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-sky-400" /> Extracted Entities (Editable)
              </span>
              <button
                onClick={addPerson}
                className="btn-secondary text-xs py-1 px-2.5 rounded text-sky-300 border-sky-500/30"
              >
                <Plus className="w-3.5 h-3.5" /> Add Person
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {/* Persons Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>PERSONS & SUSPECTS ({data.persons?.length || 0})</span>
                </div>
                {data.persons?.map((person, idx) => (
                  <div
                    key={idx}
                    className="glass-card p-3 rounded-lg border border-white/5 space-y-2 bg-[#12192c]"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => updatePerson(idx, 'name', e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded px-2.5 py-1 text-xs text-white font-medium focus:border-sky-500 outline-none"
                        placeholder="Person Name"
                      />
                      <select
                        value={person.role}
                        onChange={(e) => updatePerson(idx, 'role', e.target.value)}
                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                      >
                        <option value="suspect">Suspect</option>
                        <option value="victim">Victim</option>
                        <option value="associate">Associate</option>
                        <option value="witness">Witness</option>
                        <option value="unknown">Unknown</option>
                      </select>
                      {getConfidenceBadge(person.confidence)}
                      <button
                        onClick={() => removePerson(idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={person.description || ''}
                      onChange={(e) => updatePerson(idx, 'description', e.target.value)}
                      className="w-full bg-black/20 border border-white/5 rounded px-2.5 py-1 text-xs text-slate-300 placeholder-slate-500 focus:border-sky-500/50 outline-none"
                      placeholder="Identifying details, aliases, or roles"
                    />
                  </div>
                ))}
              </div>

              {/* BNS Statutory Tags */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs text-slate-400 font-medium block">
                  BNS 2023 STATUTORY PROVISIONS ({data.bns_tags?.length || 0})
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {data.bns_tags?.map((tag, idx) => (
                    <div key={idx} className="bg-purple-950/30 border border-purple-500/30 p-2.5 rounded-lg">
                      <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                        <span>Section {tag.section}: {tag.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {tag.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objects & Locations */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <span className="text-xs text-slate-400 font-medium block mb-1.5">
                    OBJECTS & VEHICLES ({data.objects?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {data.objects?.map((obj, idx) => (
                      <div key={idx} className="bg-white/5 p-2 rounded border border-white/5 text-xs">
                        <div className="font-semibold text-sky-300">{obj.name}</div>
                        {obj.identifier && (
                          <div className="text-[11px] font-mono text-slate-400">{obj.identifier}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-medium block mb-1.5">
                    LOCATIONS ({data.locations?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {data.locations?.map((loc, idx) => (
                      <div key={idx} className="bg-white/5 p-2 rounded border border-white/5 text-xs">
                        <div className="font-semibold text-emerald-300">{loc.name}</div>
                        <div className="text-[11px] text-slate-400">{loc.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
