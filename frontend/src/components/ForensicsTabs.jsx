import React, { useState } from 'react';
import { ShieldCheck, Cpu, Hash, Terminal, Award, Copy, Check, Search } from 'lucide-react';

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
    <div className="panel p-5 mb-5 bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto mb-4.5">
        <button
          onClick={() => setActiveTab('auth')}
          className={`py-2 px-3.5 border-b-2 text-xs font-medium flex items-center gap-1.5 rounded-t cursor-pointer transition ${
            activeTab === 'auth'
              ? 'bg-slate-800 border-blue-500 text-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Protocol Authentication (SPF / DKIM / DMARC)
        </button>

        <button
          onClick={() => setActiveTab('nlp')}
          className={`py-2 px-3.5 border-b-2 text-xs font-medium flex items-center gap-1.5 rounded-t cursor-pointer transition ${
            activeTab === 'nlp'
              ? 'bg-slate-800 border-blue-500 text-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          NLP & Social Engineering
        </button>

        <button
          onClick={() => setActiveTab('iocs')}
          className={`py-2 px-3.5 border-b-2 text-xs font-medium flex items-center gap-1.5 rounded-t cursor-pointer transition ${
            activeTab === 'iocs'
              ? 'bg-slate-800 border-blue-500 text-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          IOCs Table
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`py-2 px-3.5 border-b-2 text-xs font-medium flex items-center gap-1.5 rounded-t cursor-pointer transition ${
            activeTab === 'headers'
              ? 'bg-slate-800 border-blue-500 text-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Raw Headers
        </button>

        <button
          onClick={() => setActiveTab('custody')}
          className={`py-2 px-3.5 border-b-2 text-xs font-medium flex items-center gap-1.5 rounded-t cursor-pointer transition ${
            activeTab === 'custody'
              ? 'bg-slate-800 border-blue-500 text-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Chain of Custody
        </button>
      </div>

      {/* Tab 1: Protocol Authentication */}
      {activeTab === 'auth' && authentication && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-md p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-xs text-slate-100">SPF (Sender Policy)</span>
                <span className={`badge ${authentication.spf.pass ? 'badge-safe' : (authentication.spf.status === 'SOFTFAIL' ? 'badge-warning' : 'badge-critical')}`}>
                  {authentication.spf.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0">
                {authentication.spf.details}
              </p>
              {authentication.spf.ipChecked && (
                <div className="text-[11px] text-slate-500 font-mono mt-1.5">
                  IP: {authentication.spf.ipChecked}
                </div>
              )}
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-md p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-xs text-slate-100">DKIM Signature</span>
                <span className={`badge ${authentication.dkim.pass ? 'badge-safe' : (authentication.dkim.status === 'NONE' ? 'badge-warning' : 'badge-critical')}`}>
                  {authentication.dkim.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0">
                {authentication.dkim.details}
              </p>
              <div className="text-[11px] text-slate-500 font-mono mt-1.5">
                Aligned: {authentication.dkim.alignment ? 'YES' : 'NO'}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-md p-3.5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-xs text-slate-100">DMARC Policy</span>
                <span className={`badge ${authentication.dmarc.pass ? 'badge-safe' : 'badge-critical'}`}>
                  {authentication.dmarc.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 m-0">
                {authentication.dmarc.details}
              </p>
              <div className="text-[11px] text-slate-500 font-mono mt-1.5">
                Policy: {authentication.dmarc.policy || 'quarantine'}
              </div>
            </div>
          </div>

          {/* Alignment Details */}
          <div className="bg-slate-950/60 rounded-md p-3.5 border border-slate-800">
            <div className="text-xs font-semibold text-slate-200 mb-2.5">
              Identity Alignment Verification
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div>
                <span className="text-slate-500">From:</span>
                <div className="text-slate-100 font-medium font-mono">
                  {maskEmail(parsedEmail?.from?.address)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Return-Path:</span>
                <div className={`font-medium font-mono ${headers?.returnPathMismatch ? 'text-rose-400' : 'text-slate-100'}`}>
                  {maskEmail(parsedEmail?.returnPath) || '(None)'}
                  {headers?.returnPathMismatch && ' (Mismatch)'}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Reply-To:</span>
                <div className={`font-medium font-mono ${headers?.replyToMismatch ? 'text-rose-400' : 'text-slate-100'}`}>
                  {maskEmail(parsedEmail?.replyTo?.address) || '(Same as From)'}
                  {headers?.replyToMismatch && ' (Foreign domain)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: NLP & Social Engineering */}
      {activeTab === 'nlp' && nlp && (
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-slate-950/60 p-3.5 rounded-md border border-slate-800">
              <div className="text-xs font-semibold text-amber-400 mb-1.5">
                Urgency & Pressure Cues ({nlp.urgencyCues?.length || 0})
              </div>
              {nlp.urgencyCues?.length > 0 ? (
                <ul className="pl-4 text-xs text-slate-300 m-0 list-disc flex flex-col gap-0.5">
                  {nlp.urgencyCues.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-500">No urgency cues detected.</span>
              )}
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-md border border-slate-800">
              <div className="text-xs font-semibold text-rose-400 mb-1.5">
                BEC Financial Diversion Cues ({nlp.becIndicators?.length || 0})
              </div>
              {nlp.becIndicators?.length > 0 ? (
                <ul className="pl-4 text-xs text-slate-300 m-0 list-disc flex flex-col gap-0.5">
                  {nlp.becIndicators.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-500">No financial diversion cues detected.</span>
              )}
            </div>
          </div>

          {nlp.lookalikeDomains?.length > 0 && (
            <div className="bg-slate-950/60 p-3.5 rounded-md border border-slate-700">
              <div className="text-xs font-semibold text-rose-400 mb-2">
                Lookalike / Typosquatting Domains
              </div>
              {nlp.lookalikeDomains.map((l, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800 last:border-0">
                  <span>
                    <strong className="text-rose-300 font-mono">{l.domain}</strong>
                    <span className="text-slate-500 mx-1.5">spoofing</span>
                    <strong className="text-cyan-400 font-mono">{l.target}</strong>
                  </span>
                  <span className="badge badge-critical text-[10px]">
                    {l.technique}
                  </span>
                </div>
              ))}
            </div>
          )}

          {domainIntel && (
            <div className="bg-slate-950/60 p-3.5 rounded-md border border-slate-800 text-xs">
              <div className="text-xs font-semibold text-slate-200 mb-1.5">Domain WHOIS Intel</div>
              <div className="flex gap-5 text-slate-400 flex-wrap">
                <div>Domain: <strong className="text-slate-100">{domainIntel.domain}</strong></div>
                <div>Registrar: <strong className="text-slate-200">{domainIntel.registrar || 'Private'}</strong></div>
                <div>Age: <strong className={domainIntel.isRecentlyRegistered ? 'text-rose-400' : 'text-emerald-400'}>{domainIntel.ageDays} days</strong></div>
                <div>Reputation: <strong className={domainIntel.reputation === 'SAFE' ? 'text-emerald-400' : 'text-rose-400'}>{domainIntel.reputation}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: IOCs */}
      {activeTab === 'iocs' && iocs && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400">Extracted technical indicators (IPs, Domains, Hashes)</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => copyToClipboard(JSON.stringify(iocs, null, 2), 'iocs-json')}
                className="btn-secondary py-1 px-2.5 text-[11px] inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedSection === 'iocs-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                {copiedSection === 'iocs-json' ? 'Copied' : 'JSON'}
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
                className="btn-secondary py-1 px-2.5 text-[11px] inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedSection === 'iocs-csv' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                {copiedSection === 'iocs-csv' ? 'Copied' : 'CSV'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-md border border-slate-800">
              <div className="text-xs font-semibold text-cyan-400 mb-1.5">IPs ({iocs.ips?.length || 0})</div>
              {iocs.ips?.map((ip, i) => (
                <div key={i} className="text-[11px] font-mono text-slate-300">{ip}</div>
              ))}
            </div>

            <div className="bg-slate-950/60 p-3 rounded-md border border-slate-800">
              <div className="text-xs font-semibold text-purple-400 mb-1.5">Domains ({iocs.domains?.length || 0})</div>
              {iocs.domains?.map((dom, i) => (
                <div key={i} className="text-[11px] font-mono text-slate-300">{dom}</div>
              ))}
            </div>

            <div className="bg-slate-950/60 p-3 rounded-md border border-slate-800">
              <div className="text-xs font-semibold text-amber-400 mb-1.5">Hashes ({iocs.hashes?.length || 0})</div>
              {iocs.hashes?.map((h, i) => (
                <div key={i} className="text-[10px] font-mono text-slate-300 break-all">{h}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Raw Headers */}
      {activeTab === 'headers' && parsedEmail?.rawHeaders && (
        <div>
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950/60 py-1 px-2.5 rounded border border-slate-800">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                placeholder="Search headers..."
                className="bg-transparent border-0 outline-none text-slate-100 text-xs w-44"
              />
            </div>

            <button
              onClick={() => {
                const text = Object.entries(parsedEmail.rawHeaders).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('\n ') : v}`).join('\n');
                copyToClipboard(text, 'raw-headers');
              }}
              className="btn-secondary py-1 px-2.5 text-[11px] inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copiedSection === 'raw-headers' ? 'Copied' : 'Copy All'}
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded p-3 max-h-80 overflow-y-auto font-mono text-[11px] leading-relaxed">
            {Object.entries(parsedEmail.rawHeaders)
              .filter(([k, v]) => {
                if (!headerSearch) return true;
                const str = `${k} ${Array.isArray(v) ? v.join(' ') : v}`.toLowerCase();
                return str.includes(headerSearch.toLowerCase());
              })
              .map(([key, val], idx) => {
                const valStr = Array.isArray(val) ? val.join('\n  ') : val;
                const isHighlight = key.toLowerCase() === 'received' || key.toLowerCase().includes('auth');
                return (
                  <div key={idx} className="mb-1.5">
                    <span className={isHighlight ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>{key}: </span>
                    <span className="text-slate-300">{valStr}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 5: Chain of Custody */}
      {activeTab === 'custody' && chainOfCustody && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="bg-slate-950/60 p-3.5 rounded-md border border-slate-800 text-xs">
            <div className="font-semibold text-emerald-400 mb-2">Evidence Seal</div>
            <div>Evidence ID: <strong className="font-mono text-slate-100">{chainOfCustody.evidenceId}</strong></div>
            <div className="mt-1">SHA-256 Hash:</div>
            <code className="text-[10px] text-cyan-400 break-all block mt-0.5 bg-slate-900 p-1 rounded font-mono">
              {chainOfCustody.sha256IntegrityHash}
            </code>
            <div className="mt-1.5">Intake Time: <span className="text-slate-400">{chainOfCustody.intakeTimestamp}</span></div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-md border border-slate-800 text-xs">
            <div className="font-semibold text-cyan-400 mb-2">Handling Standards</div>
            <div>Analyst: <strong className="text-slate-100">{report.analyst}</strong></div>
            <div className="mt-1">Preservation: <span className="badge badge-safe text-[10px] ml-1">Read-Only Immutable</span></div>
            <div className="mt-1">Retention: <strong className="text-slate-100">365 Days (ISO 27037)</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
