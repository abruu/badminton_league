import { supabase } from '../lib/supabase';
import { Team, Match, Court, Referee, Zone, ScoreAction } from '../types';

// Teams
export const getTeams = async (): Promise<Team[]> => {
  const { data, error } = await supabase.from('teams').select('*');
  if (error) throw error;
  return data || [];
};

export const saveTeam = async (team: Team): Promise<void> => {
  const { error } = await supabase.from('teams').upsert(team);
  if (error) throw error;
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
  const { error } = await supabase.from('matches').upsert(match);
  if (error) throw error;
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
  const { error } = await supabase.from('courts').upsert(court);
  if (error) throw error;
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
  // Delete all data from all tables
  await Promise.all([
    supabase.from('score_history').delete().neq('matchId', ''), // Delete score history first (has foreign key to matches)
    supabase.from('matches').delete().neq('id', ''),
    supabase.from('teams').delete().neq('id', ''),
    supabase.from('referees').delete().neq('id', ''),
    supabase.from('courts').delete().neq('id', ''),
    supabase.from('zones').delete().neq('id', '')
  ]);
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
