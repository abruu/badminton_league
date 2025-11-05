import { create } from 'zustand';
import { Team, Match, Court, Referee, Zone, Set, ScoreEvent } from '../types';
import * as supabaseStorage from '../utils/supabaseStorage';
import { calculations } from '../utils/calculations';

interface TournamentState {
  teams: Team[];
  matches: Match[];
  courts: Court[];
  referees: Referee[];
  zones: Zone[];
  isLoading: boolean;
  isInitialized: boolean;

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
  unassignMatchFromCourt: (matchId: string) => Promise<void>;
  reorderCourtMatches: (courtId: string, matchId: string, direction: 'up' | 'down') => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  updateMatchScore: (matchId: string, team: 'team1' | 'team2', points: number) => Promise<void>;
  endSet: (matchId: string, winner: 'team1' | 'team2') => Promise<void>;
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
  updateReferee: (refereeId: string, updates: Partial<Referee>) => Promise<void>;
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
  isLoading: false,
  isInitialized: false,

  initializeData: async () => {
    set({ isLoading: true });
    try {
      await supabaseStorage.initializeDefaultData();
      
      const [teams, matches, courts, referees, zones] = await Promise.all([
        supabaseStorage.getTeams(),
        supabaseStorage.getMatches(),
        supabaseStorage.getCourts(),
        supabaseStorage.getReferees(),
        supabaseStorage.getZones()
      ]);

      // Populate courts with their assigned matches
      const courtsWithMatches = courts.map(court => ({
        ...court,
        matches: matches
          .filter(m => m.courtId === court.id && (m.status === 'upcoming' || m.status === 'live'))
          .sort((a, b) => (a.queueOrder ?? 999) - (b.queueOrder ?? 999)),
        match: matches.find(m => m.courtId === court.id && m.status === 'live')
      }));

      set({ teams, matches, courts: courtsWithMatches, referees, zones, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('Error initializing data:', error);
      set({ isLoading: false });
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

      // Populate courts with their assigned matches
      const courtsWithMatches = courts.map(court => ({
        ...court,
        matches: matches
          .filter(m => m.courtId === court.id && (m.status === 'upcoming' || m.status === 'live'))
          .sort((a, b) => (a.queueOrder ?? 999) - (b.queueOrder ?? 999)),
        match: matches.find(m => m.courtId === court.id && m.status === 'live')
      }));

      set({ teams, matches, courts: courtsWithMatches, referees, zones });
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
      console.log('Assigning match:', matchId, 'to court:', courtId);
      const match = get().matches.find(m => m.id === matchId);
      const court = get().courts.find(c => c.id === courtId);
      
      if (!match) {
        console.error('Match not found:', matchId);
        return;
      }
      if (!court) {
        console.error('Court not found:', courtId);
        return;
      }

      // Calculate queue order (place at end of queue)
      const courtMatches = get().matches.filter(m => m.courtId === courtId && (m.status === 'upcoming' || m.status === 'live'));
      const maxOrder = Math.max(...courtMatches.map(m => m.queueOrder ?? 0), -1);
      
      console.log('Current queue order:', maxOrder, 'New order:', maxOrder + 1);
      
      // Update match with court assignment and queue order
      const updatedMatch = { ...match, courtId, queueOrder: maxOrder + 1 };
      await supabaseStorage.saveMatch(updatedMatch);
      
      console.log('Match saved successfully, refreshing data...');
      await get().refreshData();
      console.log('Data refreshed');
    } catch (error) {
      console.error('Error assigning match to court:', error);
    }
  },

  unassignMatchFromCourt: async (matchId) => {
    try {
      console.log('Unassigning match:', matchId);
      const match = get().matches.find(m => m.id === matchId);
      if (!match) {
        console.error('Match not found:', matchId);
        return;
      }

      // Clear court assignment from match - use null for database
      const updatedMatch = { 
        ...match, 
        courtId: null as any, // Set to null to clear from database
        queueOrder: null as any 
      };
      await supabaseStorage.saveMatch(updatedMatch);
      
      console.log('Match unassigned successfully, refreshing data...');
      await get().refreshData();
      console.log('Data refreshed');
    } catch (error) {
      console.error('Error unassigning match from court:', error);
    }
  },

  reorderCourtMatches: async (courtId, matchId, direction) => {
    try {
      const court = get().courts.find(c => c.id === courtId);
      if (!court || !court.matches) return;

      const matches = [...court.matches];
      const currentIndex = matches.findIndex(m => m.id === matchId);
      
      if (currentIndex === -1) return;
      
      // Calculate new position
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Check bounds
      if (newIndex < 0 || newIndex >= matches.length) return;

      // Swap matches queue order
      const match1 = matches[currentIndex];
      const match2 = matches[newIndex];
      
      const updatedMatch1 = { ...match1, queueOrder: match2.queueOrder ?? newIndex };
      const updatedMatch2 = { ...match2, queueOrder: match1.queueOrder ?? currentIndex };
      
      await supabaseStorage.saveMatch(updatedMatch1);
      await supabaseStorage.saveMatch(updatedMatch2);
      
      await get().refreshData();
    } catch (error) {
      console.error('Error reordering matches:', error);
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

      // Get or create current set
      const currentSetIndex = match.sets.findIndex(s => s.setNumber === match.currentSetNumber);
      let currentSet: Set;
      
      if (currentSetIndex === -1) {
        // Create new set if it doesn't exist
        currentSet = {
          setNumber: match.currentSetNumber,
          score: { team1: 0, team2: 0 }
        };
      } else {
        currentSet = { ...match.sets[currentSetIndex] };
      }

      // Check if current set is locked (manually ended)
      if (currentSet.locked) {
        console.warn('Cannot score on a locked set');
        return;
      }

      // Capture serve state BEFORE scoring
      const serveBefore = match.servingTeam;

      // Update current set score
      currentSet.score[team] = currentSet.score[team] + points;
      
      let updatedMatch = { ...match };
      
      // Rally scoring: Point winner gets/keeps the serve
      updatedMatch.servingTeam = team;
      const serveAfter = team;

      // Record this scoring event in history for undo
      const scoreEvent: ScoreEvent = {
        setNumber: match.currentSetNumber,
        team,
        serveBefore,
        serveAfter,
        timestamp: Date.now()
      };
      
      const newHistory = [...(match.history || []), scoreEvent];
      updatedMatch.history = newHistory;
      
      // Update the set in the array (no auto-completion)
      const newSets = [...match.sets];
      if (currentSetIndex === -1) {
        newSets.push(currentSet);
      } else {
        newSets[currentSetIndex] = currentSet;
      }
      updatedMatch.sets = newSets;
      
      await supabaseStorage.saveMatch(updatedMatch);
      
      await get().refreshData();
    } catch (error) {
      console.error('Error updating match score:', error);
    }
  },

  endSet: async (matchId, winner: 'team1' | 'team2') => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      // Find current set
      const currentSetIndex = match.sets.findIndex(s => s.setNumber === match.currentSetNumber);
      if (currentSetIndex === -1) {
        console.error('Current set not found');
        return;
      }

      const currentSet = { ...match.sets[currentSetIndex] };
      
      // Check if already locked
      if (currentSet.locked) {
        console.warn('Set already ended');
        return;
      }

      // Mark set as complete with winner and locked
      currentSet.winner = winner;
      currentSet.locked = true;

      // Update sets array
      const newSets = [...match.sets];
      newSets[currentSetIndex] = currentSet;

      // Update match score (sets won)
      const newScore = { ...match.score };
      newScore[winner] = newScore[winner] + 1;

      // Check if match is won (best of 3 - need 2 sets)
      const matchWon = newScore.team1 === 2 || newScore.team2 === 2;

      let updatedMatch = { ...match, sets: newSets, score: newScore };

      if (matchWon) {
        // Match is over
        const matchWinner = newScore.team1 === 2 ? match.team1 : match.team2;
        updatedMatch = {
          ...updatedMatch,
          status: 'completed' as const,
          winner: matchWinner,
          courtId: null as any // Clear court assignment
        };
      } else {
        // Start new set - switch positions, set winner serves first
        const newTeam1Position = match.team1Position === 'left' ? 'right' : 'left';
        const newTeam2Position = match.team2Position === 'left' ? 'right' : 'left';
        
        // Create new empty set for next round
        const nextSetNumber = match.currentSetNumber + 1;
        newSets.push({
          setNumber: nextSetNumber,
          score: { team1: 0, team2: 0 }
        });
        
        updatedMatch = {
          ...updatedMatch,
          sets: newSets,
          currentSetNumber: nextSetNumber,
          team1Position: newTeam1Position,
          team2Position: newTeam2Position,
          servingTeam: winner // Previous set winner serves first in next set
        };
      }

      await supabaseStorage.saveMatch(updatedMatch);
      await get().refreshData();
    } catch (error) {
      console.error('Error ending set:', error);
    }
  },

