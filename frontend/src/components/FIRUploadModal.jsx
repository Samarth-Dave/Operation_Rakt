import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, Sparkles, X, Zap, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

// Full realistic FIR texts (mirrors backend/app/data/mock_firs/)
const DEMO_CASES = [
  {
    id: 1,
    title: 'Case #1 — Andheri Extortion',
    sub: 'Suspect "Chhotu" · Pulsar MH-02-AB-1234 · BNS §308',
    filename: 'fir_001_extortion.txt',
    color: '#ef4444',
    text: `FIR No: 2024/MUM/EXT/0187
Police Station: Andheri West, Mumbai
Date: 15-06-2024

Complainant: Rajesh Kumar Agarwal, age 45, businessman, owner of Agarwal Textile Mills,
residing at 302 Sagar Apartments, Lokhandwala Complex, Andheri West, Mumbai - 400053.

Statement of Complainant:

Main Rajesh Kumar Agarwal apni dukaan Agarwal Textile Mills, Shop No. 12, Link Road,
Andheri West mein 14 June 2024 ko shaam 7:30 baje kaam kar raha tha. Tab meri dukaan mein
ek aadmi aaya jiska naam baad mein pata chala "Chhotu" hai. Uske saath ek aur aadmi tha
jise woh "Bhai" bula raha tha.

Chhotu ne mujhse kaha - "Agarwal sahab, aapki dukaan bahut acchi chal rahi hai. Humein
har mahine 2 lakh rupaye chahiye, nahi toh aapki dukaan ka kya hoga woh aap samajh lo."
Usne ek kali Bajaj Pulsar motorcycle se aaya tha jiska number MH-02-AB-1234 tha.

Jab maine mana kiya toh dusre aadmi ne apni jacket utha ke ek desi katta (pistol) dikhaya
aur kaha - "Chhotu ke bhai Vikram ka naam suna hai? Delhi se aate hain woh. Unhe mana
karne ki galti mat karna."

Unhone kaha ki paisa Lokhandwala Junction ke paas ek chai ki dukaan pe dena hai jo
"Shankar Tea Stall" ke naam se hai. Yeh dukaan Shankar Yadav ki hai jo inke liye paisa
collect karta hai.

Main bahut dara hua tha. Unhone jaate waqt kaha - "3 din mein paisa tayaar rakh, warna
tera textile mill jala denge."

Meri dukaan mein CCTV hai lekin unhone cap aur mask pehen rakha tha. Sirf Chhotu ka chehra
thoda dikhta hai - woh lagbhag 5'8" height ka hai, dark complexion, left haath pe tattoo
hai (snake design).

Main yeh FIR darj kara raha hoon aur police se suraksha ki maang karta hoon.

Sd/-
Rajesh Kumar Agarwal
15-06-2024`
  },
  {
    id: 2,
    title: 'Case #2 — Jogeshwari Threat',
    sub: 'Deepak · Swift MH-04-CD-5678 · "Ramesh" drop',
    filename: 'fir_002_extortion_linked.txt',
    color: '#f59e0b',
    text: `FIR No: 2024/MUM/EXT/0192
Police Station: Jogeshwari East, Mumbai
Date: 22-06-2024

Complainant: Farhan Shaikh, age 38, owner of Shaikh Electronics, Jogeshwari Market,
Mumbai - 400060.

Statement of Complainant:

Aaj subah 10 baje meri dukaan Shaikh Electronics, Shop No 45, Main Road Jogeshwari East
mein do aadmi aaye. Pehla aadmi - jiska naam usne Deepak bataya - bahut aggressive tha.
Dusra aadmi bahut chup tha lekin uska haath mein ek black bag tha.

Deepak ne kaha ki woh "Vikram Bhai" ke aadmi hain aur yeh area unke "protection" mein
hai. Har mahine 1.5 lakh rupaye dene honge warna dukaan band karwa denge. Usne ek
photograph dikhaya jismein mera beta school ja raha tha - "Beta accha school jaata hai,
uski safety ka khayal rakhna."

Deepak ek white Maruti Suzuki Swift mein aaya tha, number MH-04-CD-5678. Woh lagbhag
30-32 saal ka hai, medium build, beard hai.

Unhone bola paisa har mahine ki 1 tareekh ko "Royal Hotel, Goregaon West" mein dena hai.
Wahan ek aadmi milega jiska naam "Ramesh" hai - woh paisa lega.

Main pehle bhi ek baar Chhotu naam ke aadmi se mila tha jo Andheri mein bhi vasuli karta
hai. Lagta hai yeh sab ek hi gang ke log hain.

Yeh FIR main apni aur apne parivaar ki suraksha ke liye darj kara raha hoon.

Sd/-
Farhan Shaikh
22-06-2024`
  },
  {
    id: 3,
    title: 'Case #3 — Crime Branch Hawala',
    sub: 'Ramesh Gupta hawala conduit · Delhi kingpin link',
    filename: 'fir_003_hawala.txt',
    color: '#a855f7',
    text: `FIR No: 2024/MUM/FIN/0201
Police Station: Goregaon West, Mumbai
Date: 05-07-2024

Complainant: Intelligence Bureau tip-off received via Mumbai Crime Branch.
Filed by: Sub-Inspector Priya Deshmukh, Badge No. 4521

Subject: Suspected Hawala Operations and Links to Extortion Syndicate

Investigation Report:

During surveillance of ongoing extortion cases (FIR/2024/MUM/EXT/0187 and
FIR/2024/MUM/EXT/0192), financial intelligence unit ne ek suspicious money trail
identify kiya hai.

Royal Hotel, Goregaon West ke manager Ramesh Gupta (age approximately 50, residing at
Flat 101, Shanti Nagar, Goregaon East) ek hawala network operate karta hai. Yeh hotel
legitimate business ke naam pe paisa collect aur distribute karta hai.

Bank records aur informant tip ke mutabik:
- Ramesh Gupta ke bank account (HDFC Bank, A/C ending 4589) mein har mahine 15-20 lakh
  cash deposit hota hai, jo uski hotel income se kaafi zyada hai.
- Yeh paisa phir multiple accounts mein transfer hota hai, jinmein se ek account
  Delhi mein Vikram Singh Tomar ke naam pe hai.
- Vikram Singh Tomar (age 42, originally from Ghaziabad, UP) ka criminal record hai
  Delhi Police ke records mein - 3 extortion cases aur 1 arms act case.
- Vikram ka ek close associate Suresh Pandey hai jo Thane mein rehta hai (address:
  Room 12, Patel Chawl, Wagle Estate, Thane West) aur woh logistics handle karta hai -
  gaadi arrange karna, naye collectors bhejná etc.

Chhotu (real name suspected: Raju Gujjar, age approximately 28, from Meerut, UP) Vikram
ka ground-level collection agent hai. CCTV footage from Andheri case mein dikha Chhotu
ki Bajaj Pulsar (MH-02-AB-1234) Shankar Tea Stall pe bhi dikhi hai, confirming the
money drop connection.

Shankar Yadav (age 55, Shankar Tea Stall owner, Lokhandwala Junction) suspected front
man hai jo small collections handle karta hai before routing to Ramesh.

Money Flow: Victim → Shankar Yadav (collection) → Ramesh Gupta (hawala) → Vikram Singh
Tomar (kingpin in Delhi). Estimated monthly extortion revenue: 50-80 lakh across
western Mumbai suburbs.

Vehicle registry check:
- Bajaj Pulsar MH-02-AB-1234 - registered to one "Raju" in Meerut (likely Chhotu)
- Maruti Swift MH-04-CD-5678 - registered to Deepak Jadhav, Jogeshwari
- Toyota Fortuner MH-01-EF-9012 - registered to Ramesh Gupta
- Honda City DL-03-GH-3456 - registered to Vikram Singh Tomar, Delhi

Recommendation: All suspects should be placed under surveillance. Ramesh Gupta is the
critical financial node connecting street-level extortion to the Delhi syndicate leadership.

Sd/-
SI Priya Deshmukh
05-07-2024`
  },
  {
    id: 4,
    title: 'Case #4 — Versova Assault',
    sub: 'Deepak + Bunty physical coercion · BNS §115',
    filename: 'fir_004_assault.txt',
    color: '#10b981',
    text: `FIR No: 2024/MUM/ASS/0215
Police Station: Versova, Mumbai
Date: 18-07-2024

Complainant: Amit Verma, age 29, shopkeeper, Versova Market, Mumbai.

Statement of Complainant:

Main Amit Verma, dukaan "Verma General Store" ka malik hoon, Versova Market mein.
18 July 2024 ko raat 9 baje ke kareeb, jab main dukaan band kar raha tha, tab 3 log
aaye. Inmein se ek ko main pehchanta hoon - Deepak, jo pehle bhi mere paas aaya tha
do mahine pehle paisa maangne.

Deepak ke saath ek nayi shakl thi - ek ladka jise Deepak ne "Bunty" bulaya. Bunty
lagbhag 22-24 saal ka hai, patla, lamba, aur right arm pe ek bada sa scar hai.

Pichli baar maine mana kar diya tha tab Deepak ne kaha tha chod deta hoon. Lekin aaj
woh bahut gusse mein tha. Usne kaha - "Teri himmat badh gayi hai. Suresh bhai ne bola
hai tujhe sabak sikhana padega."

Bunty ne mujhe peeche se pakda aur Deepak ne mujhe 4-5 mukke maare. Mera naak se
khoon aaya aur left eye ke neeche sujan aa gayi. Phir unhone meri dukaan ka glass
counter toda aur lagbhag 50,000 rupaye cash jo counter mein tha woh le gaye.

Jaate waqt Deepak ne kaha - "Ab se har mahine 75,000 dena padega. Ramesh ke paas
jaake de dena Royal Hotel mein. Nahi toh agla baar Chhotu aayega, aur woh sirf
dhamki nahi deta."

Woh teeno ek auto-rickshaw mein aaye the. Mere padosi Vijay Sharma ne dekha hai unhein
jaate hue aur woh gawah ban sakta hai.

Main hospital ja raha hoon treatment ke liye. Mere injuries ki medical report baad mein
attach karunga.

Sd/-
Amit Verma
18-07-2024`
  },
];

