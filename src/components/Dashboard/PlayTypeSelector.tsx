import React from 'react';
import { PlayType } from '../../types';

interface PlayTypeSelectorProps {
  currentPlayType: PlayType;
  onSelectPlayType: (type: PlayType) => void;
}

const PLAY_TYPES: { type: PlayType; label: string; icon: string }[] = [
  { type: 'run', label: 'Run', icon: '🏃' },
  { type: 'pass-complete', label: 'Pass Complete', icon: '🏈' },
  { type: 'pass-incomplete', label: 'Incomplete Pass', icon: '❌' },
  { type: 'sack', label: 'Sack', icon: '💥' },
  { type: 'interception', label: 'Interception', icon: '🔄' },
  { type: 'fumble', label: 'Fumble', icon: '⚠️' },
  { type: 'penalty', label: 'Penalty', icon: '🚩' },
  { type: 'punt', label: 'Punt', icon: '🦵' },
  { type: 'field-goal', label: 'Field Goal', icon: '🙌' },
  { type: 'touchdown', label: 'Touchdown', icon: '🏆' },
];

export const PlayTypeSelector: React.FC<PlayTypeSelectorProps> = ({
  currentPlayType,
  onSelectPlayType,
}) => {
  return (
    <div className="play-type-panel glass-panel">
      <div className="section-title">Select Play Type</div>
      <div className="play-type-grid">
        {PLAY_TYPES.map((pt) => (
          <button
            key={pt.type}
            className={`play-btn ${currentPlayType === pt.type ? 'active' : ''}`}
            onClick={() => onSelectPlayType(pt.type)}
          >
            <span style={{ fontSize: '1.2rem' }}>{pt.icon}</span>
            <span>{pt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
