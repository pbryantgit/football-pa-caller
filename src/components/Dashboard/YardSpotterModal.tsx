import React, { useState } from 'react';
import { FieldPosition, Team } from '../../types';
import { X, Check, Target } from 'lucide-react';

interface YardSpotterModalProps {
  currentPos: FieldPosition;
  teams: Record<string, Team>;
  leftTeamId: string;
  rightTeamId: string;
  onSelectPos: (pos: FieldPosition) => void;
  onClose: () => void;
  /** Called with the new ball spot so caller can recompute the 1st-down line */
  onResetFirstDown?: (newBallPos: FieldPosition) => void;
}

export const YardSpotterModal: React.FC<YardSpotterModalProps> = ({
  currentPos,
  teams,
  leftTeamId,
  rightTeamId,
  onSelectPos,
  onClose,
  onResetFirstDown,
}) => {
  const leftTeam = teams[leftTeamId];
  const rightTeam = teams[rightTeamId];

  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(
    currentPos.isMidfield ? null : currentPos.territoryTeamId || leftTeamId
  );
  const [selectedYard, setSelectedYard] = useState<number>(currentPos.isMidfield ? 50 : currentPos.yardLine);

  const buildSelectedPos = (): FieldPosition => {
    if (selectedYard === 50 || selectedTerritory === null) {
      return { territoryTeamId: null, yardLine: 50, isMidfield: true };
    }
    return {
      territoryTeamId: selectedTerritory,
      yardLine: selectedYard,
      isMidfield: false,
      isGoalLine: selectedYard === 0,
    };
  };

  const handleApply = () => {
    onSelectPos(buildSelectedPos());
    onClose();
  };

  const handleResetFirstDown = () => {
    const newPos = buildSelectedPos();
    onSelectPos(newPos);
    if (onResetFirstDown) onResetFirstDown(newPos);
    onClose();
  };

  const QUICK_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" style={{ maxWidth: '520px', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
            <Target color="#60a5fa" size={22} />
            <span>Select Ball Spot (Yard Line)</span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Territory Team Side Segmented Control */}
        <div style={{ marginBottom: '16px' }}>
          <label className="section-title">1. Select Side of Field</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', marginTop: '6px' }}>
            <button
              className={`btn ${selectedTerritory === leftTeamId ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                backgroundColor: selectedTerritory === leftTeamId ? leftTeam?.jerseyColor : undefined,
                color: selectedTerritory === leftTeamId ? leftTeam?.jerseyTextColor : undefined,
                fontWeight: 800,
                minHeight: '48px',
              }}
              onClick={() => {
                setSelectedTerritory(leftTeamId);
                if (selectedYard === 50) setSelectedYard(45);
              }}
            >
              {leftTeam?.shortName || leftTeam?.mascot || 'Left Team'} Territory
            </button>

            <button
              className={`btn ${selectedYard === 50 || selectedTerritory === null ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: '48px', fontWeight: 800 }}
              onClick={() => {
                setSelectedTerritory(null);
                setSelectedYard(50);
              }}
            >
              50 (Midfield)
            </button>

            <button
              className={`btn ${selectedTerritory === rightTeamId ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                backgroundColor: selectedTerritory === rightTeamId ? rightTeam?.jerseyColor : undefined,
                color: selectedTerritory === rightTeamId ? rightTeam?.jerseyTextColor : undefined,
                fontWeight: 800,
                minHeight: '48px',
              }}
              onClick={() => {
                setSelectedTerritory(rightTeamId);
                if (selectedYard === 50) setSelectedYard(45);
              }}
            >
              {rightTeam?.shortName || rightTeam?.mascot || 'Right Team'} Territory
            </button>
          </div>
        </div>

        {/* Yard Line Number Grid */}
        {selectedYard !== 50 && (
          <div style={{ marginBottom: '16px' }}>
            <label className="section-title">2. Select Yard Line Number</label>

            {/* Quick 5-yard presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', margin: '8px 0' }}>
              {QUICK_PRESETS.map((y) => (
                <button
                  key={y}
                  className={`btn ${selectedYard === y ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontWeight: 800, minHeight: '44px' }}
                  onClick={() => setSelectedYard(y)}
                >
                  {y === 0 ? 'Goal (0)' : y}
                </button>
              ))}
            </div>

            {/* Numeric Slider for exact 1-49 yard tuning */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 700 }}>
                <span>Exact Yard Line:</span>
                <span style={{ color: '#facc15', fontSize: '1.1rem' }}>{selectedYard}</span>
              </div>
              <input
                type="range"
                min={0}
                max={49}
                value={selectedYard}
                onChange={(e) => setSelectedYard(parseInt(e.target.value, 10))}
                style={{ width: '100%', height: '8px', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          {onResetFirstDown && (
            <button
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontWeight: 800, border: '1px solid #facc15', color: '#facc15' }}
              onClick={handleResetFirstDown}
              title="Move ball here AND reset the 1st down marker 10 yards ahead"
            >
              🟡 Set Spot + Reset 1st Down
            </button>
          )}
          <button className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 800 }} onClick={handleApply}>
            <Check size={18} />
            <span>Set Ball Spot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
