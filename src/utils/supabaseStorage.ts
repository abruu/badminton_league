import { supabase } from '../lib/supabase';
import { Team, Match, Court, Referee, Zone, ScoreAction } from '../types';

// Teams
export const getTeams = async (): Promise<Team[]> => {
  const { data, error } = await supabase.from('teams').select('*');
  if (error) throw error;
  
  // Ensure all teams have properly initialized stats
  const teams = (data || []).map(team => ({
    ...team,
    stats: team.stats || { matchesWon: 0, matchesLost: 0, points: 0 }
  }));
  
  console.log('[GET_TEAMS] Teams loaded with stats:', teams.map(t => ({ 
    id: t.id, 
    name: t.name, 
    stats: t.stats 
  })));
  
  return teams;
};

export const saveTeam = async (team: Team): Promise<void> => {
  console.log('[SAVE_TEAM] Saving team:', { 
    id: team.id, 
    name: team.name, 
    stats: team.stats 
  });
  
  // Ensure stats object exists
  const teamData = {
    ...team,
    stats: team.stats || { matchesWon: 0, matchesLost: 0, points: 0 }
  };
  
  const { error } = await supabase.from('teams').upsert(teamData);
  if (error) {
    console.error('[SAVE_TEAM] Error:', error);
    throw error;
  }
  
  console.log('[SAVE_TEAM] Team saved successfully');
};

export const deleteTeam = async (id: string): Promise<void> => {
  const { error } = await supabase.from('teams').delete().eq('id', id);
  if (error) throw error;
};

// Matches
export const getMatches = async (): Promise<Match[]> => {
  const { data, error } = await supabase.from('matches').select('*');
  if (error) throw error;
  return data || [];
};

export const saveMatch = async (match: Match): Promise<void> => {
  console.log('[SAVE_MATCH] Starting save for match:', match.id);
  
  try {
    // Create a clean copy without computed properties
    const matchData = {
      id: match.id,
      team1: match.team1,
      team2: match.team2,
      score: match.score,
      sets: match.sets || [{ setNumber: 1, score: { team1: 0, team2: 0 } }],
      currentSetNumber: match.currentSetNumber || 1,
      servingTeam: match.servingTeam || 'team1',
      team1Position: match.team1Position || 'left',
      team2Position: match.team2Position || 'right',
      winner: match.winner,
      status: match.status,
      courtId: match.courtId ?? null, // Convert undefined to null for database
      pendingApproval: match.pendingApproval,
      requestedBy: match.requestedBy,
      queueOrder: match.queueOrder ?? null, // Convert undefined to null for database
      history: match.history || [] // Save history array for undo tracking
    };
    
    console.log('[SAVE_MATCH] Match data prepared, history length:', matchData.history.length);
    console.log('[SAVE_MATCH] Calling Supabase upsert...');
    
    const { error, data } = await supabase.from('matches').upsert(matchData).select();
    
    if (error) {
      console.error('[SAVE_MATCH] Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('[SAVE_MATCH] Match saved successfully:', data);
  } catch (err) {
    console.error('[SAVE_MATCH] Unexpected error:', err);
    throw err;
  }
};

export const deleteMatch = async (id: string): Promise<void> => {
  const { error } = await supabase.from('matches').delete().eq('id', id);
  if (error) throw error;
};

// Courts
export const getCourts = async (): Promise<Court[]> => {
  const { data, error } = await supabase.from('courts').select('*');
  if (error) throw error;
  return data || [];
};

export const saveCourt = async (court: Court): Promise<void> => {
  // Create a clean copy without computed properties (matches, match)
  const courtData = {
    id: court.id,
    name: court.name,
    refereeId: court.refereeId,
    refereeName: court.refereeName
  };
  
  const { error } = await supabase.from('courts').upsert(courtData);
  if (error) {
    console.error('Error saving court:', error);
    throw error;
  }
};

// Referees
export const getReferees = async (): Promise<Referee[]> => {
  const { data, error } = await supabase.from('referees').select('*');
  if (error) throw error;
  return data || [];
};

export const saveReferee = async (referee: Referee): Promise<void> => {
  const { error } = await supabase.from('referees').upsert(referee);
  if (error) throw error;
};

export const deleteReferee = async (id: string): Promise<void> => {
  const { error } = await supabase.from('referees').delete().eq('id', id);
  if (error) throw error;
};

export const authenticateReferee = async (username: string, password: string): Promise<Referee | null> => {
  const { data, error } = await supabase
    .from('referees')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();
  
  if (error || !data) return null;
  return data;
};

// Zones
export const getZones = async (): Promise<Zone[]> => {
  const { data, error } = await supabase.from('zones').select('*');
  if (error) throw error;
  return data || [];
};

export const saveZones = async (zones: Zone[]): Promise<void> => {
  const { error } = await supabase.from('zones').upsert(zones);
  if (error) throw error;
};

// Score History
export const getScoreHistory = async (matchId: string): Promise<ScoreAction[]> => {
  const { data, error } = await supabase
    .from('score_history')
    .select('*')
    .eq('matchId', matchId)
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const saveScoreAction = async (action: ScoreAction): Promise<void> => {
  const { error } = await supabase.from('score_history').insert(action);
  if (error) throw error;
};

export const deleteLastScoreAction = async (matchId: string): Promise<void> => {
  const history = await getScoreHistory(matchId);
  if (history.length > 0) {
    const { error } = await supabase
      .from('score_history')
      .delete()
      .eq('timestamp', history[0].timestamp);
    if (error) throw error;
  }
};

// Clear all data
export const clearAll = async (): Promise<void> => {
  // Delete all data from all tables EXCEPT teams
  // Teams are preserved so they can be reused in the next tournament
  await Promise.all([
    supabase.from('score_history').delete().neq('matchId', ''), // Delete score history first (has foreign key to matches)
    supabase.from('matches').delete().neq('id', ''),
    // Do NOT delete teams - they are preserved
    // supabase.from('teams').delete().neq('id', ''),
    supabase.from('referees').delete().neq('id', ''),
    supabase.from('courts').delete().neq('id', ''),
    supabase.from('zones').delete().neq('id', '')
  ]);

  // Reset team statistics (set all stats to 0)
  const teams = await getTeams();
  const resetPromises = teams.map(team => {
    const resetTeam = {
      ...team,
      stats: {
        matchesWon: 0,
        matchesLost: 0,
        points: 0
      }
    };
    return saveTeam(resetTeam);
  });
  
  await Promise.all(resetPromises);
};

// Initialize default data
export const initializeDefaultData = async (): Promise<void> => {
  // Check if zones exist
  const zones = await getZones();
  if (zones.length === 0) {
    const defaultZones: Zone[] = [
      { id: 'zone-a', name: 'Zone A', courts: [] },
      { id: 'zone-b', name: 'Zone B', courts: [] },
      { id: 'zone-c', name: 'Zone C', courts: [] },
      { id: 'zone-d', name: 'Zone D', courts: [] }
    ];
    await saveZones(defaultZones);
  }

  // Check if courts exist
  const courts = await getCourts();
  if (courts.length === 0) {
    const defaultCourts: Court[] = [
      { id: 'court-1', name: 'Court 1', refereeId: '', refereeName: 'Unassigned' },
      { id: 'court-2', name: 'Court 2', refereeId: '', refereeName: 'Unassigned' },
      { id: 'court-3', name: 'Court 3', refereeId: '', refereeName: 'Unassigned' }
    ];
    for (const court of defaultCourts) {
      await saveCourt(court);
    }
  }
};
