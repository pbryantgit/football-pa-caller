import { describe, expect, it } from 'vitest';
import { GameState } from '../types';
import { proposeNextGameState } from '../utils/footballEngine';

describe('footballEngine rule calculations', () => {
  const initialState: GameState = {
    homeTeamId: 'home',
    awayTeamId: 'away',
    leftFieldTeamId: 'home',
    rightFieldTeamId: 'away',
    possessionTeamId: 'home',
    quarter: 1,
    clock: '12:00',
    homeScore: 0,
    awayScore: 0,
    down: 1,
    distance: 10,
    ballPosition: { territoryTeamId: 'home', yardLine: 35, isMidfield: false },
    status: 'live',
  };

  it('advances down and distance on 5 yard run gain (1st down to 2nd & 5)', () => {
    const endPos = { territoryTeamId: 'home', yardLine: 40, isMidfield: false };
    const proposal = proposeNextGameState(initialState, 'run', endPos);

    expect(proposal.gainLoss).toBe(5);
    expect(proposal.isFirstDown).toBe(false);
    expect(proposal.nextState.down).toBe(2);
    expect(proposal.nextState.distance).toBe(5);
    expect(proposal.nextState.possessionTeamId).toBe('home');
  });

  it('grants a First Down when gain >= distance', () => {
    const endPos = { territoryTeamId: 'home', yardLine: 47, isMidfield: false }; // +12 yards
    const proposal = proposeNextGameState(initialState, 'run', endPos);

    expect(proposal.gainLoss).toBe(12);
    expect(proposal.isFirstDown).toBe(true);
    expect(proposal.nextState.down).toBe(1);
    expect(proposal.nextState.distance).toBe(10);
    expect(proposal.nextState.possessionTeamId).toBe('home');
  });

  it('triggers Turnover on Downs on 4th down without reaching line to gain', () => {
    const fourthDownState: GameState = { ...initialState, down: 4, distance: 3 };
    const endPos = { territoryTeamId: 'home', yardLine: 36, isMidfield: false }; // +1 yard
    const proposal = proposeNextGameState(fourthDownState, 'run', endPos);

    expect(proposal.gainLoss).toBe(1);
    expect(proposal.isTurnover).toBe(true);
    expect(proposal.nextState.down).toBe(1);
    expect(proposal.nextState.possessionTeamId).toBe('away');
  });

  it('handles Interception with possession change to defense', () => {
    const endPos = { territoryTeamId: 'away', yardLine: 35, isMidfield: false };
    const proposal = proposeNextGameState(initialState, 'interception', endPos);

    expect(proposal.isTurnover).toBe(true);
    expect(proposal.nextState.possessionTeamId).toBe('away');
    expect(proposal.nextState.down).toBe(1);
  });

  it('handles Touchdown detection and score increment', () => {
    const endPos = { territoryTeamId: 'away', yardLine: 0, isMidfield: false, isGoalLine: true };
    const proposal = proposeNextGameState(initialState, 'run', endPos, { isTouchdown: true });

    expect(proposal.isTouchdown).toBe(true);
    expect(proposal.nextState.homeScore).toBe(6);
  });

  it('handles Defensive Pass Interference (Automatic 1st Down)', () => {
    const endPos = { territoryTeamId: 'away', yardLine: 50, isMidfield: true }; // +15 yards
    const proposal = proposeNextGameState(initialState, 'penalty', endPos, {
      penaltyDetails: {
        penaltyName: 'Defensive Pass Interference',
        side: 'defense',
        yards: 15,
        downResult: 'first-down',
      },
    });

    expect(proposal.isFirstDown).toBe(true);
    expect(proposal.nextState.down).toBe(1);
    expect(proposal.nextState.distance).toBe(10);
  });

  it('handles Offensive False Start (5 yards back, replay down)', () => {
    const endPos = { territoryTeamId: 'home', yardLine: 30, isMidfield: false }; // -5 yards
    const proposal = proposeNextGameState(initialState, 'penalty', endPos, {
      penaltyDetails: {
        penaltyName: 'False Start',
        side: 'offense',
        yards: 5,
        downResult: 'replay',
      },
    });

    expect(proposal.isFirstDown).toBe(false);
    expect(proposal.nextState.down).toBe(1);
    expect(proposal.nextState.distance).toBe(15);
  });
});