  finishMatch: async (matchId) => {
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) return;

      const winner = match.score.team1 > match.score.team2 ? match.team1 : match.team2;
      const loser = match.score.team1 > match.score.team2 ? match.team2 : match.team1;
      
      const updatedMatch = { ...match, status: 'completed' as const, winner, courtId: undefined };
      
      // Update match status
      await supabaseStorage.saveMatch(updatedMatch);

      // Update team stats in database
      const winnerTeam = get().teams.find(t => t.id === winner.id);
      const loserTeam = get().teams.find(t => t.id === loser.id);

      if (winnerTeam) {
        await supabaseStorage.saveTeam({
          ...winnerTeam,
          stats: {
            matchesWon: winnerTeam.stats.matchesWon + 1,
            matchesLost: winnerTeam.stats.matchesLost,
            points: winnerTeam.stats.points + 3 // 3 points for win
          }
        });
      }

      if (loserTeam) {
        await supabaseStorage.saveTeam({
          ...loserTeam,
          stats: {
            matchesWon: loserTeam.stats.matchesWon,
            matchesLost: loserTeam.stats.matchesLost + 1,
            points: loserTeam.stats.points + 1 // 1 point for participation
          }
        });
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
      const loser = match.score.team1 > match.score.team2 ? match.team2 : match.team1;
      
      const updatedMatch = { 
        ...match, 
        status: 'completed' as const, 
        winner,
        pendingApproval: false,
        requestedBy: undefined
      };
      
      await supabaseStorage.saveMatch(updatedMatch);

      // Update team stats in database
      const winnerTeam = get().teams.find(t => t.id === winner.id);
      const loserTeam = get().teams.find(t => t.id === loser.id);

      if (winnerTeam) {
        await supabaseStorage.saveTeam({
          ...winnerTeam,
          stats: {
            matchesWon: winnerTeam.stats.matchesWon + 1,
            matchesLost: winnerTeam.stats.matchesLost,
            points: winnerTeam.stats.points + 3 // 3 points for win
          }
        });
      }

      if (loserTeam) {
        await supabaseStorage.saveTeam({
          ...loserTeam,
          stats: {
            matchesWon: loserTeam.stats.matchesWon,
            matchesLost: loserTeam.stats.matchesLost + 1,
            points: loserTeam.stats.points + 1 // 1 point for participation
          }
        });
      }

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
    console.log('[UNDO] Starting undo for match:', matchId);
    try {
      const match = get().matches.find(m => m.id === matchId);
      if (!match) {
        console.warn('[UNDO] Match not found');
        return;
      }

      // Check if history exists and has events
      const history = match.history || [];
      console.log('[UNDO] History length:', history.length);
      if (history.length === 0) {
        console.warn('[UNDO] No history to undo');
        return;
      }

      // Pop the last event
      const lastEvent = history[history.length - 1];
      console.log('[UNDO] Last event:', lastEvent);
      
      // Verify the event belongs to the current set
      if (lastEvent.setNumber !== match.currentSetNumber) {
        console.warn('[UNDO] Cannot undo from a previous set');
        return;
      }

      // Find the current set
      const currentSetIndex = match.sets.findIndex(s => s.setNumber === match.currentSetNumber);
      if (currentSetIndex === -1) {
        console.warn('[UNDO] Current set not found');
        return;
      }

      const currentSet = match.sets[currentSetIndex];

      // Check if set is locked
      if (currentSet.locked) {
        console.warn('[UNDO] Cannot undo in a locked set');
        return;
      }

      // Decrement the score for the team that scored
      const currentScore = currentSet.score[lastEvent.team];
      if (currentScore <= 0) {
        console.warn('[UNDO] Score cannot go negative');
        return;
      }

      console.log('[UNDO] Creating updated match...');
      
      // Create updated sets array with decremented score
      const updatedSets = [...match.sets];
      updatedSets[currentSetIndex] = {
        ...currentSet,
        score: {
          ...currentSet.score,
          [lastEvent.team]: currentScore - 1
        }
      };

      // Restore the serve state from before the point was scored
      const restoredServingTeam = lastEvent.serveBefore;

      // Remove the last event from history
      const updatedHistory = history.slice(0, -1);

      // Create updated match
      const updatedMatch: Match = {
        ...match,
        sets: updatedSets,
        history: updatedHistory,
        servingTeam: restoredServingTeam
      };

      console.log('[UNDO] Saving to database...');
      // Save to database (this is the only database operation needed)
      await supabaseStorage.saveMatch(updatedMatch);
      
      console.log('[UNDO] Refreshing data...');
      // Refresh data to update UI
      await get().refreshData();
      
      console.log('[UNDO] Undo completed successfully');
    } catch (error) {
      console.error('[UNDO] Error undoing last score:', error);
      throw error;
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
        // Exclude computed properties before saving to Supabase
        const { matches, match, ...courtData } = { ...court, ...updates };
        await supabaseStorage.saveCourt(courtData as Court);
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

  updateReferee: async (refereeId, updates) => {
    try {
      const referee = get().referees.find(r => r.id === refereeId);
      if (!referee) return;

      const updatedReferee = { ...referee, ...updates };
      await supabaseStorage.saveReferee(updatedReferee);
      await get().refreshData();
    } catch (error) {
      console.error('Error updating referee:', error);
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
