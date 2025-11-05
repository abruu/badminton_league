export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'pending_approval';

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

export interface Set {
  setNumber: number; // 1, 2, or 3
  score: {
    team1: number; // Points scored (0-17)
    team2: number; // Points scored (0-17)
  };
  winner?: 'team1' | 'team2'; // Winner of this set (if completed)
  locked?: boolean; // true if set manually ended by referee
}

export interface ScoreEvent {
  setNumber: number; // Which set this point was scored in
  team: 'team1' | 'team2'; // Team that scored
  serveBefore: 'team1' | 'team2'; // Serve state before this point
  serveAfter: 'team1' | 'team2'; // Serve state after this point
  timestamp: number; // When the point was scored
}

export interface Match {
  id: string;
  team1: Team;
  team2: Team;
  score: {
    team1: number; // Sets won by team1 (0-2)
    team2: number; // Sets won by team2 (0-2)
  };
  sets: Set[]; // Array of all sets (current + completed)
  currentSetNumber: number; // Current set number (1, 2, or 3)
  servingTeam: 'team1' | 'team2'; // Which team is currently serving (rally scoring)
  team1Position: 'left' | 'right'; // Team 1 court position
  team2Position: 'left' | 'right'; // Team 2 court position
  history: ScoreEvent[]; // Score history for undo functionality
  winner?: Team;
  status: MatchStatus;
  courtId?: string;
  pendingApproval?: boolean;
  requestedBy?: string;
  queueOrder?: number; // For ordering matches in court queue
}

export interface Court {
  id: string;
  name: string;
  refereeId: string;
  refereeName: string;
  match?: Match; // Current active match (for backward compatibility)
  matches?: Match[]; // Queue of matches assigned to this court
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
  username: string;
  password: string;
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
