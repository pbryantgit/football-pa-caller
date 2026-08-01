import { AnnouncementSettings, FieldPosition, GameState, PlayParticipants, PlayType, Team } from '../types';
import { formatFieldPositionFull } from './fieldMath';

const ORDINAL_DOWNS: Record<number, string> = {
  1: 'first down',
  2: 'second down',
  3: 'third down',
  4: 'fourth down',
};

const SHORT_DOWNS: Record<number, string> = {
  1: '1st down',
  2: '2nd down',
  3: '3rd down',
  4: '4th down',
};

export function formatPlayer(
  playerId: string | undefined,
  team: Team | undefined,
  settings: AnnouncementSettings
): string {
  if (!playerId || !team) return '';
  const player = team.roster.find((p) => p.id === playerId);
  if (!player) return '';

  const numStr = settings.sayJerseyPrefix ? `Number ${player.jerseyNumber}` : `#${player.jerseyNumber}`;
  if (!settings.includePlayerNames) {
    return numStr;
  }
  return `${numStr} ${player.displayName}`;
}

export function formatTeamName(team: Team | undefined, settings: AnnouncementSettings): string {
  if (!team) return 'Team';
  return settings.useMascotName ? team.mascot : team.shortName || team.schoolName;
}

export function formatDownAndDistance(
  down: number,
  distance: number,
  possessionTeam: Team | undefined,
  settings: AnnouncementSettings
): string {
  const downStr = settings.useOrdinalDowns ? ORDINAL_DOWNS[down] || `${down}th down` : SHORT_DOWNS[down] || `${down}th & ${distance}`;
  const teamName = formatTeamName(possessionTeam, settings);
  if (distance <= 0) {
    return `It will be ${downStr} and Goal for the ${teamName}.`;
  }
  return `It will be ${downStr} and ${distance} for the ${teamName}.`;
}

/**
 * Generates natural language announcement string for a given play.
 */
