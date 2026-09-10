import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import GraphCanvas from './components/GraphCanvas';
import NodeDetail from './components/NodeDetail';
import ControlPanel from './components/ControlPanel';
import FIRUploadModal from './components/FIRUploadModal';
import ReviewScreen from './components/ReviewScreen';
import IntelBanner from './components/IntelBanner';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [originalGraphData, setOriginalGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [centralityScores, setCentralityScores] = useState({});
  const [topBridgeNode, setTopBridgeNode] = useState(null);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState({ totalNodes: 0, totalLinks: 0 });

  const fetchGraph = useCallback(async () => {
    try {
      const resp = await axios.get(`${API_BASE}/api/graph`);
      if (resp.data.success) {
        setGraphData(resp.data.graph);
        setOriginalGraphData(resp.data.graph);
        setStats({ totalNodes: resp.data.total_nodes, totalLinks: resp.data.total_links });
      }
    } catch (err) {
      console.error('Failed to load graph:', err);
    }
  }, []);

  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  const handleNodeClick = useCallback(async (node) => {
    if (isSimulationActive) {
      executeArrestSimulation(node.id);
    } else {
      try {
        const resp = await axios.get(`${API_BASE}/api/graph/node/${node.id}`);
        setSelectedNode(resp.data.success ? resp.data.node : node);
      } catch { setSelectedNode(node); }
    }
  }, [isSimulationActive]);

  const executeArrestSimulation = async (nodeId) => {
    try {
      const resp = await axios.post(`${API_BASE}/api/simulate/arrest/${nodeId}`);
      if (resp.data.success) { setSimulationResult(resp.data); setGraphData(resp.data.graph); }
    } catch (err) { console.error('Arrest simulation failed:', err); }
  };

  const handleResetSimulation = () => { setGraphData(originalGraphData); setSimulationResult(null); };

  const handleAnalyzeCentrality = async () => {
    setIsAnalyzing(true);
    try {
      const resp = await axios.get(`${API_BASE}/api/graph/centrality`);
      if (resp.data.success) {
        setCentralityScores(resp.data.scores || {});
        if (resp.data.top_bridge) {
          setTopBridgeNode(resp.data.top_bridge);
          const matched = graphData.nodes.find(n => n.id === resp.data.top_bridge.id);
          if (matched) setSelectedNode(matched);
        }
      }
    } catch (err) { console.error('Centrality analysis failed:', err); }
    finally { setIsAnalyzing(false); }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const texts = {
        1: `FIR No: 2024/MUM/EXT/0187\nPolice Station: Andheri West, Mumbai\nComplainant: Rajesh Kumar Agarwal, businessman.\nStatement: Main Rajesh Kumar Agarwal apni dukaan Agarwal Textile Mills mein kaam kar raha tha. Tab meri dukaan mein ek aadmi aaya jiska naam Chhotu hai. Uske saath ek aur aadmi tha jise woh Bhai bula raha tha. Chhotu ne 2 lakh rupaye maange nahi toh dukaan jalane ki dhamki di. Usne Bajaj Pulsar MH-02-AB-1234 ka use kiya. Dusre aadmi ne katta dikha ke kaha Vikram Delhi se aate hain, unhe mana mat karna. Paisa Shankar Tea Stall Lokhandwala pe dene ko bola.`,
        2: `FIR No: 2024/MUM/EXT/0192\nPolice Station: Jogeshwari East, Mumbai\nComplainant: Farhan Shaikh, Shaikh Electronics.\nStatement: Meri dukaan mein Deepak aaya, bola Vikram Bhai ke aadmi hain aur protection money 1.5 lakh chahiye. Usne Maruti Swift MH-04-CD-5678 use kiya. Bola paisa Ramesh ko Royal Hotel Goregaon West mein dena hai. Chhotu ka bhi naam liya.`,
        3: `FIR No: 2024/MUM/FIN/0201\nPolice Station: Goregaon West, Crime Branch.\nReport: Royal Hotel Goregaon manager Ramesh Gupta operates an extortion hawala conduit to Vikram Singh Tomar in Delhi. Shankar Yadav drops cash, Deepak Jadhav coordinates Swift drops, and Suresh Pandey arranges Thane logistics. Chhotu is the street collector.`,
        4: `FIR No: 2024/MUM/ASS/0215\nPolice Station: Versova, Mumbai\nComplainant: Amit Verma, Verma General Store.\nStatement: Deepak aur Bunty aaye, meri counter todi, 50,000 cash le gaye aur bola paisa Ramesh ko Royal Hotel mein do warna agla baar Chhotu aayega.`
      };
      for (const s of [1, 2, 3, 4]) {
        const blob = new Blob([texts[s]], { type: 'text/plain' });
        const formData = new FormData();
        formData.append('file', new File([blob], `fir_${s}.txt`, { type: 'text/plain' }));
        const upResp = await axios.post(`${API_BASE}/api/ingest/upload`, formData);
        if (upResp.data.success) await axios.post(`${API_BASE}/api/ingest/confirm`, upResp.data.extraction);
      }
      await fetchGraph();
    } catch (err) { console.error('Seeding failed:', err); }
    finally { setIsSeeding(false); }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Wipe entire Neo4j database? This removes all criminal network nodes.')) return;
    try {
      await axios.post(`${API_BASE}/api/ingest/wipe`);
      await fetchGraph();
      setSelectedNode(null); setTopBridgeNode(null); setSimulationResult(null);
    } catch (err) { console.error('Reset failed:', err); }
  };

  const handleExtractionComplete = (extracted) => { setIsUploadOpen(false); setReviewData(extracted); };

  const handleConfirmReview = async (editedData) => {
    setIsCommitting(true);
    try {
      const resp = await axios.post(`${API_BASE}/api/ingest/confirm`, editedData);
      if (resp.data.success) { setReviewData(null); await fetchGraph(); }
    } catch (err) {
      console.error('Failed to commit:', err);
      alert('Commit failed: ' + (err.response?.data?.detail || err.message));
    } finally { setIsCommitting(false); }
  };

  return (
    <div className="app-shell">
      {/* LEFT SIDEBAR */}
      <aside className="app-left-panel">
        <ControlPanel
          onOpenUpload={() => setIsUploadOpen(true)}
          onSeedDatabase={handleSeedDatabase}
          onResetDatabase={handleResetDatabase}
          onAnalyzeCentrality={handleAnalyzeCentrality}
          isSimulationActive={isSimulationActive}
          onToggleSimulation={() => {
            setIsSimulationActive(!isSimulationActive);
            if (isSimulationActive) handleResetSimulation();
          }}
          onResetSimulation={handleResetSimulation}
          isAnalyzing={isAnalyzing}
          isSeeding={isSeeding}
          simulationResult={simulationResult}
          stats={stats}
        />
      </aside>

      {/* MAIN CANVAS */}
      <main className="app-canvas-area">
        <GraphCanvas
          graphData={graphData}
          selectedNode={selectedNode}
          onNodeClick={handleNodeClick}
          topBridgeNode={topBridgeNode}
          isSimulationActive={isSimulationActive}
          simulationResult={simulationResult}
        />

        {/* RIGHT DRAWER — overlays the canvas only */}
        {selectedNode && (
          <div className="app-right-drawer">
            <NodeDetail
              node={selectedNode}
              centralityScore={centralityScores[selectedNode.id]}
              onClose={() => setSelectedNode(null)}
              onSimulateArrest={executeArrestSimulation}
            />
          </div>
        )}

        {/* BOTTOM INTEL BANNER */}
        <div className="app-bottom-banner">
          <IntelBanner
            topBridgeNode={topBridgeNode}
            simulationResult={simulationResult}
            onCloseBridge={() => setTopBridgeNode(null)}
            onCloseSimulation={() => setSimulationResult(null)}
          />
        </div>
      </main>

      {/* MODALS — always on top */}
      <FIRUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onExtractionComplete={handleExtractionComplete}
      />

      {reviewData && (
        <ReviewScreen
          extractionData={reviewData}
          onConfirm={handleConfirmReview}
          onCancel={() => setReviewData(null)}
          isCommitting={isCommitting}
        />
      )}
    </div>
  );
}
