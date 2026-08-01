import React, { useRef } from 'react';
import { FieldPosition, GameState, Team } from '../../types';
import { fromAbsoluteCoord, toAbsoluteCoord } from '../../utils/fieldMath';

interface FootballFieldProps {
  gameState: GameState;
  teams: Record<string, Team>;
  selectedEndPos?: FieldPosition;
  onFieldSpotSelect: (pos: FieldPosition) => void;
}

export const FootballField: React.FC<FootballFieldProps> = ({
  gameState,
  teams,
  selectedEndPos,
  onFieldSpotSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const leftTeam = teams[gameState.leftFieldTeamId];
  const rightTeam = teams[gameState.rightFieldTeamId];

  const currentBallAbs = toAbsoluteCoord(gameState.ballPosition, gameState.leftFieldTeamId);
  const targetEndAbs = selectedEndPos ? toAbsoluteCoord(selectedEndPos, gameState.leftFieldTeamId) : currentBallAbs;
  const lineToGainAbs = gameState.lineToGain ? toAbsoluteCoord(gameState.lineToGain, gameState.leftFieldTeamId) : null;

  // Convert 0..100 field yard coordinate to SVG X position (100 is Left Goal Line, 900 is Right Goal Line)
  const getSvgX = (absYard: number) => {
    return 100 + (absYard / 100) * 800;
  };

  const handleFieldClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Percent of total width (0 to 100%)
    const pct = (clickX / width) * 100;
    // Field playing area spans from 10% (Left Goal Line) to 90% (Right Goal Line)
    const yardCoord = Math.round(((pct - 10) / 80) * 100);
    const clampedYard = Math.max(0, Math.min(100, yardCoord));

    const newPos = fromAbsoluteCoord(clampedYard, gameState.leftFieldTeamId, gameState.rightFieldTeamId);
    onFieldSpotSelect(newPos);
  };

  const isLeftPossession = gameState.possessionTeamId === gameState.leftFieldTeamId;

  // Major yard lines: 10, 20, 30, 40, 50, 60, 70, 80, 90 (where 60 = Right 40, etc.)
  const MAJOR_YARD_LINES = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  // 5-yard hash mark ticks
  const FIVE_YARD_TICKS = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];

  return (
    <div ref={containerRef} className="field-container">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        onClick={handleFieldClick}
      >
        {/* Field Grass Background */}
        <rect x="0" y="0" width="1000" height="200" fill="#14532d" />

        {/* Left End Zone (0 to 100) */}
        <rect x="0" y="0" width="100" height="200" fill={leftTeam?.jerseyColor || '#1e3a8a'} opacity="0.9" />
        <text
          x="50"
          y="105"
          fill={leftTeam?.jerseyTextColor || '#ffffff'}
          fontSize="24"
          fontWeight="900"
          textAnchor="middle"
          transform="rotate(-90 50 105)"
        >
          {leftTeam?.abbreviation || 'LEFT'}
        </text>

        {/* Right End Zone (900 to 1000) */}
        <rect x="900" y="0" width="100" height="200" fill={rightTeam?.jerseyColor || '#18181b'} opacity="0.9" />
        <text
          x="950"
          y="105"
          fill={rightTeam?.jerseyTextColor || '#ffffff'}
          fontSize="24"
          fontWeight="900"
          textAnchor="middle"
          transform="rotate(90 950 105)"
        >
          {rightTeam?.abbreviation || 'RIGHT'}
        </text>

        {/* Left Goal Line (x = 100) & Right Goal Line (x = 900) */}
        <line x1="100" y1="0" x2="100" y2="200" stroke="#ffffff" strokeWidth="4" />
        <line x1="900" y1="0" x2="900" y2="200" stroke="#ffffff" strokeWidth="4" />

        {/* 5-Yard Hash Ticks */}
        {FIVE_YARD_TICKS.map((yard) => {
          const x = getSvgX(yard);
          return (
            <g key={`tick-${yard}`}>
              <line x1={x} y1="0" x2={x} y2="15" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <line x1={x} y1="92" x2={x} y2="108" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <line x1={x} y1="185" x2={x} y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            </g>
          );
        })}

        {/* Major 10-Yard Lines & Numbers */}
        {MAJOR_YARD_LINES.map((absYard) => {
          const x = getSvgX(absYard);
          const labelNumber = absYard <= 50 ? absYard : 100 - absYard;
          const isMidfield = absYard === 50;

          return (
            <g key={`yard-${absYard}`}>
              <line
                x1={x}
                y1="0"
                x2={x}
                y2="200"
                stroke={isMidfield ? '#ffffff' : 'rgba(255,255,255,0.5)'}
                strokeWidth={isMidfield ? '4' : '2'}
              />
              <text x={x} y="32" fill="rgba(255,255,255,0.85)" fontSize="16" fontWeight="900" textAnchor="middle">
                {labelNumber}
              </text>
              <text x={x} y="178" fill="rgba(255,255,255,0.85)" fontSize="16" fontWeight="900" textAnchor="middle">
                {labelNumber}
              </text>
            </g>
          );
        })}

        {/* Line to Gain (Yellow Marker) */}
        {lineToGainAbs !== null && (
          <line
            x1={getSvgX(lineToGainAbs)}
            y1="0"
            x2={getSvgX(lineToGainAbs)}
            y2="200"
            stroke="#facc15"
            strokeWidth="4"
            strokeDasharray="6,4"
          />
        )}

        {/* Target End Spot (Selected Spot Indicator Circle) */}
        {selectedEndPos && (
          <circle
            cx={getSvgX(targetEndAbs)}
            cy="100"
            r="16"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="3.5"
            opacity="0.95"
          >
            <animate attributeName="r" values="12;18;12" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Current Ball Marker (Brown Football) */}
        <g transform={`translate(${getSvgX(currentBallAbs)}, 100)`}>
          <ellipse cx="0" cy="0" rx="14" ry="9" fill="#92400e" stroke="#ffffff" strokeWidth="2" />
          <line x1="-6" y1="0" x2="6" y2="0" stroke="#ffffff" strokeWidth="2" />
        </g>

        {/* Direction Arrow */}
        <g transform={`translate(${getSvgX(currentBallAbs)}, 135)`}>
          <text
            x="0"
            y="0"
            fill="#ffffff"
            fontSize="18"
            fontWeight="900"
            textAnchor="middle"
          >
            {isLeftPossession ? '➔' : '⬅'}
          </text>
        </g>
      </svg>
    </div>
  );
};
