import React from 'react';
import { AlertTriangle, ShieldCheck, Clock, Server, MapPin } from 'lucide-react';
import { RelayHop } from '../types';

interface RelayRouteVisualizerProps {
  hops: RelayHop[];
  earliestReliableIp: string | null;
  anomalies: string[];
}

export const RelayRouteVisualizer: React.FC<RelayRouteVisualizerProps> = ({
  hops,
  earliestReliableIp,
  anomalies
}) => {
  return (
    <div className="panel" style={{ padding: '20px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Server style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
            Transmission Relay Route
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
            Reconstructed chronological hop path from Received headers (bottom to top).
          </p>
        </div>
        <span className="badge badge-neutral">
          {hops.length} Hops
        </span>
      </div>

      {/* Anomalies alert */}
      {anomalies.length > 0 && (
        <div style={{
          marginBottom: '14px',
          padding: '10px 12px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
            <AlertTriangle style={{ width: '14px', height: '14px' }} />
            Routing Anomalies:
          </div>
          <ul style={{ paddingLeft: '18px', color: '#fca5a5', fontSize: '12px', margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {anomalies.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hop List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {hops.map((hop) => {
          const isEarliest = hop.isEarliestReliable || hop.ip === earliestReliableIp;

          return (
            <div
              key={hop.hopIndex}
              style={{
                background: isEarliest ? 'rgba(56, 189, 248, 0.06)' : '#0d1321',
                border: `1px solid ${isEarliest ? '#0284c7' : '#1f2937'}`,
                borderRadius: '6px',
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    background: isEarliest ? '#0284c7' : '#1e293b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {hop.hopIndex}
                  </span>

                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                      {hop.by || 'Destination MX'}
                    </span>
                    {hop.from && (
                      <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '6px' }}>
                        ← {hop.from}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isEarliest && (
                    <span className="badge badge-info" style={{ fontSize: '10px' }}>
                      <ShieldCheck style={{ width: '12px', height: '12px' }} />
                      Earliest Reliable Origin Node
                    </span>
                  )}

                  {hop.ip && (
                    <span className="badge badge-neutral font-mono" style={{ fontSize: '11px' }}>
                      {hop.ip}
                    </span>
                  )}
                </div>
              </div>

              {/* Hop Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', fontSize: '11px', color: '#64748b', flexWrap: 'wrap' }}>
                {hop.timestamp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '12px', height: '12px' }} />
                    <span className="font-mono">{hop.timestamp}</span>
                  </div>
                )}
                {hop.delaySeconds !== undefined && hop.delaySeconds > 0 && (
                  <div>
                    Delay: +{hop.delaySeconds}s
                  </div>
                )}
                {hop.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                    <MapPin style={{ width: '12px', height: '12px', color: '#38bdf8' }} />
                    <span>{hop.location.city}, {hop.location.country} ({hop.location.isp || hop.location.asn})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
