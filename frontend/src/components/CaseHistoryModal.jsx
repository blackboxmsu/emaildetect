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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="panel w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-300 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
              <FolderArchive className="w-5 h-5 text-blue-600" />
              Case Management & History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Searchable archive of investigated email cases and campaigns (P7 Requirement).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 px-6 border-b border-slate-200 bg-slate-100/60">
          <div className="flex items-center gap-2 bg-white py-2 px-3 rounded-lg border border-slate-300 shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Case ID, subject, sender, or threat pattern..."
              className="bg-transparent border-0 outline-none text-slate-900 text-xs w-full"
            />
          </div>
        </div>

        {/* Cases List */}
        <div className="p-5 px-6 flex flex-col gap-3">
          {filteredCases.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No investigated cases found matching your search.
            </div>
          ) : (
            filteredCases.map(c => {
              const score = c.risk?.fraudScore ?? 0;
              const isCrit = score >= 70;
              const isHigh = score >= 40 && score < 70;

              return (
                <div
                  key={c.caseId}
                  className={`p-3.5 px-4 border rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition bg-white ${
                    isCrit ? 'border-l-4 border-l-red-500' : (isHigh ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500')
                  }`}
                  onClick={() => onSelectCase(c)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs text-blue-700 font-bold">
                        {c.caseId}
                      </span>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        {c.subject || c.parsedEmail?.subject || 'No Subject'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`badge ${isCrit ? 'badge-critical' : (isHigh ? 'badge-warning' : 'badge-safe')}`}>
                        Score: {score}/100
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 mt-2 flex-wrap">
                    <div>Threat: <strong className="text-slate-900">{c.classification?.primaryThreat || 'Unclassified'}</strong></div>
                    <div>Sender: <span className="text-slate-700 font-mono">{c.sender?.email || c.parsedEmail?.from?.address || 'Unknown'}</span></div>
                    {c.createdAt && (
                      <div className="text-slate-400 text-[11px] ml-auto">
                        {new Date(c.createdAt).toLocaleDateString()}
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
