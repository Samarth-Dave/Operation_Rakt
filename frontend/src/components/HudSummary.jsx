import React, { useMemo } from 'react';

/**
 * HUD Summary Strip — auto-generated intel readout from graph data.
 * No LLM call; computed client-side from node/link counts and types.
 */
export default function HudSummary({ graphData, topBridgeNode, simulationResult }) {
  const summary = useMemo(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      return 'AWAITING INTELLIGENCE DATA // INGEST FIR TO BEGIN ANALYSIS';
    }

    const nodes = graphData.nodes;
    const links = graphData.links;

    // Count by type
    const typeCounts = {};
    nodes.forEach(n => {
      const t = n.label || 'Unknown';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    const persons = typeCounts['Person'] || 0;
    const locations = typeCounts['Location'] || 0;
    const firs = typeCounts['FIR'] || 0;

    const parts = [];
    parts.push(`${nodes.length} ENTITIES`);
    parts.push(`${links.length} LINKS`);
    if (persons > 0) parts.push(`${persons} PERSONS OF INTEREST`);
    if (locations > 0) parts.push(`${locations} LOCATIONS`);
    if (firs > 0) parts.push(`${firs} FIRS CROSS-LINKED`);

    if (topBridgeNode) {
      const name = (topBridgeNode.name || topBridgeNode.display_name || 'UNKNOWN').toUpperCase();
      parts.push(`BRIDGE NODE: ${name}`);
    }

    if (simulationResult && simulationResult.shattered) {
      parts.push(`NETWORK SHATTERED: ${simulationResult.components_before}→${simulationResult.components_after} COMPONENTS`);
    }

    return parts.join(' • ');
  }, [graphData, topBridgeNode, simulationResult]);

  return (
    <div className="hud-summary-strip">
      <span className="hud-highlight">INTEL SUMMARY</span>
      <span className="hud-divider">//</span>
      {summary}
    </div>
  );
}
