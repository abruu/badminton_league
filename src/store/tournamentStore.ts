import { create } from 'zustand';
import { Team, Match, Court, Referee, Zone, ScoreAction } from '../types';
import * as supabaseStorage from '../utils/supabaseStorage';
import { calculations } from '../utils/calculations';

interface TournamentState {
  teams: Team[];
  matches: Match[];
  courts: Court[];
  referees: Referee[];
  zones: Zone[];
  scoreHistory: ScoreAction[];

  // Actions
  initializeData: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Team actions
  addTeam: (team: Team) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;

  // Match actions
  addMatch: (match: Match) => Promise<void>;
  updateMatch: (matchId: string, updates: Partial<Match>) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  assignMatchToCourt: (matchId: string, courtId: string) => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  updateMatchScore: (matchId: string, team: 'team1' | 'team2', points: number) => Promise<void>;
  finishMatch: (matchId: string) => Promise<void>;
  requestMatchApproval: (matchId: string, refereeName: string) => Promise<void>;
  approveMatchEnd: (matchId: string) => Promise<void>;
  rejectMatchEnd: (matchId: string) => Promise<void>;
  undoLastScore: (matchId: string) => Promise<void>;

  // Court actions
  addCourt: (court: Court) => Promise<void>;
  updateCourt: (courtId: string, updates: Partial<Court>) => Promise<void>;

  // Referee actions
  addReferee: (referee: Referee) => Promise<void>;
  deleteReferee: (refereeId: string) => Promise<void>;
  assignRefereeToCourt: (refereeId: string, courtId: string) => Promise<void>;

  // Zone actions
  initializeZones: () => Promise<void>;

  // Utility
  resetTournament: () => Promise<void>;
  getTeamStats: () => Team[];
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  teams: [],
  matches: [],
  courts: [],
  referees: [],
  zones: [],
  scoreHistory: [],

  initializeData: async () => {
    try {
      await supabaseStorage.initializeDefaultData();
      
      const [teams, matches, courts, referees, zones] = await Promise.all([
        supabaseStorage.getTeams(),
        supabaseStorage.getMatches(),
        supabaseStorage.getCourts(),
        supabaseStorage.getReferees(),
        supabaseStorage.getZones()
      ]);

      set({ teams, matches, courts, referees, zones });
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  },

  refreshData: async () => {
    try {
      const [teams, matches, courts, referees, zones] = await Promise.all([
        supabaseStorage.getTeams(),
        supabaseStorage.getMatches(),
        supabaseStorage.getCourts(),
        supabaseStorage.getReferees(),
        supabaseStorage.getZones()
      ]);

      set({ teams, matches, courts, referees, zones });
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  },

  addTeam: async (team) => {
    try {
      await supabaseStorage.saveTeam(team);
      await get().refreshData();
    } catch (error) {
      console.error('Error adding team:', error);
    }
  },

  updateTeam: async (teamId, updates) => {
    try {
      const team = get().teams.find(t => t.id === teamId);
      if (team) {
        await supabaseStorage.saveTeam({ ...team, ...updates });
        await get().refreshData();
      }
    } catch (error) {
      console.error('Error updating team:', error);
    }
  },

  deleteTeam: async (teamId) => {
    try {
      await supabaseStorage.deleteTeam(teamId);
      await get().refreshData();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  },

  addMatch: async (match) => {
    try {
      await supabaseStorage.saveMatch(match);
      await get().refreshData();
    } catch (error) {
      console.error('Error adding match:', error);
    }
  },

  updateMatch: async (matchId, updates) => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (match) {
        await supabaseStorage.saveMatch({ ...match, ...updates });
        await get().refreshData();
      }
    } catch (error) {
      console.error('Error updating match:', error);
    }
  },

  deleteMatch: async (matchId) => {
    try {
      await supabaseStorage.deleteMatch(matchId);
      
      // Also remove match from court if assigned
      const courts = get().courts;
      for (const court of courts) {
        if (court.match?.id === matchId) {
          await supabaseStorage.saveCourt({ ...court, match: undefined });
        }
      }
      
      await get().refreshData();
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  },

  assignMatchToCourt: async (matchId, courtId) => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      // Update match with court assignment (but keep status as 'upcoming')
      const updatedMatch = { ...match, courtId };
      await supabaseStorage.saveMatch(updatedMatch);
      
      // Update court with match
      const court = get().courts.find(c => c.id === courtId);
      if (court) {
        await supabaseStorage.saveCourt({ ...court, match: updatedMatch });
      }
      
      await get().refreshData();
    } catch (error) {
      console.error('Error assigning match to court:', error);
    }
  },

  startMatch: async (matchId) => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      // Update match status to 'live'
      const updatedMatch = { ...match, status: 'live' as const };
      await supabaseStorage.saveMatch(updatedMatch);

      // Update court with updated match
      if (match.courtId) {
        const court = get().courts.find(c => c.id === match.courtId);
        if (court) {
          await supabaseStorage.saveCourt({ ...court, match: updatedMatch });
        }
      }
      