export default function FIRUploadModal({ isOpen, onClose, onExtractionComplete }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCase, setProcessingCase] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]); setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setError(null); }
  };

  const uploadFile = async (fileObj) => {
    const formData = new FormData();
    formData.append('file', fileObj);
    const resp = await axios.post(`${API_BASE}/api/ingest/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp;
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a file first.'); return; }
    setIsProcessing(true); setProcessingCase(null); setError(null);
    try {
      const resp = await uploadFile(file);
      if (resp.data.success) onExtractionComplete(resp.data.extraction);
      else setError('Extraction returned unsuccessful.');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload and extraction failed.');
    } finally { setIsProcessing(false); }
  };

  const loadDemoCase = async (caseObj) => {
    setIsProcessing(true); setProcessingCase(caseObj.id); setError(null);
    try {
      const blob = new Blob([caseObj.text], { type: 'text/plain' });
      const mockFile = new File([blob], caseObj.filename, { type: 'text/plain' });
      const resp = await uploadFile(mockFile);
      if (resp.data.success) onExtractionComplete(resp.data.extraction);
      else setError('Extraction failed for this case.');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Case extraction failed.');
    } finally { setIsProcessing(false); setProcessingCase(null); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !isProcessing && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={17} color="var(--sky)" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Ingest First Information Report</h3>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                OCR → POLE Extraction → BNS 2023 Tagging → Neo4j Graph
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={isProcessing} aria-label="Close modal">
            <X size={14} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Drop Zone */}
          <div
            className={`dropzone ${dragOver ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{ position: 'relative' }}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={handleFileChange}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            />
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} color="var(--sky)" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: file ? 'var(--sky)' : '#fff', marginTop: 6 }}>
              {file ? `✓ ${file.name}` : 'Drag & drop FIR document, or click to browse'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Supports scanned images (PNG, JPG), digital PDFs, or plain text
            </span>
          </div>

          {/* Demo Cases */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Sparkles size={13} color="var(--amber)" />
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sky)' }}>
                Live Demo — Upload & Build Graph Case by Case
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO_CASES.map((c) => (
                <button
                  key={c.id}
                  className="case-chip"
                  onClick={() => loadDemoCase(c)}
                  disabled={isProcessing}
                  id={`btn-demo-case-${c.id}`}
                  style={{ borderLeft: `3px solid ${c.color}`, opacity: isProcessing && processingCase !== c.id ? 0.5 : 1 }}
                >
                  {processingCase === c.id ? (
                    <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: c.color, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
                  ) : (
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: c.color, opacity: 0.8, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: processingCase === c.id ? c.color : '#fff' }}>
                      {processingCase === c.id ? 'Processing with Gemini…' : c.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{c.sub}</div>
                  </div>
                  <ChevronRight size={13} color="var(--text-3)" />
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 10, color: 'var(--text-3)' }}>
            {['OCR / Text Parse', 'Gemini POLE Extraction', 'BNS 2023 Tagging', 'Human Review', 'Neo4j Upsert'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>{step}</span>
                {i < arr.length - 1 && <Zap size={10} color="rgba(56,189,248,0.4)" />}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#fca5a5', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isProcessing}>Cancel</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleUpload}
            disabled={!file || isProcessing}
            id="btn-extract-pole"
          >
            {isProcessing && !processingCase ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="animate-spin" style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                Processing OCR & Extracting…
              </span>
            ) : 'Extract & Review POLE Entities'}
          </button>
        </div>
      </div>
    </div>
  );
}