export function generateAnnouncement(
  playType: PlayType,
  participants: PlayParticipants,
  startState: GameState,
  endBallPos: FieldPosition,
  teams: Record<string, Team>,
  settings: AnnouncementSettings,
  gainLoss: number,
  nextState: GameState,
  isTouchdown?: boolean
): string {
  const offTeam = teams[startState.possessionTeamId];
  const defTeamId = startState.possessionTeamId === startState.homeTeamId ? startState.awayTeamId : startState.homeTeamId;
  const defTeam = teams[defTeamId];

  const offTeamName = formatTeamName(offTeam, settings);
  const defTeamName = formatTeamName(defTeam, settings);

  const endSpotStr = formatFieldPositionFull(endBallPos, teams, settings.useMascotName);

  // Tackler formatting
  let tacklerClause = '';
  if (settings.includeTacklers && participants.primaryDefenderId) {
    const primaryTackler = formatPlayer(participants.primaryDefenderId, defTeam, settings);
    if (participants.assistDefenderIds && participants.assistDefenderIds.length > 0) {
      const assistTacklers = participants.assistDefenderIds
        .map((id) => formatPlayer(id, defTeam, settings))
        .filter(Boolean)
        .join(', ');
      tacklerClause = `, tackled by ${primaryTackler} with help from ${assistTacklers}`;
    } else {
      tacklerClause = `, brought down by ${primaryTackler}`;
    }
  }

  // Yardage phrase
  let yardPhrase = '';
  if (gainLoss > 0) {
    yardPhrase = `after a gain of ${gainLoss} yard${gainLoss === 1 ? '' : 's'}`;
  } else if (gainLoss < 0) {
    yardPhrase = `for a loss of ${Math.abs(gainLoss)} yard${Math.abs(gainLoss) === 1 ? '' : 's'}`;
  } else {
    yardPhrase = 'for no gain';
  }

  if (isTouchdown) {
    const carrier = formatPlayer(participants.ballCarrierId || participants.receiverId, offTeam, settings);
    return `TOUCHDOWN ${offTeamName}! ${carrier ? `${carrier} ` : ''}carries it in to the end zone!`;
  }

  switch (playType) {
    case 'run': {
      const carrier = formatPlayer(participants.ballCarrierId, offTeam, settings) || 'The ball carrier';
      const downNotice = nextState.down === 1 && nextState.possessionTeamId === startState.possessionTeamId
        ? `First down, ${offTeamName}!`
        : formatDownAndDistance(nextState.down, nextState.distance, teams[nextState.possessionTeamId], settings);
      return `${carrier} on the carry for the ${offTeamName}${tacklerClause} ${yardPhrase} to the ${endSpotStr}. ${downNotice}`;
    }

    case 'pass-complete': {
      const passer = formatPlayer(participants.passerId, offTeam, settings) || 'Passer';
      const receiver = formatPlayer(participants.receiverId, offTeam, settings) || 'intended receiver';
      const downNotice = nextState.down === 1 && nextState.possessionTeamId === startState.possessionTeamId
        ? `First down, ${offTeamName}!`
        : formatDownAndDistance(nextState.down, nextState.distance, teams[nextState.possessionTeamId], settings);
      return `${passer} completes the pass to ${receiver}${tacklerClause} ${yardPhrase} to the ${endSpotStr}. ${downNotice}`;
    }

    case 'pass-incomplete': {
      const passer = formatPlayer(participants.passerId, offTeam, settings) || 'Passer';
      const receiver = participants.intendedReceiverId ? formatPlayer(participants.intendedReceiverId, offTeam, settings) : null;
      const targetStr = receiver ? ` intended for ${receiver}` : '';
      const downNotice = formatDownAndDistance(nextState.down, nextState.distance, teams[nextState.possessionTeamId], settings);
      return `${passer}'s pass${targetStr} is incomplete. ${downNotice}`;
    }

    case 'sack': {
      const qb = formatPlayer(participants.passerId || participants.ballCarrierId, offTeam, settings) || 'Quarterback';
      const sacker = participants.primaryDefenderId ? formatPlayer(participants.primaryDefenderId, defTeam, settings) : 'defensive line';
      const lossYards = Math.abs(gainLoss);
      const downNotice = formatDownAndDistance(nextState.down, nextState.distance, teams[nextState.possessionTeamId], settings);
      return `${qb} is sacked by ${sacker} for a loss of ${lossYards} yard${lossYards === 1 ? '' : 's'} back to the ${endSpotStr}. ${downNotice}`;
    }

    case 'interception': {
      const passer = formatPlayer(participants.passerId, offTeam, settings) || 'Passer';
      const interceptor = formatPlayer(participants.interceptorId, defTeam, settings) || 'The defense';
      return `${passer}'s pass is intercepted by ${interceptor} and returned to the ${endSpotStr}. First down, ${defTeamName}!`;
    }

    case 'fumble': {
      const fumbler = formatPlayer(participants.fumblerId, offTeam, settings) || 'The ball carrier';
      const recoveringTeam = teams[participants.recoveringTeamId || ''] || offTeam;
      const recTeamName = formatTeamName(recoveringTeam, settings);
      const recPlayer = participants.recoveringPlayerId ? ` by ${formatPlayer(participants.recoveringPlayerId, recoveringTeam, settings)}` : '';
      return `Fumble on the play! ${fumbler} fumbles, recovered${recPlayer} for the ${recTeamName} at the ${endSpotStr}.`;
    }

    case 'penalty': {
      const pd = participants.penaltyDetails;
      const penaltyTeam = pd?.side === 'defense' ? defTeam : offTeam;
      const penaltyTeamName = formatTeamName(penaltyTeam, settings);
      const penaltyNameStr = pd?.penaltyName ? `${pd.penaltyName}` : 'Penalty';
      const yardsStr = pd?.yards ? `${pd.yards}-yard penalty` : 'Penalty';

      const downNotice = nextState.down === 1 && nextState.possessionTeamId === startState.possessionTeamId
        ? `First down, ${offTeamName}!`
        : formatDownAndDistance(nextState.down, nextState.distance, teams[nextState.possessionTeamId], settings);

      return `Penalty on the play, ${penaltyNameStr} against the ${penaltyTeamName}. ${yardsStr} enforced to the ${endSpotStr}. ${downNotice}`;
    }

    case 'punt': {
      const punter = formatPlayer(participants.punterId, offTeam, settings) || 'Punter';
      const returner = formatPlayer(participants.returnerId, defTeam, settings);
      const returnerClause = returner ? `, returned by ${returner}` : '';
      return `${punter} punts downfield${returnerClause} to the ${endSpotStr}. First down, ${defTeamName}.`;
    }

    case 'kickoff': {
      const kicker = formatPlayer(participants.kickerId, offTeam, settings) || 'Kicker';
      const returner = formatPlayer(participants.returnerId, defTeam, settings);
      const returnerClause = returner ? `, returned by ${returner}` : '';
      return `${kicker} kicks off${returnerClause}, ball spotted at the ${endSpotStr}. First down, ${defTeamName}.`;
    }

    case 'field-goal': {
      const kicker = formatPlayer(participants.kickerId, offTeam, settings) || 'Kicker';
      return `Field Goal is GOOD by ${kicker}! 3 points for the ${offTeamName}!`;
    }

    case 'extra-point': {
      const kicker = formatPlayer(participants.kickerId, offTeam, settings) || 'Kicker';
      return `Extra point is GOOD by ${kicker}! The ${offTeamName} lead!`;
    }

    default: {
      return `Play committed to the ${endSpotStr}.`;
    }
  }
}
