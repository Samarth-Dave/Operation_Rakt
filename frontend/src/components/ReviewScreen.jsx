import React, { useState } from 'react';
import { ShieldCheck, Edit3, Trash2, Plus, Database, FileText, ArrowRight, X } from 'lucide-react';

export default function ReviewScreen({ extractionData, onConfirm, onCancel, isCommitting }) {
  const [data, setData] = useState(extractionData || {});

  const updatePerson = (index, field, value) => {
    const updated = [...(data.persons || [])];
    updated[index][field] = value;
    setData({ ...data, persons: updated });
  };

  const removePerson = (index) => {
    const updated = (data.persons || []).filter((_, i) => i !== index);
    setData({ ...data, persons: updated });
  };

  const addPerson = () => {
    setData({
      ...data,
      persons: [
        ...(data.persons || []),
        { name: 'New Suspect', role: 'suspect', description: '', confidence: 1.0 }
      ]
    });
  };

  const getConfidenceBadge = (confidence) => {
    const conf = (confidence || 1.0) * 100;
    if (conf >= 85) return <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{conf.toFixed(0)}% HIGH</span>;
    if (conf >= 60) return <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{conf.toFixed(0)}% MED</span>;
    return <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }} className="animate-pulse">{conf.toFixed(0)}% VERIFY</span>;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-box" style={{ width: '90vw', maxWidth: 1200, height: '85vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0a0f1d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="var(--sky)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Human-in-the-Loop Intelligence Verification</h3>
                <span style={{ fontSize: 11, background: 'rgba(56,189,248,0.15)', color: '#bae6fd', border: '1px solid rgba(56,189,248,0.3)', padding: '2px 8px', borderRadius: 9999, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  FIR: {data.fir_number || 'UNKNOWN'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                Review and rectify LLM-extracted POLE entities and BNS statutory tags prior to committing to the Neo4j Knowledge Graph.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={isCommitting}>
              <X size={14} /> Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onConfirm(data)} disabled={isCommitting}>
              {isCommitting ? 'Committing to Neo4j...' : <><Database size={14} /> Commit to Knowledge Graph <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left: Raw Text */}
          <div style={{ width: '40%', borderRight: '1px solid rgba(255,255,255,0.08)', background: '#070b14', padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} color="var(--amber)" /> Scanned Document Narrative
              </span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                OCR Confidence: {((data.ocr_confidence || 1.0) * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 16, overflowY: 'auto', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {data.raw_text || 'No raw text provided.'}
            </div>
          </div>

          {/* Right: Editable Entities */}
          <div style={{ width: '60%', background: '#0b1021', padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Edit3 size={14} color="var(--sky)" /> Extracted Entities (Editable)
              </span>
              <button className="btn btn-ghost btn-sm" onClick={addPerson} style={{ padding: '4px 10px', fontSize: 11, color: 'var(--sky)' }}>
                <Plus size={12} /> Add Person
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* PERSONS */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8 }}>PERSONS & SUSPECTS ({(data.persons || []).length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(data.persons || []).map((person, idx) => (
                    <div key={idx} style={{ background: '#12192c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => updatePerson(idx, 'name', e.target.value)}
                          style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#fff', outline: 'none' }}
                          placeholder="Person Name"
                        />
                        <select
                          value={person.role}
                          onChange={(e) => updatePerson(idx, 'role', e.target.value)}
                          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--text-1)', outline: 'none' }}
                        >
                          <option value="suspect">Suspect</option>
                          <option value="victim">Victim</option>
                          <option value="associate">Associate</option>
                          <option value="witness">Witness</option>
                          <option value="unknown">Unknown</option>
                        </select>
                        {getConfidenceBadge(person.confidence)}
                        <button onClick={() => removePerson(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={person.description || ''}
                        onChange={(e) => updatePerson(idx, 'description', e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--text-2)', outline: 'none' }}
                        placeholder="Identifying details, aliases, or roles"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* BNS TAGS */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8 }}>BNS 2023 STATUTORY PROVISIONS ({(data.bns_tags || []).length})</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(data.bns_tags || []).map((tag, idx) => (
                    <div key={idx} style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', marginBottom: 4 }}>Section {tag.section}: {tag.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.4 }}>{tag.reasoning}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OBJECTS & LOCATIONS */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8 }}>OBJECTS & VEHICLES ({(data.objects || []).length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(data.objects || []).map((obj, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 10px', borderRadius: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sky)' }}>{obj.name}</div>
                        {obj.identifier && <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{obj.identifier}</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8 }}>LOCATIONS ({(data.locations || []).length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(data.locations || []).map((loc, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 10px', borderRadius: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald)' }}>{loc.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{loc.type}</div>
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
