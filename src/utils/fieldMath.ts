import { FieldPosition, Team } from '../types';

/**
 * Converts a FieldPosition (Territory team + yard line) to an absolute 0..100 coordinate
 * where 0 is the Left Endzone goal line and 100 is the Right Endzone goal line.
 */
export function toAbsoluteCoord(pos: FieldPosition, leftTeamId: string): number {
  if (pos.isMidfield || pos.yardLine === 50 || pos.territoryTeamId === null) {
    return 50;
  }
  const yard = Math.max(0, Math.min(50, pos.yardLine));
  if (pos.territoryTeamId === leftTeamId) {
    return yard;
  } else {
    return 100 - yard;
  }
}

/**
 * Converts an absolute 0..100 field coordinate back to a FieldPosition object.
 */
export function fromAbsoluteCoord(
  coord: number,
  leftTeamId: string,
  rightTeamId: string
): FieldPosition {
  const clamped = Math.max(0, Math.min(100, Math.round(coord)));
  if (clamped === 50) {
    return { territoryTeamId: null, yardLine: 50, isMidfield: true };
  }
  if (clamped < 50) {
    return {
      territoryTeamId: leftTeamId,
      yardLine: clamped,
      isMidfield: false,
      isGoalLine: clamped === 0,
    };
  } else {
    return {
      territoryTeamId: rightTeamId,
      yardLine: 100 - clamped,
      isMidfield: false,
      isGoalLine: clamped === 100,
    };
  }
}

/**
 * Calculates net yards gained (positive) or lost (negative) between two field positions
 * based on the possession team's offensive direction.
 */
export function calculateGainLoss(
  startPos: FieldPosition,
  endPos: FieldPosition,
  possessionTeamId: string,
  leftTeamId: string
): number {
  const startAbs = toAbsoluteCoord(startPos, leftTeamId);
  const endAbs = toAbsoluteCoord(endPos, leftTeamId);

  // If possession team is on the left, advancing means increasing absolute coordinate (0 -> 100)
  if (possessionTeamId === leftTeamId) {
    return endAbs - startAbs;
  } else {
    // If possession team is on the right, advancing means decreasing absolute coordinate (100 -> 0)
    return startAbs - endAbs;
  }
}

/**
 * Formats a field position as human readable string, e.g., "Spartans 35" or "50-yard line".
 */
export function formatFieldPosition(
  pos: FieldPosition,
  teams: Record<string, Team>,
  useMascot = false
): string {
  if (pos.isMidfield || pos.yardLine === 50 || !pos.territoryTeamId) {
    return '50-yard line';
  }
  const team = teams[pos.territoryTeamId];
  const teamName = team ? (useMascot ? team.mascot : team.shortName || team.schoolName) : 'Territory';
  if (pos.isGoalLine || pos.yardLine === 0) {
    return `${teamName} Goal Line`;
  }
  return `${teamName} ${pos.yardLine}`;
}

/**
 * Formats full position string with "-yard line" suffix if applicable.
 */
export function formatFieldPositionFull(
  pos: FieldPosition,
  teams: Record<string, Team>,
  useMascot = false
): string {
  if (pos.isMidfield || pos.yardLine === 50 || !pos.territoryTeamId) {
    return '50-yard line';
  }
  const name = formatFieldPosition(pos, teams, useMascot);
  return `${name}-yard line`;
}
