import { AnnouncementSettings, GameState, Team } from '../types';

export const DEMO_TEAMS: Record<string, Team> = {
  'spartans': {
    id: 'spartans',
    schoolName: 'South Paulding',
    mascot: 'Spartans',
    shortName: 'Spartans',
    abbreviation: 'SP',
    jerseyColor: '#1e3a8a', // Navy blue
    jerseyTextColor: '#ffffff',
    defaultQuarterbackPlayerId: 'sp-12',
    roster: [
      { id: 'sp-12', jerseyNumber: '12', firstName: 'Nathan', lastName: 'Smith', displayName: 'Nathan Smith', phoneticPronunciation: 'NAY-thun Smith', position: 'QB', unit: 'offense', active: true },
      { id: 'sp-33', jerseyNumber: '33', firstName: 'Nathan', lastName: 'Bryant', displayName: 'Nathan Bryant', phoneticPronunciation: 'NAY-thun BRY-ant', position: 'RB', unit: 'offense', active: true },
      { id: 'sp-44', jerseyNumber: '44', firstName: 'John', lastName: 'Davis', displayName: 'John Davis', phoneticPronunciation: 'John DAY-vis', position: 'LB', unit: 'defense', active: true },
      { id: 'sp-52', jerseyNumber: '52', firstName: 'David', lastName: 'Williams', displayName: 'David Williams', phoneticPronunciation: 'DAY-vid WILL-yums', position: 'LB', unit: 'defense', active: true },
      { id: 'sp-88', jerseyNumber: '88', firstName: 'Tyler', lastName: 'Jones', displayName: 'Tyler Jones', phoneticPronunciation: 'TY-ler Jones', position: 'WR', unit: 'offense', active: true },
    ],
  },
  'hornets': {
    id: 'hornets',
    schoolName: 'Hiram',
    mascot: 'Hornets',
    shortName: 'Hornets',
    abbreviation: 'HIR',
    jerseyColor: '#18181b', // Black / Gold accent
    jerseyTextColor: '#facc15',
    defaultQuarterbackPlayerId: 'hh-7',
    roster: [
      { id: 'hh-2', jerseyNumber: '2', firstName: 'Jordan', lastName: 'Hill', displayName: 'Jordan Hill', phoneticPronunciation: 'JOR-dun Hill', position: 'DB', unit: 'defense', active: true },
      { id: 'hh-7', jerseyNumber: '7', firstName: 'Marcus', lastName: 'Green', displayName: 'Marcus Green', phoneticPronunciation: 'MAR-kus Green', position: 'QB', unit: 'offense', active: true },
      { id: 'hh-24', jerseyNumber: '24', firstName: 'Michael', lastName: 'Brown', displayName: 'Michael Brown', phoneticPronunciation: 'MY-kul Brown', position: 'DB', unit: 'defense', active: true },
      { id: 'hh-44', jerseyNumber: '44', firstName: 'Michael', lastName: 'Johnson', displayName: 'Michael Johnson', phoneticPronunciation: 'MY-kul JON-sun', position: 'LB', unit: 'defense', active: true },
      { id: 'hh-81', jerseyNumber: '81', firstName: 'Chris', lastName: 'Taylor', displayName: 'Chris Taylor', phoneticPronunciation: 'Chris TAY-lor', position: 'WR', unit: 'offense', active: true },
    ],
  },
  'eagles': {
    id: 'eagles',
    schoolName: 'Eastside',
    mascot: 'Eagles',
    shortName: 'Eagles',
    abbreviation: 'EAG',
    jerseyColor: '#047857', // Emerald green
    jerseyTextColor: '#ffffff',
    defaultQuarterbackPlayerId: 'eag-2',
    roster: [
      { id: 'eag-2', jerseyNumber: '2', firstName: 'Ethan', lastName: 'Carter', displayName: 'Ethan Carter', phoneticPronunciation: 'EE-thun KAR-ter', position: 'QB', unit: 'offense', active: true },
      { id: 'eag-3', jerseyNumber: '3', firstName: 'Mason', lastName: 'Brooks', displayName: 'Mason Brooks', phoneticPronunciation: 'MAY-sun BROOKS', position: 'RB', unit: 'offense', active: true },
      { id: 'eag-11', jerseyNumber: '11', firstName: 'Noah', lastName: 'Bennett', displayName: 'Noah Bennett', phoneticPronunciation: 'NOH-uh BEN-it', position: 'WR', unit: 'offense', active: true },
      { id: 'eag-17', jerseyNumber: '17', firstName: 'Luke', lastName: 'Simmons', displayName: 'Luke Simmons', phoneticPronunciation: 'LOOK SIM-unz', position: 'LB', unit: 'defense', active: true },
    ],
  },
  'lions': {
    id: 'lions',
    schoolName: 'Lakeside',
    mascot: 'Lions',
    shortName: 'Lions',
    abbreviation: 'LIO',
    jerseyColor: '#b91c1c', // Deep Red
    jerseyTextColor: '#ffffff',
    defaultQuarterbackPlayerId: 'lio-1',
    roster: [
      { id: 'lio-1', jerseyNumber: '1', firstName: 'Alexander', lastName: 'Vance', displayName: 'Alexander Vance', phoneticPronunciation: 'AL-ex VANCE', position: 'QB', unit: 'offense', active: true },
      { id: 'lio-10', jerseyNumber: '10', firstName: 'Daniel', lastName: 'Cross', displayName: 'Daniel Cross', phoneticPronunciation: 'DAN-yul CROSS', position: 'RB', unit: 'offense', active: true },
      { id: 'lio-22', jerseyNumber: '22', firstName: 'Xavier', lastName: 'Knight', displayName: 'Xavier Knight', phoneticPronunciation: 'ZAY-vee-er NITE', position: 'DB', unit: 'defense', active: true },
    ],
  },
};

export const INITIAL_ANNOUNCEMENT_SETTINGS: AnnouncementSettings = {
  includePlayerNames: true,
  includeTacklers: true,
  sayJerseyPrefix: true,
  useOrdinalDowns: true,
  useMascotName: true,
  showPhoneticHints: true,
  autoTTS: false,
};

export function createInitialGameState(homeId = 'spartans', awayId = 'hornets'): GameState {
  return {
    homeTeamId: homeId,
    awayTeamId: awayId,
    leftFieldTeamId: homeId,
    rightFieldTeamId: awayId,
    possessionTeamId: homeId,
    quarter: 1,
    clock: '12:00',
    homeScore: 0,
    awayScore: 0,
    down: 1,
    distance: 10,
    ballPosition: {
      territoryTeamId: homeId,
      yardLine: 35,
      isMidfield: false,
    },
    lineToGain: {
      territoryTeamId: homeId,
      yardLine: 45,
      isMidfield: false,
    },
    status: 'live',
  };
}
