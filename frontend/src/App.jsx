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

  // Fetch full graph from Neo4j
  const fetchGraph = useCallback(async () => {
    try {
      const resp = await axios.get(`${API_BASE}/api/graph`);
      if (resp.data.success) {
        setGraphData(resp.data.graph);
        setOriginalGraphData(resp.data.graph);
        setStats({
          totalNodes: resp.data.total_nodes,
          totalLinks: resp.data.total_links,
        });
      }
    } catch (err) {
      console.error('Failed to load graph:', err);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Node click handler
  const handleNodeClick = useCallback(async (node) => {
    if (isSimulationActive) {
      // Trigger arrest simulation on clicked node
      executeArrestSimulation(node.id);
    } else {
      // Fetch full details of node
      try {
        const resp = await axios.get(`${API_BASE}/api/graph/node/${node.id}`);
        if (resp.data.success) {
          setSelectedNode(resp.data.node);
        } else {
          setSelectedNode(node);
        }
      } catch (err) {
        setSelectedNode(node);
      }
    }
  }, [isSimulationActive]);

  // Execute arrest simulation
  const executeArrestSimulation = async (nodeId) => {
    try {
      const resp = await axios.post(`${API_BASE}/api/simulate/arrest/${nodeId}`);
      if (resp.data.success) {
        setSimulationResult(resp.data);
        setGraphData(resp.data.graph);
      }
    } catch (err) {
      console.error('Arrest simulation failed:', err);
    }
  };

  // Reset simulation back to original graph
  const handleResetSimulation = () => {
    setGraphData(originalGraphData);
    setSimulationResult(null);
  };

  // Centrality Analysis
  const handleAnalyzeCentrality = async () => {
    setIsAnalyzing(true);
    try {
      const resp = await axios.get(`${API_BASE}/api/graph/centrality`);
      if (resp.data.success) {
        setCentralityScores(resp.data.scores || {});
        if (resp.data.top_bridge) {
          setTopBridgeNode(resp.data.top_bridge);
          // Find that node in the graph and select it
          const matched = graphData.nodes.find(n => n.id === resp.data.top_bridge.id);
          if (matched) {
            setSelectedNode(matched);
          }
        }
      }
    } catch (err) {
      console.error('Centrality analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Seed mock FIRs
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      // Use ingest/confirm or seed script logic via quick sequential mock loading
      const samples = [1, 2, 3, 4];
      for (const s of samples) {
        const texts = {
          1: `FIR No: 2024/MUM/EXT/0187\nPolice Station: Andheri West, Mumbai\nComplainant: Rajesh Kumar Agarwal, businessman.\nStatement: Main Rajesh Kumar Agarwal apni dukaan Agarwal Textile Mills mein kaam kar raha tha. Tab meri dukaan mein ek aadmi aaya jiska naam Chhotu hai. Uske saath ek aur aadmi tha jise woh Bhai bula raha tha. Chhotu ne 2 lakh rupaye maange nahi toh dukaan jalane ki dhamki di. Usne Bajaj Pulsar MH-02-AB-1234 ka use kiya. Dusre aadmi ne katta dikha ke kaha Vikram Delhi se aate hain, unhe mana mat karna. Paisa Shankar Tea Stall Lokhandwala pe dene ko bola.`,
          2: `FIR No: 2024/MUM/EXT/0192\nPolice Station: Jogeshwari East, Mumbai\nComplainant: Farhan Shaikh, Shaikh Electronics.\nStatement: Meri dukaan mein Deepak aaya, bola Vikram Bhai ke aadmi hain aur protection money 1.5 lakh chahiye. Usne Maruti Swift MH-04-CD-5678 use kiya. Bola paisa Ramesh ko Royal Hotel Goregaon West mein dena hai. Chhotu ka bhi naam liya.`,
          3: `FIR No: 2024/MUM/FIN/0201\nPolice Station: Goregaon West, Crime Branch.\nReport: Royal Hotel Goregaon manager Ramesh Gupta operates an extortion hawala conduit to Vikram Singh Tomar in Delhi. Shankar Yadav drops cash, Deepak Jadhav coordinates Swift drops, and Suresh Pandey arranges Thane logistics. Chhotu is the street collector.`,
          4: `FIR No: 2024/MUM/ASS/0215\nPolice Station: Versova, Mumbai\nComplainant: Amit Verma, Verma General Store.\nStatement: Deepak aur Bunty aaye, meri counter todi, 50,000 cash le gaye aur bola paisa Ramesh ko Royal Hotel mein do warna agla baar Chhotu aayega.`
        };
        const blob = new Blob([texts[s]], { type: 'text/plain' });
        const mockFile = new File([blob], `fir_${s}.txt`, { type: 'text/plain' });
        const formData = new FormData();
        formData.append('file', mockFile);
        const upResp = await axios.post(`${API_BASE}/api/ingest/upload`, formData);
        if (upResp.data.success) {
          await axios.post(`${API_BASE}/api/ingest/confirm`, upResp.data.extraction);
        }
      }
      await fetchGraph();
    } catch (err) {
      console.error('Seeding failed:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Reset database
  const handleResetDatabase = async () => {
    if (window.confirm('Wipe entire Neo4j database? This will remove all criminal network nodes.')) {
      try {
        await axios.post(`${API_BASE}/api/ingest/confirm`, {
          fir_number: 'WIPED',
          persons: [],
          objects: [],
          locations: [],
          events: [],
          relationships: [],
          bns_tags: [],
        });
        // We can re-fetch
        await fetchGraph();
        setSelectedNode(null);
        setTopBridgeNode(null);
        setSimulationResult(null);
      } catch (err) {
        console.error('Reset failed:', err);
      }
    }
  };

  // Extraction completed from upload modal -> open review screen
  const handleExtractionComplete = (extracted) => {
    setIsUploadOpen(false);
    setReviewData(extracted);
  };

  // Confirm review -> commit to Neo4j
  const handleConfirmReview = async (editedData) => {
    setIsCommitting(true);
    try {
      const resp = await axios.post(`${API_BASE}/api/ingest/confirm`, editedData);
      if (resp.data.success) {
        setReviewData(null);
        await fetchGraph();
      }
    } catch (err) {
      console.error('Failed to commit extraction:', err);
      alert('Commit failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070a12]">
      {/* 2D Force-Directed Graph Canvas */}
      <GraphCanvas
        graphData={graphData}
        selectedNode={selectedNode}
        onNodeClick={handleNodeClick}
        topBridgeNode={topBridgeNode}
        isSimulationActive={isSimulationActive}
        simulationResult={simulationResult}
      />

      {/* Control Panel (Top Left) */}
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

      {/* Node Detail Drawer (Top Right) */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-40">
          <NodeDetail
            node={selectedNode}
            centralityScore={centralityScores[selectedNode.id]}
            onClose={() => setSelectedNode(null)}
            onSimulateArrest={executeArrestSimulation}
          />
        </div>
      )}

      {/* Centrality & Arrest Intel Banner (Bottom Center) */}
      <IntelBanner
        topBridgeNode={topBridgeNode}
        simulationResult={simulationResult}
        onCloseBridge={() => setTopBridgeNode(null)}
        onCloseSimulation={() => setSimulationResult(null)}
      />

      {/* FIR Upload Modal */}
      <FIRUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onExtractionComplete={handleExtractionComplete}
      />

      {/* Human-in-the-Loop Review Screen */}
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
