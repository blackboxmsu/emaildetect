import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Globe, Server, FileText, Mail, ArrowRight } from 'lucide-react';

export const ExecutiveThreatMeters = ({
  report,
  onOpenReportModal
}) => {
  const { risk, headers, earliestReliableGeo, parsedEmail, authentication } = report;
  const { fraudScore, fraudLevel, attributionConfidence, classification } = risk;

  const isCritical = fraudLevel === 'CRITICAL' || fraudLevel === 'HIGH';
  const isSuspicious = fraudLevel === 'MEDIUM';

  const getScoreColor = (score) => {
    if (score >= 70) return '#dc2626'; // Red
    if (score >= 40) return '#d97706'; // Amber
    return '#16a34a'; // Green
  };

  const fraudColor = getScoreColor(fraudScore);

  // Check for Reply-To discrepancy
  const fromAddr = parsedEmail?.from?.address || '';
  const replyToAddr = parsedEmail?.replyTo?.address || '';
  const hasReplyToMismatch = replyToAddr && fromAddr && replyToAddr.toLowerCase() !== fromAddr.toLowerCase();

  return (
    <div className="mb-5 flex flex-col gap-4">
      {/* 1. Real-Time High-Risk Threat Alert Banner (P7 Requirement) */}
      <div className={`p-4 px-5 rounded-lg border flex items-center justify-between flex-wrap gap-3 ${
        isCritical 
          ? 'bg-red-50 border-red-200 text-red-900' 
          : isSuspicious 
            ? 'bg-amber-50 border-amber-200 text-amber-900' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-start gap-3">
          {isCritical ? (
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          ) : isSuspicious ? (
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${
                isCritical ? 'badge-critical' : isSuspicious ? 'badge-warning' : 'badge-safe'
              }`}>
                {fraudLevel} THREAT
              </span>
              <h2 className="text-base font-bold m-0 text-slate-900">
                {classification.primaryThreat}
              </h2>
            </div>
            <p className="text-xs text-slate-700 mt-1 max-w-4xl leading-relaxed">
              {classification.description}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReportModal}
          className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm inline-flex items-center gap-2 ml-auto"
        >
          <FileText className="w-4 h-4" />
          Generate Forensic Report (PDF / Print)
        </button>
      </div>

      {/* 2. Key Metrics Row: Fraud Score, Attribution Confidence, Origin Infrastructure, Protocol Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Fraud Risk Score */}
        <div className="panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-600">Fraud Risk Score</span>
              <span className="text-2xl font-black font-mono" style={{ color: fraudColor }}>
                {fraudScore}<span className="text-xs font-normal text-slate-400">/100</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Evaluated via NLP cues, auth failures & routing anomalies
            </p>
          </div>

          <div className="my-2.5">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${fraudScore}%`, backgroundColor: fraudColor }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 (Legitimate)</span>
              <span>50 (Suspicious)</span>
              <span>100 (Fraud)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Risk Level:</span>
            <span className={`font-bold ${isCritical ? 'text-red-600' : isSuspicious ? 'text-amber-600' : 'text-emerald-600'}`}>
              {fraudLevel}
            </span>
          </div>
        </div>

        {/* Metric 2: Attribution Confidence */}
        <div className="panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-600">Attribution Confidence</span>
              <span className="text-2xl font-black font-mono text-blue-600">
                {attributionConfidence}<span className="text-xs font-normal text-slate-400">%</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Technical certainty of origin node and sender identity
            </p>
          </div>

          <div className="my-2.5">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${attributionConfidence}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Low (Anonymized)</span>
              <span>High (Directly Identified)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600 flex items-center justify-between">
            <span>Evidence Quality:</span>
            <span className="font-bold text-blue-600">
              {attributionConfidence >= 70 ? 'High Evidence' : attributionConfidence >= 40 ? 'Moderate' : 'Low / Masked'}
            </span>
          </div>
        </div>

        {/* Metric 3: Origin Infrastructure */}
        <div className="panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Server className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">Originating Node (IP)</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 truncate">
              {headers?.earliestReliableIp || 'Internal Node'}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {earliestReliableGeo ? `${earliestReliableGeo.city}, ${earliestReliableGeo.country}` : 'Internal / Private Network'}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {earliestReliableGeo?.isp || 'Standard Mail Gateway'}
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
            {earliestReliableGeo?.infraType && (
              <span className="badge badge-warning text-[10px]">
                {earliestReliableGeo.infraType}
              </span>
            )}
            {earliestReliableGeo?.asn && (
              <span className="badge badge-neutral text-[10px] font-mono">
                {earliestReliableGeo.asn}
              </span>
            )}
          </div>
        </div>

        {/* Metric 4: Protocol Authentication Status */}
        <div className="panel p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600 block mb-2">Protocol Authentication</span>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">SPF Policy:</span>
                <span className={`badge ${authentication?.spf?.pass ? 'badge-safe' : 'badge-critical'}`}>
                  {authentication?.spf?.status || 'FAIL'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">DKIM Signature:</span>
                <span className={`badge ${authentication?.dkim?.pass ? 'badge-safe' : 'badge-critical'}`}>
                  {authentication?.dkim?.status || 'NONE'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">DMARC Alignment:</span>
                <span className={`badge ${authentication?.dmarc?.pass ? 'badge-safe' : 'badge-critical'}`}>
                  {authentication?.dmarc?.status || 'FAIL'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-slate-500">
            {authentication?.dmarc?.pass 
              ? '✅ Legitimate authorized sender' 
              : '❌ Sender failed cryptographic checks'}
          </div>
        </div>
      </div>

      {/* 3. Inspected Email Header Summary & Spoofing Callout */}
      <div className="panel p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Inspected Email Metadata
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {parsedEmail?.date || 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          <div>
            <span className="text-slate-500 font-medium mr-2">From:</span>
            <strong className="text-slate-900">{parsedEmail?.from?.value?.[0]?.name || ''} </strong>
            <span className="font-mono text-slate-700">&lt;{fromAddr}&gt;</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium mr-2">Subject:</span>
            <strong className="text-slate-900">{parsedEmail?.subject || '(No Subject)'}</strong>
          </div>
        </div>

        {/* Reply-To Mismatch Alert (Key Spoofing Indicator from P7) */}
        {hasReplyToMismatch && (
          <div className="mt-2.5 p-2.5 px-3 bg-red-100 border border-red-300 rounded flex items-center gap-2 text-xs text-red-900">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>
              <strong>Spoofing Alert:</strong> Sender address is <code>{fromAddr}</code>, but responses are diverted to foreign address <code>{replyToAddr}</code>.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
