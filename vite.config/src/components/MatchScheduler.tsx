import React, { useState } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { Match } from '../types';
import { Calendar, Trophy } from 'lucide-react';

export const MatchScheduler: React.FC = () => {
  const { teams, matches, addMatch } = useTournamentStore();
  const [selectedZone, setSelectedZone] = useState('all');

  const zones = [
    { id: 'all', name: 'All Zones' },
    { id: 'zone-a', name: 'Zone A' },
    { id: 'zone-b', name: 'Zone B' },
    { id: 'zone-c', name: 'Zone C' },
    { id: 'zone-d', name: 'Zone D' }
  ];

  const generateRoundRobin = (zoneId: string) => {
    const zoneTeams = zoneId === 'all' 
      ? teams 
      : teams.filter(t => t.zone === zoneId);

    if (zoneTeams.length < 2) {
      alert('Need at least 2 teams to generate matches');
      return;
    }

    const newMatches: Match[] = [];
    
    for (let i = 0; i < zoneTeams.length; i++) {
      for (let j = i + 1; j < zoneTeams.length; j++) {
        const match: Match = {
          id: `match-${Date.now()}-${i}-${j}`,
          team1: zoneTeams[i],
          team2: zoneTeams[j],
          score: { team1: 0, team2: 0 },
          status: 'upcoming'
        };
        newMatches.push(match);
      }
    }

    newMatches.forEach(match => addMatch(match));
    alert(`Generated ${newMatches.length} matches for ${zoneId === 'all' ? 'all zones' : zones.find(z => z.id === zoneId)?.name}`);
  };

  const filteredMatches = selectedZone === 'all'
    ? matches
    : matches.filter(m => m.team1.zone === selectedZone || m.team2.zone === selectedZone);

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-gray-200 text-gray-700',
      live: 'bg-green-200 text-green-800',
      completed: 'bg-blue-200 text-blue-800'
    };
    return styles[status as keyof typeof styles] || styles.upcoming;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Match Scheduler
        </h2>
      </div>

      <div className="mb-6 flex gap-4 items-center flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Zone
          </label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-6">
          <button
            onClick={() => generateRoundRobin(selectedZone)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Generate Round Robin
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No matches scheduled</p>
            <p className="text-sm">Generate matches using the button above</p>
          </div>
        ) : (
          filteredMatches.map(match => (
            <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-center">
                <div className="flex-1">
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
              </div>
            </div>
          ))
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
