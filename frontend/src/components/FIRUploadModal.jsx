import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, Sparkles, X } from 'lucide-react';
import axios from 'axios';

export default function FIRUploadModal({ isOpen, onClose, onExtractionComplete }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await axios.post('http://localhost:8000/api/ingest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (resp.data.success) {
        onExtractionComplete(resp.data.extraction);
      } else {
        setError('Extraction returned unsuccessful.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'File upload and extraction failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadMockSample = async (sampleNum) => {
    setIsProcessing(true);
    setError(null);
    try {
      const samples = {
        1: `FIR No: 2024/MUM/EXT/0187\nPolice Station: Andheri West, Mumbai\nComplainant: Rajesh Kumar Agarwal, businessman.\nStatement: Main Rajesh Kumar Agarwal apni dukaan Agarwal Textile Mills mein kaam kar raha tha. Tab meri dukaan mein ek aadmi aaya jiska naam Chhotu hai. Uske saath ek aur aadmi tha jise woh Bhai bula raha tha. Chhotu ne 2 lakh rupaye maange nahi toh dukaan jalane ki dhamki di. Usne Bajaj Pulsar MH-02-AB-1234 ka use kiya. Dusre aadmi ne katta dikha ke kaha Vikram Delhi se aate hain, unhe mana mat karna. Paisa Shankar Tea Stall Lokhandwala pe dene ko bola.`,
        2: `FIR No: 2024/MUM/EXT/0192\nPolice Station: Jogeshwari East, Mumbai\nComplainant: Farhan Shaikh, Shaikh Electronics.\nStatement: Meri dukaan mein Deepak aaya, bola Vikram Bhai ke aadmi hain aur protection money 1.5 lakh chahiye. Usne Maruti Swift MH-04-CD-5678 use kiya. Bola paisa Ramesh ko Royal Hotel Goregaon West mein dena hai. Chhotu ka bhi naam liya.`,
        3: `FIR No: 2024/MUM/FIN/0201\nPolice Station: Goregaon West, Crime Branch.\nReport: Royal Hotel Goregaon manager Ramesh Gupta operates an extortion hawala conduit to Vikram Singh Tomar in Delhi. Shankar Yadav drops cash, Deepak Jadhav coordinates Swift drops, and Suresh Pandey arranges Thane logistics. Chhotu is the street collector.`,
        4: `FIR No: 2024/MUM/ASS/0215\nPolice Station: Versova, Mumbai\nComplainant: Amit Verma, Verma General Store.\nStatement: Deepak aur Bunty aaye, meri counter todi, 50,000 cash le gaye aur bola paisa Ramesh ko Royal Hotel mein do warna agla baar Chhotu aayega.`
      };

      const text = samples[sampleNum] || samples[1];
      const blob = new Blob([text], { type: 'text/plain' });
      const mockFile = new File([blob], `mock_fir_${sampleNum}.txt`, { type: 'text/plain' });

      const formData = new FormData();
      formData.append('file', mockFile);

      const resp = await axios.post('http://localhost:8000/api/ingest/upload', formData);
      if (resp.data.success) {
        onExtractionComplete(resp.data.extraction);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Sample extraction failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(2, 4, 8, 0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-xl p-6 flex flex-col gap-4 font-mono relative" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(0, 240, 255, 0.3)', boxShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
        {/* Corner bracket accents */}
        <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)' }} />

        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'rgba(0, 240, 255, 0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2" style={{ background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.25)', color: 'var(--cyan)' }}>
              <Upload size={18} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                INGEST FIRST INFORMATION REPORT // OCR & POLE PIPELINE
              </div>
              <p className="text-[10px] uppercase" style={{ color: 'var(--text-2)' }}>
                POLE entity extraction & BNS 2023 statutory tagging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Upload Drop Zone */}
        <div
          className="p-6 flex flex-col items-center justify-center text-center transition group relative cursor-pointer"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px dashed rgba(0, 240, 255, 0.3)',
          }}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="p-3" style={{ background: 'rgba(0, 240, 255, 0.06)', color: 'var(--cyan)' }}>
            <FileText size={24} />
          </div>
          <span className="text-xs font-semibold text-white mt-3 uppercase tracking-wider">
            {file ? file.name : 'SELECT / DROP FIR DOCUMENT'}
          </span>
          <span className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>
            [PDF, PNG, JPG, TXT // OCR CONFIDENCE THRESHOLD 80%]
          </span>
        </div>

        {/* Quick Demo Pre-load buttons */}
        <div className="p-3" style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(0, 240, 255, 0.08)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: 'var(--cyan-dim)' }}>
            <Sparkles size={12} style={{ color: 'var(--amber)' }} /> PRE-LOADED TACTICAL DEMO CASES
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 1, title: 'CASE #1: ANDHERI EXTORTION', sub: "Suspect 'Chhotu' + Pulsar MH-02" },
              { id: 2, title: 'CASE #2: JOGESHWARI THREAT', sub: 'Deepak + Swift MH-04 + Ramesh' },
              { id: 3, title: 'CASE #3: CRIME BRANCH HAWALA', sub: 'Ramesh Gupta hawala conduit Delhi' },
              { id: 4, title: 'CASE #4: VERSOVA ASSAULT', sub: 'Deepak + Bunty physical coercion' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => loadMockSample(c.id)}
                disabled={isProcessing}
                className="text-left p-2 transition"
                style={{
                  background: 'rgba(0, 240, 255, 0.03)',
                  border: '1px solid rgba(0, 240, 255, 0.1)',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                }}
              >
                <span className="font-bold text-white block text-[11px] uppercase tracking-wider">{c.title}</span>
                <span className="text-[9px] block" style={{ color: 'var(--text-3)' }}>{c.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-2 text-xs flex items-center gap-2" style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', color: 'var(--red)' }}>
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'rgba(0, 240, 255, 0.08)' }}>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isProcessing}
          >
            ABORT
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className="btn btn-primary"
          >
            {isProcessing ? 'PROCESSING OCR PIPELINE...' : 'EXECUTE EXTRACTION'}
          </button>
        </div>
      </div>
    </div>
  );
}
