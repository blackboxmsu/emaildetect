import React, { useState } from 'react';
import { X, Search, FolderArchive, ArrowUpRight, Calendar } from 'lucide-react';

export const CaseHistoryModal = ({
  isOpen,
  onClose,
  cases = [],
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
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[9999] p-4">
      <div className="panel w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-1.5 m-0">
              <FolderArchive className="w-4 h-4 text-cyan-400" />
              Case History & Management
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Archive of previously investigated email cases and campaigns.
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-0 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 px-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 bg-slate-900 py-1.5 px-2.5 rounded border border-slate-700">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Case ID, domain, threat, or subject..."
              className="bg-transparent border-0 outline-none text-slate-100 text-xs w-full"
            />
          </div>
        </div>

        {/* Cases List */}
        <div className="p-4 px-5 flex flex-col gap-2.5">
          {filteredCases.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
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
                  className={`panel panel-interactive p-3 px-3.5 border-l-4 rounded bg-slate-950/40 border border-slate-800 hover:border-slate-700 cursor-pointer transition ${
                    isCrit ? 'border-l-rose-500' : (isHigh ? 'border-l-amber-500' : 'border-l-emerald-500')
                  }`}
                  onClick={() => onSelectCase(c)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[11px] text-cyan-400 font-semibold">
                        {c.caseId}
                      </span>
                      <div className="text-xs font-semibold text-slate-100 mt-0.5">
                        {c.subject || c.parsedEmail?.subject || 'No Subject'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`badge ${isCrit ? 'badge-critical' : (isHigh ? 'badge-warning' : 'badge-safe')}`}>
                        Score: {score}/100
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                    <div>Threat: <span className="text-slate-200">{c.classification?.primaryThreat || 'Unclassified'}</span></div>
                    <div>Sender: <span className="text-slate-300 font-mono">{c.sender?.email || c.parsedEmail?.from?.address || 'Unknown'}</span></div>
                    {c.analyzedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
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
