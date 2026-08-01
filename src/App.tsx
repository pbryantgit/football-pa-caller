import React, { useEffect, useState } from 'react';
import { AnnouncementSettings, FieldPosition, GameState, PlayParticipants, PlayRecord, PlayType, Team } from './types';
import { loadGameState, loadPlayHistory, loadSavedTeams, loadSettings, saveGameState, savePlayHistory, saveTeams, saveSettings } from './utils/storage';
import { proposeNextGameState, calculateLineToGain } from './utils/footballEngine';
import { generateAnnouncement } from './utils/announcementEngine';
import { Header } from './components/Header/Header';
import { PlayTypeSelector } from './components/Dashboard/PlayTypeSelector';
import { DynamicPlayPanel } from './components/Dashboard/DynamicPlayPanel';
import { AnnouncementCard } from './components/Dashboard/AnnouncementCard';
import { RosterModal } from './components/Roster/RosterModal';
import { NewGameModal } from './components/NewGame/NewGameModal';
import { HistoryDrawer } from './components/History/HistoryDrawer';
import { SettingsModal } from './components/Settings/SettingsModal';

export const App: React.FC = () => {
  // Persistent State
  const [teams, setTeams] = useState<Record<string, Team>>(() => loadSavedTeams());
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const [playHistory, setPlayHistory] = useState<PlayRecord[]>(() => loadPlayHistory());
  const [settings, setSettings] = useState<AnnouncementSettings>(() => loadSettings());

  // Active Live Play Input State
  const [currentPlayType, setCurrentPlayType] = useState<PlayType>('run');
  const [participants, setParticipants] = useState<PlayParticipants>({ assistDefenderIds: [], returnTacklerIds: [] });
  const [endBallPos, setEndBallPos] = useState<FieldPosition>(gameState.ballPosition);
  const [isTouchdown, setIsTouchdown] = useState<boolean>(false);
  const [announcementText, setAnnouncementText] = useState<string>('');

  // Active Modals
  const [activeModal, setActiveModal] = useState<'newGame' | 'roster' | 'history' | 'settings' | null>(null);

  // Auto-Save listeners
  useEffect(() => {
    saveTeams(teams);
  }, [teams]);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  useEffect(() => {
    savePlayHistory(playHistory);
  }, [playHistory]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Sync end ball position when starting ball position changes
  useEffect(() => {
    setEndBallPos(gameState.ballPosition);
  }, [gameState.ballPosition]);

  // Calculate live proposal and generate announcement
  useEffect(() => {
    const proposal = proposeNextGameState(gameState, currentPlayType, endBallPos, { isTouchdown });
    const text = generateAnnouncement(
      currentPlayType,
      participants,
      gameState,
      endBallPos,
      teams,
      settings,
      proposal.gainLoss,
      proposal.nextState,
      isTouchdown
    );
    setAnnouncementText(text);
  }, [gameState, currentPlayType, endBallPos, participants, teams, settings, isTouchdown]);

  // Handle Play Type Change
  const handleSelectPlayType = (type: PlayType) => {
    setCurrentPlayType(type);
    setParticipants({ assistDefenderIds: [], returnTacklerIds: [] });
    setIsTouchdown(false);
  };

  // Commit Play Action
  const handleCommitPlay = () => {
    const proposal = proposeNextGameState(gameState, currentPlayType, endBallPos, { isTouchdown });

    const newRecord: PlayRecord = {
      id: `play-${Date.now()}`,
      sequence: playHistory.length + 1,
      playType: currentPlayType,
      startState: { ...gameState },
      endState: { ...proposal.nextState },
      participants: { ...participants },
      endBallPosition: { ...endBallPos },
      gainLoss: proposal.gainLoss,
      announcement: announcementText,
      createdAt: new Date().toISOString(),
    };

    // Update state & history
    const nextHistory = [...playHistory, newRecord];
    setPlayHistory(nextHistory);
    setGameState(proposal.nextState);

    // Reset play inputs for next play
    setParticipants({ assistDefenderIds: [], returnTacklerIds: [] });
    setIsTouchdown(false);
  };

  // Undo Last Play Action
  const handleUndoLastPlay = () => {
    if (playHistory.length === 0) return;
    const lastPlay = playHistory[playHistory.length - 1];
    const remainingHistory = playHistory.slice(0, -1);

    setPlayHistory(remainingHistory);
    setGameState(lastPlay.startState);
    setEndBallPos(lastPlay.startState.ballPosition);
  };

  // Update game state — always recompute lineToGain so the first-down marker
  // stays correct when possession, down, distance, or field sides change manually.
  const handleUpdateGameState = (newState: GameState) => {
    const recomputedLineToGain = calculateLineToGain(
      newState.ballPosition,
      newState.distance,
      newState.possessionTeamId,
      newState.leftFieldTeamId,
      newState.rightFieldTeamId
    );
    setGameState({ ...newState, lineToGain: recomputedLineToGain });
  };

  // Reset the first-down line to 10 yards ahead of a given ball position.
  // Also moves gameState.ballPosition so the field ball marker and arrow update visually.
  const handleResetLineToGain = (fromPos: FieldPosition) => {
    const newLineToGain = calculateLineToGain(
      fromPos,
      10,
      gameState.possessionTeamId,
      gameState.leftFieldTeamId,
      gameState.rightFieldTeamId
    );
    setGameState((prev) => ({
      ...prev,
      ballPosition: fromPos,   // ← move the ball to the re-spotted position
      distance: 10,
      down: 1,
      lineToGain: newLineToGain,
    }));
    // Sync the ending position input to the new ball spot
    setEndBallPos(fromPos);
  };

  return (
    <div className="app-container">
      {/* Persistent Header */}
      <Header
        gameState={gameState}
        teams={teams}
        onUpdateGameState={handleUpdateGameState}
        onOpenNewGame={() => setActiveModal('newGame')}
        onOpenRoster={() => setActiveModal('roster')}
        onOpenHistory={() => setActiveModal('history')}
        onOpenSettings={() => setActiveModal('settings')}
        onUndoLastPlay={handleUndoLastPlay}
        canUndo={playHistory.length > 0}
      />

      {/* Main 3-Column Dashboard View */}
      <main className="dashboard-grid">
        {/* Left Column: Play Type Selector */}
        <PlayTypeSelector
          currentPlayType={currentPlayType}
          onSelectPlayType={handleSelectPlayType}
        />

        {/* Center Column: Dynamic Interactive Entry Panel */}
        <DynamicPlayPanel
          gameState={gameState}
          teams={teams}
          playType={currentPlayType}
          participants={participants}
          onUpdateParticipants={setParticipants}
          endBallPos={endBallPos}
          onUpdateEndBallPos={setEndBallPos}
          isTouchdown={isTouchdown}
          onToggleTouchdown={setIsTouchdown}
          onResetLineToGain={handleResetLineToGain}
        />

        {/* Right Column: Announcement Preview & Actions */}
        <AnnouncementCard
          announcementText={announcementText}
          onUpdateAnnouncementText={setAnnouncementText}
          onCommitPlay={handleCommitPlay}
          onUndoLastPlay={handleUndoLastPlay}
          canUndo={playHistory.length > 0}
          isTouchdown={isTouchdown}
        />
      </main>

      {/* Modals */}
      {activeModal === 'newGame' && (
        <NewGameModal
          teams={teams}
          onStartGame={(st) => {
            setGameState(st);
            setPlayHistory([]);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'roster' && (
        <RosterModal
          teams={teams}
          onSaveTeams={setTeams}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'history' && (
        <HistoryDrawer
          history={playHistory}
          teams={teams}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onSaveSettings={setSettings}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};
