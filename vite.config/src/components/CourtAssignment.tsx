import React, { useState } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { UserCog, MapPin } from 'lucide-react';

export const CourtAssignment: React.FC = () => {
  const { courts, matches, referees, assignMatchToCourt, assignRefereeToCourt, addReferee } = useTournamentStore();
  const [isAddingReferee, setIsAddingReferee] = useState(false);
  const [refereeName, setRefereeName] = useState('');

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  const handleAssignMatch = (courtId: string, matchId: string) => {
    assignMatchToCourt(matchId, courtId);
  };

  const handleAssignReferee = (courtId: string, refereeId: string) => {
    assignRefereeToCourt(refereeId, courtId);
  };

  const handleAddReferee = (e: React.FormEvent) => {
    e.preventDefault();
    if (refereeName.trim()) {
      addReferee({
        id: `referee-${Date.now()}`,
        name: refereeName
      });
      setRefereeName('');
      setIsAddingReferee(false);
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

      {/* Add Referee Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Referees
          </h3>
          {!isAddingReferee && (
            <button
              onClick={() => setIsAddingReferee(true)}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              Add Referee
            </button>
          )}
        </div>
        
        {isAddingReferee && (
          <form onSubmit={handleAddReferee} className="flex gap-2 mb-3">
            <input
              type="text"
              value={refereeName}
              onChange={(e) => setRefereeName(e.target.value)}
              placeholder="Referee name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingReferee(false);
                setRefereeName('');
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </form>
        )}

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
                {referees.map(referee => (
                  <option key={referee.id} value={referee.id}>
                    {referee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Match */}
            {court.match ? (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs font-semibold text-green-800 mb-2">LIVE MATCH</div>
                <div className="text-sm font-medium text-gray-800">
                  {court.match.team1.name} vs {court.match.team2.name}
                </div>
                <div className="text-lg font-bold text-green-700 mt-1">
                  {court.match.score.team1} - {court.match.score.team2}
                </div>
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
