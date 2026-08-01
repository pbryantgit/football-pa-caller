const STORAGE_KEY = 'pa_roster_v3_field_mode';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const teamRosterPresets = {
  eagles: `Player Name,Position,Phonetic Spelling\nEthan Carter,Quarterback,EE-thun KAR-ter\nMason Brooks,Running Back,MAY-sun BROOKS\nNoah Bennett,Wide Receiver,NOH-uh BEN-it\nLiam Foster,Wide Receiver,LEE-um FOSS-ter\nCaleb Turner,Tight End,KAY-leb TER-ner\nOwen Mitchell,Left Tackle,OH-en MITCH-ell\nLogan Price,Left Guard,LOH-gun PRICE\nJacob Hayes,Center,JAY-kub HAYZ\nRyan Collins,Right Guard,RYE-un KAH-linz\nTyler Murphy,Right Tackle,TYE-ler MUR-fee\nAiden Cooper,Fullback,AY-den KOO-per\nIsaac Reed,Defensive End,EYE-zik REED\nHunter Ward,Defensive Tackle,HUN-ter WARD\nBrandon Ellis,Defensive Tackle,BRAN-dun ELL-iss\nConnor Ross,Defensive End,KON-er ROSS\nLuke Simmons,Linebacker,LOOK SIM-unz\nDylan Perry,Linebacker,DILL-un PEAR-ee\nAustin Gray,Linebacker,AW-stin GRAY\nNathan Cook,Cornerback,NAY-thun KOOK\nEvan Bailey,Cornerback,EV-un BAY-lee\nZachary Hughes,Safety,ZAK-uh-ree HYOOZ`,
  lions: `Player Name,Position,Phonetic Spelling\nJackson Miller,Quarterback,JAK-sun MILL-er\nWyatt Parker,Running Back,WYE-ut PAR-ker\nGrayson Adams,Wide Receiver,GRAY-sun AD-umz\nLevi Morgan,Wide Receiver,LEE-vye MOR-gun\nCameron Scott,Tight End,KAM-run SKOT\nBenjamin Foster,Left Tackle,BEN-juh-min FOSS-ter\nAndrew Bailey,Left Guard,AN-droo BAY-lee\nJordan Hill,Center,JOR-dun HILL\nNicholas Kelly,Right Guard,NIK-oh-lus KEL-ee\nParker Young,Right Tackle,PAR-ker YUNG\nCooper James,Fullback,KOO-per JAYMZ\nGavin Long,Defensive End,GAV-in LONG\nPreston White,Defensive Tackle,PRESS-tun WYTE\nTristan Green,Defensive Tackle,TRISS-tun GREEN\nCole Sanders,Defensive End,KOHL SAN-derz\nBlake Howard,Linebacker,BLAYK HOW-erd\nCarson Bell,Linebacker,KAR-sun BELL\nChase Bryant,Linebacker,CHAYS BRY-ant\nDominic Brooks,Cornerback,DOM-in-ik BROOKS\nTrevor Stone,Cornerback,TREV-er STOHN\nColton West,Safety,KOHL-tun WEST`
};

const teamNames = {
  team1: 'Eagles',
  team2: 'Lions'
};

let activeTeam = 'team1';
let offenseTeam = 'team1';
let defenseTeam = 'team2';
let currentPlayType = 'run';
let ballPosition = 50;

let teamState = {
  team1: [],
  team2: []
};

let selectedPlayers = {
  team1: null,
  team2: null
};

let selectedTacklers = {
  team1: [],
  team2: []
};

let gameState = {
  quarter: 1,
  clock: '12:00',
  homeScore: 0,
  awayScore: 0,
  down: 1,
  distance: 10,
  possessionTeam: 'team1'
};

let playHistory = [];

