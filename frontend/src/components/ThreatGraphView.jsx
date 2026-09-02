import React, { useState } from 'react';
import { Network, Sparkles } from 'lucide-react';

export const ThreatGraphView = ({ graph }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const { nodes = [], edges = [], campaignCluster } = graph || {};

  const getNodeColor = (type, risk) => {
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

  const nodePositions = {};

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
    <div className="panel p-5 mb-4 bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 m-0">
            <Network className="w-4 h-4 text-cyan-400" />
            Threat Correlation & Attribution Graph
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Entity relationships connecting sender identity, lookalike domains, IPs, and linked campaigns.
          </p>
        </div>

        {campaignCluster && (
          <div className="badge badge-critical text-xs py-1 px-2.5 flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded">
            <Sparkles className="w-3 h-3 text-rose-400" />
            {campaignCluster.name} ({campaignCluster.confidence}% Match)
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="w-full h-[360px] bg-slate-950/60 rounded-md border border-slate-800 relative overflow-hidden">
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
                className="cursor-pointer"
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
          <div className="absolute bottom-2.5 right-2.5 bg-slate-900 border border-slate-700 rounded-md p-3 max-w-xs text-xs shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="badge badge-info text-[10px]">{selectedNode.type}</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
            <div className="font-semibold text-slate-100 mb-1">{selectedNode.label}</div>
            {selectedNode.details && (
              <pre className="text-[10px] text-slate-400 font-mono m-0 overflow-auto max-h-24">
                {JSON.stringify(selectedNode.details, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3.5 mt-2.5 text-[11px] text-slate-400 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span>Target Email</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Sender Domain</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          <span>Relay IP</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
          <span>Campaign Cluster</span>
        </div>
      </div>
    </div>
  );
};
