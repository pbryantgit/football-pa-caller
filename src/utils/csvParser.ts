import { Player, Unit } from '../types';

export interface CSVImportResult {
  players: Player[];
  warnings: string[];
  errors: string[];
  skippedRows: number;
}

export function parseRosterCSV(csvText: string): CSVImportResult {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const result: CSVImportResult = {
    players: [],
    warnings: [],
    errors: [],
    skippedRows: 0,
  };

  if (lines.length < 2) {
    result.errors.push('CSV file is empty or missing data rows.');
    return result;
  }

  // Parse header line
  const headerTokens = splitCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const getColIndex = (names: string[]): number => {
    return headerTokens.findIndex((h) => names.some((n) => h.includes(n)));
  };

  const jerseyIdx = getColIndex(['jerseynumber', 'jersey', 'number', '#']);
  const firstNameIdx = getColIndex(['firstname', 'first']);
  const lastNameIdx = getColIndex(['lastname', 'last']);
  const displayNameIdx = getColIndex(['displayname', 'name', 'playername']);
  const phoneticIdx = getColIndex(['phoneticpronunciation', 'phoneticspelling', 'phonetic', 'pronunciation']);
  const positionIdx = getColIndex(['position', 'pos']);
  const unitIdx = getColIndex(['unit']);
  const activeIdx = getColIndex(['active', 'status']);

  if (jerseyIdx === -1) {
    result.errors.push('CSV must include a jersey number column (e.g. "jerseyNumber", "jersey", or "number").');
    return result;
  }

  const seenNumbers = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const tokens = splitCSVLine(lines[i]);
    if (tokens.length === 0 || tokens.every((t) => !t)) continue;

    const jerseyNumber = tokens[jerseyIdx]?.trim() || '';
    if (!jerseyNumber) {
      result.skippedRows++;
      result.warnings.push(`Row ${i + 1}: Skipped row due to missing jersey number.`);
      continue;
    }

    const firstName = firstNameIdx >= 0 ? tokens[firstNameIdx]?.trim() : '';
    const lastName = lastNameIdx >= 0 ? tokens[lastNameIdx]?.trim() : '';

    let displayName = displayNameIdx >= 0 ? tokens[displayNameIdx]?.trim() : '';
    if (!displayName) {
      if (firstName || lastName) {
        displayName = `${firstName} ${lastName}`.trim();
      } else {
        displayName = `Player #${jerseyNumber}`;
      }
    }

    const phoneticPronunciation = phoneticIdx >= 0 ? tokens[phoneticIdx]?.trim() : '';
    const position = positionIdx >= 0 ? tokens[positionIdx]?.trim() : '';

    let unit: Unit = 'offense';
    if (unitIdx >= 0 && tokens[unitIdx]) {
      const uStr = tokens[unitIdx].toLowerCase();
      if (uStr.includes('def')) unit = 'defense';
      else if (uStr.includes('spec')) unit = 'special-teams';
      else if (uStr.includes('mult')) unit = 'multiple';
    }

    let active = true;
    if (activeIdx >= 0 && tokens[activeIdx]) {
      const actStr = tokens[activeIdx].toLowerCase();
      if (actStr === 'false' || actStr === '0' || actStr === 'inactive') active = false;
    }

    if (seenNumbers.has(jerseyNumber)) {
      result.warnings.push(`Duplicate jersey number #${jerseyNumber} found at row ${i + 1} (${displayName}).`);
    } else {
      seenNumbers.add(jerseyNumber);
    }

    const player: Player = {
      id: `p-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      jerseyNumber,
      firstName,
      lastName,
      displayName,
      phoneticPronunciation,
      position,
      unit,
      active,
    };

    result.players.push(player);
  }

  return result;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function generateCSVTemplate(): string {
  return `jerseyNumber,firstName,lastName,displayName,phoneticPronunciation,position,unit,active
12,Nathan,Smith,Nathan Smith,NAY-thun Smith,QB,Offense,true
33,Nathan,Bryant,Nathan Bryant,NAY-thun BRY-ant,RB,Offense,true
44,Michael,Johnson,Michael Johnson,MY-kul JON-sun,LB,Defense,true
52,David,Williams,David Williams,DAY-vid WILL-yums,LB,Defense,true
88,Tyler,Jones,Tyler Jones,TY-ler Jones,WR,Offense,true`;
}