function normalizeState() {
  if (!teamState.team1) teamState.team1 = [];
  if (!teamState.team2) teamState.team2 = [];
  if (!selectedPlayers.team1) selectedPlayers.team1 = null;
  if (!selectedPlayers.team2) selectedPlayers.team2 = null;
  if (!selectedTacklers.team1) selectedTacklers.team1 = [];
  if (!selectedTacklers.team2) selectedTacklers.team2 = [];
  if (ballPosition === undefined || ballPosition === null || Number.isNaN(ballPosition)) {
    ballPosition = 50;
  }

  gameState = {
    quarter: Number(gameState?.quarter || 1),
    clock: gameState?.clock || '12:00',
    homeScore: Number(gameState?.homeScore || 0),
    awayScore: Number(gameState?.awayScore || 0),
    down: Number(gameState?.down || 1),
    distance: Number(gameState?.distance || 10),
    possessionTeam: gameState?.possessionTeam || offenseTeam || 'team1'
  };

  if (!gameState.clock || !/^\d{1,2}:\d{2}$/.test(gameState.clock)) {
    gameState.clock = '12:00';
  }
}

function buildSnapshot() {
  return {
    activeTeam,
    offenseTeam,
    defenseTeam,
    currentPlayType,
    ballPosition,
    teamState: deepClone(teamState),
    selectedPlayers: deepClone(selectedPlayers),
    selectedTacklers: deepClone(selectedTacklers),
    gameState: deepClone(gameState)
  };
}

function saveState() {
  normalizeState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    activeTeam,
    offenseTeam,
    defenseTeam,
    currentPlayType,
    ballPosition,
    teamState,
    selectedPlayers,
    selectedTacklers,
    gameState,
    playHistory
  }));
  renderRosterList();
  renderNumberGrid();
  updateFieldStatus();
  updateTeamButtons();
  updateSideButtons();
  updateGameStatusHeader();
  renderHistory();
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    activeTeam = parsed.activeTeam || 'team1';
    offenseTeam = parsed.offenseTeam || 'team1';
    defenseTeam = parsed.defenseTeam || 'team2';
    currentPlayType = parsed.currentPlayType || 'run';
    ballPosition = Number(parsed.ballPosition ?? 50);
    teamState = {
      team1: parsed.teamState?.team1 || [],
      team2: parsed.teamState?.team2 || []
    };
    selectedPlayers = {
      team1: parsed.selectedPlayers?.team1 || null,
      team2: parsed.selectedPlayers?.team2 || null
    };
    selectedTacklers = {
      team1: parsed.selectedTacklers?.team1 || [],
      team2: parsed.selectedTacklers?.team2 || []
    };
    gameState = { ...{
      quarter: 1,
      clock: '12:00',
      homeScore: 0,
      awayScore: 0,
      down: 1,
      distance: 10,
      possessionTeam: 'team1'
    }, ...(parsed.gameState || {}) };
    playHistory = Array.isArray(parsed.playHistory) ? parsed.playHistory : [];
  }

  normalizeState();
  renderRosterList();
  renderNumberGrid();
  updateFieldStatus();
  updateTeamButtons();
  updateSideButtons();
  updateGameStatusHeader();
  renderHistory();
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const out = [];
  let nextNumber = 1;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const parts = line.split(',').map((part) => part.trim());

    if (!parts.length) continue;

    const headerText = parts.join(',').toLowerCase();
    const isHeader = headerText.includes('player name') && headerText.includes('position') && headerText.includes('phonetic');
    if (index === 0 && isHeader) continue;

    if (parts.length >= 3) {
      const firstValue = parts[0];
      const secondValue = parts[1];
      const thirdValue = parts[2];
      const parsedNumber = parseInt(firstValue, 10);

      if (!Number.isNaN(parsedNumber) && secondValue) {
        out.push({ number: parsedNumber, name: secondValue, position: '', phonetic: thirdValue || '' });
        continue;
      }

      if (firstValue && secondValue) {
        out.push({
          number: nextNumber,
          name: firstValue,
          position: secondValue,
          phonetic: thirdValue || ''
        });
        nextNumber += 1;
      }
    }
  }

  return out;
}

function getCurrentRoster() {
  return teamState[activeTeam] || [];
}

