import React, { useState } from 'react';
import { Network, Sparkles } from 'lucide-react';

interface ThreatGraphViewProps {
  graph: {
    nodes: Array<{ id: string; label: string; type: string; risk?: string; details?: any }>;
    edges: Array<{ from: string; to: string; label: string; risk?: string }>;
    campaignCluster?: {
      id: string;
      name: string;
      confidence: number;
      sharedAttributes: string[];
    };
  };
}

export const ThreatGraphView: React.FC<ThreatGraphViewProps> = ({ graph }) => {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const { nodes, edges, campaignCluster } = graph;

  const getNodeColor = (type: string, risk?: string) => {
    if (type === 'CAMPAIGN') return '#ec4899';
    if (risk === 'MALICIOUS') return '#ef4444';
    if (risk === 'SUSPICIOUS') return '#f59e0b';
    if (type === 'EMAIL') return '#2563eb';
    if (type === 'IP') return '#0ea5e9';
    if (type === 'DOMAIN') return '#8b5cf6';
    if (type === 'URL') return '#f97316';
    return '#64748b';
  };

  const width = 800;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions: Record<string, { x: number; y: number }> = {};

  nodes.forEach((node, idx) => {
    if (node.type === 'EMAIL') {
      nodePositions[node.id] = { x: centerX, y: centerY };
    } else if (node.type === 'CAMPAIGN') {
      nodePositions[node.id] = { x: centerX, y: centerY - 120 };
    } else {
      const angle = (idx / Math.max(1, nodes.length - 1)) * 2 * Math.PI;
      const radius = 120;
      nodePositions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    }
  });

  return (
    <div className="panel" style={{ padding: '20px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Network style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
            Threat Correlation & Attribution Graph
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
            Entity relationships connecting sender identity, lookalike domains, IPs, and linked campaigns.
          </p>
        </div>

        {campaignCluster && (
          <div className="badge badge-critical" style={{ fontSize: '11px' }}>
            <Sparkles style={{ width: '12px', height: '12px' }} />
            {campaignCluster.name} ({campaignCluster.confidence}% Match)
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div style={{
        width: '100%',
        height: '360px',
        background: '#0d1321',
        borderRadius: '6px',
        border: '1px solid #1f2937',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <marker id="arrow-simple" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, idx) => {
            const start = nodePositions[edge.from];
            const end = nodePositions[edge.to];
            if (!start || !end) return null;

            const isMal = edge.risk === 'MALICIOUS';
            const stroke = isMal ? '#ef4444' : '#334155';

            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;

            return (
              <g key={idx}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={stroke}
                  strokeWidth={1.5}
                  strokeDasharray={isMal ? '3, 3' : 'none'}
                  markerEnd="url(#arrow-simple)"
                />
                <text
                  x={midX}
                  y={midY - 4}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const color = getNodeColor(node.type, node.risk);
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{ cursor: 'pointer' }}
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                <circle
                  r={isSelected ? 20 : 16}
                  fill="#111827"
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                >
                  {node.type.slice(0, 3)}
                </text>
                <text
                  y={26}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="10"
                  fontFamily="var(--font-sans)"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Box */}
        {selectedNode && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: '#111827',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '10px 14px',
            maxWidth: '280px',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="badge badge-info" style={{ fontSize: '10px' }}>{selectedNode.type}</span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>{selectedNode.label}</div>
            {selectedNode.details && (
              <pre style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)', margin: 0 }}>
                {JSON.stringify(selectedNode.details, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px', fontSize: '11px', color: '#64748b', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
          <span>Target Email</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></span>
          <span>Sender Domain</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ea5e9' }}></span>
          <span>Relay IP</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }}></span>
          <span>Campaign Cluster</span>
        </div>
      </div>
    </div>
  );
};
