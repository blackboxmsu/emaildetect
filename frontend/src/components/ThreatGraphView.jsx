import React from 'react';
import { Network, ShieldAlert, CheckCircle, AlertTriangle, Globe, Sparkles, Server, ArrowRight } from 'lucide-react';

export const ThreatGraphView = ({ graph, report }) => {
  const { campaignCluster } = graph || {};
  const { risk, headers, earliestReliableGeo, parsedEmail, nlp, domainIntel } = report || {};

  // P7 Flagging: Determine Attribution Category
  const isSpoofed = headers?.replyToMismatch || headers?.returnPathMismatch || (report?.authentication?.spf?.status === 'FAIL' || report?.authentication?.dmarc?.status === 'FAIL');
  const isAnonymized = earliestReliableGeo?.infraType === 'VPN_PROXY' || earliestReliableGeo?.infraType === 'TOR_EXIT' || earliestReliableGeo?.infraType === 'CLOUD_HOSTING';
  const isCompromised = !isSpoofed && report?.authentication?.spf?.pass && report?.risk?.fraudScore > 40;

  let attributionVerdict = 'Direct Malicious Actor Environment';
  let verdictBadge = 'badge-critical';
  let verdictDescription = 'Email originated directly from attacker-operated mail infrastructure.';

  if (isSpoofed && isAnonymized) {
    attributionVerdict = 'Spoofed Domain & Anonymized Infrastructure';
    verdictBadge = 'badge-critical';
    verdictDescription = 'Sender address was spoofed to mimic legitimate domain, transmitted through VPN/Proxy relay to hide attacker origin.';
  } else if (isSpoofed) {
    attributionVerdict = 'Spoofed Domain';
    verdictBadge = 'badge-critical';
    verdictDescription = 'Sender identity or domain header has been falsified without valid cryptographic SPF/DKIM authorization.';
  } else if (isAnonymized) {
    attributionVerdict = 'Anonymized Infrastructure (VPN / Proxy)';
    verdictBadge = 'badge-warning';
    verdictDescription = 'Transmitted via anonymized hosting or proxy gateway, obscuring the physical origin point.';
  } else if (isCompromised) {
    attributionVerdict = 'Compromised Legitimate Account';
    verdictBadge = 'badge-warning';
    verdictDescription = 'Email passes protocol authentication, indicating a valid corporate account that has likely been compromised.';
  } else if ((risk?.fraudScore || 0) < 30) {
    attributionVerdict = 'Legitimate Infrastructure';
    verdictBadge = 'badge-safe';
    verdictDescription = 'Email originated from authenticated, legitimate mail infrastructure matching domain policy.';
  }

  const fromAddr = parsedEmail?.from?.address || 'N/A';
  const returnPath = parsedEmail?.returnPath || 'N/A';
  const replyTo = parsedEmail?.replyTo?.address || fromAddr;
  const originIp = headers?.earliestReliableIp || 'Internal Node';

  return (
    <div className="panel p-5 mb-5 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 m-0">
              Identity Correlation & Attribution Intelligence
            </h3>
            <span className="badge badge-info text-[10px]">P7 Core Module</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Correlates sender domains, reply routing, origin IPs, and infrastructure attribution.
          </p>
        </div>

        {campaignCluster && (
          <div className="badge badge-warning text-xs py-1 px-3">
            <Sparkles className="w-3.5 h-3.5" />
            Linked Campaign: <strong>{campaignCluster.name}</strong> ({campaignCluster.confidence}% Match)
          </div>
        )}
      </div>

      {/* Attribution Classification Banner (P7 Requirement) */}
      <div className="p-3.5 px-4 bg-slate-50 border border-slate-200 rounded-lg mb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-600">
            Investigative Attribution Flag:
          </div>
          <span className={`badge text-xs py-1 px-2.5 font-bold ${verdictBadge}`}>
            {attributionVerdict}
          </span>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-1.5">
          <span>Attribution Confidence:</span>
          <strong className="text-blue-600 font-mono text-sm">{risk?.attributionConfidence || 70}%</strong>
        </div>
      </div>

      <p className="text-xs text-slate-600 -mt-2 mb-4">
        {verdictDescription}
      </p>

      {/* Correlation Matrix Table: From vs Return-Path vs Reply-To vs IP */}
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="p-2.5 font-semibold">Entity Element</th>
              <th className="p-2.5 font-semibold">Observed Header Value</th>
              <th className="p-2.5 font-semibold">Correlation Status</th>
              <th className="p-2.5 font-semibold">Forensic Finding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Sender From */}
            <tr>
              <td className="p-2.5 font-medium text-slate-900">Sender (From)</td>
              <td className="p-2.5 font-mono text-slate-700">{fromAddr}</td>
              <td className="p-2.5">
                <span className="badge badge-neutral text-[10px]">Claimed Identity</span>
              </td>
              <td className="p-2.5 text-slate-600">
                {nlp?.executiveImpersonation?.detected ? 'Impersonates VIP / Executive title' : 'Sender identity declared in header'}
              </td>
            </tr>

            {/* Return Path */}
            <tr>
              <td className="p-2.5 font-medium text-slate-900">Return-Path</td>
              <td className="p-2.5 font-mono text-slate-700">{returnPath}</td>
              <td className="p-2.5">
                {headers?.returnPathMismatch ? (
                  <span className="badge badge-warning text-[10px]">Mismatch</span>
                ) : (
                  <span className="badge badge-safe text-[10px]">Aligned</span>
                )}
              </td>
              <td className="p-2.5 text-slate-600">
                {headers?.returnPathMismatch ? 'Bounce envelope domain does not match sender domain' : 'Properly aligned with sender'}
              </td>
            </tr>

            {/* Reply-To */}
            <tr>
              <td className="p-2.5 font-medium text-slate-900">Reply-To Address</td>
              <td className="p-2.5 font-mono text-slate-700">{replyTo}</td>
              <td className="p-2.5">
                {headers?.replyToMismatch ? (
                  <span className="badge badge-critical text-[10px]">Diverted Route</span>
                ) : (
                  <span className="badge badge-safe text-[10px]">Matches Sender</span>
                )}
              </td>
              <td className="p-2.5 text-slate-600">
                {headers?.replyToMismatch 
                  ? '⚠️ Responses routed away to attacker-controlled mailbox' 
                  : 'Normal reply routing'}
              </td>
            </tr>

            {/* Origin Server IP */}
            <tr>
              <td className="p-2.5 font-medium text-slate-900">Origin IP Node</td>
              <td className="p-2.5 font-mono text-slate-700">
                {originIp} ({earliestReliableGeo ? `${earliestReliableGeo.city}, ${earliestReliableGeo.country}` : 'Local Node'})
              </td>
              <td className="p-2.5">
                {earliestReliableGeo?.infraType === 'VPN_PROXY' || earliestReliableGeo?.infraType === 'TOR_EXIT' ? (
                  <span className="badge badge-warning text-[10px]">Proxy / VPN</span>
                ) : (
                  <span className="badge badge-info text-[10px]">Identified</span>
                )}
              </td>
              <td className="p-2.5 text-slate-600">
                {earliestReliableGeo?.isp || 'Standard Mail Gateway'} • {earliestReliableGeo?.infraType || 'Public Host'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Lookalike Domains & Threat Flags if present */}
      {nlp?.lookalikeDomains && nlp.lookalikeDomains.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-1.5 text-red-800 text-xs font-bold mb-1">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            Deceptive Domain Squatting / Lookalike Detected:
          </div>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {nlp.lookalikeDomains.map((l, idx) => (
              <span key={idx} className="badge badge-critical text-xs font-mono py-1 px-2.5">
                {l.domain} ➔ Spoofs legitimate: <strong>{l.target}</strong> ({l.type})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