function renderRosterList() {
  const el = document.getElementById('rosterList');
  el.innerHTML = '';

  const roster = getCurrentRoster();
  if (!roster.length) {
    el.textContent = `No ${teamNames[activeTeam]} roster loaded.`;
    return;
  }

  const ul = document.createElement('ul');
  roster.forEach((player) => {
    const li = document.createElement('li');
    const positionText = player.position ? ` — ${player.position}` : '';
    const phoneticText = player.phonetic ? ` (${player.phonetic})` : '';
    li.textContent = `${player.number} — ${player.name}${positionText}${phoneticText}`;
    ul.appendChild(li);
  });

  el.appendChild(ul);
}

function renderNumberGrid() {
  const container = document.getElementById('numberGrid');
  container.innerHTML = '';

  const fieldTeams = [
    { key: 'team1', label: teamNames.team1 },
    { key: 'team2', label: teamNames.team2 }
  ];

  fieldTeams.forEach((team) => {
    const column = document.createElement('div');
    column.className = 'team-number-column';
    column.dataset.teamKey = team.key;

    const label = document.createElement('div');
    label.className = 'team-number-label';
    label.textContent = team.label;
    column.appendChild(label);

    const roster = teamState[team.key] || [];
    if (!roster.length) {
      const empty = document.createElement('div');
      empty.className = 'team-number-empty';
      empty.textContent = `No ${team.label} roster`;
      column.appendChild(empty);
      container.appendChild(column);
      return;
    }

    roster.forEach((player) => {
      const btn = document.createElement('button');
      btn.className = 'numBtn';
      btn.textContent = player.number;
      btn.title = `${team.label}: ${player.name}`;
      btn.type = 'button';

      const isSelectedOffense = team.key === offenseTeam && selectedPlayers[team.key] === player.number;
      const isSelectedTackler = team.key === defenseTeam && (selectedTacklers[team.key] || []).includes(player.number);
      if (isSelectedOffense || isSelectedTackler) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        if (team.key === offenseTeam) {
          selectedPlayers[team.key] = selectedPlayers[team.key] === player.number ? null : player.number;
        } else if (team.key === defenseTeam) {
          const existing = selectedTacklers[team.key] || [];
          if (existing.includes(player.number)) {
            selectedTacklers[team.key] = existing.filter((number) => number !== player.number);
          } else {
            selectedTacklers[team.key] = [...existing, player.number];
          }
        }
        saveState();
      });

      column.appendChild(btn);
    });

    container.appendChild(column);
  });

  updateSelectionUI();
}

function updateTeamButtons() {
  document.querySelectorAll('.team-btn').forEach((button) => {
    const isActive = button.dataset.team === activeTeam;
    button.classList.toggle('active', isActive);
  });
}

function updateSideButtons() {
  document.querySelectorAll('.side-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.offense === offenseTeam);
  });
}

function updateSelectionUI() {
  const buttons = document.querySelectorAll('.numBtn');
  buttons.forEach((btn) => {
    const teamKey = btn.closest('.team-number-column') && btn.closest('.team-number-column').dataset.teamKey;
    const num = parseInt(btn.textContent, 10);
    const isSelectedOffense = teamKey === offenseTeam && num === selectedPlayers[teamKey];
    const isSelectedTackler = teamKey === defenseTeam && (selectedTacklers[teamKey] || []).includes(num);
    btn.classList.toggle('selected', isSelectedOffense || isSelectedTackler);
  });

  const offensePlayer = offenseTeam ? selectedPlayers[offenseTeam] : null;
  const offenseRoster = teamState[offenseTeam] || [];
  const offenseInfo = offenseRoster.find((player) => player.number === offensePlayer);
  const badge = document.getElementById('selectedPlayerBadge');

  if (offenseInfo) {
    badge.textContent = `#${offenseInfo.number} ${offenseInfo.name || offenseInfo.phonetic || 'Player'} (${teamNames[offenseTeam]})`;
    document.getElementById('playActions').classList.remove('hidden');
  } else {
    badge.textContent = `Choose a ${teamNames[offenseTeam]} player`;
    document.getElementById('playActions').classList.add('hidden');
  }

  const tacklers = (selectedTacklers[defenseTeam] || []).map((number) => {
    const player = (teamState[defenseTeam] || []).find((entry) => entry.number === number);
    return player ? `#${number} ${player.name || player.phonetic || 'Player'}` : `#${number}`;
  });

  const tackleBadge = document.getElementById('tackleBadge');
  if (tacklers.length) {
    tackleBadge.textContent = `Tackle: ${tacklers.join(', ')}`;
  } else {
    tackleBadge.textContent = 'Tackle: none selected';
  }

  const offenseDisplay = document.getElementById('offenseDisplay');
  const defenseDisplay = document.getElementById('defenseDisplay');

  if (offenseInfo) {
    offenseDisplay.textContent = `Offense: #${offenseInfo.number}`;
  } else {
    offenseDisplay.textContent = 'Choose offense';
  }

  if (tacklers.length) {
    defenseDisplay.textContent = `Defense: ${tacklers.slice(0, 2).join(', ')}${tacklers.length > 2 ? ' + more' : ''}`;
  } else {
    defenseDisplay.textContent = 'Choose defense';
  }
}

