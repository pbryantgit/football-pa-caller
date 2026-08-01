export type Unit = 'offense' | 'defense' | 'special-teams' | 'multiple';

export type PlayType =
  | 'run'
  | 'pass-complete'
  | 'pass-incomplete'
  | 'sack'
  | 'interception'
  | 'fumble'
  | 'penalty'
  | 'punt'
  | 'kickoff'
  | 'field-goal'
  | 'extra-point'
  | 'two-point-conversion'
  | 'touchdown'
  | 'safety'
  | 'other';

export interface Player {
  id: string;
  jerseyNumber: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  phoneticPronunciation?: string;
  position?: string;
  unit?: Unit;
  active: boolean;
}

export interface Team {
  id: string;
  schoolName: string;
  mascot: string;
  shortName: string;
  abbreviation: string;
  jerseyColor: string;
  jerseyTextColor: string;
  logoDataUrl?: string;
  defaultQuarterbackPlayerId?: string;
  roster: Player[];
}

export interface FieldPosition {
  territoryTeamId: string | null; // null if midfield (50)
  yardLine: number; // 1 to 50
  isMidfield: boolean;
  isGoalLine?: boolean;
}

export interface GameState {
  homeTeamId: string;
  awayTeamId: string;
  leftFieldTeamId: string;
  rightFieldTeamId: string;
  possessionTeamId: string;
  quarter: number;
  clock: string;
  homeScore: number;
  awayScore: number;
  down: 1 | 2 | 3 | 4;
  distance: number;
  ballPosition: FieldPosition;
  lineToGain?: FieldPosition;
  status: 'setup' | 'live' | 'halftime' | 'final';
}

export interface PenaltyDetails {
  penaltyName?: string;
  side?: 'offense' | 'defense';
  yards?: number;
  accepted?: boolean;
  downResult?: 'replay' | 'first-down' | 'loss-of-down';
  playerJersey?: string;
}

export interface PlayParticipants {
  passerId?: string;
  ballCarrierId?: string;
  receiverId?: string;
  intendedReceiverId?: string;
  interceptorId?: string;
  fumblerId?: string;
  recoveringPlayerId?: string;
  recoveringTeamId?: string;
  primaryDefenderId?: string;
  assistDefenderIds: string[];
  returnTacklerIds: string[];
  kickerId?: string;
  punterId?: string;
  returnerId?: string;
  penaltyDetails?: PenaltyDetails;
}

export interface PlayRecord {
  id: string;
  sequence: number;
  playType: PlayType;
  startState: GameState;
  endState: GameState;
  participants: PlayParticipants;
  endBallPosition?: FieldPosition;
  gainLoss?: number;
  announcement: string;
  editedAnnouncement?: string;
  notes?: string;
  createdAt: string;
}

export interface AnnouncementSettings {
  includePlayerNames: boolean;
  includeTacklers: boolean;
  sayJerseyPrefix: boolean;
  useOrdinalDowns: boolean;
  useMascotName: boolean;
  showPhoneticHints: boolean;
  autoTTS: boolean;
}
