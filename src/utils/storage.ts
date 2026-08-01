import { AnnouncementSettings, GameState, PlayRecord, Team } from '../types';
import { createInitialGameState, DEMO_TEAMS, INITIAL_ANNOUNCEMENT_SETTINGS } from './sampleData';

const KEYS = {
  GAME_STATE: 'pa_play_caller_game_state_v2',
  PLAY_HISTORY: 'pa_play_caller_history_v2',
  TEAMS: 'pa_play_caller_teams_v2',
  SETTINGS: 'pa_play_caller_settings_v2',
};

export function loadSavedTeams(): Record<string, Team> {
  try {
    const raw = localStorage.getItem(KEYS.TEAMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load teams from localStorage', e);
  }
  return DEMO_TEAMS;
}

export function saveTeams(teams: Record<string, Team>): void {
  try {
    localStorage.setItem(KEYS.TEAMS, JSON.stringify(teams));
  } catch (e) {
    console.error('Failed to save teams to localStorage', e);
  }
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(KEYS.GAME_STATE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load game state from localStorage', e);
  }
  return createInitialGameState();
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state to localStorage', e);
  }
}

export function loadPlayHistory(): PlayRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.PLAY_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
  }
  return [];
}

export function savePlayHistory(history: PlayRecord[]): void {
  try {
    localStorage.setItem(KEYS.PLAY_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
}

export function loadSettings(): AnnouncementSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
  }
  return INITIAL_ANNOUNCEMENT_SETTINGS;
}

export function saveSettings(settings: AnnouncementSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function exportGameDataJSON(state: GameState, history: PlayRecord[], teams: Record<string, Team>): string {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
    gameState: state,
    playHistory: history,
    teams: teams,
  };
  return JSON.stringify(data, null, 2);
}
