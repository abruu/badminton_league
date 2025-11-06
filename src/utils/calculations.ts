import { Team, Match, TournamentStats, Player } from '../types';

export const calculations = {
  /**
   * Calculate statistics for all teams based on completed matches
   * Uses existing schema: stats.points stores total badminton points scored
   */
  calculateTeamStats: (teams: Team[], matches: Match[]): Team[] => {
    const updatedTeams = teams.map(team => ({
      ...team,
      stats: {
        matchesWon: 0,
        matchesLost: 0,
        points: 0 // Total badminton points scored across all sets
      }
    }));

    const completedMatches = matches.filter(m => m.status === 'completed');

    completedMatches.forEach(match => {
      const { team1, team2, sets, winner } = match;

      // Calculate total badminton points scored by each team across all sets
      const team1PointsScored = sets.reduce((sum, set) => sum + set.score.team1, 0);
      const team2PointsScored = sets.reduce((sum, set) => sum + set.score.team2, 0);

      const team1Ref = updatedTeams.find(t => t.id === team1.id);
      const team2Ref = updatedTeams.find(t => t.id === team2.id);

      if (!team1Ref || !team2Ref) return;

      // Update total points scored
      team1Ref.stats.points += team1PointsScored;
      team2Ref.stats.points += team2PointsScored;

      // Update match wins/losses
      if (winner) {
        if (winner.id === team1Ref.id) {
          team1Ref.stats.matchesWon += 1;
          team2Ref.stats.matchesLost += 1;
        } else if (winner.id === team2Ref.id) {
          team2Ref.stats.matchesWon += 1;
          team1Ref.stats.matchesLost += 1;
        }
      }
    });

    return updatedTeams;
  },

  /**
   * Get best team per zone
   * Ranking criteria: 1) Matches won, 2) Total points scored (tiebreaker)
   */
  getBestTeamByZone: (teams: Team[], zoneId: string): Team | undefined => {
    const zoneTeams = teams.filter(team => team.zone === zoneId);
    if (zoneTeams.length === 0) return undefined;

    const sorted = [...zoneTeams].sort((a, b) => {
      // Primary: matches won
      if (b.stats.matchesWon !== a.stats.matchesWon) {
        return b.stats.matchesWon - a.stats.matchesWon;
      }
      // Secondary: total points scored (tiebreaker)
      return b.stats.points - a.stats.points;
    });

    return sorted[0];
  },

  /**
   * Get overall best team across all zones
   * Ranking criteria: 1) Matches won, 2) Total points scored (tiebreaker)
   */
  getOverallBestTeam: (teams: Team[]): Team | undefined => {
    if (teams.length === 0) return undefined;

    const sorted = [...teams].sort((a, b) => {
      // Primary: matches won
      if (b.stats.matchesWon !== a.stats.matchesWon) {
        return b.stats.matchesWon - a.stats.matchesWon;
      }
      // Secondary: total points scored (tiebreaker)
      return b.stats.points - a.stats.points;
    });

    return sorted[0];
  },

  // Calculate player wins
  calculatePlayerWins: (matches: Match[]): Map<string, number> => {
    const playerWins = new Map<string, number>();

    matches.forEach(match => {
      if (match.status === 'completed' && match.winner) {
        match.winner.players.forEach(player => {
          const currentWins = playerWins.get(player.id) || 0;
          playerWins.set(player.id, currentWins + 1);
        });
      }
    });

    return playerWins;
  },

  // Get best player overall
  getBestPlayer: (teams: Team[], matches: Match[]): { player: Player; wins: number } | undefined => {
    const playerWins = calculations.calculatePlayerWins(matches);
    
    let bestPlayer: Player | undefined;
    let maxWins = 0;

    teams.forEach(team => {
      team.players.forEach(player => {
        const wins = playerWins.get(player.id) || 0;
        if (wins > maxWins) {
          maxWins = wins;
          bestPlayer = player;
        }
      });
    });

    return bestPlayer ? { player: bestPlayer, wins: maxWins } : undefined;
  },

  // Get best player per zone
  getBestPlayerByZone: (teams: Team[], matches: Match[], zoneId: string): { player: Player; wins: number } | undefined => {
    const zoneTeams = teams.filter(team => team.zone === zoneId);
    const playerWins = calculations.calculatePlayerWins(matches);
    
    let bestPlayer: Player | undefined;
    let maxWins = 0;

    zoneTeams.forEach(team => {
      team.players.forEach(player => {
        const wins = playerWins.get(player.id) || 0;
        if (wins > maxWins) {
          maxWins = wins;
          bestPlayer = player;
        }
      });
    });

    return bestPlayer ? { player: bestPlayer, wins: maxWins } : undefined;
  },

  // Calculate full tournament statistics
  // NOTE: This now uses database-persisted stats instead of recalculating
  calculateTournamentStats: (teams: Team[], matches: Match[], zones: string[]): TournamentStats => {
    // Use teams as-is with their database stats (don't recalculate)
    const completedMatches = matches.filter(m => m.status === 'completed').length;

    const bestTeamByZone: { [zoneId: string]: Team } = {};
    const bestPlayerByZone: { [zoneId: string]: { player: Player; wins: number } } = {};

    zones.forEach(zoneId => {
      const bestTeam = calculations.getBestTeamByZone(teams, zoneId);
      if (bestTeam) {
        bestTeamByZone[zoneId] = bestTeam;
      }

      const bestPlayer = calculations.getBestPlayerByZone(teams, matches, zoneId);
      if (bestPlayer) {
        bestPlayerByZone[zoneId] = bestPlayer;
      }
    });

    return {
      totalMatches: matches.length,
      completedMatches,
      bestTeamByZone,
      bestPlayerByZone,
      teams, // Include teams with their database stats
      overallBestTeam: calculations.getOverallBestTeam(teams),
      overallBestPlayer: calculations.getBestPlayer(teams, matches)
    };
  },

  /**
   * Calculate average badminton points scored per match for a team
   */
  calculateAveragePoints: (team: Team, matches: Match[]): number => {
    const teamMatches = matches.filter(m => 
      m.status === 'completed' && (m.team1.id === team.id || m.team2.id === team.id)
    );

    if (teamMatches.length === 0) return 0;

    const totalPoints = teamMatches.reduce((sum, match) => {
      // Sum points from all sets for this team
      const teamPoints = match.sets.reduce((setSum, set) => {
        const points = match.team1.id === team.id ? set.score.team1 : set.score.team2;
        return setSum + points;
      }, 0);
      return sum + teamPoints;
    }, 0);

    return totalPoints / teamMatches.length;
  }
};
