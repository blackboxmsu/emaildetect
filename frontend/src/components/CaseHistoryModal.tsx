import React, { useState } from 'react';
import { X, Search, FolderArchive, ArrowUpRight, Calendar } from 'lucide-react';

interface CaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: any[];
  onSelectCase: (caseItem: any) => void;
}

export const CaseHistoryModal: React.FC<CaseHistoryModalProps> = ({
  isOpen,
  onClose,
  cases,
  onSelectCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCases = cases.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const caseId = (c.caseId || '').toLowerCase();
    const subj = (c.subject || '').toLowerCase();
    const sender = (c.sender?.email || c.parsedEmail?.from?.address || '').toLowerCase();
    const threat = (c.classification?.primaryThreat || '').toLowerCase();
    return caseId.includes(term) || subj.includes(term) || sender.includes(term) || threat.includes(term);
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      padding: '20px'
    }}>
      <div className="panel" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '85vh',
        overflowY: 'auto',
        background: '#111827',
        borderRadius: '8px',
        border: '1px solid #374151'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <FolderArchive style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
              Case History & Management
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
              Archive of previously investigated email cases and campaigns.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #1f2937', background: '#0d1321' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111827', padding: '6px 10px', borderRadius: '4px', border: '1px solid #374151' }}>
            <Search style={{ width: '14px', height: '14px', color: '#64748b' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Case ID, domain, threat, or subject..."
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '12px', width: '100%' }}
            />
          </div>
        </div>

        {/* Cases List */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredCases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b', fontSize: '12px' }}>
              No cases recorded yet.
            </div>
          ) : (
            filteredCases.map(c => {
              const score = c.risk?.fraudScore ?? 0;
              const isCrit = score >= 70;
              const isHigh = score >= 40 && score < 70;

              return (
                <div
                  key={c.caseId}
                  className="panel panel-interactive"
                  onClick={() => onSelectCase(c)}
                  style={{
                    padding: '12px 14px',
                    borderLeft: `3px solid ${isCrit ? '#ef4444' : (isHigh ? '#f59e0b' : '#10b981')}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                        {c.caseId}
                      </span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                        {c.subject || c.parsedEmail?.subject || 'No Subject'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`badge ${isCrit ? 'badge-critical' : (isHigh ? 'badge-warning' : 'badge-safe')}`}>
                        Score: {score}/100
                      </span>
                      <ArrowUpRight style={{ width: '14px', height: '14px', color: '#64748b' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#64748b', marginTop: '6px', flexWrap: 'wrap' }}>
                    <div>Threat: <span style={{ color: '#cbd5e1' }}>{c.classification?.primaryThreat || 'Unclassified'}</span></div>
                    <div>Sender: <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{c.sender?.email || c.parsedEmail?.from?.address || 'Unknown'}</span></div>
                    {c.analyzedAt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar style={{ width: '11px', height: '11px' }} />
                        <span>{new Date(c.analyzedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
