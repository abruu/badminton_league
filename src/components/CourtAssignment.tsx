import React from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { UserCog, MapPin, ChevronUp, ChevronDown, X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export const CourtAssignment: React.FC = () => {
  const { courts, matches, referees, assignMatchToCourt, assignRefereeToCourt, unassignMatchFromCourt, reorderCourtMatches, isLoading, isInitialized } = useTournamentStore();

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  const handleAssignMatch = (courtId: string, matchId: string) => {
    if (!matchId) {
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

  const handleRemoveMatch = (matchId: string, matchName: string) => {
    if (window.confirm(`Remove "${matchName}" from this court's queue?`)) {
      unassignMatchFromCourt(matchId);
    }
  };

  const handleReorderMatch = (courtId: string, matchId: string, direction: 'up' | 'down') => {
    reorderCourtMatches(courtId, matchId, 'down');
  };

  // Show loader during initial data fetch
  if (isLoading && !isInitialized) {
    return <LoadingSpinner size="lg" text="Loading Courts..." />;
  }

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

            {/* Assigned Matches Queue */}
            {court.matches && court.matches.length > 0 && (
              <div className="space-y-2 mb-3">
                <div className="text-xs font-semibold text-gray-700">Assigned Matches ({court.matches.length})</div>
                {court.matches.map((match, index) => (
                  <div 
                    key={match.id}
                    className={`p-2 rounded-lg border text-xs ${
                      match.status === 'live' 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex-1">
                        <span className={`font-semibold ${match.status === 'live' ? 'text-green-800' : 'text-gray-700'}`}>
                          {index + 1}. {match.team1.name} vs {match.team2.name}
                        </span>
                        {match.status === 'live' && (
                          <span className="ml-2 text-green-600 font-bold">
                            {match.score.team1} - {match.score.team2} 🔴
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          match.status === 'live' 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {match.status === 'live' ? 'LIVE' : 'QUEUED'}
                        </span>
                        {/* Reorder and Remove buttons - only show for queued matches */}
                        {match.status !== 'live' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleReorderMatch(court.id, match.id, 'up')}
                              disabled={index === 0 || (court.matches && court.matches[0].status === 'live' && index === 1)}
                              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleReorderMatch(court.id, match.id, 'down')}
                              disabled={court.matches && index === court.matches.length - 1}
                              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemoveMatch(match.id, `${match.team1.name} vs ${match.team2.name}`)}
                              className="p-1 rounded hover:bg-red-100 text-red-600"
                              title="Remove from queue"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Assign Match Dropdown - Always available */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Assign Match
              </label>
              <select
                onChange={(e) => e.target.value && handleAssignMatch(court.id, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value=""
              >
                <option value="">Select Match</option>
                {upcomingMatches.filter(m => !m.courtId).map(match => (
                  <option key={match.id} value={match.id}>
                    {match.team1.name} vs {match.team2.name}
                  </option>
                ))}
              </select>
              {upcomingMatches.filter(m => !m.courtId).length === 0 && (
                <p className="text-xs text-gray-500 mt-2">No unassigned matches available</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
