import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, Sparkles, X, CheckCircle2 } from 'lucide-react';
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

  // Quick test demo FIR loader
  const loadMockSample = async (sampleNum) => {
    setIsProcessing(true);
    setError(null);
    try {
      // Create a mock File object matching one of the sample texts
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ingest First Information Report (FIR)</h3>
              <p className="text-xs text-slate-400">OCR parsing, POLE entity extraction, and BNS 2023 statutory tagging</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Drop Zone */}
        <div className="border-2 border-dashed border-sky-500/30 hover:border-sky-500/60 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-[#090e1c]/60 transition group cursor-pointer relative">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="p-3 rounded-full bg-sky-500/10 text-sky-400 group-hover:scale-110 transition duration-200">
            <FileText className="w-8 h-8" />
          </div>
          <span className="text-sm font-semibold text-white mt-3">
            {file ? file.name : 'Drag & drop FIR document, or browse'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Supports scanned images (PNG, JPG), digital PDFs, or raw text reports
          </span>
        </div>

        {/* Quick Demo Pre-load buttons */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Load Realistic Demo Cases
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => loadMockSample(1)}
              disabled={isProcessing}
              className="text-left p-2 rounded bg-black/30 hover:bg-white/10 border border-white/5 text-xs transition"
            >
              <span className="font-semibold text-white block">Case #1: Andheri Extortion</span>
              <span className="text-[11px] text-slate-400">Suspect 'Chhotu' + Pulsar MH-02</span>
            </button>
            <button
              onClick={() => loadMockSample(2)}
              disabled={isProcessing}
              className="text-left p-2 rounded bg-black/30 hover:bg-white/10 border border-white/5 text-xs transition"
            >
              <span className="font-semibold text-white block">Case #2: Jogeshwari Threat</span>
              <span className="text-[11px] text-slate-400">Deepak + Swift MH-04 + Ramesh link</span>
            </button>
            <button
              onClick={() => loadMockSample(3)}
              disabled={isProcessing}
              className="text-left p-2 rounded bg-black/30 hover:bg-white/10 border border-white/5 text-xs transition"
            >
              <span className="font-semibold text-white block">Case #3: Crime Branch Hawala</span>
              <span className="text-[11px] text-slate-400">Ramesh Gupta hawala conduit to Delhi</span>
            </button>
            <button
              onClick={() => loadMockSample(4)}
              disabled={isProcessing}
              className="text-left p-2 rounded bg-black/30 hover:bg-white/10 border border-white/5 text-xs transition"
            >
              <span className="font-semibold text-white block">Case #4: Versova Assault</span>
              <span className="text-[11px] text-slate-400">Deepak + Bunty physical coercion</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary text-xs" disabled={isProcessing}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className="btn-primary text-xs font-semibold py-2 px-4"
          >
            {isProcessing ? 'Processing OCR & Extracting...' : 'Extract & Inspect POLE'}
          </button>
        </div>
      </div>
    </div>
  );
}
