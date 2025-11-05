import React from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { UserCog, MapPin } from 'lucide-react';

export const CourtAssignment: React.FC = () => {
  const { courts, matches, referees, assignMatchToCourt, assignRefereeToCourt } = useTournamentStore();

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  const handleAssignMatch = (courtId: string, matchId: string) => {
    if (!matchId) {
      assignMatchToCourt(matchId, courtId);
      return;
    }
    
    const match = matches.find(m => m.id === matchId);
    const court = courts.find(c => c.id === courtId);
    
    if (match && court) {
      if (window.confirm(`Assign match "${match.team1.name} vs ${match.team2.name}" to ${court.name}?`)) {
        assignMatchToCourt(matchId, courtId);
      }
    }
  };

  const handleAssignReferee = (courtId: string, refereeId: string) => {
    if (!refereeId) {
      assignRefereeToCourt(refereeId, courtId);
      return;
    }
    
    const referee = referees.find(r => r.id === refereeId);
    const court = courts.find(c => c.id === courtId);
    
    if (referee && court) {
      if (window.confirm(`Assign referee "${referee.name}" to ${court.name}?`)) {
        assignRefereeToCourt(refereeId, courtId);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Court & Referee Assignment
        </h2>
      </div>

      {/* Referees List */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <UserCog className="w-5 h-5" />
          Referees
        </h3>

        <div className="flex flex-wrap gap-2">
          {referees.map(referee => (
            <div
              key={referee.id}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {referee.name}
              {referee.courtId && (
                <span className="ml-2 text-blue-600">
                  (Court {referee.courtId.replace('court-', '')})
                </span>
              )}
            </div>
          ))}
          {referees.length === 0 && (
            <p className="text-sm text-gray-500">No referees added yet</p>
          )}
        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courts.map(court => (
          <div key={court.id} className="border-2 border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{court.name}</h3>
              <div className="text-sm text-gray-600">
                Referee: <span className="font-medium">{court.refereeName}</span>
              </div>
            </div>

            {/* Assign Referee */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assign Referee
              </label>
              <select
                value={court.refereeId}
                onChange={(e) => handleAssignReferee(court.id, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Referee</option>
                {referees.map(referee => {
                  // Check if referee is already assigned to a different court
                  const isAssignedElsewhere = !!(referee.courtId && referee.courtId !== court.id);
                  return (
                    <option 
                      key={referee.id} 
                      value={referee.id}
                      disabled={isAssignedElsewhere}
                    >
                      {referee.name}
                      {isAssignedElsewhere ? ' (Assigned to another court)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Current Match */}
            {court.match ? (
              <div className={`p-3 rounded-lg border ${
                court.match.status === 'live' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className={`text-xs font-semibold mb-2 ${
                  court.match.status === 'live' 
                    ? 'text-green-800' 
                    : 'text-blue-800'
                }`}>
                  {court.match.status === 'live' ? '🔴 LIVE MATCH' : '⏳ MATCH ASSIGNED'}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {court.match.team1.name} vs {court.match.team2.name}
                </div>
                <div className="text-lg font-bold mt-1" style={{ color: court.match.status === 'live' ? '#15803d' : '#1e40af' }}>
                  {court.match.score.team1} - {court.match.score.team2}
                </div>
                {court.match.status === 'upcoming' && (
                  <div className="mt-2 text-xs text-blue-700">
                    Referee will start the match
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  Assign Match
                </label>
                <select
                  onChange={(e) => e.target.value && handleAssignMatch(court.id, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="">Select Match</option>
                  {upcomingMatches.map(match => (
                    <option key={match.id} value={match.id}>
                      {match.team1.name} vs {match.team2.name}
                    </option>
                  ))}
                </select>
                {upcomingMatches.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">No upcoming matches available</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
