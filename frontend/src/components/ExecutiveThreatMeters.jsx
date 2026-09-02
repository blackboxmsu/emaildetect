import React from 'react';
import { ShieldAlert, Globe, Server, Info, FileText } from 'lucide-react';

export const ExecutiveThreatMeters = ({
  report,
  onOpenReportModal
}) => {
  const { risk, headers, earliestReliableGeo } = report;
  const { fraudScore, fraudLevel, attributionConfidence, classification } = risk;

  const getScoreColor = (score) => {
    if (score >= 70) return '#ef4444'; // Red
    if (score >= 40) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  const getBadgeClass = (level) => {
    if (level === 'CRITICAL' || level === 'HIGH') return 'badge-critical';
    if (level === 'MEDIUM') return 'badge-warning';
    return 'badge-safe';
  };

  const fraudColor = getScoreColor(fraudScore);

  return (
    <div className="panel p-5 mb-4 bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm">
      {/* Title & Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3.5 mb-4 pb-3.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className={`badge ${getBadgeClass(fraudLevel)}`}>
              {fraudLevel} THREAT
            </span>
            <span className="text-slate-400 text-xs">
              Case: <strong className="text-slate-200 font-mono">{report.caseId}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-slate-100 mb-0.5">
            {classification.primaryThreat}
          </h2>
          <p className="text-xs text-slate-400 max-w-4xl m-0">
            {classification.description}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="btn-primary py-2 px-3.5 text-xs inline-flex items-center gap-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow transition"
        >
          <FileText className="w-4 h-4" />
          Forensic Report (Print / PDF)
        </button>
      </div>

      {/* Clean Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Fraud Risk Score */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-md p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" style={{ color: fraudColor }} />
                <span className="text-xs font-semibold text-slate-200">
                  Fraud & Threat Risk
                </span>
              </div>
              <span className="text-2xl font-extrabold font-mono" style={{ color: fraudColor }}>
                {fraudScore}<span className="text-xs text-slate-500">/100</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Weighted maliciousness probability
            </p>
          </div>

          <div className="my-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${fraudScore}%`, backgroundColor: fraudColor }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 (Legitimate)</span>
            <span>50 (Suspicious)</span>
            <span>100 (Fraud)</span>
          </div>
        </div>

        {/* Metric 2: Attribution Confidence */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-md p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Attribution Confidence
                </span>
              </div>
              <span className="text-2xl font-extrabold font-mono text-cyan-400">
                {attributionConfidence}<span className="text-xs text-slate-500">%</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Technical evidentiary route certainty
            </p>
          </div>

          <div className="my-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${attributionConfidence}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Low (Anonymized)</span>
            <span>High (Signed/Verified)</span>
          </div>
        </div>

        {/* Origin Infrastructure Box */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-md p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200">
                Origin Infrastructure
              </span>
            </div>
            <div className="text-sm font-semibold text-cyan-400 font-mono">
              {headers?.earliestReliableIp || 'Internal Node'}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {earliestReliableGeo ? `${earliestReliableGeo.city}, ${earliestReliableGeo.country}` : 'Internal / Private LAN'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 truncate">
              {earliestReliableGeo?.isp || 'Standard Mail Transit'}
            </div>
          </div>

          <div className="mt-2.5 flex gap-1.5 flex-wrap">
            {earliestReliableGeo?.infraType && (
              <span className="badge badge-info text-[10px]">
                {earliestReliableGeo.infraType}
              </span>
            )}
            {earliestReliableGeo?.asn && (
              <span className="badge badge-neutral font-mono text-[10px]">
                {earliestReliableGeo.asn}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clean Disclaimer */}
      <div className="mt-3.5 p-2 px-3 bg-slate-950/70 border-l-2 border-amber-500 rounded-r flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-xs text-slate-300">
          <strong>P7 Forensic Principle:</strong> Origin geolocation identifies the technical mail transfer agent/host infrastructure, not the physical location of the attacker.
        </span>
      </div>
    </div>
  );
};
