import React, { useState } from 'react';
import { GameState, Team } from '../../types';
import { formatFieldPosition } from '../../utils/fieldMath';
import { Volume2, Settings as SettingsIcon, History, Shield, Users, RotateCcw, Edit2, Check, ArrowRightLeft } from 'lucide-react';

interface HeaderProps {
  gameState: GameState;
  teams: Record<string, Team>;
  onUpdateGameState: (state: GameState) => void;
  onOpenNewGame: () => void;
  onOpenRoster: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onUndoLastPlay: () => void;
  canUndo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  teams,
  onUpdateGameState,
  onOpenNewGame,
  onOpenRoster,
  onOpenHistory,
  onOpenSettings,
  onUndoLastPlay,
  canUndo,
}) => {
  const homeTeam = teams[gameState.homeTeamId];
  const awayTeam = teams[gameState.awayTeamId];

  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editHomeScore, setEditHomeScore] = useState(gameState.homeScore);
  const [editAwayScore, setEditAwayScore] = useState(gameState.awayScore);

  const isHomePossession = gameState.possessionTeamId === gameState.homeTeamId;

  const handleTogglePossession = (targetTeamId: string) => {
    onUpdateGameState({
      ...gameState,
      possessionTeamId: targetTeamId,
    });
  };

  const handleSwitchFieldSides = () => {
    onUpdateGameState({
      ...gameState,
      leftFieldTeamId: gameState.rightFieldTeamId,
      rightFieldTeamId: gameState.leftFieldTeamId,
    });
  };

  const handleSaveScores = () => {
    onUpdateGameState({
      ...gameState,
      homeScore: editHomeScore,
      awayScore: editAwayScore,
    });
    setIsEditingScores(false);
  };

  const handleQuarterChange = (q: number) => {
    onUpdateGameState({
      ...gameState,
      quarter: q,
    });
  };

  const handleDownChange = (d: 1 | 2 | 3 | 4) => {
    onUpdateGameState({
      ...gameState,
      down: d,
    });
  };

  const handleDistanceChange = (dist: number) => {
    onUpdateGameState({
      ...gameState,
      distance: Math.max(1, dist),
    });
  };

  const ballPosStr = formatFieldPosition(gameState.ballPosition, teams);
  const leftTeam = teams[gameState.leftFieldTeamId];
  const rightTeam = teams[gameState.rightFieldTeamId];

  return (
    <header className="glass-panel" style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div className="brand-title">
          <Volume2 size={24} color="#3b82f6" />
          <span>PA PLAY CALLER</span>
        </div>

        <div className="nav-controls">
          {/* Switch Field Sides Button */}
          <button className="btn btn-secondary" onClick={handleSwitchFieldSides} title="Switch Press Box Field Sides (e.g. Quarter Change / Halftime)">
            <ArrowRightLeft size={16} color="#60a5fa" />
            <span>Switch Sides ⇄</span>
          </button>

          <button className="btn btn-secondary" onClick={onUndoLastPlay} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.4 }}>
            <RotateCcw size={16} />
            <span>Undo Last</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenRoster}>
            <Users size={16} />
            <span>Rosters</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenHistory}>
            <History size={16} />
            <span>History</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenSettings}>
            <SettingsIcon size={16} />
            <span>Settings</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenNewGame}>
            <Shield size={16} />
            <span>New Game</span>
          </button>
        </div>
      </div>

      <div className="game-header-bar" style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '12px', padding: '12px 16px' }}>
        {/* Home Team Card (Click to give Possession!) */}
        <div
          className="team-header-card"
          onClick={() => handleTogglePossession(gameState.homeTeamId)}
          style={{
            cursor: 'pointer',
            border: isHomePossession ? '2px solid #3b82f6' : '1px solid transparent',
            boxShadow: isHomePossession ? '0 0 12px rgba(59, 130, 246, 0.4)' : undefined,
            transition: 'all 0.15s ease',
          }}
          title="Click to set Possession to Home Team"
        >
          <div
            className="jersey-badge"
            style={{
              backgroundColor: homeTeam?.jerseyColor || '#1e3a8a',
              color: homeTeam?.jerseyTextColor || '#ffffff',
            }}
          >
            {homeTeam?.abbreviation || 'HM'}
          </div>
          <div className="team-info">
            <div className="team-name">
              {homeTeam?.shortName || homeTeam?.mascot || 'Home'}
              {isHomePossession ? (
                <span className="pill pill-active" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
                  OFFENSE 🏈
                </span>
              ) : (
                <span className="pill" style={{ marginLeft: '8px', fontSize: '0.65rem', opacity: 0.6 }}>
                  DEFENSE
                </span>
              )}
            </div>
            <div className="school-name">{homeTeam?.schoolName}</div>
          </div>
          {isEditingScores ? (
            <input
              type="number"
              value={editHomeScore}
              onChange={(e) => setEditHomeScore(parseInt(e.target.value, 10) || 0)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '54px', fontSize: '1.4rem', fontWeight: 900, textAlign: 'center' }}
            />
          ) : (
            <div className="team-score">{gameState.homeScore}</div>
          )}
        </div>

        {/* Center Game State & Quick Toggles */}
        <div className="center-game-status">
          <div className="status-pills" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* Quarter Selector Pill */}
            <select
              value={gameState.quarter}
              onChange={(e) => handleQuarterChange(parseInt(e.target.value, 10))}
              style={{ padding: '2px 8px', fontSize: '0.8rem', fontWeight: 800, borderRadius: '12px' }}
            >
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
              <option value={3}>Q3</option>
              <option value={4}>Q4</option>
              <option value={5}>OT</option>
            </select>

            <span className="pill">{gameState.clock}</span>

            {/* Score Edit Button */}
            {isEditingScores ? (
              <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={handleSaveScores}>
                <Check size={12} /> Save Score
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                style={{ padding: '2px 6px', fontSize: '0.7rem', opacity: 0.8 }}
                onClick={() => {
                  setEditHomeScore(gameState.homeScore);
                  setEditAwayScore(gameState.awayScore);
                  setIsEditingScores(true);
                }}
              >
                <Edit2 size={12} /> Score
              </button>
            )}
          </div>

          {/* Down & Distance Quick Selector */}
          <div className="down-distance-display" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={gameState.down}
              onChange={(e) => handleDownChange(parseInt(e.target.value, 10) as any)}
              style={{ background: 'transparent', border: 'none', color: '#facc15', fontSize: '1.4rem', fontWeight: 900, cursor: 'pointer' }}
            >
              <option value={1} style={{ background: '#1e293b' }}>1st</option>
              <option value={2} style={{ background: '#1e293b' }}>2nd</option>
              <option value={3} style={{ background: '#1e293b' }}>3rd</option>
              <option value={4} style={{ background: '#1e293b' }}>4th</option>
            </select>
            <span>&amp;</span>
            <input
              type="number"
              min={0}
              max={99}
              value={gameState.distance}
              onChange={(e) => handleDistanceChange(parseInt(e.target.value, 10) || 10)}
              style={{ width: '50px', background: 'transparent', border: 'none', borderBottom: '1px solid #facc15', color: '#facc15', fontSize: '1.4rem', fontWeight: 900, textAlign: 'center' }}
            />
          </div>

          {/* ONE-TAP POSSESSION SWITCHER & SIDE SWITCHER BAR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <button
              className={`btn ${isHomePossession ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 800 }}
              onClick={() => handleTogglePossession(gameState.homeTeamId)}
            >
              🏈 {homeTeam?.shortName || homeTeam?.mascot}
            </button>

            <button
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)' }}
              onClick={handleSwitchFieldSides}
              title={`Left: ${leftTeam?.shortName || 'Left'} | Right: ${rightTeam?.shortName || 'Right'}. Tap to switch sides!`}
            >
              <ArrowRightLeft size={12} />
              <span>Switch Sides</span>
            </button>

            <button
              className={`btn ${!isHomePossession ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 800 }}
              onClick={() => handleTogglePossession(gameState.awayTeamId)}
            >
              🏈 {awayTeam?.shortName || awayTeam?.mascot}
            </button>
          </div>
        </div>

        {/* Away Team Card (Click to give Possession!) */}
        <div
          className="team-header-card right"
          onClick={() => handleTogglePossession(gameState.awayTeamId)}
          style={{
            cursor: 'pointer',
            border: !isHomePossession ? '2px solid #3b82f6' : '1px solid transparent',
            boxShadow: !isHomePossession ? '0 0 12px rgba(59, 130, 246, 0.4)' : undefined,
            transition: 'all 0.15s ease',
          }}
          title="Click to set Possession to Away Team"
        >
          <div
            className="jersey-badge"
            style={{
              backgroundColor: awayTeam?.jerseyColor || '#18181b',
              color: awayTeam?.jerseyTextColor || '#facc15',
            }}
          >
            {awayTeam?.abbreviation || 'AW'}
          </div>
          <div className="team-info">
            <div className="team-name">
              {awayTeam?.shortName || awayTeam?.mascot || 'Away'}
              {!isHomePossession ? (
                <span className="pill pill-active" style={{ marginRight: '8px', fontSize: '0.65rem' }}>
                  OFFENSE 🏈
                </span>
              ) : (
                <span className="pill" style={{ marginRight: '8px', fontSize: '0.65rem', opacity: 0.6 }}>
                  DEFENSE
                </span>
              )}
            </div>
            <div className="school-name">{awayTeam?.schoolName}</div>
          </div>
          {isEditingScores ? (
            <input
              type="number"
              value={editAwayScore}
              onChange={(e) => setEditAwayScore(parseInt(e.target.value, 10) || 0)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '54px', fontSize: '1.4rem', fontWeight: 900, textAlign: 'center' }}
            />
          ) : (
            <div className="team-score">{gameState.awayScore}</div>
          )}
        </div>
      </div>
    </header>
  );
};
