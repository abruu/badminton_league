import React, { useMemo, useState } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { calculations } from '../utils/calculations';
import { TrendingUp, Award, Users, Target, RefreshCw, Calculator, Trophy } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export const Statistics: React.FC = () => {
  const { teams, matches, zones, courts, refreshData, recalculateAllStatistics, isLoading, isInitialized } = useTournamentStore();
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Real-time subscriptions in useRealtimeSubscriptions hook handle all updates
  // No component-level polling needed - reduces database load significantly

  const stats = useMemo(() => {
    const zoneIds = zones.map(z => z.id);
    return calculations.calculateTournamentStats(teams, matches, zoneIds);
  }, [teams, matches, zones]);

  // Use teams directly from store (stats are now persisted in database)
  const teamsWithStats = useMemo(() => teams, [teams]);

  // Calculate zone-based statistics
  const zoneStats = useMemo(() => {
    const stats: { [zoneId: string]: { teams: any[], totalPoints: number, topTeam: any } } = {};

    zones.forEach(zone => {
      const zoneTeams = teamsWithStats.filter(t => t.zone === zone.id);
      const totalPoints = zoneTeams.reduce((sum, team) => sum + team.stats.points, 0);
      const topTeam = calculations.getBestTeamByZone(teamsWithStats, zone.id);

      stats[zone.id] = {
        teams: zoneTeams,
        totalPoints,
        topTeam
      };
    });

    return stats;
  }, [teamsWithStats, zones]);

  // Show loader during initial data fetch
  if (isLoading && !isInitialized) {
    return <LoadingSpinner size="lg" text="Loading Statistics..." />;
  }

  const handleRecalculate = async () => {
    if (confirm('Recalculate all team statistics from completed matches? This will update all team stats in the database based on actual match results.')) {
      setIsRecalculating(true);
      try {
        await recalculateAllStatistics();
        alert('Statistics recalculated successfully! All team stats have been updated.');
      } catch (error) {
        alert('Error recalculating statistics. Please try again.');
        console.error(error);
      } finally {
        setIsRecalculating(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Warning banner if statistics might be stale */}
      {stats.completedMatches > 0 && teams.some(t => t.stats.points === 0 && t.stats.matchesWon === 0) && (
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Calculator className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                Statistics May Need Recalculation
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Some teams have zero points despite completed matches. This might happen if:
              </p>
              <ul className="text-sm text-yellow-800 list-disc list-inside mb-3 space-y-1">
                <li>The statistics calculation logic was recently updated</li>
                <li>Matches were imported or modified directly in the database</li>
                <li>There was an error during a previous match completion</li>
              </ul>
              <p className="text-sm font-semibold text-yellow-900">
                Click "Recalculate Stats" above to fix this and update all team statistics based on actual match results.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Tournament Statistics
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleRecalculate}
            disabled={isLoading || isRecalculating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Recalculate all statistics from matches"
          >
            <Calculator className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            {isRecalculating ? 'Recalculating...' : 'Recalculate Stats'}
          </button>
          <button
            onClick={() => refreshData()}
            disabled={isLoading || isRecalculating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Manually refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Matches</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalMatches}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{stats.completedMatches}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Teams</p>
              <p className="text-2xl font-bold text-gray-800">{teams.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Zones</p>
              <p className="text-2xl font-bold text-gray-800">{zones.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Best - Only show if there are completed matches */}
      {stats.completedMatches > 0 && stats.overallBestTeam && (
        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            🏆 Overall Tournament Leader
          </h3>
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-2xl font-bold text-gray-800">{stats.overallBestTeam.name}</h4>
                <p className="text-gray-600">
                  {stats.overallBestTeam.players.map(p => p.name).join(' & ')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Zone: {zones.find(z => z.id === stats.overallBestTeam!.zone)?.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.overallBestTeam.stats.points} pts
                </div>
                <div className="text-sm text-gray-600">
                  {stats.overallBestTeam.stats.matchesWon}W - {stats.overallBestTeam.stats.matchesLost}L
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Best per Zone - Only show if there are completed matches */}
      {stats.completedMatches > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Best Teams by Zone</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map(zone => {
              const bestTeam = stats.bestTeamByZone[zone.id];
              return bestTeam ? (
                <div key={zone.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h4 className="font-bold text-gray-700">{zone.name}</h4>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{bestTeam.name}</p>
                        <p className="text-xs text-gray-600">
                          {bestTeam.players.map(p => p.name).join(' & ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{bestTeam.stats.points} pts</p>
                        <p className="text-xs text-gray-600">
                          {bestTeam.stats.matchesWon}W - {bestTeam.stats.matchesLost}L
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Zone-Based Team Points Detail */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Zone-Based Team Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map(zone => {
            const stats = zoneStats[zone.id];
            if (!stats) return null;

            return (
              <div key={zone.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3 flex items-center justify-between">
                  <span>{zone.name}</span>
                  <Award className="w-5 h-5 text-yellow-500" />
                </h4>

                {/* Zone Summary */}
                <div className="mb-3 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Total Points:</span>
                    <span className="font-bold text-purple-700 text-lg">{stats.totalPoints}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Teams:</span>
                    <span className="font-semibold text-gray-700">{stats.teams.length}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-600">Avg Points:</span>
                    <span className="font-semibold text-gray-700">
                      {stats.teams.length > 0 ? (stats.totalPoints / stats.teams.length).toFixed(1) : '0'}
                    </span>
                  </div>
                </div>

                {/* All Teams in Zone */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Team Rankings</div>
                  {stats.teams
                    .sort((a, b) => {
                      // Primary: matches won
                      if (b.stats.matchesWon !== a.stats.matchesWon) {
                        return b.stats.matchesWon - a.stats.matchesWon;
                      }
                      // Secondary: total points scored (tiebreaker)
                      return b.stats.points - a.stats.points;
                    })
                    .map((team, index) => (
                      <div key={team.id} className="bg-white rounded-lg p-2 border border-gray-200 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`font-bold text-sm flex-shrink-0 ${
                              index === 0 ? 'text-yellow-600' :
                              index === 1 ? 'text-gray-500' :
                              index === 2 ? 'text-orange-600' :
                              'text-gray-400'
                            }`}>
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                              {index > 2 && `#${index + 1}`}
                            </span>
                            <span className="text-sm font-semibold text-gray-800 truncate">{team.name}</span>
                          </div>
                          <div className="font-bold text-purple-600 flex-shrink-0 ml-2">{team.stats.points} pts</div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600 ml-6">
                          <span>{team.players.map((p: any) => p.name).join(' & ')}</span>
                          <span className="text-xs">
                            <span className="text-green-600 font-semibold">{team.stats.matchesWon}W</span>
                            {' - '}
                            <span className="text-red-600 font-semibold">{team.stats.matchesLost}L</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  {stats.teams.length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      No teams in this zone
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Leaderboard */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Team Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Team</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Zone</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Played</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Won</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Lost</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total Pts Scored</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Avg/Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamsWithStats
                .sort((a, b) => {
                  // Primary: matches won
                  if (b.stats.matchesWon !== a.stats.matchesWon) {
                    return b.stats.matchesWon - a.stats.matchesWon;
                  }
                  // Secondary: total points scored (tiebreaker)
                  return b.stats.points - a.stats.points;
                })
                .map((team, index) => {
                  const avgScore = calculations.calculateAveragePoints(team, matches);
                  return (
                    <tr key={team.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <span className={`font-bold ${index < 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-800">{team.name}</p>
                          <p className="text-xs text-gray-500">
                            {team.players.map(p => p.name).join(' & ')}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {zones.find(z => z.id === team.zone)?.name}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {team.stats.matchesWon + team.stats.matchesLost}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                        {team.stats.matchesWon}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-red-600">
                        {team.stats.matchesLost}
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-bold text-blue-600">
                        {team.stats.points}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {avgScore.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {teamsWithStats.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No teams data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Courts with Completed Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Court Activity & Completed Matches</h3>
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold">
            Total Completed: {matches.filter(m => m.status === 'completed').length}
          </div>
        </div>

        {/* Show ALL completed matches in a single section */}
        {(() => {
          const allCompletedMatches = matches.filter(m => m.status === 'completed');
          if (allCompletedMatches.length > 0) {
            return (
              <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
                <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  All Completed Matches ({allCompletedMatches.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                  {[...allCompletedMatches].reverse().map(match => {
                    const matchCourt = courts.find(c => c.id === match.courtId);
                    return (
                      <div key={match.id} className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition">
                        {/* Court info */}
                        {matchCourt && (
                          <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                            <span>🏟️ {matchCourt.name}</span>
                            <span className="text-gray-400">Ref: {matchCourt.refereeName}</span>
                          </div>
                        )}
                        {!matchCourt && (
                          <div className="text-xs text-yellow-600 mb-2">
                            ⚠️ No court assigned
                          </div>
                        )}

                        {/* Match details */}
                        <div className="mb-3">
                          <div className="text-sm font-semibold text-gray-800 mb-1">
                            {match.team1.name}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">vs</div>
                          <div className="text-sm font-semibold text-gray-800">
                            {match.team2.name}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-2">
                          <div className="text-center mb-2">
                            <span className="text-xs text-gray-600">Sets Won</span>
                            <div className="text-2xl font-bold text-blue-600">
                              {match.score.team1} - {match.score.team2}
                            </div>
                          </div>

                          {/* Set by set scores */}
                          <div className="border-t border-blue-200 pt-2">
                            <div className="text-xs text-gray-600 mb-1">Set Scores:</div>
                            <div className="flex justify-center gap-3">
                              {match.sets.map((set) => (
                                <span key={`${match.id}-set-${set.setNumber}`} className="font-mono text-sm font-semibold text-gray-700">
                                  {set.score.team1}-{set.score.team2}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Winner */}
                        {match.winner && (
                          <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                            <div className="text-xs text-green-700 font-semibold flex items-center justify-center gap-1">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              Winner: {match.winner.name}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          return (
            <div className="mb-6 bg-gray-50 rounded-lg p-12 text-center border-2 border-gray-200">
              <div className="text-gray-400 text-lg">No completed matches yet</div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map(court => {
            const completedMatches = matches.filter(m => m.courtId === court.id && m.status === 'completed');
            const liveMatch = matches.find(m => m.courtId === court.id && m.status === 'live');
            const upcomingMatches = matches.filter(m => m.courtId === court.id && m.status === 'upcoming');

            return (
              <div key={court.id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800 text-lg">{court.name}</h4>
                  <div className="text-xs font-semibold px-2 py-1 rounded bg-purple-100 text-purple-700">
                    {completedMatches.length} Completed
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-3">
                  <p>Referee: <span className="font-semibold">{court.refereeName}</span></p>
                  <p className="mt-1">
                    <span className="text-green-600 font-semibold">{liveMatch ? '🔴 Live' : upcomingMatches.length > 0 ? `${upcomingMatches.length} Queued` : 'Idle'}</span>
                  </p>
                </div>

                {/* Completed Matches */}
                {completedMatches.length > 0 ? (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-blue-700 mb-2">
                      ✓ All Completed Matches ({completedMatches.length})
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {[...completedMatches]
                        .reverse()
                        .map(match => (
                          <div key={match.id} className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-700 truncate">
                                {match.team1.name} vs {match.team2.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-xs ${match.winner?.id === match.team1.id ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                                {match.team1.name}: {match.score.team1} sets
                              </span>
                              <span className={`text-xs ${match.winner?.id === match.team2.id ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                                {match.team2.name}: {match.score.team2} sets
                              </span>
                            </div>
                            {match.winner && (
                              <div className="text-xs text-center text-green-700 font-semibold mt-1 pt-1 border-t border-gray-200">
                                🏆 Winner: {match.winner.name}
                              </div>
                            )}
                            {/* Show set-by-set scores */}
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Sets:</span>
                                <div className="flex gap-2">
                                  {match.sets.map((set) => (
                                    <span key={`${match.id}-set-${set.setNumber}`} className="font-mono">
                                      {set.score.team1}-{set.score.team2}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    <p>No completed matches yet</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
