import React, { useState } from 'react';
import { GameState, Player, Team } from '../../types';
import { X, Trash2 } from 'lucide-react';

interface SpotterBoardModalProps {
  gameState: GameState;
  teams: Record<string, Team>;
  onClose: () => void;
}

export const SpotterBoardModal: React.FC<SpotterBoardModalProps> = ({ gameState, teams, onClose }) => {
  const homeTeam = teams[gameState.homeTeamId];
  const awayTeam = teams[gameState.awayTeamId];

  // Keep track of selected player IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const getPlayerDetails = (id: string): { player: Player, team: Team } | null => {
    let p = homeTeam.roster.find((pl) => pl.id === id);
    if (p) return { player: p, team: homeTeam };
    p = awayTeam.roster.find((pl) => pl.id === id);
    if (p) return { player: p, team: awayTeam };
    return null;
  };

  const selectedPlayers = selectedIds
    .map(id => getPlayerDetails(id))
    .filter((res): res is {player: Player, team: Team} => res !== null)
    .sort((a, b) => {
      // Left team always on top
      const isALeft = a.team.id === gameState.leftFieldTeamId;
      const isBLeft = b.team.id === gameState.leftFieldTeamId;
      
      if (isALeft && !isBLeft) return -1;
      if (!isALeft && isBLeft) return 1;
      
      // If they are on the same team, sort numerically
      const numA = parseInt(a.player.jerseyNumber, 10) || 0;
      const numB = parseInt(b.player.jerseyNumber, 10) || 0;
      return numA - numB;
    });

  const renderGrid = (team: Team) => {
    const activePlayers = [...team.roster]
      .filter((p) => p.active)
      .sort((a, b) => (parseInt(a.jerseyNumber, 10) || 0) - (parseInt(b.jerseyNumber, 10) || 0));

    return (
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h3 style={{ marginBottom: '12px', borderBottom: `2px solid ${team.jerseyColor}`, paddingBottom: '8px' }}>
          {team.schoolName} ({team.mascot})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: '8px' }}>
          {activePlayers.map(player => {
            const isSelected = selectedIds.includes(player.id);
            return (
              <button
                key={player.id}
                onClick={() => togglePlayer(player.id)}
                style={{
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  background: isSelected ? '#2563eb' : 'rgba(255, 255, 255, 0.07)',
                  border: isSelected ? '1px solid #60a5fa' : '1px solid var(--border-color)',
                  color: isSelected ? 'white' : 'var(--text-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 0 12px rgba(59, 130, 246, 0.6)' : 'none'
                }}
              >
                <span>{player.jerseyNumber}</span>
              </button>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-content glass-panel" style={{ maxWidth: '1200px', height: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>
            Spotter Board (Quick View)
          </h2>
          <button className="btn btn-secondary" onClick={onClose}>
            <X size={20} />
            <span>Close</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
          
          {/* Left Column: Selected Players Info */}
          <div style={{ width: '350px', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Selected Players</h3>
              {selectedPlayers.length > 0 && (
                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => setSelectedIds([])}>
                  <Trash2 size={14} /> Clear All
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedPlayers.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px', fontStyle: 'italic' }}>
                  Tap numbers on the right to view player info here.
                </div>
              ) : (
                selectedPlayers.map(({ player, team }) => (
                  <div key={player.id} style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    borderLeft: `4px solid ${team.jerseyColor}`, 
                    padding: '12px', 
                    borderRadius: '4px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: team.jerseyColor === '#18181b' ? '#facc15' : team.jerseyColor }}>
                        #{player.jerseyNumber}
                      </span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        {player.displayName}
                      </span>
                    </div>
                    {player.phoneticPronunciation && (
                      <div style={{ color: '#60a5fa', fontSize: '0.95rem', marginBottom: '4px', fontStyle: 'italic' }}>
                        "{player.phoneticPronunciation}"
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Pos: <strong>{player.position || 'N/A'}</strong></span>
                      <span>{team.mascot}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Number Grids */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
            {renderGrid(teams[gameState.leftFieldTeamId])}
            <div style={{ height: '1px', width: '100%', background: 'var(--border-color)' }}></div>
            {renderGrid(teams[gameState.rightFieldTeamId])}
          </div>
          
        </div>
      </div>
    </div>
  );
};
