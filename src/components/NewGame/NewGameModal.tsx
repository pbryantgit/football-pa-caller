import React, { useState } from 'react';
import { GameState, Team } from '../../types';
import { createInitialGameState } from '../../utils/sampleData';
import { Play, X } from 'lucide-react';

interface NewGameModalProps {
  teams: Record<string, Team>;
  onStartGame: (state: GameState) => void;
  onClose: () => void;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({ teams, onStartGame, onClose }) => {
  const teamKeys = Object.keys(teams);
  const [homeId, setHomeId] = useState(teamKeys[0] || 'spartans');
  const [awayId, setAwayId] = useState(teamKeys[1] || 'hornets');
  const [leftId, setLeftId] = useState(teamKeys[0] || 'spartans');
  const [possession, setPossession] = useState(teamKeys[0] || 'spartans');
  const [startYardLine, setStartYardLine] = useState(35);
  const [down, setDown] = useState<1 | 2 | 3 | 4>(1);
  const [distance, setDistance] = useState(10);
  const [quarter, setQuarter] = useState(1);

  const handleStart = () => {
    const rightId = leftId === homeId ? awayId : homeId;
    const newState: GameState = {
      ...createInitialGameState(homeId, awayId),
      leftFieldTeamId: leftId,
      rightFieldTeamId: rightId,
      possessionTeamId: possession,
      down,
      distance,
      quarter,
      ballPosition: {
        territoryTeamId: possession,
        yardLine: startYardLine,
        isMidfield: startYardLine === 50,
      },
    };
    onStartGame(newState);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>New Game Setup</h2>
          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Home Team</label>
              <select value={homeId} onChange={(e) => setHomeId(e.target.value)} style={{ width: '100%' }}>
                {Object.values(teams).map((t) => (
                  <option key={t.id} value={t.id}>{t.schoolName} {t.mascot}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Visiting Team</label>
              <select value={awayId} onChange={(e) => setAwayId(e.target.value)} style={{ width: '100%' }}>
                {Object.values(teams).map((t) => (
                  <option key={t.id} value={t.id}>{t.schoolName} {t.mascot}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Press Box Orientation (Left Side Team)</label>
            <select value={leftId} onChange={(e) => setLeftId(e.target.value)} style={{ width: '100%' }}>
              <option value={homeId}>{teams[homeId]?.mascot || 'Home Team'} on Left</option>
              <option value={awayId}>{teams[awayId]?.mascot || 'Visiting Team'} on Left</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Initial Possession</label>
            <select value={possession} onChange={(e) => setPossession(e.target.value)} style={{ width: '100%' }}>
              <option value={homeId}>{teams[homeId]?.mascot || 'Home Team'}</option>
              <option value={awayId}>{teams[awayId]?.mascot || 'Visiting Team'}</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Start Yard Line</label>
              <input type="number" min={1} max={50} value={startYardLine} onChange={(e) => setStartYardLine(parseInt(e.target.value) || 35)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Down</label>
              <select value={down} onChange={(e) => setDown(parseInt(e.target.value) as any)} style={{ width: '100%' }}>
                <option value={1}>1st Down</option>
                <option value={2}>2nd Down</option>
                <option value={3}>3rd Down</option>
                <option value={4}>4th Down</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Distance</label>
              <input type="number" min={1} max={99} value={distance} onChange={(e) => setDistance(parseInt(e.target.value) || 10)} style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleStart}>
            <Play size={16} />
            <span>Start Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
