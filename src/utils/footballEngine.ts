import { FieldPosition, GameState, PenaltyDetails, PlayType } from '../types';
import { fromAbsoluteCoord, toAbsoluteCoord, calculateGainLoss } from './fieldMath';

export interface NextStateProposal {
  nextState: GameState;
  gainLoss: number;
  isFirstDown: boolean;
  isTurnover: boolean;
  isTouchdown: boolean;
  isSafety: boolean;
}

export function calculateLineToGain(
  ballPos: FieldPosition,
  distance: number,
  possessionTeamId: string,
  leftTeamId: string,
  rightTeamId: string
): FieldPosition {
  const absBall = toAbsoluteCoord(ballPos, leftTeamId);
  if (possessionTeamId === leftTeamId) {
    const targetAbs = Math.min(100, absBall + distance);
    return fromAbsoluteCoord(targetAbs, leftTeamId, rightTeamId);
  } else {
    const targetAbs = Math.max(0, absBall - distance);
    return fromAbsoluteCoord(targetAbs, leftTeamId, rightTeamId);
  }
}

/**
 * Core football rule engine: Calculates net gain/loss and proposes the next GameState.
 */
export function proposeNextGameState(
  currentState: GameState,
  playType: PlayType,
  endBallPos: FieldPosition,
  options: {
    isTouchdown?: boolean;
    isSafety?: boolean;
    recoveringTeamId?: string;
    penaltyDetails?: PenaltyDetails;
  } = {}
): NextStateProposal {
  const { homeTeamId, awayTeamId, leftFieldTeamId, rightFieldTeamId, possessionTeamId } = currentState;
  const defendingTeamId = possessionTeamId === homeTeamId ? awayTeamId : homeTeamId;

  const startAbs = toAbsoluteCoord(currentState.ballPosition, leftFieldTeamId);
  let endAbs = toAbsoluteCoord(endBallPos, leftFieldTeamId);

  // Incomplete pass leaves ball at previous spot
  if (playType === 'pass-incomplete') {
    endAbs = startAbs;
  }

  const gainLoss = playType === 'pass-incomplete' ? 0 : calculateGainLoss(currentState.ballPosition, endBallPos, possessionTeamId, leftFieldTeamId);

  let isTouchdown = options.isTouchdown || false;
  let isSafety = options.isSafety || false;

  // Auto-detect Touchdown or Safety
  if (possessionTeamId === leftFieldTeamId) {
    if (endAbs >= 100 && playType !== 'pass-incomplete') isTouchdown = true;
    if (endAbs <= 0 && playType !== 'pass-incomplete') isSafety = true;
  } else {
    if (endAbs <= 0 && playType !== 'pass-incomplete') isTouchdown = true;
    if (endAbs >= 100 && playType !== 'pass-incomplete') isSafety = true;
  }

  let nextHomeScore = currentState.homeScore;
  let nextAwayScore = currentState.awayScore;
  let nextPossessionTeamId = possessionTeamId;
  let isFirstDown = false;
  let isTurnover = false;

  let nextDown: 1 | 2 | 3 | 4 = currentState.down;
  let nextDistance = currentState.distance;
  let nextBallPos: FieldPosition = playType === 'pass-incomplete' ? { ...currentState.ballPosition } : { ...endBallPos };

  // Handle Scoring Plays
  if (isTouchdown) {
    if (possessionTeamId === homeTeamId) nextHomeScore += 6;
    else nextAwayScore += 6;
  } else if (isSafety) {
    if (defendingTeamId === homeTeamId) nextHomeScore += 2;
    else nextAwayScore += 2;
    isTurnover = true;
    nextPossessionTeamId = defendingTeamId;
  } else if (playType === 'field-goal') {
    if (possessionTeamId === homeTeamId) nextHomeScore += 3;
    else nextAwayScore += 3;
    isTurnover = true;
    nextPossessionTeamId = defendingTeamId;
  } else if (playType === 'extra-point') {
    if (possessionTeamId === homeTeamId) nextHomeScore += 1;
    else nextAwayScore += 1;
  } else if (playType === 'two-point-conversion') {
    if (possessionTeamId === homeTeamId) nextHomeScore += 2;
    else nextAwayScore += 2;
  }

  // Handle Play Specific Possession & Down/Distance Logic
  if (isTouchdown) {
    nextDown = 1;
    nextDistance = 10;
  } else if (playType === 'penalty' && options.penaltyDetails) {
    const pd = options.penaltyDetails;
    if (pd.side === 'defense') {
      if (pd.downResult === 'first-down' || gainLoss >= currentState.distance) {
        isFirstDown = true;
        nextDown = 1;
        const distanceToGoal = possessionTeamId === leftFieldTeamId ? 100 - endAbs : endAbs;
        nextDistance = Math.min(10, distanceToGoal);
      } else {
        nextDown = currentState.down;
        nextDistance = Math.max(1, currentState.distance - (pd.yards || 5));
      }
    } else {
      // Offense penalty
      if (pd.downResult === 'loss-of-down') {
        if (currentState.down < 4) {
          nextDown = (currentState.down + 1) as 1 | 2 | 3 | 4;
          nextDistance = currentState.distance + (pd.yards || 5);
        } else {
          isTurnover = true;
          nextPossessionTeamId = defendingTeamId;
          nextDown = 1;
          nextDistance = 10;
        }
      } else if (pd.downResult === 'first-down') {
        isFirstDown = true;
        nextDown = 1;
        nextDistance = 10;
      } else {
        // Replay down
        nextDown = currentState.down;
        nextDistance = currentState.distance + (pd.yards || 5);
      }
    }
  } else if (playType === 'interception') {
    isTurnover = true;
    nextPossessionTeamId = defendingTeamId;
    nextDown = 1;
    const distanceToGoal = nextPossessionTeamId === leftFieldTeamId ? 100 - endAbs : endAbs;
    nextDistance = Math.min(10, distanceToGoal);
  } else if (playType === 'fumble') {
    if (options.recoveringTeamId && options.recoveringTeamId !== possessionTeamId) {
      isTurnover = true;
      nextPossessionTeamId = options.recoveringTeamId;
      nextDown = 1;
      const distanceToGoal = nextPossessionTeamId === leftFieldTeamId ? 100 - endAbs : endAbs;
      nextDistance = Math.min(10, distanceToGoal);
    } else {
      if (gainLoss >= currentState.distance) {
        isFirstDown = true;
        nextDown = 1;
        const distanceToGoal = possessionTeamId === leftFieldTeamId ? 100 - endAbs : endAbs;
        nextDistance = Math.min(10, distanceToGoal);
      } else {
        if (currentState.down < 4) {
          nextDown = (currentState.down + 1) as 1 | 2 | 3 | 4;
          nextDistance = Math.max(1, currentState.distance - gainLoss);
        } else {
          isTurnover = true;
          nextPossessionTeamId = defendingTeamId;
          nextDown = 1;
          const distanceToGoal = nextPossessionTeamId === leftFieldTeamId ? 100 - endAbs : endAbs;
          nextDistance = Math.min(10, distanceToGoal);
        }
      }
    }
  } else if (playType === 'punt' || playType === 'kickoff') {
    isTurnover = true;
    nextPossessionTeamId = defendingTeamId;
    nextDown = 1;
    const distanceToGoal = nextPossessionTeamId === leftFieldTeamId ? 100 - endAbs : endAbs;
    nextDistance = Math.min(10, distanceToGoal);
  } else if (playType === 'run' || playType === 'pass-complete' || playType === 'pass-incomplete' || playType === 'sack') {
    if (gainLoss >= currentState.distance) {
      isFirstDown = true;
      nextDown = 1;
      const distanceToGoal = possessionTeamId === leftFieldTeamId ? 100 - endAbs : endAbs;
      nextDistance = Math.min(10, distanceToGoal);
    } else {
      if (currentState.down < 4) {
        nextDown = (currentState.down + 1) as 1 | 2 | 3 | 4;
        nextDistance = Math.max(1, currentState.distance - gainLoss);
      } else {
        isTurnover = true;
        nextPossessionTeamId = defendingTeamId;
        nextDown = 1;
        const distanceToGoal = nextPossessionTeamId === leftFieldTeamId ? 100 - endAbs : endAbs;
        nextDistance = Math.min(10, distanceToGoal);
      }
    }
  }

  const nextLineToGain = calculateLineToGain(
    nextBallPos,
    nextDistance,
    nextPossessionTeamId,
    leftFieldTeamId,
    rightFieldTeamId
  );

  const nextState: GameState = {
    ...currentState,
    homeScore: nextHomeScore,
    awayScore: nextAwayScore,
    possessionTeamId: nextPossessionTeamId,
    down: nextDown,
    distance: nextDistance,
    ballPosition: nextBallPos,
    lineToGain: nextLineToGain,
  };

  return {
    nextState,
    gainLoss,
    isFirstDown,
    isTurnover,
    isTouchdown,
    isSafety,
  };
}
