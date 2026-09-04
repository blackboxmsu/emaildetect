import React, { useState } from 'react';
import { X, UploadCloud, Play, FileText, CheckCircle2 } from 'lucide-react';

export const SamplePickerModal = ({
  isOpen,
  onClose,
  samples = [],
  onSelectSample,
  onUploadFile,
  onAnalyzeRaw,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState('samples');
  const [analystName, setAnalystName] = useState('SOC-Analyst-01');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('manual_investigation.eml');
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFile(e.dataTransfer.files[0], analystName);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFile(e.target.files[0], analystName);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="panel w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-slate-300 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 m-0">
              Investigate Email
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a benchmark test scenario, upload a .eml file, or paste raw RFC 5322 text.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Analyst input */}
        <div className="p-3 px-6 bg-slate-100/70 border-b border-slate-200 flex items-center gap-3">
          <span className="text-xs font-medium text-slate-600">Investigator Name:</span>
          <input
            type="text"
            value={analystName}
            onChange={e => setAnalystName(e.target.value)}
            className="bg-white border border-slate-300 rounded py-1 px-3 text-slate-900 text-xs flex-1 outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'samples'
                ? 'bg-white border-blue-600 text-blue-600 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Benchmark Scenarios ({samples.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'upload'
                ? 'bg-white border-blue-600 text-blue-600 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload .EML File
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'raw'
                ? 'bg-white border-blue-600 text-blue-600 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Paste Raw Text
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'samples' && (
            <div className="flex flex-col gap-3">
              {samples.map(s => {
                const isCrit = s.expectedRisk.includes('CRITICAL') || s.expectedRisk.includes('HIGH');

                return (
                  <div
                    key={s.id}
                    className={`p-3.5 px-4 border rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition bg-white ${
                      isCrit ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-emerald-500'
                    }`}
                    onClick={() => !isLoading && onSelectSample(s.id, analystName)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">
                        {s.title}
                      </span>
                      <span className={`badge ${isCrit ? 'badge-critical' : 'badge-safe'}`}>
                        {s.expectedRisk}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 m-0 leading-relaxed">
                      {s.description}
                    </p>
                    <div className="mt-2 text-right text-xs text-blue-600 font-bold flex items-center justify-end gap-1">
                      Run Forensics Analysis ➔
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'upload' && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
                dragOver ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 bg-slate-50'
              }`}
              onClick={() => document.getElementById('eml-upload-input')?.click()}
            >
              <UploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-900 mb-1">
                Drop raw .eml file here or click to browse
              </div>
              <p className="text-xs text-slate-500 m-0">
                Supports standard RFC 5322 MIME formats (.eml, .txt, .msg)
              </p>
              <input
                id="eml-upload-input"
                type="file"
                accept=".eml,.txt,.msg"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          )}

          {activeTab === 'raw' && (
            <div>
              <div className="mb-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Investigation Evidence Label:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded py-2 px-3 text-slate-900 text-xs outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Raw RFC 5322 Headers & Body Text:</label>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  rows={8}
                  placeholder="Paste complete raw email headers and body starting with 'Received: from...' or 'From:...'"
                  className="w-full bg-white border border-slate-300 rounded p-3 text-slate-900 font-mono text-xs outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
              <div className="text-right">
                <button
                  onClick={() => onAnalyzeRaw(rawText, fileName, analystName)}
                  disabled={!rawText.trim() || isLoading}
                  className="btn-primary py-2 px-5 text-xs font-bold disabled:opacity-50"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Raw Content'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
