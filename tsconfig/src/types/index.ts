export type MatchStatus = 'upcoming' | 'live' | 'completed';

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  zone: string;
  stats: {
    matchesWon: number;
    matchesLost: number;
    points: number;
  };
}

export interface Match {
  id: string;
  team1: Team;
  team2: Team;
  score: {
    team1: number;
    team2: number;
  };
  winner?: Team;
  status: MatchStatus;
  courtId?: string;
}

export interface Court {
  id: string;
  name: string;
  refereeId: string;
  refereeName: string;
  match?: Match;
}

export interface Zone {
  id: string;
  name: string;
  courts: Court[];
}

export interface Referee {
  id: string;
  name: string;
  courtId?: string;
}

export interface TournamentStats {
  totalMatches: number;
  completedMatches: number;
  bestPlayerByZone: { [zoneId: string]: { player: Player; wins: number } };
  bestTeamByZone: { [zoneId: string]: Team };
  overallBestTeam?: Team;
  overallBestPlayer?: { player: Player; wins: number };
}

export interface ScoreAction {
  matchId: string;
  team: 'team1' | 'team2';
  timestamp: number;
}
