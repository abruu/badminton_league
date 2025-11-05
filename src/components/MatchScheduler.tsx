import React, { useState } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { Match } from '../types';
import { Calendar, Plus, Trash2, Loader2 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export const MatchScheduler: React.FC = () => {
  const { teams, matches, addMatch, deleteMatch, zones: storeZones, isLoading, isInitialized } = useTournamentStore();
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [loading, setLoading] = useState(false);

  // Get teams filtered by selected zone
  const filteredTeams = selectedZone 
    ? teams.filter(team => team.zone === selectedZone)
    : [];

  const handleManualSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!selectedZone) {
        alert('Please select a zone');
        return;
      }

      if (!team1Id || !team2Id) {
        alert('Please select both teams');
        return;
      }

      if (team1Id === team2Id) {
        alert('Please select different teams');
        return;
      }

      const team1 = teams.find(t => t.id === team1Id);
      const team2 = teams.find(t => t.id === team2Id);

      if (!team1 || !team2) {
        alert('Invalid team selection');
        return;
      }

      // Validate teams are from the same zone
      if (team1.zone !== team2.zone) {
        alert('Both teams must be from the same zone');
        return;
      }

      const newMatch: Match = {
        id: `match-${Date.now()}`,
        team1,
        team2,
        score: { team1: 0, team2: 0 }, // Sets won (0-2)
        sets: [
          {
            setNumber: 1,
            score: { team1: 0, team2: 0 }
          }
        ], // Initialize with first set
        currentSetNumber: 1, // Start with set 1
        servingTeam: 'team1', // Team 1 serves first (rally scoring)
        team1Position: 'left', // Default positions
        team2Position: 'right',
        status: 'upcoming',
        history: [] // Initialize empty history for score tracking
      };

      await addMatch(newMatch);
      setTeam1Id('');
      setTeam2Id('');
      setSelectedZone('');
      alert('Match scheduled successfully!');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-gray-200 text-gray-700',
      live: 'bg-green-200 text-green-800',
      completed: 'bg-blue-200 text-blue-800'
    };
    return styles[status as keyof typeof styles] || styles.upcoming;
  };

  const handleDeleteMatch = (matchId: string, matchInfo: string) => {
    if (confirm(`Are you sure you want to delete this match?\n${matchInfo}`)) {
      deleteMatch(matchId);
    }
  };

  // Show loader during initial data fetch
  if (isLoading && !isInitialized) {
    return <LoadingSpinner size="lg" text="Loading Matches..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Match Scheduler
        </h2>
      </div>

      {/* Manual Scheduling Form */}
      <form onSubmit={handleManualSchedule} className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-blue-900">Schedule New Match</h3>
          <Plus className="w-5 h-5 text-blue-700" />
        </div>

        {/* Zone Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Zone (Teams must be from the same zone)
          </label>
          <select
            value={selectedZone}
            onChange={(e) => {
              setSelectedZone(e.target.value);
              setTeam1Id(''); // Reset team selections when zone changes
              setTeam2Id('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Zone First</option>
            {storeZones.map(zone => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({teams.filter(t => t.zone === zone.id).length} teams)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team 1
            </label>
            <select
              value={team1Id}
              onChange={(e) => setTeam1Id(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!selectedZone}
            >
              <option value="">Select Team 1</option>
              {filteredTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.players.map(p => p.name).join(' & ')})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team 2
            </label>
            <select
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!selectedZone}
            >
              <option value="">Select Team 2</option>
              {filteredTeams.map(team => (
                <option key={team.id} value={team.id} disabled={team.id === team1Id}>
                  {team.name} ({team.players.map(p => p.name).join(' & ')})
                </option>
              ))}
            </select>
          </div>
        </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Schedule Match
          </button>
        </form>

      <div className="space-y-3">
        {matches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No matches scheduled</p>
            <p className="text-sm">Schedule matches using the form above</p>
          </div>
        ) : (
          matches.map(match => {
            const zoneName = storeZones.find(z => z.id === match.team1.zone)?.name || 'Unknown Zone';
            return (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Zone Badge */}
                    <div className="mb-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        📍 {zoneName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          {match.team1.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {match.team1.players.map(p => p.name).join(' & ')}
                        </div>
                      </div>
                      <div className="text-2xl font-bold mx-4 text-gray-600">VS</div>
                      <div className="flex-1 text-right">
                        <div className="font-semibold text-gray-800">
                          {match.team2.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {match.team2.players.map(p => p.name).join(' & ')}
                        </div>
                      </div>
                    </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(match.status)}`}>
                      {match.status.toUpperCase()}
                    </span>
                    {match.status === 'completed' && (
                      <div className="text-sm font-semibold text-gray-700">
                        Score: {match.score.team1} - {match.score.team2}
                      </div>
                    )}
                    {match.status === 'live' && (
                      <div className="text-sm font-semibold text-green-700">
                        Live: {match.score.team1} - {match.score.team2}
                      </div>
                    )}
                    {match.courtId && (
                      <div className="text-xs text-gray-500">
                        Court: {match.courtId.replace('court-', '')}
                      </div>
                    )}
                  </div>
                </div>
                {match.status === 'upcoming' && (
                  <button
                    onClick={() => handleDeleteMatch(
                      match.id,
                      `${match.team1.name} vs ${match.team2.name}`
                    )}
                    className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                    title="Delete match"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            );
          })
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Match Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Matches:</span>
            <span className="ml-2 font-semibold">{matches.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Live:</span>
            <span className="ml-2 font-semibold text-green-700">
              {matches.filter(m => m.status === 'live').length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Completed:</span>
            <span className="ml-2 font-semibold text-blue-700">
              {matches.filter(m => m.status === 'completed').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
