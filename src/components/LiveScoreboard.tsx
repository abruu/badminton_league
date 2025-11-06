import React, { useState, useMemo } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { Trophy, Share2, Filter, TrendingUp, Award, RefreshCw } from 'lucide-react';
import { calculations } from '../utils/calculations';
import { LoadingSpinner } from './LoadingSpinner';

export const LiveScoreboard: React.FC = () => {
  const { courts, matches, teams, zones: storeZones, refreshData, isLoading, isInitialized } = useTournamentStore();
  const [selectedZone, setSelectedZone] = useState('all');

  // Real-time subscriptions in useRealtimeSubscriptions hook handle all updates
  // No component-level polling needed - reduces database load significantly

  // Use teams directly from store (stats are now persisted in database)
  const teamsWithStats = useMemo(() => teams, [teams]);

  // Calculate zone-based statistics
  const zoneStats = useMemo(() => {
    const stats: { [zoneId: string]: { teams: any[], totalPoints: number, topTeam: any } } = {};
    
    storeZones.forEach(zone => {
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
  }, [teamsWithStats, storeZones]);

  const zoneOptions = [
    { id: 'all', name: 'All Zones' },
    ...storeZones.map(z => ({ id: z.id, name: z.name }))
  ];

  const filteredCourts = selectedZone === 'all'
    ? courts
    : courts.filter(c => c.match && (
        c.match.team1.zone === selectedZone || c.match.team2.zone === selectedZone
      ));

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Badminton Tournament Live Scores',
          text: 'Check out the live scores from the tournament!',
          url: url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const getMatchStatus = (match: any) => {
    if (match.status === 'completed') return 'Completed';
    if (match.status === 'live') return '🔴 Live';
    return 'Upcoming';
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-blue-100 text-blue-800';
    if (status === 'live') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Show loader during initial data fetch
  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <LoadingSpinner fullScreen size="xl" text="Loading Live Scoreboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                🏸 Live Tournament Scoreboard
              </h1>
              <p className="text-gray-600 mt-1">Real-time updates from all courts</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refreshData()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Manually refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Zone Filter */}
          <div className="mt-4 flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {zoneOptions.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map(court => (
            <div
              key={court.id}
              className={`bg-white rounded-xl shadow-lg p-6 ${
                court.match?.status === 'live' ? 'ring-4 ring-green-400' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{court.name}</h2>
                {court.match && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(court.match.status)}`}>
                    {getMatchStatus(court.match)}
                  </span>
                )}
              </div>

              {court.match ? (
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">
                      {storeZones.find(z => z.id === court.match!.team1.zone)?.name || 'No Zone'}
                    </div>
                    
                    {/* Team 1 */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-blue-900">
                            {court.match.team1.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {court.match.team1.players.map(p => p.name).join(' & ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Set Scores */}
                          {court.match.sets.map((set, idx) => (
                            <div 
                              key={idx}
                              className={`text-sm px-2 py-1 rounded ${
                                set.setNumber === court.match!.currentSetNumber 
                                  ? 'bg-blue-200 font-bold' 
                                  : 'bg-blue-100'
                              }`}
                            >
                              {set.score.team1}
                            </div>
                          ))}
                          {/* Total Score */}
                          <div className="text-3xl font-bold text-blue-600 ml-2">
                            {court.match.score.team1}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-gray-400 font-bold mb-3">VS</div>

                    {/* Team 2 */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-red-900">
                            {court.match.team2.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {court.match.team2.players.map(p => p.name).join(' & ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Set Scores */}
                          {court.match.sets.map((set, idx) => (
                            <div 
                              key={idx}
                              className={`text-sm px-2 py-1 rounded ${
                                set.setNumber === court.match!.currentSetNumber 
                                  ? 'bg-red-200 font-bold' 
                                  : 'bg-red-100'
                              }`}
                            >
                              {set.score.team2}
                            </div>
                          ))}
                          {/* Total Score */}
                          <div className="text-3xl font-bold text-red-600 ml-2">
                            {court.match.score.team2}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Set Indicator */}
                  {court.match.status === 'live' && (
                    <div className="mb-3 p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg text-center">
                      <span className="text-sm font-semibold text-gray-700">
                        📊 Set {court.match.currentSetNumber} in Progress
                        {court.match.servingTeam && (
                          <span className="ml-2 text-xs">
                            • Serving: {court.match.servingTeam === 'team1' ? court.match.team1.name : court.match.team2.name}
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {court.match.winner && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg text-center">
                      <span className="text-sm font-semibold text-yellow-800">
                        🏆 Winner: {court.match.winner.name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No match assigned</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Referee: <span className="font-medium">{court.refereeName}</span>
                </p>
              </div>

              {/* Court Queue - Upcoming Matches */}
              {court.matches && court.matches.filter(m => m.status === 'upcoming').length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs font-semibold text-gray-700">📋 Queue ({court.matches.filter(m => m.status === 'upcoming').length})</div>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {court.matches
                      .filter(m => m.status === 'upcoming')
                      .slice(0, 3)
                      .map((match, idx) => (
                        <div key={match.id} className="bg-gray-50 rounded p-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-600">#{idx + 1}</span>
                            <span className="text-gray-800 font-semibold truncate flex-1 mx-2">
                              {match.team1.name} vs {match.team2.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    {court.matches.filter(m => m.status === 'upcoming').length > 3 && (
                      <div className="text-xs text-center text-gray-500">
                        +{court.matches.filter(m => m.status === 'upcoming').length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Matches on this Court */}
              {matches.filter(m => m.courtId === court.id && m.status === 'completed').length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs font-semibold text-blue-700">✓ Completed ({matches.filter(m => m.courtId === court.id && m.status === 'completed').length})</div>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {matches
                      .filter(m => m.courtId === court.id && m.status === 'completed')
                      .slice(-3)
                      .reverse()
                      .map(match => (
                        <div key={match.id} className="bg-blue-50 rounded p-2 text-xs border border-blue-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-800 font-semibold truncate">
                              {match.team1.name} vs {match.team2.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${match.winner?.id === match.team1.id ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                              {match.team1.name}: {match.score.team1}
                            </span>
                            <span className={`text-xs ${match.winner?.id === match.team2.id ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                              {match.team2.name}: {match.score.team2}
                            </span>
                          </div>
                          {match.winner && (
                            <div className="text-xs text-center text-green-700 font-semibold mt-1">
                              🏆 {match.winner.name}
                            </div>
                          )}
                        </div>
                      ))}
                    {matches.filter(m => m.courtId === court.id && m.status === 'completed').length > 3 && (
                      <div className="text-xs text-center text-gray-500">
                        +{matches.filter(m => m.courtId === court.id && m.status === 'completed').length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tournament Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                {matches.length}
              </div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {matches.filter(m => m.status === 'live').length}
              </div>
              <div className="text-sm text-gray-600">Live Now</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {matches.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {matches.filter(m => m.status === 'upcoming').length}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-bold text-gray-800">Tournament Leaders</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Best Team */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h4 className="font-bold text-gray-800">Best Team Overall</h4>
              </div>
              {calculations.getOverallBestTeam(teamsWithStats) ? (
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {calculations.getOverallBestTeam(teamsWithStats)!.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {storeZones.find(z => z.id === calculations.getOverallBestTeam(teamsWithStats)!.zone)?.name}
                  </div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <div>
                      <div className="font-bold text-yellow-700">{calculations.getOverallBestTeam(teamsWithStats)!.stats.points}</div>
                      <div className="text-gray-500">Points</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-700">{calculations.getOverallBestTeam(teamsWithStats)!.stats.matchesWon}</div>
                      <div className="text-gray-500">Wins</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-700">{calculations.getOverallBestTeam(teamsWithStats)!.stats.matchesLost}</div>
                      <div className="text-gray-500">Losses</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No data yet</div>
              )}
            </div>

            {/* Total Tournament Points */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-gray-800">Total Points Distributed</h4>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-700">
                  {teamsWithStats.reduce((sum, team) => sum + team.stats.points, 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Across {teamsWithStats.length} teams
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Average: {teamsWithStats.length > 0 
                    ? (teamsWithStats.reduce((sum, team) => sum + team.stats.points, 0) / teamsWithStats.length).toFixed(1)
                    : 0} pts/team
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone-Based Team Points */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-800">Zone-Based Team Standings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {storeZones.map(zone => {
              const stats = zoneStats[zone.id];
              if (!stats) return null;
              
              return (
                <div key={zone.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center justify-between">
                    <span>{zone.name}</span>
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </h4>
                  
                  {/* Top Team */}
                  {stats.topTeam && (
                    <div className="mb-3 p-2 bg-white rounded-lg border-2 border-yellow-300">
                      <div className="text-xs text-gray-500 mb-1">🏆 Top Team</div>
                      <div className="font-bold text-sm text-gray-800">{stats.topTeam.name}</div>
                      <div className="text-xs text-gray-600">
                        {stats.topTeam.stats.points} points • {stats.topTeam.stats.matchesWon}W-{stats.topTeam.stats.matchesLost}L
                      </div>
                    </div>
                  )}
                  
                  {/* All Teams in Zone */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-600 mb-2">All Teams ({stats.teams.length})</div>
                    {stats.teams
                      .sort((a, b) => b.stats.points - a.stats.points)
                      .map((team, index) => (
                        <div key={team.id} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${
                              index === 0 ? 'text-yellow-600' : 
                              index === 1 ? 'text-gray-500' : 
                              index === 2 ? 'text-orange-600' : 
                              'text-gray-400'
                            }`}>
                              #{index + 1}
                            </span>
                            <span className="text-gray-800 truncate max-w-[120px]">{team.name}</span>
                          </div>
                          <div className="font-bold text-purple-600">{team.stats.points} pts</div>
                        </div>
                      ))}
                  </div>
                  
                  {/* Zone Total Points */}
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Zone Total:</span>
                      <span className="font-bold text-purple-700">{stats.totalPoints} points</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Completed Matches Section */}
        {(() => {
          const allCompletedMatches = matches.filter(m => m.status === 'completed');
          if (allCompletedMatches.length > 0) {
            return (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  All Completed Matches ({allCompletedMatches.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                  {[...allCompletedMatches].reverse().map(match => {
                    const matchCourt = courts.find(c => c.id === match.courtId);
                    return (
                      <div key={match.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition">
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
                        <div className="bg-white rounded-lg p-3 mb-2 border border-blue-300">
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
          return null;
        })()}
        
      </div>
    </div>
  );
};