function updateGameStatusHeader() {
  const homeScoreEl = document.getElementById('homeScore');
  const awayScoreEl = document.getElementById('awayScore');
  const quarterLabelEl = document.getElementById('quarterLabel');
  const clockLabelEl = document.getElementById('clockLabel');
  const downDistanceEl = document.getElementById('downDistanceLabel');

  if (homeScoreEl) homeScoreEl.textContent = String(gameState.homeScore);
  if (awayScoreEl) awayScoreEl.textContent = String(gameState.awayScore);
  if (quarterLabelEl) quarterLabelEl.textContent = `Q${gameState.quarter}`;
  if (clockLabelEl) clockLabelEl.textContent = gameState.clock;
  if (downDistanceEl) {
    const ordinalMap = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };
    const ordinal = ordinalMap[gameState.down] || `${gameState.down}th`;
    downDistanceEl.textContent = `${ordinal} & ${gameState.distance}`;
  }

  const homeScoreInput = document.getElementById('homeScoreInput');
  const awayScoreInput = document.getElementById('awayScoreInput');
  const quarterInput = document.getElementById('quarterInput');
  const clockInput = document.getElementById('clockInput');
  if (homeScoreInput) homeScoreInput.value = String(gameState.homeScore);
  if (awayScoreInput) awayScoreInput.value = String(gameState.awayScore);
  if (quarterInput) quarterInput.value = String(gameState.quarter);
  if (clockInput) clockInput.value = gameState.clock;
}

function updateFieldStatus() {
  const dirLabel = document.getElementById('directionLabel');
  const team1Status = document.getElementById('team1Status');
  const team2Status = document.getElementById('team2Status');
  const team1Label = document.querySelector('.field-team.team-one .team-label');
  const team2Label = document.querySelector('.field-team.team-two .team-label');

  team1Label.textContent = teamNames.team1;
  team2Label.textContent = teamNames.team2;

  team1Status.textContent = offenseTeam === 'team1' ? 'Offense' : 'Defense';
  team2Status.textContent = offenseTeam === 'team2' ? 'Offense' : 'Defense';

  if (offenseTeam === 'team1') {
    dirLabel.textContent = `${teamNames.team1} moving right`;
  } else {
    dirLabel.textContent = `${teamNames.team2} moving left`;
  }

  const ballMarker = document.getElementById('ballMarker');
  if (ballMarker) {
    const rawPercent = Number.isFinite(ballPosition) ? ballPosition : 50;
    const bounded = Math.min(100, Math.max(0, rawPercent));
    const mirroredValue = offenseTeam === 'team1' ? bounded : 100 - bounded;
    ballMarker.style.left = `${mirroredValue}%`;
  }

  const offenseDisplay = document.getElementById('offenseDisplay');
  const defenseDisplay = document.getElementById('defenseDisplay');
  if (offenseDisplay && defenseDisplay) {
    const offenseSide = offenseTeam === 'team1' ? 'left' : 'right';
    offenseDisplay.style.left = offenseSide === 'left' ? '12%' : 'auto';
    offenseDisplay.style.right = offenseSide === 'right' ? '12%' : 'auto';
    defenseDisplay.style.left = offenseSide === 'left' ? 'auto' : '12%';
    defenseDisplay.style.right = offenseSide === 'left' ? '12%' : 'auto';
  }
}

