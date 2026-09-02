import React, { useState } from 'react';
import { ShieldCheck, Cpu, Hash, Terminal, Award, Copy, Check, Search } from 'lucide-react';
import { AnalysisReport } from '../types';

interface ForensicsTabsProps {
  report: AnalysisReport;
  privacyMode: boolean;
}

export const ForensicsTabs: React.FC<ForensicsTabsProps> = ({ report, privacyMode }) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'nlp' | 'iocs' | 'headers' | 'custody'>('auth');
  const [headerSearch, setHeaderSearch] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const { authentication, nlp, headers, parsedEmail, iocs, chainOfCustody, domainIntel } = report;

  const maskEmail = (email?: string) => {
    if (!email || !privacyMode) return email || '';
    const parts = email.split('@');
    if (parts.length !== 2) return '***@***';
    return `${parts[0].slice(0, 2)}***@${parts[1]}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="panel" style={{ padding: '20px', marginBottom: '20px' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1f2937', gap: '4px', overflowX: 'auto', marginBottom: '18px' }}>
        <button
          onClick={() => setActiveTab('auth')}
          style={{
            padding: '8px 14px',
            background: activeTab === 'auth' ? '#1e293b' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'auth' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'auth' ? '#f8fafc' : '#94a3b8',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <ShieldCheck style={{ width: '14px', height: '14px' }} />
          Protocol Authentication (SPF / DKIM / DMARC)
        </button>

        <button
          onClick={() => setActiveTab('nlp')}
          style={{
            padding: '8px 14px',
            background: activeTab === 'nlp' ? '#1e293b' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'nlp' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'nlp' ? '#f8fafc' : '#94a3b8',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Cpu style={{ width: '14px', height: '14px' }} />
          NLP & Social Engineering
        </button>

        <button
          onClick={() => setActiveTab('iocs')}
          style={{
            padding: '8px 14px',
            background: activeTab === 'iocs' ? '#1e293b' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'iocs' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'iocs' ? '#f8fafc' : '#94a3b8',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Hash style={{ width: '14px', height: '14px' }} />
          IOCs Table
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          style={{
            padding: '8px 14px',
            background: activeTab === 'headers' ? '#1e293b' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'headers' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'headers' ? '#f8fafc' : '#94a3b8',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Terminal style={{ width: '14px', height: '14px' }} />
          Raw Headers
        </button>

        <button
          onClick={() => setActiveTab('custody')}
          style={{
            padding: '8px 14px',
            background: activeTab === 'custody' ? '#1e293b' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'custody' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'custody' ? '#f8fafc' : '#94a3b8',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Award style={{ width: '14px', height: '14px' }} />
          Chain of Custody
        </button>
      </div>

      {/* Tab 1: Protocol Authentication */}
      {activeTab === 'auth' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div style={{ background: '#0d1321', border: '1px solid #1f2937', borderRadius: '6px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc' }}>SPF (Sender Policy)</span>
                <span className={`badge ${authentication.spf.pass ? 'badge-safe' : (authentication.spf.status === 'SOFTFAIL' ? 'badge-warning' : 'badge-critical')}`}>
                  {authentication.spf.status}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                {authentication.spf.details}
              </p>
              {authentication.spf.ipChecked && (
                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                  IP: {authentication.spf.ipChecked}
                </div>
              )}
            </div>

            <div style={{ background: '#0d1321', border: '1px solid #1f2937', borderRadius: '6px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc' }}>DKIM Signature</span>
                <span className={`badge ${authentication.dkim.pass ? 'badge-safe' : (authentication.dkim.status === 'NONE' ? 'badge-warning' : 'badge-critical')}`}>
                  {authentication.dkim.status}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                {authentication.dkim.details}
              </p>
              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                Aligned: {authentication.dkim.alignment ? 'YES' : 'NO'}
              </div>
            </div>

            <div style={{ background: '#0d1321', border: '1px solid #1f2937', borderRadius: '6px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc' }}>DMARC Policy</span>
                <span className={`badge ${authentication.dmarc.pass ? 'badge-safe' : 'badge-critical'}`}>
                  {authentication.dmarc.status}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                {authentication.dmarc.details}
              </p>
              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                Policy: {authentication.dmarc.policy || 'quarantine'}
              </div>
            </div>
          </div>

          {/* Alignment Details */}
          <div style={{ background: '#0d1321', borderRadius: '6px', padding: '14px', border: '1px solid #1f2937' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '10px' }}>
              Identity Alignment Verification
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b' }}>From:</span>
                <div style={{ color: '#f8fafc', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                  {maskEmail(parsedEmail.from.address)}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Return-Path:</span>
                <div style={{ color: headers.returnPathMismatch ? '#f87171' : '#f8fafc', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                  {maskEmail(parsedEmail.returnPath) || '(None)'}
                  {headers.returnPathMismatch && ' (Mismatch)'}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Reply-To:</span>
                <div style={{ color: headers.replyToMismatch ? '#f87171' : '#f8fafc', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                  {maskEmail(parsedEmail.replyTo?.address) || '(Same as From)'}
                  {headers.replyToMismatch && ' (Foreign domain)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: NLP & Social Engineering */}
      {activeTab === 'nlp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#0d1321', padding: '14px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fbbf24', marginBottom: '6px' }}>
                Urgency & Pressure Cues ({nlp.urgencyCues.length})
              </div>
              {nlp.urgencyCues.length > 0 ? (
                <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                  {nlp.urgencyCues.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontSize: '12px', color: '#64748b' }}>No urgency cues detected.</span>
              )}
            </div>

            <div style={{ background: '#0d1321', padding: '14px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f87171', marginBottom: '6px' }}>
                BEC Financial Diversion Cues ({nlp.becIndicators.length})
              </div>
              {nlp.becIndicators.length > 0 ? (
                <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                  {nlp.becIndicators.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontSize: '12px', color: '#64748b' }}>No financial diversion cues detected.</span>
              )}
            </div>
          </div>

          {nlp.lookalikeDomains.length > 0 && (
            <div style={{ background: '#0d1321', padding: '14px', borderRadius: '6px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f87171', marginBottom: '8px' }}>
                Lookalike / Typosquatting Domains
              </div>
              {nlp.lookalikeDomains.map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #1f2937' }}>
                  <span>
                    <strong style={{ color: '#fca5a5', fontFamily: 'var(--font-mono)' }}>{l.domain}</strong>
                    <span style={{ color: '#64748b', margin: '0 6px' }}>spoofing</span>
                    <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{l.target}</strong>
                  </span>
                  <span className="badge badge-critical" style={{ fontSize: '10px' }}>
                    {l.technique}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#0d1321', padding: '14px', borderRadius: '6px', border: '1px solid #1f2937', fontSize: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>Domain WHOIS Intel</div>
            <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', flexWrap: 'wrap' }}>
              <div>Domain: <strong style={{ color: '#f8fafc' }}>{domainIntel.domain}</strong></div>
              <div>Registrar: <strong style={{ color: '#cbd5e1' }}>{domainIntel.registrar || 'Private'}</strong></div>
              <div>Age: <strong style={{ color: domainIntel.isRecentlyRegistered ? '#f87171' : '#34d399' }}>{domainIntel.ageDays} days</strong></div>
              <div>Reputation: <strong style={{ color: domainIntel.reputation === 'SAFE' ? '#34d399' : '#f87171' }}>{domainIntel.reputation}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: IOCs */}
      {activeTab === 'iocs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Extracted technical indicators (IPs, Domains, Hashes)</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => copyToClipboard(JSON.stringify(iocs, null, 2), 'iocs-json')}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                {copiedSection === 'iocs-json' ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
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
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                {copiedSection === 'iocs-csv' ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                {copiedSection === 'iocs-csv' ? 'Copied' : 'CSV'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#0d1321', padding: '12px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', marginBottom: '6px' }}>IPs ({iocs.ips.length})</div>
              {iocs.ips.map((ip, i) => (
                <div key={i} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>{ip}</div>
              ))}
            </div>

            <div style={{ background: '#0d1321', padding: '12px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', marginBottom: '6px' }}>Domains ({iocs.domains.length})</div>
              {iocs.domains.map((dom, i) => (
                <div key={i} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>{dom}</div>
              ))}
            </div>

            <div style={{ background: '#0d1321', padding: '12px', borderRadius: '6px', border: '1px solid #1f2937' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24', marginBottom: '6px' }}>Hashes ({iocs.hashes.length})</div>
              {iocs.hashes.map((h, i) => (
                <div key={i} style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#cbd5e1', wordBreak: 'break-all' }}>{h}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Raw Headers */}
      {activeTab === 'headers' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0d1321', padding: '4px 10px', borderRadius: '4px', border: '1px solid #1f2937' }}>
              <Search style={{ width: '13px', height: '13px', color: '#64748b' }} />
              <input
                type="text"
                value={headerSearch}
                onChange={e => setHeaderSearch(e.target.value)}
                placeholder="Search headers..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '12px', width: '180px' }}
              />
            </div>

            <button
              onClick={() => {
                const text = Object.entries(parsedEmail.rawHeaders).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('\n ') : v}`).join('\n');
                copyToClipboard(text, 'raw-headers');
              }}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              {copiedSection === 'raw-headers' ? 'Copied' : 'Copy All'}
            </button>
          </div>

          <div style={{
            background: '#0d1321',
            border: '1px solid #1f2937',
            borderRadius: '4px',
            padding: '12px',
            maxHeight: '340px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            lineHeight: '1.5'
          }}>
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
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <span style={{ color: isHighlight ? '#38bdf8' : '#64748b' }}>{key}: </span>
                    <span style={{ color: '#cbd5e1' }}>{valStr}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 5: Chain of Custody */}
      {activeTab === 'custody' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#0d1321', padding: '14px', borderRadius: '6px', border: '1px solid #1f2937', fontSize: '12px' }}>
            <div style={{ fontWeight: 600, color: '#34d399', marginBottom: '8px' }}>Evidence Seal</div>
            <div>Evidence ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{chainOfCustody.evidenceId}</strong></div>
            <div style={{ marginTop: '4px' }}>SHA-256 Hash:</div>
            <code style={{ fontSize: '10px', color: '#38bdf8', wordBreak: 'break-all', display: 'block', marginTop: '2px' }}>
              {chainOfCustody.sha256IntegrityHash}
            </code>
            <div style={{ marginTop: '6px' }}>Intake Time: <span style={{ color: '#94a3b8' }}>{chainOfCustody.intakeTimestamp}</span></div>
          </div>

          <div style={{ background: '#0d1321', padding: '14px', borderRadius: '6px', border: '1px solid #1f2937', fontSize: '12px' }}>
            <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '8px' }}>Handling Standards</div>
            <div>Analyst: <strong>{report.analyst}</strong></div>
            <div style={{ marginTop: '4px' }}>Preservation: <span className="badge badge-safe" style={{ fontSize: '10px' }}>Read-Only Immutable</span></div>
            <div style={{ marginTop: '4px' }}>Retention: <strong>365 Days (ISO 27037)</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
