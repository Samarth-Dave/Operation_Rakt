import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, X, ShieldAlert, Activity, Globe, Scissors } from 'lucide-react';

const DEMO_STEPS = [
  {
    phase: 'PHASE 01 // TARGET OVERVIEW',
    title: 'INITIATING OPERATION RAKT TACTICAL BRIEFING',
    desc: 'Analyzing an active extortion and hawala syndicate operating across Mumbai western suburbs and inter-state corridors.',
    duration: 6,
    icon: <ShieldAlert size={14} color="var(--cyan)" />,
    action: 'overview',
  },
  {
    phase: 'PHASE 02 // POLE INGESTION',
    title: 'MULTI-JURISDICTIONAL FIR INGESTION',
    desc: 'Ingesting FIRs from Andheri West, Jogeshwari, Goregaon Crime Branch, and Versova. POLE entities & BNS 2023 tags extracted.',
    duration: 6,
    icon: <Activity size={14} color="var(--amber)" />,
    action: 'ingest',
  },
  {
    phase: 'PHASE 03 // GRAPH DATA SCIENCE',
    title: 'COMPUTING BETWEENNESS CENTRALITY',
    desc: 'Executing Neo4j GDS betweenness centrality algorithms to quantify structural bottleneck vulnerabilities.',
    duration: 6,
    icon: <Activity size={14} color="var(--cyan)" />,
    action: 'centrality',
  },
  {
    phase: 'PHASE 04 // TARGET IDENTIFICATION',
    title: 'TOP BRIDGE NODE: RAMESH GUPTA',
    desc: 'Target node isolated. Ramesh Gupta acts as the primary hawala conduit linking street extortion to Delhi syndicates.',
    duration: 7,
    icon: <ShieldAlert size={14} color="var(--red)" />,
    action: 'focus_target',
  },
  {
    phase: 'PHASE 05 // SEVERANCE SIMULATION',
    title: 'SIMULATING CONDUIT INTERCEPTION & ARREST',
    desc: 'Severing links connected to the top bridge node to calculate real-time network fragmentation and modularity breakdown.',
    duration: 7,
    icon: <Scissors size={14} color="var(--red)" />,
    action: 'simulate',
  },
  {
    phase: 'PHASE 06 // GEOSPATIAL INTELLIGENCE',
    title: 'MAPPING INTERSTATE HAWALA CORRIDOR',
    desc: 'Switching to 2D tactical geospatial view. Tracking collection conduits from Mumbai to Delhi Syndicate HQ.',
    duration: 8,
    icon: <Globe size={14} color="var(--cyan)" />,
    action: 'geo',
  },
  {
    phase: 'PHASE 07 // MISSION DEBRIEF',
    title: 'TACTICAL INTELLIGENCE DOSSIER READY',
    desc: 'Operational target mapped, statutory BNS tags established, and interstate flow vector intercepted.',
    duration: 6,
    icon: <ShieldAlert size={14} color="var(--emerald)" />,
    action: 'conclude',
  },
];

export default function DemoReel({
  isOpen,
  onClose,
  onAnalyzeCentrality,
  onSelectNodeByName,
  onToggleSimulation,
  onSetActiveView,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const step = DEMO_STEPS[currentStep];

  // Execute step action on step change
  useEffect(() => {
    if (!isOpen) return;

    const act = DEMO_STEPS[currentStep].action;
    if (act === 'centrality' && onAnalyzeCentrality) {
      onAnalyzeCentrality();
    } else if (act === 'focus_target' && onSelectNodeByName) {
      onSelectNodeByName('Ramesh Gupta');
    } else if (act === 'simulate' && onToggleSimulation) {
      onToggleSimulation(true);
    } else if (act === 'geo' && onSetActiveView) {
      onSetActiveView('geo');
    } else if (act === 'conclude' && onSetActiveView) {
      onSetActiveView('network');
    }
  }, [currentStep, isOpen, onAnalyzeCentrality, onSelectNodeByName, onToggleSimulation, onSetActiveView]);

  // Step countdown timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const durationMs = step.duration * 1000;
    const intervalMs = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalMs;
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(pct);

      if (elapsed >= durationMs) {
        if (currentStep < DEMO_STEPS.length - 1) {
          setCurrentStep((prev) => prev + 1);
          setProgress(0);
        } else {
          setIsPlaying(false);
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentStep, isPlaying, isOpen, step.duration]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl font-mono animate-fadeIn pointer-events-auto"
      style={{
        background: 'rgba(2, 4, 8, 0.94)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        boxShadow: '0 0 35px rgba(0, 0, 0, 0.9)',
        padding: '12px 16px',
      }}
    >
      {/* Corner bracket accents */}
      <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)' }} />
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)' }} />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b pb-2 mb-2" style={{ borderColor: 'rgba(0, 240, 255, 0.12)' }}>
        <div className="flex items-center gap-2">
          {step.icon}
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cyan)' }}>
            {step.phase}
          </span>
          <span className="text-[9px] px-1.5 py-0.2" style={{ background: 'rgba(0, 240, 255, 0.08)', color: 'var(--text-3)' }}>
            STEP {currentStep + 1} OF {DEMO_STEPS.length}
          </span>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:text-white transition"
            style={{ background: 'transparent', border: 'none', color: 'var(--cyan)', cursor: 'pointer' }}
            title={isPlaying ? 'Pause' : 'Resume'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 hover:text-white transition"
            style={{ background: 'transparent', border: 'none', color: 'var(--cyan)', cursor: 'pointer' }}
            title="Next Step"
          >
            <SkipForward size={13} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:text-white transition"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
            title="Exit Demo"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex flex-col gap-1">
        <div className="text-xs font-bold uppercase text-white tracking-wide">
          {step.title}
        </div>
        <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
          {step.desc}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full h-1 mt-3 relative overflow-hidden"
        style={{ background: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--cyan-dim), var(--cyan))',
            boxShadow: '0 0 8px var(--cyan)',
          }}
        />
      </div>
    </div>
  );
}