function renderHistory() {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;

  historyList.innerHTML = '';
  if (!playHistory.length) {
    const empty = document.createElement('div');
    empty.className = 'history-item';
    empty.textContent = 'No committed plays yet.';
    historyList.appendChild(empty);
    return;
  }

  playHistory.slice().reverse().forEach((entry) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = `${entry.sequence}. ${entry.summary || entry.announcement || 'Play logged'}`;
    historyList.appendChild(item);
  });
}

function formatName(teamKey, number) {
  const roster = teamState[teamKey] || [];
  const player = roster.find((entry) => entry.number === number);
  if (!player) return `#${number}`;
  return player.phonetic || player.name || `#${number}`;
}

function getBallDirectionLabel() {
  return offenseTeam === 'team1' ? 'right' : 'left';
}

function getClampedBallValues() {
  const start = parseInt(document.getElementById('startYard').value, 10) || 50;
  const endYard = parseInt(document.getElementById('ballAfterPlay').value, 10);
  const safeStart = Math.min(100, Math.max(0, start));
  const safeEnd = Number.isFinite(endYard) ? Math.min(100, Math.max(0, endYard)) : safeStart;
  return { start: safeStart, end: safeEnd };
}

function computeStatement() {
  const { start, end } = getClampedBallValues();
  const carrier = selectedPlayers[offenseTeam];
  const tacklers = selectedTacklers[defenseTeam] || [];

  if (!carrier) {
    alert('Select an offensive jersey first.');
    return '';
  }

  const effectiveEnd = end;
  const yardsDelta = effectiveEnd - start;
  const direction = getBallDirectionLabel();
  const ballSummary = `ball on the ${effectiveEnd} with ${yardsDelta >= 0 ? `a gain of ${Math.abs(yardsDelta)}` : `a loss of ${Math.abs(yardsDelta)}`} yards ${yardsDelta >= 0 ? 'downfield' : 'backward'}`;

  ballPosition = effectiveEnd;
  document.getElementById('startYard').value = String(start);
  document.getElementById('ballAfterPlay').value = String(effectiveEnd);

  let description = '';

  if (currentPlayType === 'run') {
    description = `${formatName(offenseTeam, carrier)} with the carry ${ballSummary} toward the ${direction}.`;
  } else if (currentPlayType === 'pass') {
    description = `${formatName(offenseTeam, carrier)} on the pass ${ballSummary} toward the ${direction}.`;
  } else if (currentPlayType === 'penalty') {
    description = `Penalty on ${formatName(offenseTeam, carrier)} near the ${effectiveEnd}.`;
  } else if (currentPlayType === 'sack') {
    description = `${formatName(offenseTeam, carrier)} wrapped up for a sack at the ${effectiveEnd}.`;
  }

  if (tacklers.length) {
    const tacklerNames = tacklers.map((number) => formatName(defenseTeam, number));
    description += ` Tackled by ${tacklerNames.join(', ')}.`;
  }

  updateFieldStatus();
  return `${teamNames[offenseTeam]} offense: ${description}.`;
}

const playButtons = document.querySelectorAll('.action-btn');
playButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentPlayType = button.dataset.type;
    const statement = computeStatement();
    if (statement) {
      document.getElementById('preview').textContent = statement;
    }
  });
});

document.querySelectorAll('.team-btn').forEach((button) => {
  button.addEventListener('click', () => {
    activeTeam = button.dataset.team;
    saveState();
  });
});

document.querySelectorAll('.side-btn').forEach((button) => {
  button.addEventListener('click', () => {
    offenseTeam = button.dataset.offense;
    defenseTeam = offenseTeam === 'team1' ? 'team2' : 'team1';
    gameState.possessionTeam = offenseTeam;
    saveState();
  });
});

