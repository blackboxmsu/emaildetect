import React, { useState } from 'react';
import { ShieldCheck, Cpu, Hash, Terminal, Award, Copy, Check, Search, FileText, AlertTriangle } from 'lucide-react';

export const ForensicsTabs = ({ report, privacyMode }) => {
  const [activeTab, setActiveTab] = useState('auth');
  const [headerSearch, setHeaderSearch] = useState('');
  const [copiedSection, setCopiedSection] = useState(null);

  const { authentication, nlp, headers, parsedEmail, iocs, chainOfCustody, domainIntel } = report || {};

  const maskEmail = (email) => {
    if (!email || !privacyMode) return email || '';
    const parts = email.split('@');
    if (parts.length !== 2) return '***@***';
    return `${parts[0].slice(0, 2)}***@${parts[1]}`;
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="panel p-5 mb-5 bg-white border border-slate-200 rounded-lg shadow-sm">
      {/* Clean Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto mb-4 pb-0">
        <button
          onClick={() => setActiveTab('auth')}
          className={`py-2 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'auth'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Protocol Authentication (SPF / DKIM / DMARC)
        </button>

        <button
          onClick={() => setActiveTab('nlp')}
          className={`py-2 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'nlp'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          NLP & Content Threat Analysis
        </button>

        <button
          onClick={() => setActiveTab('iocs')}
          className={`py-2 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'iocs'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          Extracted IOCs Table
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`py-2 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'headers'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Full Email Headers
        </button>

        <button
          onClick={() => setActiveTab('custody')}
          className={`py-2 px-3.5 border-b-2 text-xs font-semibold flex items-center gap-1.5 transition ${
            activeTab === 'custody'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Evidentiary Chain of Custody
        </button>
      </div>

      {/* Tab 1: Protocol Authentication (SPF, DKIM, DMARC) */}
      {activeTab === 'auth' && authentication && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* SPF Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-xs text-slate-900">SPF (Sender Policy Framework)</span>
                <span className={`badge ${authentication.spf.pass ? 'badge-safe' : (authentication.spf.status === 'SOFTFAIL' ? 'badge-warning' : 'badge-critical')}`}>
                  {authentication.spf.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">
                {authentication.spf.details}
              </p>
              {authentication.spf.ipChecked && (
                <div className="text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200">
                  Checked IP: <strong>{authentication.spf.ipChecked}</strong>
                </div>
              )}
            </div>

            {/* DKIM Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-xs text-slate-900">DKIM Cryptographic Signature</span>
                <span className={`badge ${authentication.dkim.pass ? 'badge-safe' : (authentication.dkim.status === 'NONE' ? 'badge-warning' : 'badge-critical')}`}>
                  {authentication.dkim.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">
                {authentication.dkim.details}
              </p>
              <div className="text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200">
                Signature Alignment: <strong>{authentication.dkim.alignment ? 'YES' : 'NO'}</strong>
              </div>
            </div>

            {/* DMARC Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-xs text-slate-900">DMARC Policy Enforcement</span>
                <span className={`badge ${authentication.dmarc.pass ? 'badge-safe' : 'badge-critical'}`}>
                  {authentication.dmarc.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">
                {authentication.dmarc.details}
              </p>
              <div className="text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200">
                Action Policy: <strong>{authentication.dmarc.policy || 'quarantine'}</strong>
              </div>
            </div>
          </div>

          {/* Identity Alignment Verification */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-xs font-bold text-slate-900 mb-2">
              Header Identity Alignment Verification
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px] mb-0.5">From Address:</span>
                <span className="text-slate-900 font-mono font-medium">{maskEmail(parsedEmail?.from?.address)}</span>
              </div>

              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px] mb-0.5">Return-Path (Bounce):</span>
                <span className={`font-mono font-medium ${headers?.returnPathMismatch ? 'text-amber-700' : 'text-slate-900'}`}>
                  {maskEmail(parsedEmail?.returnPath) || '(None)'}
                </span>
                {headers?.returnPathMismatch && (
                  <span className="badge badge-warning text-[10px] ml-2">Mismatch</span>
                )}
              </div>

              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px] mb-0.5">Reply-To (Routing):</span>
                <span className={`font-mono font-medium ${headers?.replyToMismatch ? 'text-red-700' : 'text-slate-900'}`}>
                  {maskEmail(parsedEmail?.replyTo?.address) || '(Same as From)'}
                </span>
                {headers?.replyToMismatch && (
                  <span className="badge badge-critical text-[10px] ml-2">Diverted</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: NLP & Threat Content */}
      {activeTab === 'nlp' && nlp && (
        <div className="flex flex-col gap-4">
          {/* Cues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-amber-800 mb-2 flex items-center justify-between">
                <span>Urgency & Psychological Pressure Cues</span>
                <span className="badge badge-warning text-[10px]">{nlp.urgencyCues?.length || 0} Found</span>
              </div>
              {nlp.urgencyCues?.length > 0 ? (
                <ul className="pl-5 text-xs text-slate-700 m-0 list-disc flex flex-col gap-1">
                  {nlp.urgencyCues.map((c, i) => (
                    <li key={i}><strong>"{c}"</strong></li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-500">No urgency pressure cues detected in email text.</span>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-red-800 mb-2 flex items-center justify-between">
                <span>Business Email Compromise (BEC) Patterns</span>
                <span className="badge badge-critical text-[10px]">{nlp.becIndicators?.length || 0} Found</span>
              </div>
              {nlp.becIndicators?.length > 0 ? (
                <ul className="pl-5 text-xs text-slate-700 m-0 list-disc flex flex-col gap-1">
                  {nlp.becIndicators.map((c, i) => (
                    <li key={i}><strong>"{c}"</strong></li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-500">No financial diversion or BEC patterns detected.</span>
              )}
            </div>
          </div>

          {/* Email Body Preview */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-900 mb-2">
              Analyzed Email Body Text
            </div>
            <div className="bg-white p-3 rounded border border-slate-200 font-sans text-xs text-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {parsedEmail?.textBody || '(No plain text body content found)'}
            </div>
          </div>

          {/* Lookalike Domains */}
          {nlp.lookalikeDomains?.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-xs font-bold text-red-900 mb-2">
                Detected Typosquatting / Lookalike Domains
              </div>
              <div className="flex flex-col gap-1.5">
                {nlp.lookalikeDomains.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-red-200">
                    <span>
                      <strong className="text-red-700 font-mono">{l.domain}</strong>
                      <span className="text-slate-500 mx-2">imitates legitimate</span>
                      <strong className="text-blue-700 font-mono">{l.target}</strong>
                    </span>
                    <span className="badge badge-critical text-[10px]">
                      {l.type || 'Typosquatting'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Extracted IOCs Table */}
      {activeTab === 'iocs' && iocs && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-600 font-medium">
              Extracted Indicators of Compromise (IPs, Domains, Hashes) for SOC & SIEM Export
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(iocs, null, 2), 'iocs-json')}
                className="btn-secondary py-1 px-3 text-xs"
              >
                {copiedSection === 'iocs-json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copiedSection === 'iocs-json' ? 'Copied' : 'Export JSON'}
              </button>
              <button
                onClick={() => {
                  const csv = [
                    'Type,Value',
                    ...iocs.ips.map(ip => `IP,${ip}`),
                    ...iocs.domains.map(d => `Domain,${d}`),
                    ...iocs.hashes.map(h => `SHA256,${h}`)
                  ].join('\n');
                  copyToClipboard(csv, 'iocs-csv');
                }}
                className="btn-secondary py-1 px-3 text-xs"
              >
                {copiedSection === 'iocs-csv' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copiedSection === 'iocs-csv' ? 'Copied' : 'Export CSV'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-800 mb-2">Origin & Relay IPs ({iocs.ips?.length || 0})</div>
              {iocs.ips?.map((ip, i) => (
                <div key={i} className="text-xs font-mono text-slate-800 py-0.5">{ip}</div>
              ))}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-800 mb-2">Domains ({iocs.domains?.length || 0})</div>
              {iocs.domains?.map((dom, i) => (
                <div key={i} className="text-xs font-mono text-slate-800 py-0.5">{dom}</div>
              ))}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-800 mb-2">Cryptographic Hashes ({iocs.hashes?.length || 0})</div>
              {iocs.hashes?.map((h, i) => (
                <div key={i} className="text-[11px] font-mono text-slate-800 break-all py-0.5">{h}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Raw Headers */}
      {activeTab === 'headers' && parsedEmail?.rawHeaders && (
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 py-1.5 px-3 rounded border border-slate-200">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                placeholder="Filter header by name..."
                className="bg-transparent border-0 outline-none text-slate-900 text-xs w-56"
              />
            </div>

            <button
              onClick={() => {
                const text = Object.entries(parsedEmail.rawHeaders).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('\n ') : v}`).join('\n');
                copyToClipboard(text, 'raw-headers');
              }}
              className="btn-secondary py-1 px-3 text-xs"
            >
              {copiedSection === 'raw-headers' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copiedSection === 'raw-headers' ? 'Copied' : 'Copy All Headers'}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 max-h-80 overflow-y-auto font-mono text-xs leading-relaxed">
            {Object.entries(parsedEmail.rawHeaders)
              .filter(([k, v]) => {
                if (!headerSearch) return true;
                const str = `${k} ${Array.isArray(v) ? v.join(' ') : v}`.toLowerCase();
                return str.includes(headerSearch.toLowerCase());
              })
              .map(([key, val], idx) => {
                const valStr = Array.isArray(val) ? val.join('\n  ') : val;
                const isHighlight = key.toLowerCase() === 'received' || key.toLowerCase().includes('auth') || key.toLowerCase().includes('dkim');
                return (
                  <div key={idx} className="mb-2 pb-1 border-b border-slate-200 last:border-0">
                    <span className={isHighlight ? 'text-blue-700 font-bold' : 'text-slate-600 font-semibold'}>{key}: </span>
                    <span className="text-slate-800 break-all">{valStr}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 5: Chain of Custody */}
      {activeTab === 'custody' && chainOfCustody && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div className="font-bold text-slate-900 mb-2">Evidence Integrity Seal (ISO/IEC 27037)</div>
            <div className="mb-1">Evidence ID: <strong className="font-mono text-slate-900">{chainOfCustody.evidenceId}</strong></div>
            <div className="mt-2 text-slate-600">SHA-256 Digital Fingerprint:</div>
            <code className="text-xs text-blue-700 break-all block mt-1 bg-white p-2 rounded border border-slate-200 font-mono font-semibold">
              {chainOfCustody.sha256IntegrityHash}
            </code>
            <div className="mt-2 text-slate-600">Intake Timestamp: <strong className="text-slate-900">{chainOfCustody.intakeTimestamp}</strong></div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div className="font-bold text-slate-900 mb-2">Legal Compliance & Chain of Custody</div>
            <div className="mb-1">Designated Investigator: <strong className="text-slate-900">{report.analyst}</strong></div>
            <div className="mt-2">Preservation Status: <span className="badge badge-safe text-[10px] ml-1">Cryptographically Locked (Read-Only)</span></div>
            <div className="mt-2">Retention Schedule: <strong className="text-slate-900">365 Days Compliant Retention</strong></div>
            <div className="mt-2 text-slate-500 text-[11px]">
              Evidentiary integrity verified for institutional security review, cyber incident response, and law enforcement support.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
