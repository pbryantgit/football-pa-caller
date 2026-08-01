import { describe, expect, it } from 'vitest';
import { calculateGainLoss, fromAbsoluteCoord, toAbsoluteCoord } from '../utils/fieldMath';

describe('fieldMath utility', () => {
  const leftTeamId = 'home';
  const rightTeamId = 'away';

  it('converts Left Team 35 to absolute coordinate 35', () => {
    const pos = { territoryTeamId: 'home', yardLine: 35, isMidfield: false };
    expect(toAbsoluteCoord(pos, leftTeamId)).toBe(35);
  });

  it('converts Right Team 35 to absolute coordinate 65', () => {
    const pos = { territoryTeamId: 'away', yardLine: 35, isMidfield: false };
    expect(toAbsoluteCoord(pos, leftTeamId)).toBe(65);
  });

  it('converts 50 midfield to absolute coordinate 50', () => {
    const pos = { territoryTeamId: null, yardLine: 50, isMidfield: true };
    expect(toAbsoluteCoord(pos, leftTeamId)).toBe(50);
  });

  it('converts absolute coordinate 35 back to Left Team 35', () => {
    const res = fromAbsoluteCoord(35, leftTeamId, rightTeamId);
    expect(res.territoryTeamId).toBe('home');
    expect(res.yardLine).toBe(35);
  });

  it('converts absolute coordinate 70 back to Right Team 30', () => {
    const res = fromAbsoluteCoord(70, leftTeamId, rightTeamId);
    expect(res.territoryTeamId).toBe('away');
    expect(res.yardLine).toBe(30);
  });

  it('calculates gain correctly for Home team moving left-to-right', () => {
    const start = { territoryTeamId: 'home', yardLine: 35, isMidfield: false }; // 35
    const end = { territoryTeamId: 'home', yardLine: 42, isMidfield: false };   // 42
    const gain = calculateGainLoss(start, end, 'home', leftTeamId);
    expect(gain).toBe(7);
  });

  it('calculates loss correctly across midfield for Home team', () => {
    const start = { territoryTeamId: 'away', yardLine: 40, isMidfield: false }; // 60
    const end = { territoryTeamId: 'home', yardLine: 45, isMidfield: false };   // 45
    const gain = calculateGainLoss(start, end, 'home', leftTeamId);
    expect(gain).toBe(-15);
  });

  it('calculates gain correctly for Away team moving right-to-left', () => {
    const start = { territoryTeamId: 'away', yardLine: 35, isMidfield: false }; // 65
    const end = { territoryTeamId: 'away', yardLine: 45, isMidfield: false };   // 55
    const gain = calculateGainLoss(start, end, 'away', leftTeamId);
    expect(gain).toBe(10);
  });
});