      await get().refreshData();
    } catch (error) {
      console.error('Error starting match:', error);
    }
  },

  updateMatchScore: async (matchId, team, points) => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      const newScore = { ...match.score };
      newScore[team] = points;
      const updatedMatch = { ...match, score: newScore };
      
      await supabaseStorage.saveMatch(updatedMatch);
      
      // Add to score history
      const scoreAction: ScoreAction = {
        matchId,
        team,
        timestamp: Date.now()
      };
      await supabaseStorage.saveScoreAction(scoreAction);

      // Update court if match is assigned
      if (match.courtId) {
        const court = get().courts.find(c => c.id === match.courtId);
        if (court) {
          await supabaseStorage.saveCourt({ ...court, match: updatedMatch });
        }
      }
      
      await get().refreshData();
    } catch (error) {
      console.error('Error updating match score:', error);
    }
  },

  finishMatch: async (matchId) => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      const winner = match.score.team1 > match.score.team2 ? match.team1 : match.team2;
      const updatedMatch = { ...match, status: 'completed' as const, winner };
      
      await supabaseStorage.saveMatch(updatedMatch);

      // Clear from court
      if (match.courtId) {
        const court = get().courts.find(c => c.id === match.courtId);
        if (court) {
          await supabaseStorage.saveCourt({ ...court, match: undefined });
        }
      }
      
      await get().refreshData();
    } catch (error) {
      console.error('Error finishing match:', error);
    }
  },

  requestMatchApproval: async (matchId, refereeName) => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      const updatedMatch = { 
        ...match, 
        pendingApproval: true,
        requestedBy: refereeName
      };
      
      await supabaseStorage.saveMatch(updatedMatch);
      await get().refreshData();
    } catch (error) {
      console.error('Error requesting match approval:', error);
    }
  },

  approveMatchEnd: async (matchId) => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      const winner = match.score.team1 > match.score.team2 ? match.team1 : match.team2;
      const updatedMatch = { 
        ...match, 
        status: 'completed' as const, 
        winner,
        pendingApproval: false,
        requestedBy: undefined
      };
      
      await supabaseStorage.saveMatch(updatedMatch);

      // Clear from court
      if (match.courtId) {
        const court = get().courts.find(c => c.id === match.courtId);
        if (court) {
          await supabaseStorage.saveCourt({ ...court, match: undefined });
        }
      }
      
      await get().refreshData();
    } catch (error) {
      console.error('Error approving match end:', error);
    }
  },

  rejectMatchEnd: async (matchId) => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      const updatedMatch = { 
        ...match, 
        pendingApproval: false,
        requestedBy: undefined
      };
      
      await supabaseStorage.saveMatch(updatedMatch);
      await get().refreshData();
    } catch (error) {
      console.error('Error rejecting match end:', error);
    }
  },

  undoLastScore: async (matchId) => {
    try {
      const history = await supabaseStorage.getScoreHistory(matchId);
      if (history.length === 0) return;

      const lastAction = history[0]; // Already sorted descending
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      const newScore = { ...match.score };
      newScore[lastAction.team] = Math.max(0, newScore[lastAction.team] - 1);
      const updatedMatch = { ...match, score: newScore };

      await supabaseStorage.saveMatch(updatedMatch);
      await supabaseStorage.deleteLastScoreAction(matchId);

      // Update court if match is assigned
      if (match.courtId) {
        const court = get().courts.find(c => c.id === match.courtId);
        if (court) {
          await supabaseStorage.saveCourt({ ...court, match: updatedMatch });
        }
      }
      
      await get().refreshData();
    } catch (error) {
      console.error('Error undoing last score:', error);
    }
  },

  addCourt: async (court) => {
    try {
      await supabaseStorage.saveCourt(court);
      await get().refreshData();
    } catch (error) {
      console.error('Error adding court:', error);
    }
  },

  updateCourt: async (courtId, updates) => {
    try {
      const court = get().courts.find(c => c.id === courtId);
      if (court) {
        await supabaseStorage.saveCourt({ ...court, ...updates });
        await get().refreshData();
      }
    } catch (error) {
      console.error('Error updating court:', error);
    }
  },

  addReferee: async (referee) => {
    try {
      await supabaseStorage.saveReferee(referee);
      await get().refreshData();
    } catch (error) {
      console.error('Error adding referee:', error);
    }
  },

  deleteReferee: async (refereeId) => {
    try {
      await supabaseStorage.deleteReferee(refereeId);
      await get().refreshData();
    } catch (error) {
      console.error('Error deleting referee:', error);
    }
  },

  assignRefereeToCourt: async (refereeId, courtId) => {
    try {
      const referee = get().referees.find(r => r.id === refereeId);
      const court = get().courts.find(c => c.id === courtId);
      
      if (!referee || !court) return;

      await supabaseStorage.saveCourt({ ...court, refereeId, refereeName: referee.name });
      await get().refreshData();
    } catch (error) {
      console.error('Error assigning referee to court:', error);
    }
  },

  initializeZones: async () => {
    try {
      const zones = await supabaseStorage.getZones();
      set({ zones });
    } catch (error) {
      console.error('Error initializing zones:', error);
    }
  },

  resetTournament: async () => {
    try {
      await supabaseStorage.clearAll();
      await get().initializeData();
    } catch (error) {
      console.error('Error resetting tournament:', error);
    }
  },

  getTeamStats: () => {
    return calculations.calculateTeamStats(get().teams, get().matches);
  }
}));
