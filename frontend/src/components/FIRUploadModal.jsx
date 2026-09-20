import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, Sparkles, X } from 'lucide-react';
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
      setError(err.response?.data?.detail || err.message || 'Case extraction failed.');
    } finally { setIsProcessing(false); setProcessingCase(null); }
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
            className="btn btn-primary btn-sm"
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
