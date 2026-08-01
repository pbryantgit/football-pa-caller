import React, { useEffect, useState } from 'react';
import { FieldPosition, GameState, PenaltyDetails, PlayParticipants, PlayType, Player, Team } from '../../types';
import { FootballField } from '../Field/FootballField';
import { JerseyGrid } from './JerseyGrid';
import { YardSpotterModal } from './YardSpotterModal';
import { formatFieldPosition, fromAbsoluteCoord, toAbsoluteCoord } from '../../utils/fieldMath';
import { DEFENSIVE_PENALTIES, OFFENSIVE_PENALTIES, PenaltyPreset } from '../../utils/penaltyPresets';
import { Check, Flag, Edit3, Target, RefreshCw } from 'lucide-react';

interface DynamicPlayPanelProps {
  gameState: GameState;
  teams: Record<string, Team>;
  playType: PlayType;
  participants: PlayParticipants;
  onUpdateParticipants: (participants: PlayParticipants) => void;
  endBallPos: FieldPosition;
  onUpdateEndBallPos: (pos: FieldPosition) => void;
  isTouchdown: boolean;
  onToggleTouchdown: (isTD: boolean) => void;
  /** Recomputes the 1st-down line from the given ball position (10 yds ahead in offense direction) */
  onResetLineToGain: (fromPos: FieldPosition) => void;
}

