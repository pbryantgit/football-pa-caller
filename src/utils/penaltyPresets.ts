export interface PenaltyPreset {
  id: string;
  name: string;
  side: 'offense' | 'defense';
  yards: number;
  downResult: 'replay' | 'first-down' | 'loss-of-down';
}

export const OFFENSIVE_PENALTIES: PenaltyPreset[] = [
  { id: 'off-false-start', name: 'False Start', side: 'offense', yards: 5, downResult: 'replay' },
  { id: 'off-holding', name: 'Offensive Holding', side: 'offense', yards: 10, downResult: 'replay' },
  { id: 'off-illegal-motion', name: 'Illegal Motion / Shift', side: 'offense', yards: 5, downResult: 'replay' },
  { id: 'off-delay', name: 'Delay of Game', side: 'offense', yards: 5, downResult: 'replay' },
  { id: 'off-opi', name: 'Offensive Pass Interference', side: 'offense', yards: 15, downResult: 'replay' },
  { id: 'off-block-back', name: 'Illegal Block in the Back', side: 'offense', yards: 10, downResult: 'replay' },
  { id: 'off-personal-foul', name: 'Personal Foul', side: 'offense', yards: 15, downResult: 'replay' },
  { id: 'off-illegal-pass', name: 'Illegal Forward Pass', side: 'offense', yards: 5, downResult: 'loss-of-down' },
  { id: 'off-ineligible-downfield', name: 'Ineligible Receiver Downfield', side: 'offense', yards: 5, downResult: 'replay' },
];

export const DEFENSIVE_PENALTIES: PenaltyPreset[] = [
  { id: 'def-offside', name: 'Offside / Encroachment', side: 'defense', yards: 5, downResult: 'replay' },
  { id: 'def-holding', name: 'Defensive Holding', side: 'defense', yards: 10, downResult: 'first-down' },
  { id: 'def-dpi', name: 'Defensive Pass Interference', side: 'defense', yards: 15, downResult: 'first-down' },
  { id: 'def-personal-foul', name: 'Personal Foul / Unnecessary Roughness', side: 'defense', yards: 15, downResult: 'first-down' },
  { id: 'def-facemask', name: 'Face Mask', side: 'defense', yards: 15, downResult: 'first-down' },
  { id: 'def-roughing-qb', name: 'Roughing the Passer', side: 'defense', yards: 15, downResult: 'first-down' },
  { id: 'def-unsportsmanlike', name: 'Unsportsmanlike Conduct', side: 'defense', yards: 15, downResult: 'first-down' },
  { id: 'def-delay', name: 'Delay of Game', side: 'defense', yards: 5, downResult: 'replay' },
];
