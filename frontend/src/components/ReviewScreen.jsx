import React, { useState } from 'react';
import { ShieldCheck, Edit3, Trash2, Plus, Database, FileText, ArrowRight, X } from 'lucide-react';

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
        { name: 'NEW SUSPECT', role: 'suspect', description: '', confidence: 1.0 }
      ]
    });
  };

  const getConfidenceBadge = (confidence) => {
    const conf = (confidence || 1.0) * 100;
    if (conf >= 85) {
      return (
        <span
          className="px-2 py-0.5 text-[10px] font-mono font-bold"
          style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
        >
          {conf.toFixed(0)}% HIGH
        </span>
      );
    }
    if (conf >= 60) {
      return (
        <span
          className="px-2 py-0.5 text-[10px] font-mono font-bold"
          style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
        >
          {conf.toFixed(0)}% MED
        </span>
      );
    }
    return (
      <span
        className="px-2 py-0.5 text-[10px] font-mono font-bold animate-pulse"
        style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.4)' }}
      >
        {conf.toFixed(0)}% VERIFY
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fadeIn" style={{ background: 'rgba(2, 4, 8, 0.88)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden font-mono relative"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Corner bracket accents */}
        <div style={{ position: 'absolute', top: -1, left: -1, width: 14, height: 14, borderTop: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)', zIndex: 10 }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)', zIndex: 10 }} />

        {/* Header */}
        <div
          className="px-6 py-3.5 border-b flex items-center justify-between"
          style={{ background: 'var(--bg-raised)', borderColor: 'rgba(0, 240, 255, 0.15)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2" style={{ background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.25)', color: 'var(--cyan)' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  HUMAN-IN-THE-LOOP INTELLIGENCE VERIFICATION
                </h2>
                <span
                  className="px-2 py-0.5 text-[10px] uppercase font-bold"
                  style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--cyan)', border: '1px solid rgba(0, 240, 255, 0.25)' }}
                >
                  FIR // {data.fir_number || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-[10px] uppercase mt-0.5" style={{ color: 'var(--text-3)' }}>
                Review and sanitize extracted POLE entities and BNS provisions prior to Neo4j persistence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="btn btn-ghost btn-sm"
              disabled={isCommitting}
            >
              <X size={14} /> ABORT
            </button>
            <button
              onClick={() => onConfirm(data)}
              className="btn btn-primary btn-sm"
              disabled={isCommitting}
            >
              {isCommitting ? (
                <>PERSISTING TO NEO4J...</>
              ) : (
                <>
                  <Database size={14} /> COMMIT TO KNOWLEDGE GRAPH <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body: Split Screen */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left Column: Original Document */}
          <div
            className="col-span-5 border-r p-4 flex flex-col overflow-hidden"
            style={{ background: 'rgba(2, 4, 8, 0.6)', borderColor: 'rgba(0, 240, 255, 0.1)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--cyan-dim)' }}>
                <FileText size={12} style={{ color: 'var(--amber)' }} /> RAW DOCUMENT NARRATIVE
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                OCR CONFIDENCE: {((data.ocr_confidence || 1.0) * 100).toFixed(0)}%
              </span>
            </div>
            <div
              className="flex-1 p-3 overflow-y-auto text-[11px] whitespace-pre-wrap leading-relaxed select-text"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 240, 255, 0.08)',
                color: 'var(--text-2)',
              }}
            >
              {data.raw_text || 'No raw text provided.'}
            </div>
          </div>

          {/* Right Column: Editable POLE Entities */}
          <div
            className="col-span-7 p-4 flex flex-col overflow-hidden"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--cyan)' }}>
                <Edit3 size={12} /> EXTRACTED POLE ENTITIES (EDITABLE)
              </span>
              <button
                onClick={addPerson}
                className="btn btn-sky btn-sm"
              >
                <Plus size={12} /> ADD PERSON
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
              {/* Persons Section */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                  PERSONS OF INTEREST ({data.persons?.length || 0})
                </span>
                {data.persons?.map((person, idx) => (
                  <div
                    key={idx}
                    className="p-2 flex flex-col gap-1.5"
                    style={{
                      background: 'rgba(0, 240, 255, 0.03)',
                      border: '1px solid rgba(0, 240, 255, 0.12)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => updatePerson(idx, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs text-white font-mono uppercase"
                        style={{
                          background: 'rgba(0, 0, 0, 0.6)',
                          border: '1px solid rgba(0, 240, 255, 0.2)',
                          outline: 'none',
                        }}
                        placeholder="PERSON NAME"
                      />
                      <select
                        value={person.role}
                        onChange={(e) => updatePerson(idx, 'role', e.target.value)}
                        className="px-2 py-1 text-xs text-white font-mono uppercase"
                        style={{
                          background: 'rgba(0, 0, 0, 0.6)',
                          border: '1px solid rgba(0, 240, 255, 0.2)',
                          outline: 'none',
                        }}
                      >
                        <option value="suspect">SUSPECT</option>
                        <option value="victim">VICTIM</option>
                        <option value="associate">ASSOCIATE</option>
                        <option value="witness">WITNESS</option>
                        <option value="unknown">UNKNOWN</option>
                      </select>
                      {getConfidenceBadge(person.confidence)}
                      <button
                        onClick={() => removePerson(idx)}
                        className="p-1 hover:text-red-400 transition"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={person.description || ''}
                      onChange={(e) => updatePerson(idx, 'description', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] font-mono"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-2)',
                        outline: 'none',
                      }}
                      placeholder="IDENTIFYING DETAILS, ALIASES, OR OPERATIONAL ROLE"
                    />
                  </div>
                ))}
              </div>

              {/* BNS Statutory Tags */}
              <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'rgba(0, 240, 255, 0.08)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>
                  BNS 2023 STATUTORY TAGS ({data.bns_tags?.length || 0})
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {data.bns_tags?.map((tag, idx) => (
                    <div
                      key={idx}
                      className="p-2"
                      style={{
                        background: 'rgba(168, 85, 247, 0.06)',
                        border: '1px solid rgba(168, 85, 247, 0.25)',
                      }}
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--purple)' }}>
                        SEC {tag.section}: {tag.title}
                      </div>
                      <p className="text-[10px] mt-1 leading-snug" style={{ color: 'var(--text-2)' }}>
                        {tag.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objects & Locations */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: 'rgba(0, 240, 255, 0.08)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-2)' }}>
                    OBJECTS & VEHICLES ({data.objects?.length || 0})
                  </span>
                  <div className="flex flex-col gap-1">
                    {data.objects?.map((obj, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 text-[11px]"
                        style={{
                          background: 'rgba(0, 240, 255, 0.04)',
                          border: '1px solid rgba(0, 240, 255, 0.1)',
                        }}
                      >
                        <div className="font-bold text-white uppercase">{obj.name}</div>
                        {obj.identifier && (
                          <div className="text-[10px] font-mono" style={{ color: 'var(--cyan-dim)' }}>{obj.identifier}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-2)' }}>
                    LOCATIONS ({data.locations?.length || 0})
                  </span>
                  <div className="flex flex-col gap-1">
                    {data.locations?.map((loc, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 text-[11px]"
                        style={{
                          background: 'rgba(16, 185, 129, 0.04)',
                          border: '1px solid rgba(16, 185, 129, 0.15)',
                        }}
                      >
                        <div className="font-bold text-white uppercase">{loc.name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--emerald)' }}>{loc.type || 'GEOSPATIAL'}</div>
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
