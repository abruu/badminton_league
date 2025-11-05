import { create } from 'zustand';
import { Team, Match, Court, Referee, Zone, ScoreAction } from '../types';
import { storage } from '../utils/storage';
import { calculations } from '../utils/calculations';

interface TournamentState {
  teams: Team[];
  matches: Match[];
  courts: Court[];
  referees: Referee[];
  zones: Zone[];
  scoreHistory: ScoreAction[];

  // Actions
  initializeData: () => void;
  refreshData: () => void;
  
  // Team actions
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;

  // Match actions
  addMatch: (match: Match) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  assignMatchToCourt: (matchId: string, courtId: string) => void;
  updateMatchScore: (matchId: string, team: 'team1' | 'team2', points: number) => void;
  finishMatch: (matchId: string) => void;
  undoLastScore: (matchId: string) => void;

  // Court actions
  addCourt: (court: Court) => void;
  updateCourt: (courtId: string, updates: Partial<Court>) => void;

  // Referee actions
  addReferee: (referee: Referee) => void;
  assignRefereeToCourt: (refereeId: string, courtId: string) => void;

  // Zone actions
  initializeZones: () => void;

  // Utility
  resetTournament: () => void;
  getTeamStats: () => Team[];
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  teams: [],
  matches: [],
  courts: [],
  referees: [],
  zones: [],
  scoreHistory: [],

  initializeData: () => {
    const teams = storage.loadTeams();
    const matches = storage.loadMatches();
    const courts = storage.loadCourts();
    const referees = storage.loadReferees();
    const zones = storage.loadZones();

    // Initialize default zones if none exist
    if (zones.length === 0) {
      const defaultZones: Zone[] = [
        { id: 'zone-a', name: 'Zone A', courts: [] },
        { id: 'zone-b', name: 'Zone B', courts: [] },
        { id: 'zone-c', name: 'Zone C', courts: [] },
        { id: 'zone-d', name: 'Zone D', courts: [] }
      ];
      storage.saveZones(defaultZones);
      set({ zones: defaultZones });
    } else {
      set({ zones });
    }

    // Initialize default courts if none exist
    if (courts.length === 0) {
      const defaultCourts: Court[] = [
        { id: 'court-1', name: 'Court 1', refereeId: '', refereeName: 'Unassigned' },
        { id: 'court-2', name: 'Court 2', refereeId: '', refereeName: 'Unassigned' },
        { id: 'court-3', name: 'Court 3', refereeId: '', refereeName: 'Unassigned' }
      ];
      storage.saveCourts(defaultCourts);
      set({ courts: defaultCourts });
    } else {
      set({ courts });
    }

    set({ teams, matches, referees });
  },

  refreshData: () => {
    const teams = storage.loadTeams();
    const matches = storage.loadMatches();
    const courts = storage.loadCourts();
    const referees = storage.loadReferees();
    const zones = storage.loadZones();
    set({ teams, matches, courts, referees, zones });
  },

  addTeam: (team) => {
    const updatedTeams = [...get().teams, team];
    set({ teams: updatedTeams });
    storage.saveTeams(updatedTeams);
  },

  updateTeam: (teamId, updates) => {
    const updatedTeams = get().teams.map(team =>
      team.id === teamId ? { ...team, ...updates } : team
    );
    set({ teams: updatedTeams });
    storage.saveTeams(updatedTeams);
  },

  deleteTeam: (teamId) => {
    const updatedTeams = get().teams.filter(team => team.id !== teamId);
    set({ teams: updatedTeams });
    storage.saveTeams(updatedTeams);
  },

  addMatch: (match) => {
    const updatedMatches = [...get().matches, match];
    set({ matches: updatedMatches });
    storage.saveMatches(updatedMatches);
  },

  updateMatch: (matchId, updates) => {
    const updatedMatches = get().matches.map(match =>
      match.id === matchId ? { ...match, ...updates } : match
    );
    set({ matches: updatedMatches });
    storage.saveMatches(updatedMatches);
  },

  assignMatchToCourt: (matchId, courtId) => {
    const match = get().matches.find(m => m.id === matchId);
    if (!match) return;

    // Update match
    const updatedMatches = get().matches.map(m =>
      m.id === matchId ? { ...m, courtId, status: 'live' as const } : m
    );

    // Update court
    const updatedCourts = get().courts.map(c =>
      c.id === courtId ? { ...c, match: { ...match, courtId, status: 'live' as const } } : c
    );

    set({ matches: updatedMatches, courts: updatedCourts });
    storage.saveMatches(updatedMatches);
    storage.saveCourts(updatedCourts);
  },

