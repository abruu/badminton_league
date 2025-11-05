import { Team, Match, TournamentStats, Player } from '../types';

export const calculations = {
  // Calculate statistics for all teams
  calculateTeamStats: (teams: Team[], matches: Match[]): Team[] => {
    const updatedTeams = teams.map(team => ({
      ...team,
      stats: {
        matchesWon: 0,
        matchesLost: 0,
        points: 0
      }
    }));

    matches.forEach(match => {
      if (match.status === 'completed' && match.winner) {
        const winnerTeam = updatedTeams.find(t => t.id === match.winner!.id);
        const loserTeam = updatedTeams.find(t => 
          t.id === (match.winner!.id === match.team1.id ? match.team2.id : match.team1.id)
        );

        if (winnerTeam) {
          winnerTeam.stats.matchesWon += 1;
          winnerTeam.stats.points += 3; // 3 points for win
        }

        if (loserTeam) {
          loserTeam.stats.matchesLost += 1;
          loserTeam.stats.points += 1; // 1 point for participation
        }
      }
    });

    return updatedTeams;
  },

  // Get best team per zone
  getBestTeamByZone: (teams: Team[], zoneId: string): Team | undefined => {
    const zoneTeams = teams.filter(team => team.zone === zoneId);
    if (zoneTeams.length === 0) return undefined;

    return zoneTeams.reduce((best, current) => {
      if (current.stats.points > best.stats.points) return current;
      if (current.stats.points === best.stats.points && 
          current.stats.matchesWon > best.stats.matchesWon) return current;
      return best;
    });
  },

  // Get overall best team
  getOverallBestTeam: (teams: Team[]): Team | undefined => {
    if (teams.length === 0) return undefined;

    return teams.reduce((best, current) => {
      if (current.stats.points > best.stats.points) return current;
      if (current.stats.points === best.stats.points && 
          current.stats.matchesWon > best.stats.matchesWon) return current;
      return best;
    });
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

  // Calculate average points per match for a team
  calculateAveragePoints: (team: Team, matches: Match[]): number => {
    const teamMatches = matches.filter(m => 
      m.status === 'completed' && (m.team1.id === team.id || m.team2.id === team.id)
    );

    if (teamMatches.length === 0) return 0;

    const totalPoints = teamMatches.reduce((sum, match) => {
      const points = match.team1.id === team.id ? match.score.team1 : match.score.team2;
      return sum + points;
    }, 0);

    return totalPoints / teamMatches.length;
  }
};
