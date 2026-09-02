import React, { useState } from 'react';
import { X, UploadCloud, Play } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="panel w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100 m-0">
              Investigate Email
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a benchmark test scenario, upload a .eml file, or paste raw RFC 5322 content.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="bg-transparent border-0 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Analyst input */}
        <div className="p-3 px-5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2.5">
          <span className="text-xs text-slate-400">Investigator Name:</span>
          <input
            type="text"
            value={analystName}
            onChange={e => setAnalystName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded py-1 px-2.5 text-slate-100 text-xs flex-1 outline-none focus:border-blue-500"
          />
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950">
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition ${
              activeTab === 'samples'
                ? 'bg-slate-900 border-blue-500 text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Test Scenarios ({samples.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition ${
              activeTab === 'upload'
                ? 'bg-slate-900 border-blue-500 text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload .EML File
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition ${
              activeTab === 'raw'
                ? 'bg-slate-900 border-blue-500 text-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Raw Text
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'samples' && (
            <div className="flex flex-col gap-2.5">
              {samples.map(s => {
                const isCrit = s.expectedRisk.includes('CRITICAL') || s.expectedRisk.includes('HIGH');

                return (
                  <div
                    key={s.id}
                    className={`panel panel-interactive p-3 px-4 border-l-4 rounded bg-slate-950/40 border border-slate-800 hover:border-slate-700 cursor-pointer transition ${
                      isCrit ? 'border-l-rose-500' : 'border-l-emerald-500'
                    }`}
                    onClick={() => !isLoading && onSelectSample(s.id, analystName)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-100">
                        {s.title}
                      </span>
                      <span className={`badge ${isCrit ? 'badge-critical' : 'badge-safe'}`}>
                        {s.expectedRisk}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 m-0">
                      {s.description}
                    </p>
                    <div className="mt-1.5 text-right text-[11px] text-cyan-400 font-medium">
                      Run Forensics Pipeline →
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
              className={`border-2 border-dashed rounded-lg p-9 text-center bg-slate-950/60 cursor-pointer transition ${
                dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => document.getElementById('eml-upload-input')?.click()}
            >
              <UploadCloud className="w-9 h-9 text-cyan-400 mx-auto mb-2.5" />
              <div className="text-xs font-semibold text-slate-100 mb-1">
                Drop raw .eml file here or click to browse
              </div>
              <p className="text-xs text-slate-500 m-0">
                Supports RFC 5322 MIME formats with automated SHA-256 evidence integrity hashing
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
              <div className="mb-2.5">
                <label className="text-xs text-slate-400 block mb-1">File Label:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded py-1.5 px-2.5 text-slate-100 text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div className="mb-3.5">
                <label className="text-xs text-slate-400 block mb-1">Raw Headers & Body:</label>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  rows={8}
                  placeholder={`From: user@domain.com\nSubject: Invoice\n\nContent...`}
                  className="w-full bg-slate-950/60 border border-slate-700 rounded p-2 text-slate-100 font-mono text-[11px] outline-none focus:border-blue-500"
                />
              </div>
              <button
                className="btn-primary w-full justify-center py-2 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition"
                disabled={isLoading || !rawText.trim()}
                onClick={() => onAnalyzeRaw(rawText, fileName, analystName)}
              >
                <Play className="w-3.5 h-3.5" />
                Execute Forensic Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
