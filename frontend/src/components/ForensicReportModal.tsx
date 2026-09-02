import React from 'react';
import { X, Printer, Shield, CheckCircle, AlertTriangle, FileText, Download } from 'lucide-react';
import { AnalysisReport } from '../types';

interface ForensicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AnalysisReport;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const { risk, parsedEmail, headers, authentication, nlp, earliestReliableGeo, chainOfCustody, iocs } = report;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '12px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Controls (Not printed) */}
        <div style={{
          padding: '14px 24px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText style={{ width: '18px', height: '18px', color: '#00f0ff' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Forensic Report Generator (Law Enforcement & IR Ready)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer style={{ width: '14px', height: '14px' }} />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div id="forensic-printable-content" style={{ padding: '36px 40px', fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: '1.6' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                FORENSIC EMAIL INVESTIGATION REPORT
              </h1>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                AEGIS-MAIL CYBERSECURITY INCIDENT RESPONSE & EVIDENCE DOSSIER
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', fontFamily: 'monospace' }}>
              <div><strong>CASE ID:</strong> {report.caseId}</div>
              <div><strong>EVIDENCE ID:</strong> {chainOfCustody.evidenceId}</div>
              <div><strong>DATE:</strong> {new Date(report.analyzedAt).toUTCString()}</div>
            </div>
          </div>

          {/* Executive Summary Box */}
          <div style={{
            background: risk.fraudLevel === 'CRITICAL' || risk.fraudLevel === 'HIGH' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${risk.fraudLevel === 'CRITICAL' || risk.fraudLevel === 'HIGH' ? '#f87171' : '#86efac'}`,
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '14px', color: risk.fraudLevel === 'CRITICAL' || risk.fraudLevel === 'HIGH' ? '#991b1b' : '#166534' }}>
                INCIDENT CLASSIFICATION: {risk.classification.primaryThreat.toUpperCase()}
              </span>
              <span style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                FRAUD RISK: {risk.fraudScore}/100 | ATTRIBUTION CONFIDENCE: {risk.attributionConfidence}%
              </span>
            </div>
            <p style={{ margin: 0, color: '#334155', fontSize: '12px' }}>
              {risk.classification.description}
            </p>
          </div>

          {/* Chain of Custody Section */}
          <h2 style={{ fontSize: '14px', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
            1. EVIDENCE INTEGRITY & CHAIN OF CUSTODY (ISO/IEC 27037)
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', width: '220px', color: '#64748b' }}>Original File Name:</td>
                <td style={{ padding: '6px 0', fontWeight: 600 }}>{report.fileName}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>Cryptographic SHA-256 Hash:</td>
                <td style={{ padding: '6px 0', fontFamily: 'monospace', fontSize: '11px', color: '#0f172a' }}>{chainOfCustody.sha256IntegrityHash}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>Investigating Officer / Analyst:</td>
                <td style={{ padding: '6px 0', fontWeight: 600 }}>{report.analyst}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>Intake Timestamp:</td>
                <td style={{ padding: '6px 0' }}>{chainOfCustody.intakeTimestamp}</td>
              </tr>
            </tbody>
          </table>

          {/* Email Envelope Section */}
          <h2 style={{ fontSize: '14px', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
            2. EMAIL HEADER & PROTOCOL AUTHENTICATION
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', width: '220px', color: '#64748b' }}>Sender (From):</td>
                <td style={{ padding: '6px 0', fontWeight: 600 }}>{parsedEmail.from.text}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>Subject:</td>
                <td style={{ padding: '6px 0', fontWeight: 600 }}>{parsedEmail.subject}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>SPF Protocol:</td>
                <td style={{ padding: '6px 0' }}><strong>{authentication.spf.status}</strong> - {authentication.spf.details}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>DKIM Signature:</td>
                <td style={{ padding: '6px 0' }}><strong>{authentication.dkim.status}</strong> - {authentication.dkim.details}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>DMARC Policy:</td>
                <td style={{ padding: '6px 0' }}><strong>{authentication.dmarc.status}</strong> - {authentication.dmarc.details}</td>
              </tr>
            </tbody>
          </table>

          {/* Origin Traceability Section */}
          <h2 style={{ fontSize: '14px', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
            3. ORIGIN TRACEABILITY & INFRASTRUCTURE GEOLOCATION
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
            {risk.attributionAssessment.disclaimer}
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', width: '220px', color: '#64748b' }}>Earliest Reliable Sending IP:</td>
                <td style={{ padding: '6px 0', fontFamily: 'monospace', fontWeight: 700 }}>{headers.earliestReliableIp || 'Internal Node Only'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>Probable Origin Location:</td>
                <td style={{ padding: '6px 0' }}>{earliestReliableGeo ? `${earliestReliableGeo.city}, ${earliestReliableGeo.country}` : 'Private LAN'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>Autonomous System / ISP:</td>
                <td style={{ padding: '6px 0' }}>{earliestReliableGeo?.isp} ({earliestReliableGeo?.asn})</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '6px 0', color: '#64748b' }}>Infrastructure Type:</td>
                <td style={{ padding: '6px 0', fontWeight: 600 }}>{earliestReliableGeo?.infraType}</td>
              </tr>
            </tbody>
          </table>

          {/* IOCs Section */}
          <h2 style={{ fontSize: '14px', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
            4. INDICATORS OF COMPROMISE (IOC DOSSIER)
          </h2>
          <div style={{ marginBottom: '20px', fontSize: '11px', fontFamily: 'monospace', background: '#f8fafc', padding: '12px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <div><strong>[IPs]</strong> {iocs.ips.join(', ')}</div>
            <div style={{ marginTop: '4px' }}><strong>[DOMAINS]</strong> {iocs.domains.join(', ')}</div>
            <div style={{ marginTop: '4px' }}><strong>[PAYLOAD HASHES]</strong> {iocs.hashes.join(', ')}</div>
          </div>

          {/* Signature Sign-Off */}
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #0f172a', paddingTop: '16px', fontSize: '11px' }}>
            <div>
              <strong>Certified Digital Signature:</strong><br />
              <span style={{ fontFamily: 'monospace', color: '#64748b' }}>SIG-SHA256-{chainOfCustody.sha256IntegrityHash.slice(0, 16)}...</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>Investigator Sign-Off:</strong><br />
              {report.analyst}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
