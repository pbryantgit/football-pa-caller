import React, { useState } from 'react';
import { CSVImportResult, generateCSVTemplate, parseRosterCSV } from '../../utils/csvParser';
import { Player } from '../../types';
import { Upload, Download, AlertTriangle, X, Check } from 'lucide-react';

interface CSVImportModalProps {
  onClose: () => void;
  onImportPlayers: (players: Player[]) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ onClose, onImportPlayers }) => {
  const [csvText, setCsvText] = useState('');
  const [parseResult, setParseResult] = useState<CSVImportResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvText(content);
        const res = parseRosterCSV(content);
        setParseResult(res);
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (text: string) => {
    setCsvText(text);
    if (text.trim().length > 0) {
      setParseResult(parseRosterCSV(text));
    } else {
      setParseResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample-roster.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    if (parseResult && parseResult.players.length > 0) {
      onImportPlayers(parseResult.players);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>Import Roster from CSV</h2>
          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            <span>Upload CSV File</span>
            <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button className="btn btn-secondary" onClick={handleDownloadTemplate}>
            <Download size={16} />
            <span>Download CSV Template</span>
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Or paste CSV text directly here..."
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
        </div>

        {/* Validation & Warnings Preview */}
        {parseResult && (
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px' }}>
              Import Preview: {parseResult.players.length} valid player(s) found
            </div>

            {parseResult.warnings.length > 0 && (
              <div style={{ color: '#facc15', fontSize: '0.85rem', marginBottom: '8px' }}>
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                <strong>Warnings:</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                  {parseResult.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {parseResult.errors.length > 0 && (
              <div style={{ color: '#fca5a5', fontSize: '0.85rem' }}>
                <strong>Errors:</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                  {parseResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirmImport}
            disabled={!parseResult || parseResult.players.length === 0}
          >
            <Check size={16} />
            <span>Import {parseResult?.players.length || 0} Players</span>
          </button>
        </div>
      </div>
    </div>
  );
};