export const DynamicPlayPanel: React.FC<DynamicPlayPanelProps> = ({
  gameState,
  teams,
  playType,
  participants,
  onUpdateParticipants,
  endBallPos,
  onUpdateEndBallPos,
  isTouchdown,
  onToggleTouchdown,
  onResetLineToGain,
}) => {
  const offTeam = teams[gameState.possessionTeamId];
  const defTeamId = gameState.possessionTeamId === gameState.homeTeamId ? gameState.awayTeamId : gameState.homeTeamId;
  const defTeam = teams[defTeamId];

  const [penaltySide, setPenaltySide] = useState<'offense' | 'defense'>('offense');
  const [selectedPenaltyId, setSelectedPenaltyId] = useState<string>('');
  const [showYardModal, setShowYardModal] = useState<boolean>(false);

  // Pre-populate default QB for passer if not set
  useEffect(() => {
    if ((playType === 'pass-complete' || playType === 'pass-incomplete' || playType === 'sack' || playType === 'interception') && !participants.passerId) {
      if (offTeam?.defaultQuarterbackPlayerId) {
        onUpdateParticipants({ ...participants, passerId: offTeam.defaultQuarterbackPlayerId });
      }
    }
  }, [playType, offTeam]);

  // Stepper adjustments for ball spot — always moves in the offense's direction
  const handleYardStep = (delta: number) => {
    const currentAbs = toAbsoluteCoord(endBallPos, gameState.leftFieldTeamId);

    // If possession team is on the LEFT they drive RIGHT (+abs = gain).
    // If possession team is on the RIGHT they drive LEFT (-abs = gain).
    const directedDelta =
      gameState.possessionTeamId === gameState.leftFieldTeamId ? delta : -delta;

    const newAbs = Math.max(0, Math.min(100, currentAbs + directedDelta));
    const newPos = fromAbsoluteCoord(newAbs, gameState.leftFieldTeamId, gameState.rightFieldTeamId);
    onUpdateEndBallPos(newPos);
  };

  const handleSelectPenaltyPreset = (preset: PenaltyPreset) => {
    setSelectedPenaltyId(preset.id);
    const details: PenaltyDetails = {
      penaltyName: preset.name,
      side: preset.side,
      yards: preset.yards,
      accepted: true,
      downResult: preset.downResult,
    };
    onUpdateParticipants({ ...participants, penaltyDetails: details });

    // Calculate new end ball spot based on penalty yards
    const startAbs = toAbsoluteCoord(gameState.ballPosition, gameState.leftFieldTeamId);
    let targetAbs = startAbs;

    if (gameState.possessionTeamId === gameState.leftFieldTeamId) {
      if (preset.side === 'defense') targetAbs = Math.min(100, startAbs + preset.yards);
      else targetAbs = Math.max(0, startAbs - preset.yards);
    } else {
      if (preset.side === 'defense') targetAbs = Math.max(0, startAbs - preset.yards);
      else targetAbs = Math.min(100, startAbs + preset.yards);
    }

    const calculatedEndPos = fromAbsoluteCoord(targetAbs, gameState.leftFieldTeamId, gameState.rightFieldTeamId);
    onUpdateEndBallPos(calculatedEndPos);
  };

  const handleSelectOffensivePlayer = (player: Player, role: 'carrier' | 'passer' | 'receiver' | 'fumbler' | 'kicker' | 'punter') => {
    const updated = { ...participants };
    if (role === 'carrier') {
      updated.ballCarrierId = updated.ballCarrierId === player.id ? undefined : player.id;
    } else if (role === 'passer') {
      updated.passerId = updated.passerId === player.id ? undefined : player.id;
    } else if (role === 'receiver') {
      updated.receiverId = updated.receiverId === player.id ? undefined : player.id;
      updated.intendedReceiverId = updated.receiverId;
    } else if (role === 'fumbler') {
      updated.fumblerId = updated.fumblerId === player.id ? undefined : player.id;
    } else if (role === 'kicker') {
      updated.kickerId = updated.kickerId === player.id ? undefined : player.id;
    } else if (role === 'punter') {
      updated.punterId = updated.punterId === player.id ? undefined : player.id;
    }
    onUpdateParticipants(updated);
  };

  const handleSelectReturner = (player: Player) => {
    const updated = { ...participants };
    updated.returnerId = updated.returnerId === player.id ? undefined : player.id;
    onUpdateParticipants(updated);
  };

  const handleSelectDefensivePlayer = (player: Player, role: 'tackler' | 'interceptor' | 'recovering') => {
    const updated = { ...participants };
    if (role === 'tackler') {
      if (updated.primaryDefenderId === player.id) {
        updated.primaryDefenderId = undefined;
      } else if (updated.assistDefenderIds?.includes(player.id)) {
        updated.assistDefenderIds = updated.assistDefenderIds.filter((id) => id !== player.id);
      } else if (!updated.primaryDefenderId) {
        updated.primaryDefenderId = player.id;
      } else {
        updated.assistDefenderIds = [...(updated.assistDefenderIds || []), player.id];
      }
    } else if (role === 'interceptor') {
      updated.interceptorId = updated.interceptorId === player.id ? undefined : player.id;
    } else if (role === 'recovering') {
      updated.recoveringPlayerId = updated.recoveringPlayerId === player.id ? undefined : player.id;
      updated.recoveringTeamId = defTeamId;
    }
    onUpdateParticipants(updated);
  };

  const selectedOffensePlayerName = (id?: string) => {
    if (!id || !offTeam) return 'None Selected';
    const p = offTeam.roster.find((pl) => pl.id === id);
    return p ? `#${p.jerseyNumber} ${p.displayName}` : 'None Selected';
  };

  const selectedDefensePlayerName = (id?: string) => {
    if (!id || !defTeam) return 'None Selected';
    const p = defTeam.roster.find((pl) => pl.id === id);
    return p ? `#${p.jerseyNumber} ${p.displayName}` : 'None Selected';
  };

  return (
    <div className="center-entry-panel glass-panel">
      {/* Interactive Press Box Field */}
      <FootballField
        gameState={gameState}
        teams={teams}
        selectedEndPos={endBallPos}
        onFieldSpotSelect={onUpdateEndBallPos}
      />

      {/* iPad-Optimized Synchronized Ball Spotter Controls Bar */}
      <div className="ball-spotter-row">
        <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={16} color="#60a5fa" />
          <span>Ending Ball Position:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button className="stepper-btn" style={{ width: '44px', height: '44px', fontSize: '0.9rem' }} onClick={() => handleYardStep(-10)}>-10</button>
          <button className="stepper-btn" style={{ width: '44px', height: '44px', fontSize: '0.9rem' }} onClick={() => handleYardStep(-5)}>-5</button>
          <button className="stepper-btn" style={{ width: '44px', height: '44px', fontSize: '0.9rem' }} onClick={() => handleYardStep(-1)}>-1</button>

          {/* Touch Target Yardage Badge (Click opens Touch Yard Selector Modal!) */}
          <button
            className="btn btn-primary"
            style={{
              padding: '8px 14px',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              boxShadow: '0 0 14px rgba(37, 99, 235, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => setShowYardModal(true)}
            title="Tap to open iPad Touch Yardage Spotter"
          >
            <span>{formatFieldPosition(endBallPos, teams)}</span>
            <Edit3 size={14} style={{ opacity: 0.8 }} />
          </button>

          <button className="stepper-btn" style={{ width: '44px', height: '44px', fontSize: '0.9rem' }} onClick={() => handleYardStep(1)}>+1</button>
          <button className="stepper-btn" style={{ width: '44px', height: '44px', fontSize: '0.9rem' }} onClick={() => handleYardStep(5)}>+5</button>
          <button className="stepper-btn" style={{ width: '44px', height: '44px', fontSize: '0.9rem' }} onClick={() => handleYardStep(10)}>+10</button>
        </div>

        {/* Touchdown Toggle + Reset 1st Down */}
        <button
          className={`btn ${isTouchdown ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onToggleTouchdown(!isTouchdown)}
          style={{ padding: '8px 14px', fontSize: '0.85rem', fontWeight: 800 }}
        >
          <Check size={16} />
          <span>TOUCHDOWN</span>
        </button>

        {/* Quick Reset 1st Down from current ending ball position */}
        <button
          className="btn btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid #facc15', color: '#facc15' }}
          onClick={() => onResetLineToGain(endBallPos)}
          title="Reset the 1st down marker 10 yards ahead from ending ball position"
        >
          <RefreshCw size={14} />
          <span>Reset 1st Down</span>
        </button>
      </div>

      {/* SPECIAL PENALTY WORKFLOW UI */}
      {playType === 'penalty' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1rem', color: '#facc15' }}>
              <Flag size={18} />
              <span>Penalty Selection</span>
            </div>

            {/* Offense vs Defense Side Selector Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`btn ${penaltySide === 'offense' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                onClick={() => setPenaltySide('offense')}
              >
                Offensive Penalties ({offTeam?.shortName || 'Offense'})
              </button>
              <button
                className={`btn ${penaltySide === 'defense' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                onClick={() => setPenaltySide('defense')}
              >
                Defensive Penalties ({defTeam?.shortName || 'Defense'})
              </button>
            </div>
          </div>

          {/* Penalty Presets Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {(penaltySide === 'offense' ? OFFENSIVE_PENALTIES : DEFENSIVE_PENALTIES).map((preset) => {
              const isSelected = selectedPenaltyId === preset.id;
              return (
                <button
                  key={preset.id}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                    textAlign: 'left',
                    borderRadius: '8px',
                    background: isSelected ? undefined : 'rgba(255,255,255,0.06)',
                  }}
                  onClick={() => handleSelectPenaltyPreset(preset)}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{preset.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
                    {preset.side === 'defense' ? `+${preset.yards} Yards (Defense)` : `-${preset.yards} Yards (Offense)`}
                    {preset.downResult === 'first-down' && ' • Automatic 1st Down'}
                    {preset.downResult === 'loss-of-down' && ' • Loss of Down'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Penalty Details Active Summary */}
          {participants.penaltyDetails && (
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#93c5fd' }}>{participants.penaltyDetails.penaltyName}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  ({participants.penaltyDetails.side === 'defense' ? 'Defense Penalty' : 'Offense Penalty'}) — {participants.penaltyDetails.yards} Yards Enforced
                </span>
              </div>

              <div style={{ fontWeight: 800, color: '#facc15', fontSize: '0.9rem' }}>
                {participants.penaltyDetails.downResult === 'first-down' ? 'AUTOMATIC 1ST DOWN' : 'REPLAY DOWN'}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Selected Participants Summary Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
            {playType === 'run' && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Carrier: </span>
                <strong style={{ color: '#60a5fa' }}>{selectedOffensePlayerName(participants.ballCarrierId)}</strong>
              </div>
            )}

            {(playType === 'pass-complete' || playType === 'pass-incomplete' || playType === 'sack' || playType === 'interception') && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Passer: </span>
                <strong style={{ color: '#60a5fa' }}>{selectedOffensePlayerName(participants.passerId)}</strong>
              </div>
            )}

            {playType === 'pass-complete' && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Receiver: </span>
                <strong style={{ color: '#60a5fa' }}>{selectedOffensePlayerName(participants.receiverId)}</strong>
              </div>
            )}

            {playType === 'interception' && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Interceptor: </span>
                <strong style={{ color: '#facc15' }}>{selectedDefensePlayerName(participants.interceptorId)}</strong>
              </div>
            )}

            {(playType === 'run' || playType === 'pass-complete' || playType === 'sack') && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Tackler: </span>
                <strong style={{ color: '#f59e0b' }}>{selectedDefensePlayerName(participants.primaryDefenderId)}</strong>
              </div>
            )}

            {playType === 'punt' && (
              <>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Punter: </span>
                  <strong style={{ color: '#60a5fa' }}>{selectedOffensePlayerName(participants.punterId)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Returner: </span>
                  <strong style={{ color: '#a78bfa' }}>{selectedDefensePlayerName(participants.returnerId)}</strong>
                </div>
              </>
            )}

            {playType === 'kickoff' && (
              <>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Kicker: </span>
                  <strong style={{ color: '#60a5fa' }}>{selectedOffensePlayerName(participants.kickerId)}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Returner: </span>
                  <strong style={{ color: '#a78bfa' }}>{selectedDefensePlayerName(participants.returnerId)}</strong>
                </div>
              </>
            )}

            {playType === 'field-goal' && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Kicker: </span>
                <strong style={{ color: '#60a5fa' }}>{selectedOffensePlayerName(participants.kickerId)}</strong>
              </div>
            )}

            {playType === 'extra-point' && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Kicker: </span>
                <strong style={{ color: '#60a5fa' }}>{selectedOffensePlayerName(participants.kickerId)}</strong>
              </div>
            )}
          </div>

          {/* Offensive Player Jersey Selection Grid */}
          {offTeam && !['punt', 'kickoff', 'field-goal', 'extra-point'].includes(playType) && (
            <JerseyGrid
              title={
                playType === 'run'
                  ? 'Select Ball Carrier'
                  : playType === 'pass-complete'
                  ? 'Select Receiver'
                  : 'Select Offensive Player'
              }
              team={offTeam}
              selectedPrimaryId={
                playType === 'run'
                  ? participants.ballCarrierId
                  : playType === 'pass-complete'
                  ? participants.receiverId
                  : participants.passerId
              }
              onSelectPlayer={(p) =>
                handleSelectOffensivePlayer(
                  p,
                  playType === 'run' ? 'carrier' : playType === 'pass-complete' ? 'receiver' : 'passer'
                )
              }
            />
          )}

          {/* PUNT — Punter + Returner grids */}
          {playType === 'punt' && (
            <>
              {offTeam && (
                <JerseyGrid
                  title={`Select Punter — ${offTeam.shortName || offTeam.mascot}`}
                  team={offTeam}
                  selectedPrimaryId={participants.punterId}
                  onSelectPlayer={(p) => handleSelectOffensivePlayer(p, 'punter')}
                />
              )}
              {defTeam && (
                <JerseyGrid
                  title={`Select Punt Returner — ${defTeam.shortName || defTeam.mascot}`}
                  team={defTeam}
                  selectedPrimaryId={participants.returnerId}
                  onSelectPlayer={handleSelectReturner}
                />
              )}
            </>
          )}

          {/* KICKOFF — Kicker + Returner grids */}
          {playType === 'kickoff' && (
            <>
              {offTeam && (
                <JerseyGrid
                  title={`Select Kicker — ${offTeam.shortName || offTeam.mascot}`}
                  team={offTeam}
                  selectedPrimaryId={participants.kickerId}
                  onSelectPlayer={(p) => handleSelectOffensivePlayer(p, 'kicker')}
                />
              )}
              {defTeam && (
                <JerseyGrid
                  title={`Select Kick Returner — ${defTeam.shortName || defTeam.mascot}`}
                  team={defTeam}
                  selectedPrimaryId={participants.returnerId}
                  onSelectPlayer={handleSelectReturner}
                />
              )}
            </>
          )}

          {/* FIELD GOAL / EXTRA POINT — Kicker grid only */}
          {(playType === 'field-goal' || playType === 'extra-point') && (
            <>
              {offTeam && (
                <JerseyGrid
                  title={`Select Kicker — ${offTeam.shortName || offTeam.mascot}`}
                  team={offTeam}
                  selectedPrimaryId={participants.kickerId}
                  onSelectPlayer={(p) => handleSelectOffensivePlayer(p, 'kicker')}
                />
              )}
            </>
          )}

          {/* Defensive Tackler Jersey Selection Grid */}
          {defTeam && (playType === 'run' || playType === 'pass-complete' || playType === 'sack') && (
            <JerseyGrid
              title={playType === 'sack' ? 'Select Sacking Defender' : 'Select Defensive Tackler(s)'}
              team={defTeam}
              selectedPrimaryId={participants.primaryDefenderId}
              selectedAssistIds={participants.assistDefenderIds}
              onSelectPlayer={(p) => handleSelectDefensivePlayer(p, 'tackler')}
              allowAssists={true}
            />
          )}

          {/* Interceptor Selection Grid */}
          {defTeam && playType === 'interception' && (
            <JerseyGrid
              title="Select Interceptor"
              team={defTeam}
              selectedPrimaryId={participants.interceptorId}
              onSelectPlayer={(p) => handleSelectDefensivePlayer(p, 'interceptor')}
            />
          )}
        </>
      )}

      {/* iPad Touch Yardage Spotter Modal */}
      {showYardModal && (
        <YardSpotterModal
          currentPos={endBallPos}
          teams={teams}
          leftTeamId={gameState.leftFieldTeamId}
          rightTeamId={gameState.rightFieldTeamId}
          onSelectPos={onUpdateEndBallPos}
          onResetFirstDown={onResetLineToGain}
          onClose={() => setShowYardModal(false)}
        />
      )}
    </div>
  );
};
