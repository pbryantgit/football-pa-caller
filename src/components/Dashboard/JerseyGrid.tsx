import React from 'react';
import { Player, Team } from '../../types';

interface JerseyGridProps {
  title: string;
  team: Team;
  selectedPrimaryId?: string;
  selectedAssistIds?: string[];
  onSelectPlayer: (player: Player) => void;
  allowAssists?: boolean;
}

export const JerseyGrid: React.FC<JerseyGridProps> = ({
  title,
  team,
  selectedPrimaryId,
  selectedAssistIds = [],
  onSelectPlayer,
}) => {
  // Sort active players in ascending numerical order
  const activePlayers = [...team.roster]
    .filter((p) => p.active)
    .sort((a, b) => {
      const numA = parseInt(a.jerseyNumber, 10) || 0;
      const numB = parseInt(b.jerseyNumber, 10) || 0;
      return numA - numB;
    });

  return (
    <div className="jersey-grid-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="section-title" style={{ color: team.jerseyColor === '#18181b' ? '#facc15' : 'white' }}>
          {title} ({team.shortName || team.mascot})
        </span>
        {selectedPrimaryId && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tap selected again to clear
          </span>
        )}
      </div>

      <div className="jersey-grid">
        {activePlayers.map((player) => {
          const isPrimary = selectedPrimaryId === player.id;
          const isAssist = selectedAssistIds.includes(player.id);

          return (
            <button
              key={player.id}
              className={`jersey-num-btn ${isPrimary ? 'selected-primary' : isAssist ? 'selected-assist' : ''}`}
              onClick={() => onSelectPlayer(player)}
              title={`${player.displayName} (${player.position || 'Player'})`}
            >
              {team.defaultQuarterbackPlayerId === player.id && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#3b82f6', color: 'white', fontSize: '0.55rem', fontWeight: 800, padding: '2px 4px', borderRadius: '4px', border: '1px solid white', zIndex: 1 }}>
                  QB
                </span>
              )}
              <span>{player.jerseyNumber}</span>
              <span className="sub-name">{player.lastName || player.displayName.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
