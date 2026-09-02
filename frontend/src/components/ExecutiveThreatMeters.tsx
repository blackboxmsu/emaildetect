import React from 'react';
import { ShieldAlert, Globe, Server, Info, FileText } from 'lucide-react';
import { AnalysisReport } from '../types';

interface ExecutiveThreatMetersProps {
  report: AnalysisReport;
  onOpenReportModal: () => void;
}

export const ExecutiveThreatMeters: React.FC<ExecutiveThreatMetersProps> = ({
  report,
  onOpenReportModal
}) => {
  const { risk, headers, earliestReliableGeo } = report;
  const { fraudScore, fraudLevel, attributionConfidence, classification } = risk;

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#ef4444'; // Red
    if (score >= 40) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  const getBadgeClass = (level: string) => {
    if (level === 'CRITICAL' || level === 'HIGH') return 'badge-critical';
    if (level === 'MEDIUM') return 'badge-warning';
    return 'badge-safe';
  };

  const fraudColor = getScoreColor(fraudScore);

  return (
    <div className="panel" style={{ padding: '20px', marginBottom: '18px' }}>
      {/* Title & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px', borderBottom: '1px solid #1f2937', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${getBadgeClass(fraudLevel)}`}>
              {fraudLevel} THREAT
            </span>
            <span style={{ color: '#64748b', fontSize: '12px' }}>
              Case: <strong style={{ color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>{report.caseId}</strong>
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: '#f8fafc', margin: '4px 0 2px' }}>
            {classification.primaryThreat}
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '850px' }}>
            {classification.description}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="btn-primary"
          style={{ padding: '8px 14px' }}
        >
          <FileText style={{ width: '15px', height: '15px' }} />
          Forensic Report (Print / PDF)
        </button>
      </div>

      {/* Clean Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* Metric 1: Fraud Risk Score */}
        <div style={{
          background: '#0d1321',
          border: '1px solid #1f2937',
          borderRadius: '6px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert style={{ width: '15px', height: '15px', color: fraudColor }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                  Fraud & Threat Risk
                </span>
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: fraudColor, fontFamily: 'var(--font-mono)' }}>
                {fraudScore}<span style={{ fontSize: '13px', color: '#64748b' }}>/100</span>
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Weighted maliciousness probability
            </p>
          </div>

          <div style={{ margin: '12px 0 6px', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${fraudScore}%`, height: '100%', background: fraudColor, borderRadius: '3px' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
            <span>0 (Legitimate)</span>
            <span>50 (Suspicious)</span>
            <span>100 (Fraud)</span>
          </div>
        </div>

        {/* Metric 2: Attribution Confidence */}
        <div style={{
          background: '#0d1321',
          border: '1px solid #1f2937',
          borderRadius: '6px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                  Attribution Confidence
                </span>
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {attributionConfidence}<span style={{ fontSize: '13px', color: '#64748b' }}>%</span>
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Technical evidentiary route certainty
            </p>
          </div>

          <div style={{ margin: '12px 0 6px', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${attributionConfidence}%`, height: '100%', background: '#38bdf8', borderRadius: '3px' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
            <span>Low (Anonymized)</span>
            <span>High (Signed/Verified)</span>
          </div>
        </div>

        {/* Origin Infrastructure Box */}
        <div style={{
          background: '#0d1321',
          border: '1px solid #1f2937',
          borderRadius: '6px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Server style={{ width: '15px', height: '15px', color: '#94a3b8' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                Origin Infrastructure
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {headers.earliestReliableIp || 'Internal Node'}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
              {earliestReliableGeo ? `${earliestReliableGeo.city}, ${earliestReliableGeo.country}` : 'Internal / Private LAN'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
              {earliestReliableGeo?.isp || 'Standard Mail Transit'}
            </div>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {earliestReliableGeo?.infraType && (
              <span className="badge badge-info" style={{ fontSize: '10px' }}>
                {earliestReliableGeo.infraType}
              </span>
            )}
            {earliestReliableGeo?.asn && (
              <span className="badge badge-neutral font-mono" style={{ fontSize: '10px' }}>
                {earliestReliableGeo.asn}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clean Disclaimer */}
      <div style={{
        marginTop: '14px',
        padding: '8px 12px',
        background: '#111827',
        borderLeft: '3px solid #f59e0b',
        borderRadius: '0 4px 4px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Info style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
          <strong>P7 Forensic Principle:</strong> Origin geolocation identifies the technical mail transfer agent/host infrastructure, not the physical location of the attacker.
        </span>
      </div>
    </div>
  );
};
