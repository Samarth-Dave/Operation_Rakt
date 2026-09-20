import React, { useState, useMemo } from 'react';
import { Search, User, MapPin, Box, Calendar, FileText, Bookmark, Users, ChevronDown, ChevronRight } from 'lucide-react';

const TYPE_COLORS = {
  Person:     '#ef4444',
  Object:     '#00f0ff',
  Location:   '#10b981',
  Event:      '#f59e0b',
  BNSSection: '#a855f7',
  FIR:        '#eab308',
};

export default function RosterPanel({ graphData, selectedNode, onNodeClick }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const nodes = graphData?.nodes || [];

  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchesType = filterType === 'ALL' || n.label === filterType || (filterType === 'BNS' && n.label === 'BNSSection');
      const name = (n.display_name || n.name || n.number || n.label || '').toLowerCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [nodes, filterType, searchQuery]);

  return (
    <div
      className="glass-sm"
      style={{
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Header with expand/collapse */}
      <div
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={11} style={{ color: 'var(--cyan)' }} />
          <span>ENTITY ROSTER ({nodes.length})</span>
        </div>
        {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </div>

      {isExpanded && (
        <>
          {/* Search box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              padding: '4px 8px',
            }}
          >
            <Search size={11} style={{ color: 'var(--cyan-dim)', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ENTITY..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                width: '100%',
                textTransform: 'uppercase',
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {['ALL', 'Person', 'Location', 'Object', 'Event', 'BNS'].map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                style={{
                  padding: '2px 5px',
                  fontSize: 8,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  border: `1px solid ${filterType === ft ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                  background: filterType === ft ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                  color: filterType === ft ? 'var(--cyan)' : 'var(--text-3)',
                  cursor: 'pointer',
                }}
              >
                {ft === 'Person' ? 'PERS' : ft === 'Location' ? 'LOC' : ft === 'Object' ? 'OBJ' : ft === 'Event' ? 'EVT' : ft}
              </button>
            ))}
          </div>

          {/* Node List */}
          <div
            style={{
              maxHeight: 180,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              scrollbarWidth: 'thin',
            }}
          >
            {filteredNodes.length === 0 ? (
              <div style={{ fontSize: 9, color: 'var(--text-3)', padding: 6, textAlign: 'center' }}>
                NO ENTITIES FOUND
              </div>
            ) : (
              filteredNodes.map((n) => {
                const isSelected = selectedNode && selectedNode.id === n.id;
                const dotColor = TYPE_COLORS[n.label] || '#7a8ba0';
                const name = n.display_name || n.name || n.number || n.label;

                return (
                  <div
                    key={n.id}
                    onClick={() => onNodeClick && onNodeClick(n)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 6px',
                      background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                      border: `1px solid ${isSelected ? 'var(--cyan)' : 'rgba(0, 240, 255, 0.05)'}`,
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          background: dotColor,
                          boxShadow: `0 0 6px ${dotColor}`,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: isSelected ? '#fff' : 'var(--text-1)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textTransform: 'uppercase',
                        }}
                      >
                        {name}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: 8,
                        color: 'var(--text-3)',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                        marginLeft: 4,
                      }}
                    >
                      {n.role ? n.role.substring(0, 4) : (n.label || '').substring(0, 4)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
