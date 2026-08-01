import React from 'react';
import { PlayRecord, Team } from '../../types';
import { X, FileText } from 'lucide-react';

interface HistoryDrawerProps {
  history: PlayRecord[];
  teams: Record<string, Team>;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ history, teams, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>Play History Log ({history.length})</h2>
          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No plays committed yet in this game.
            </div>
          ) : (
            [...history].reverse().map((play) => (
              <div
                key={play.id}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 800, color: '#93c5fd' }}>Play #{play.sequence}</span>
                  <span>Q{play.startState.quarter} • {play.startState.clock}</span>
                  <span>
                    Score: {teams[play.startState.homeTeamId]?.abbreviation} {play.endState.homeScore} - {play.endState.awayScore} {teams[play.startState.awayTeamId]?.abbreviation}
                  </span>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f3f4f6' }}>
                  {play.editedAnnouncement || play.announcement}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
