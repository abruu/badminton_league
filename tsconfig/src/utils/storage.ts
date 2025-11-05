import { Team, Match, Zone, Referee, Court } from '../types';

const STORAGE_KEYS = {
  TEAMS: 'tournament_teams',
  MATCHES: 'tournament_matches',
  ZONES: 'tournament_zones',
  REFEREES: 'tournament_referees',
  COURTS: 'tournament_courts',
  SCORE_HISTORY: 'tournament_score_history'
};

export const storage = {
  // Generic save/load
  saveData: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('storage-update', { detail: { key, value } }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  loadData: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  },

  // Teams
  saveTeams: (teams: Team[]): void => {
    storage.saveData(STORAGE_KEYS.TEAMS, teams);
  },

  loadTeams: (): Team[] => {
    return storage.loadData<Team[]>(STORAGE_KEYS.TEAMS) || [];
  },

  // Matches
  saveMatches: (matches: Match[]): void => {
    storage.saveData(STORAGE_KEYS.MATCHES, matches);
  },

  loadMatches: (): Match[] => {
    return storage.loadData<Match[]>(STORAGE_KEYS.MATCHES) || [];
  },

  // Zones
  saveZones: (zones: Zone[]): void => {
    storage.saveData(STORAGE_KEYS.ZONES, zones);
  },

  loadZones: (): Zone[] => {
    return storage.loadData<Zone[]>(STORAGE_KEYS.ZONES) || [];
  },

  // Referees
  saveReferees: (referees: Referee[]): void => {
    storage.saveData(STORAGE_KEYS.REFEREES, referees);
  },

  loadReferees: (): Referee[] => {
    return storage.loadData<Referee[]>(STORAGE_KEYS.REFEREES) || [];
  },

  // Courts
  saveCourts: (courts: Court[]): void => {
    storage.saveData(STORAGE_KEYS.COURTS, courts);
  },

  loadCourts: (): Court[] => {
    return storage.loadData<Court[]>(STORAGE_KEYS.COURTS) || [];
  },

  // Clear all tournament data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    window.dispatchEvent(new CustomEvent('storage-update', { detail: { key: 'all', value: null } }));
  }
};

export { STORAGE_KEYS };