  updateMatchScore: (matchId, team, points) => {
    const updatedMatches = get().matches.map(match => {
      if (match.id === matchId) {
        const newScore = { ...match.score };
        newScore[team] = points;
        return { ...match, score: newScore };
      }
      return match;
    });

    // Update court with new match data
    const match = updatedMatches.find(m => m.id === matchId);
    if (match && match.courtId) {
      const updatedCourts = get().courts.map(c =>
        c.id === match.courtId ? { ...c, match } : c
      );
      set({ courts: updatedCourts });
      storage.saveCourts(updatedCourts);
    }

    // Add to score history
    const scoreAction: ScoreAction = {
      matchId,
      team,
      timestamp: Date.now()
    };
    const updatedHistory = [...get().scoreHistory, scoreAction];

    set({ matches: updatedMatches, scoreHistory: updatedHistory });
    storage.saveMatches(updatedMatches);
  },

  finishMatch: (matchId) => {
    const match = get().matches.find(m => m.id === matchId);
    if (!match) return;

    const winner = match.score.team1 > match.score.team2 ? match.team1 : match.team2;

    const updatedMatches = get().matches.map(m =>
      m.id === matchId ? { ...m, status: 'completed' as const, winner } : m
    );

    // Clear match from court
    const updatedCourts = get().courts.map(c =>
      c.match?.id === matchId ? { ...c, match: undefined } : c
    );

    set({ matches: updatedMatches, courts: updatedCourts });
    storage.saveMatches(updatedMatches);
    storage.saveCourts(updatedCourts);
  },

  undoLastScore: (matchId) => {
    const history = get().scoreHistory.filter(h => h.matchId === matchId);
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    const match = get().matches.find(m => m.id === matchId);
    if (!match) return;

    const updatedMatches = get().matches.map(m => {
      if (m.id === matchId) {
        const newScore = { ...m.score };
        newScore[lastAction.team] = Math.max(0, newScore[lastAction.team] - 1);
        return { ...m, score: newScore };
      }
      return m;
    });

    const updatedHistory = get().scoreHistory.filter(h => 
      !(h.matchId === matchId && h.timestamp === lastAction.timestamp)
    );

    set({ matches: updatedMatches, scoreHistory: updatedHistory });
    storage.saveMatches(updatedMatches);
  },

  addCourt: (court) => {
    const updatedCourts = [...get().courts, court];
    set({ courts: updatedCourts });
    storage.saveCourts(updatedCourts);
  },

  updateCourt: (courtId, updates) => {
    const updatedCourts = get().courts.map(court =>
      court.id === courtId ? { ...court, ...updates } : court
    );
    set({ courts: updatedCourts });
    storage.saveCourts(updatedCourts);
  },

  addReferee: (referee) => {
    const updatedReferees = [...get().referees, referee];
    set({ referees: updatedReferees });
    storage.saveReferees(updatedReferees);
  },

  assignRefereeToCourt: (refereeId, courtId) => {
    const referee = get().referees.find(r => r.id === refereeId);
    if (!referee) return;

    const updatedReferees = get().referees.map(r =>
      r.id === refereeId ? { ...r, courtId } : r
    );

    const updatedCourts = get().courts.map(c =>
      c.id === courtId ? { ...c, refereeId, refereeName: referee.name } : c
    );

    set({ referees: updatedReferees, courts: updatedCourts });
    storage.saveReferees(updatedReferees);
    storage.saveCourts(updatedCourts);
  },

  initializeZones: () => {
    const zones: Zone[] = [
      { id: 'zone-a', name: 'Zone A', courts: [] },
      { id: 'zone-b', name: 'Zone B', courts: [] },
      { id: 'zone-c', name: 'Zone C', courts: [] },
      { id: 'zone-d', name: 'Zone D', courts: [] }
    ];
    set({ zones });
    storage.saveZones(zones);
  },

  resetTournament: () => {
    storage.clearAll();
    set({
      teams: [],
      matches: [],
      courts: [],
      referees: [],
      zones: [],
      scoreHistory: []
    });
    get().initializeData();
  },

  getTeamStats: () => {
    return calculations.calculateTeamStats(get().teams, get().matches);
  }
}));
