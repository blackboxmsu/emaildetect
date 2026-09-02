import React from 'react';
import { X, Printer, FileText } from 'lucide-react';

export const ForensicReportModal = ({
  isOpen,
  onClose,
  report
}) => {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const { risk, parsedEmail, headers, authentication, earliestReliableGeo, chainOfCustody, iocs } = report;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white text-slate-900 rounded-xl shadow-2xl flex flex-col">
        {/* Modal Controls (Not printed) */}
        <div className="p-3.5 px-6 bg-slate-900 text-white flex items-center justify-between rounded-t-xl print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-cyan-400" />
            <span className="font-bold text-sm">Forensic Report Generator (Law Enforcement & IR Ready)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3.5 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="bg-transparent border-0 text-slate-400 hover:text-white cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div id="forensic-printable-content" className="p-9 px-10 text-[13px] leading-relaxed">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
                FORENSIC EMAIL INVESTIGATION REPORT
              </h1>
              <div className="text-xs text-slate-600 mt-0.5 font-medium">
                INCIDENT RESPONSE & TECHNICAL FORENSIC INTELLIGENCE DOSSIER
              </div>
            </div>
            <div className="text-right text-[11px] font-mono">
              <div><strong>CASE ID:</strong> {report.caseId}</div>
              <div><strong>EVIDENCE ID:</strong> {chainOfCustody?.evidenceId}</div>
              <div><strong>DATE:</strong> {new Date(report.analyzedAt).toUTCString()}</div>
            </div>
          </div>

          {/* Executive Summary Box */}
          <div className={`rounded-md p-4 mb-5 border ${
            risk.fraudLevel === 'CRITICAL' || risk.fraudLevel === 'HIGH'
              ? 'bg-rose-50 border-rose-300'
              : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <span className={`font-black text-sm ${
                risk.fraudLevel === 'CRITICAL' || risk.fraudLevel === 'HIGH'
                  ? 'text-rose-800'
                  : 'text-emerald-800'
              }`}>
                INCIDENT CLASSIFICATION: {risk.classification.primaryThreat.toUpperCase()}
              </span>
              <span className="font-bold text-xs text-slate-900">
                FRAUD RISK: {risk.fraudScore}/100 | ATTRIBUTION CONFIDENCE: {risk.attributionConfidence}%
              </span>
            </div>
            <p className="m-0 text-slate-700 text-xs">
              {risk.classification.description}
            </p>
          </div>

          {/* Chain of Custody Section */}
          <h2 className="text-sm font-extrabold border-b border-slate-300 pb-1 mb-2 text-slate-900 uppercase">
            1. Evidence Integrity & Chain of Custody (ISO/IEC 27037)
          </h2>
          <table className="w-full border-collapse mb-5 text-xs">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 w-56 text-slate-500 font-medium">Original File Name:</td>
                <td className="py-1.5 font-semibold text-slate-900">{report.fileName}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">Cryptographic SHA-256 Hash:</td>
                <td className="py-1.5 font-mono text-[11px] text-slate-900 break-all">{chainOfCustody?.sha256IntegrityHash}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">Investigating Officer / Analyst:</td>
                <td className="py-1.5 font-semibold text-slate-900">{report.analyst}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">Intake Timestamp:</td>
                <td className="py-1.5 text-slate-800">{chainOfCustody?.intakeTimestamp}</td>
              </tr>
            </tbody>
          </table>

          {/* Email Envelope Section */}
          <h2 className="text-sm font-extrabold border-b border-slate-300 pb-1 mb-2 text-slate-900 uppercase">
            2. Email Header & Protocol Authentication
          </h2>
          <table className="w-full border-collapse mb-5 text-xs">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 w-56 text-slate-500 font-medium">Sender (From):</td>
                <td className="py-1.5 font-semibold text-slate-900">{parsedEmail?.from?.text}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">Subject:</td>
                <td className="py-1.5 font-semibold text-slate-900">{parsedEmail?.subject}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">SPF Protocol:</td>
                <td className="py-1.5 text-slate-800"><strong>{authentication?.spf?.status}</strong> - {authentication?.spf?.details}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">DKIM Signature:</td>
                <td className="py-1.5 text-slate-800"><strong>{authentication?.dkim?.status}</strong> - {authentication?.dkim?.details}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">DMARC Policy:</td>
                <td className="py-1.5 text-slate-800"><strong>{authentication?.dmarc?.status}</strong> - {authentication?.dmarc?.details}</td>
              </tr>
            </tbody>
          </table>

          {/* Origin Traceability Section */}
          <h2 className="text-sm font-extrabold border-b border-slate-300 pb-1 mb-2 text-slate-900 uppercase">
            3. Origin Traceability & Infrastructure Geolocation
          </h2>
          <p className="text-[11px] text-slate-500 mb-2 italic">
            {risk?.attributionAssessment?.disclaimer}
          </p>
          <table className="w-full border-collapse mb-5 text-xs">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 w-56 text-slate-500 font-medium">Earliest Reliable Sending IP:</td>
                <td className="py-1.5 font-mono font-bold text-slate-900">{headers?.earliestReliableIp || 'Internal Node Only'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">Probable Origin Location:</td>
                <td className="py-1.5 text-slate-800">{earliestReliableGeo ? `${earliestReliableGeo.city}, ${earliestReliableGeo.country}` : 'Private LAN'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">Autonomous System / ISP:</td>
                <td className="py-1.5 text-slate-800">{earliestReliableGeo?.isp} ({earliestReliableGeo?.asn})</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 text-slate-500 font-medium">Infrastructure Type:</td>
                <td className="py-1.5 font-semibold text-slate-900">{earliestReliableGeo?.infraType}</td>
              </tr>
            </tbody>
          </table>

          {/* IOCs Section */}
          <h2 className="text-sm font-extrabold border-b border-slate-300 pb-1 mb-2 text-slate-900 uppercase">
            4. Indicators of Compromise (IOC Dossier)
          </h2>
          <div className="mb-5 text-[11px] font-mono bg-slate-50 p-3 rounded border border-slate-200 text-slate-800">
            <div><strong>[IPs]</strong> {iocs?.ips?.join(', ')}</div>
            <div className="mt-1"><strong>[DOMAINS]</strong> {iocs?.domains?.join(', ')}</div>
            <div className="mt-1 break-all"><strong>[PAYLOAD HASHES]</strong> {iocs?.hashes?.join(', ')}</div>
          </div>

          {/* Signature Sign-Off */}
          <div className="mt-8 flex justify-between border-t border-slate-900 pt-4 text-[11px]">
            <div>
              <strong>Certified Digital Signature:</strong><br />
              <span className="font-mono text-slate-500">SIG-SHA256-{chainOfCustody?.sha256IntegrityHash?.slice(0, 16)}...</span>
            </div>
            <div className="text-right">
              <strong>Investigator Sign-Off:</strong><br />
              <span className="font-semibold text-slate-900">{report.analyst}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