function commitPlay() {
  const statement = computeStatement();
  if (!statement) return;

  const beforeSnapshot = buildSnapshot();
  const startLine = Number(document.getElementById('startYard').value || 50);
  const endLine = Number(document.getElementById('ballAfterPlay').value || startLine);
  const delta = endLine - startLine;
  const summary = `${teamNames[offenseTeam]} ${currentPlayType} • ${delta >= 0 ? '+' : ''}${delta} yds to ${endLine}`;

  ballPosition = endLine;
  gameState.possessionTeam = offenseTeam;
  const nextSequence = playHistory.length + 1;

  const entry = {
    sequence: nextSequence,
    summary,
    announcement: statement,
    before: beforeSnapshot,
    after: buildSnapshot(),
    createdAt: new Date().toISOString()
  };

  playHistory.push(entry);
  saveState();
  document.getElementById('preview').textContent = statement;
}

document.getElementById('commitPlay').addEventListener('click', commitPlay);

document.getElementById('undoLastPlay').addEventListener('click', () => {
  if (!playHistory.length) return;

  const lastEntry = playHistory.pop();
  if (!lastEntry || !lastEntry.before) {
    saveState();
    return;
  }

  const previousState = lastEntry.before;
  activeTeam = previousState.activeTeam;
  offenseTeam = previousState.offenseTeam;
  defenseTeam = previousState.defenseTeam;
  currentPlayType = previousState.currentPlayType;
  ballPosition = previousState.ballPosition;
  teamState = deepClone(previousState.teamState);
  selectedPlayers = deepClone(previousState.selectedPlayers);
  selectedTacklers = deepClone(previousState.selectedTacklers);
  gameState = deepClone(previousState.gameState);
  saveState();
});

const rosterToggle = document.getElementById('toggleRoster');
let rosterExpanded = true;

if (rosterToggle) {
  const setRosterExpanded = (expanded) => {
    const panel = document.getElementById('roster');
    rosterExpanded = expanded;
    panel.classList.toggle('collapsed', !expanded);
    rosterToggle.setAttribute('aria-expanded', String(expanded));
    const indicator = rosterToggle.querySelector('.toggle-indicator');
    if (indicator) indicator.textContent = expanded ? '▾' : '▸';
  };

  rosterToggle.addEventListener('click', () => {
    setRosterExpanded(!rosterExpanded);
  });
}

// UI wiring
document.getElementById('csvFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const text = await file.text();
  const parsed = parseCSV(text);
  if (parsed.length) {
    teamState[activeTeam] = parsed;
    saveState();
  }
});

document.getElementById('loadManual').onclick = () => {
  const text = document.getElementById('manualRoster').value.trim();
  if (!text) return alert('Paste CSV (number,name,phonetic) or JSON array.');

  try {
    if (text.startsWith('[')) {
      teamState[activeTeam] = JSON.parse(text);
    } else {
      teamState[activeTeam] = parseCSV(text);
    }
    saveState();
  } catch (error) {
    alert('Invalid input: ' + error.message);
  }
};

document.getElementById('clearRoster').onclick = () => {
  teamState[activeTeam] = [];
  selectedPlayers[activeTeam] = null;
  saveState();
};

document.querySelectorAll('.preset-btn').forEach((button) => {
  button.addEventListener('click', async () => {
    const preset = button.dataset.preset;
    const csvText = teamRosterPresets[preset];
    if (csvText) {
      teamState[activeTeam] = parseCSV(csvText);
      saveState();
    }
  });
});

document.getElementById('ballAfterPlay').addEventListener('input', () => {
  const nextBall = parseInt(document.getElementById('ballAfterPlay').value, 10);
  if (Number.isFinite(nextBall)) {
    ballPosition = Math.min(100, Math.max(0, nextBall));
    updateFieldStatus();
  }
});

document.getElementById('generate').onclick = () => {
  const statement = computeStatement();
  if (statement) {
    document.getElementById('preview').textContent = statement;
  }
};

loadState();
updateSelectionUI();
updateFieldStatus();