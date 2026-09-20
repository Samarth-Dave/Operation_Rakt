import React, { useState, useEffect } from 'react';
import { fetchEvidenceChain, logEvidenceAction, connectWallet } from '../utils/ethereum';
import { Link, CheckCircle, AlertTriangle, Plus, ShieldCheck } from 'lucide-react';

export default function ChainOfCustodyPanel({ evidenceId }) {
  const [chain, setChain] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [actionType, setActionType] = useState('VIEWED');
  const [officerId, setOfficerId] = useState('');
  const [details, setDetails] = useState('');

  const loadChain = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) setIsWalletConnected(true);
      }
      
      const data = await fetchEvidenceChain(String(evidenceId));
      setChain(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch blockchain ledger. Ensure Ganache is running and contract address is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (evidenceId) {
      loadChain();
    }
  }, [evidenceId]);

  const handleConnect = async () => {
    try {
      await connectWallet();
      setIsWalletConnected(true);
      loadChain(); // Reload to try fetching again if it failed before
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogAction = async (e) => {
    e.preventDefault();
    if (!officerId) return alert("Officer ID is required");
    
    setIsSubmitting(true);
    setError(null);
    try {
      const receipt = await logEvidenceAction(String(evidenceId), actionType, officerId, details);
      console.log("Transaction mined:", receipt.hash);
      setShowLogForm(false);
      setOfficerId('');
      setDetails('');
      await loadChain(); // Refresh the chain
    } catch (err) {
      console.error(err);
      if (err.code === 'ACTION_REJECTED' || (err.message && err.message.includes('user rejected'))) {
        setError("Transaction cancelled by user.");
      } else {
        setError(err.shortMessage || err.message || "Transaction failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="coc-panel" style={{ marginTop: '10px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(0, 240, 255, 0.1)', padding: '10px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Link size={12} color="var(--cyan)" /> 
          <span style={{ color: 'var(--cyan)' }}>ON-CHAIN CUSTODY LEDGER</span>
        </div>
        {!isWalletConnected ? (
          <button onClick={handleConnect} style={{ fontSize: '8px', padding: '2px 6px', background: 'var(--cyan)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            CONNECT WALLET
          </button>
        ) : (
          <span style={{ fontSize: '9px', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <CheckCircle size={10} /> CONNECTED
          </span>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--red)', color: '#fca5a5', padding: '6px', fontSize: '9px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={10} /> {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ fontSize: '10px', color: 'var(--text-2)', padding: '10px', textAlign: 'center' }}>SCANNING BLOCKCHAIN...</div>
      ) : (
        <div className="ledger-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
          {chain.length === 0 ? (
            <div style={{ fontSize: '10px', color: 'var(--text-2)', fontStyle: 'italic' }}>No ledger entries found for this evidence.</div>
          ) : (
            chain.map((entry, idx) => (
              <div key={idx} style={{ padding: '6px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#fff', background: 'rgba(0,240,255,0.1)', padding: '1px 4px' }}>{entry.actionType}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-2)' }}>
                    {new Date(entry.timestamp * 1000).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1' }}>
                  Officer: <span style={{ color: 'var(--cyan)' }}>{entry.officerId}</span>
                </div>
                {entry.details && (
                  <div style={{ fontSize: '9px', color: 'var(--text-2)', marginTop: '3px' }}>
                    Data: {entry.details}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px', fontSize: '8px', color: 'var(--emerald)' }}>
                  <ShieldCheck size={8} /> VERIFIED ON-CHAIN
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isWalletConnected && !showLogForm && (
        <button 
          onClick={() => setShowLogForm(true)}
          style={{ width: '100%', marginTop: '10px', padding: '6px', background: 'transparent', border: '1px dashed rgba(0, 240, 255, 0.3)', color: 'var(--cyan)', fontSize: '9px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={10} /> RECORD NEW ACTION
        </button>
      )}

      {showLogForm && (
        <form onSubmit={handleLogAction} style={{ marginTop: '10px', background: 'rgba(0,0,0,0.3)', padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <select 
              value={actionType} 
              onChange={e => setActionType(e.target.value)}
              style={{ background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', padding: '4px' }}
            >
              <option value="VIEWED">VIEWED</option>
              <option value="ANALYZED">ANALYZED</option>
              <option value="TRANSFERRED">TRANSFERRED</option>
            </select>
            <input 
              type="text" 
              placeholder="Officer ID / Badge No." 
              value={officerId} 
              onChange={e => setOfficerId(e.target.value)}
              style={{ background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', padding: '4px' }}
            />
            <input 
              type="text" 
              placeholder="Details / IPFS Hash (Optional)" 
              value={details} 
              onChange={e => setDetails(e.target.value)}
              style={{ background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '10px', padding: '4px' }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button type="submit" disabled={isSubmitting} style={{ flex: 1, background: 'var(--cyan)', color: '#000', border: 'none', padding: '4px', fontSize: '10px', fontWeight: 'bold', cursor: isSubmitting ? 'wait' : 'pointer' }}>
                {isSubmitting ? 'SIGNING...' : 'SIGN & COMMIT'}
              </button>
              <button type="button" onClick={() => setShowLogForm(false)} style={{ flex: 1, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px', fontSize: '10px', cursor: 'pointer' }}>
                CANCEL
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
