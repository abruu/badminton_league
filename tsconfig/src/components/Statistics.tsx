import React, { useMemo, useEffect } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { calculations } from '../utils/calculations';
import { TrendingUp, Award, Users, Target } from 'lucide-react';

export const Statistics: React.FC = () => {
  const { teams, matches, zones, refreshData } = useTournamentStore();

  useEffect(() => {
    // Auto-refresh statistics every 2 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 2000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const stats = useMemo(() => {
    const zoneIds = zones.map(z => z.id);
    return calculations.calculateTournamentStats(teams, matches, zoneIds);
  }, [teams, matches, zones]);

  const teamsWithStats = useMemo(() => {
    return calculations.calculateTeamStats(teams, matches);
  }, [teams, matches]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Tournament Statistics
      </h2>

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

      {/* Overall Best */}
      {stats.overallBestTeam && (
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

      {/* Best Player */}
      {stats.overallBestPlayer && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border-2 border-blue-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            🎯 Best Player
          </h3>
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-2xl font-bold text-gray-800">
                  {stats.overallBestPlayer.player.name}
                </h4>
                <p className="text-gray-600">Most Wins</p>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.overallBestPlayer.wins} wins
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Best per Zone */}
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

      {/* Team Leaderboard */}
      <div>
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
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Points</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamsWithStats
                .sort((a, b) => {
                  if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
                  return b.stats.matchesWon - a.stats.matchesWon;
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
    </div>
  );
};
