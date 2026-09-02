import React, { useState } from 'react';
import { X, UploadCloud, FileText, Play } from 'lucide-react';
import { SampleScenario } from '../types';

interface SamplePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: SampleScenario[];
  onSelectSample: (id: string, analyst: string) => void;
  onUploadFile: (file: File, analyst: string) => void;
  onAnalyzeRaw: (raw: string, fileName: string, analyst: string) => void;
  isLoading: boolean;
}

export const SamplePickerModal: React.FC<SamplePickerModalProps> = ({
  isOpen,
  onClose,
  samples,
  onSelectSample,
  onUploadFile,
  onAnalyzeRaw,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'samples' | 'upload' | 'raw'>('samples');
  const [analystName, setAnalystName] = useState('SOC-Analyst-01');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('manual_investigation.eml');
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFile(e.dataTransfer.files[0], analystName);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFile(e.target.files[0], analystName);
    }
  };

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="panel" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '88vh',
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Investigate Email
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
              Select a test scenario, upload a .eml file, or paste raw email content.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Analyst input */}
        <div style={{ padding: '12px 20px', background: '#0d1321', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Investigator Name:</span>
          <input
            type="text"
            value={analystName}
            onChange={e => setAnalystName(e.target.value)}
            style={{
              background: '#111827',
              border: '1px solid #374151',
              borderRadius: '4px',
              padding: '4px 10px',
              color: '#f8fafc',
              fontSize: '12px',
              flex: 1
            }}
          />
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1f2937', background: '#0b0f19' }}>
          <button
            onClick={() => setActiveTab('samples')}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === 'samples' ? '#111827' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'samples' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'samples' ? '#f8fafc' : '#94a3b8',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Test Scenarios ({samples.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === 'upload' ? '#111827' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'upload' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'upload' ? '#f8fafc' : '#94a3b8',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Upload .EML File
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === 'raw' ? '#111827' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'raw' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'raw' ? '#f8fafc' : '#94a3b8',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Paste Raw Text
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '20px' }}>
          {activeTab === 'samples' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {samples.map(s => {
                const isCrit = s.expectedRisk.includes('CRITICAL') || s.expectedRisk.includes('HIGH');

                return (
                  <div
                    key={s.id}
                    className="panel panel-interactive"
                    style={{
                      padding: '12px 16px',
                      borderLeft: `3px solid ${isCrit ? '#ef4444' : '#10b981'}`
                    }}
                    onClick={() => !isLoading && onSelectSample(s.id, analystName)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#f8fafc' }}>
                        {s.title}
                      </span>
                      <span className={`badge ${isCrit ? 'badge-critical' : 'badge-safe'}`}>
                        {s.expectedRisk}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                      {s.description}
                    </p>
                    <div style={{ marginTop: '6px', textAlign: 'right', fontSize: '11px', color: '#38bdf8' }}>
                      Run Analysis →
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
              style={{
                border: `2px dashed ${dragOver ? '#2563eb' : '#374151'}`,
                borderRadius: '6px',
                padding: '36px 20px',
                textAlign: 'center',
                background: '#0d1321',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('eml-upload-input')?.click()}
            >
              <UploadCloud style={{ width: '36px', height: '36px', color: '#38bdf8', margin: '0 auto 10px' }} />
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                Drop raw .eml file here or click to browse
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Supports standard RFC 5322 MIME formats with automated SHA-256 evidence hashing
              </p>
              <input
                id="eml-upload-input"
                type="file"
                accept=".eml,.txt,.msg"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
            </div>
          )}

          {activeTab === 'raw' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>File Label:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d1321',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Raw Headers & Body:</label>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  rows={8}
                  placeholder={`From: user@domain.com\nSubject: Invoice\n\nContent...`}
                  style={{
                    width: '100%',
                    background: '#0d1321',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    color: '#f8fafc',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px'
                  }}
                />
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={isLoading || !rawText.trim()}
                onClick={() => onAnalyzeRaw(rawText, fileName, analystName)}
              >
                <Play style={{ width: '14px', height: '14px' }} />
                Execute Forensic Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
