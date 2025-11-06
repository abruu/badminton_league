import React from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { CheckCircle, XCircle, Clock, AlertCircle, Trophy } from 'lucide-react';

export const MatchApprovalPanel: React.FC = () => {
  const { matches, approveMatchEnd, rejectMatchEnd, courts } = useTournamentStore();

  const pendingMatches = matches.filter(m => m.pendingApproval);

  const handleApprove = async (matchId: string) => {
    if (confirm('Approve this match completion? The match will be marked as finished and team statistics will be updated.')) {
      await approveMatchEnd(matchId);
    }
  };

  const handleReject = async (matchId: string) => {
    if (confirm('Reject this completion request? The referee can continue or modify the match.')) {
      await rejectMatchEnd(matchId);
    }
  };

  if (pendingMatches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All match completion requests have been processed.</p>
            <p className="text-sm text-gray-500 mt-2">When referees request match approval, they will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-orange-900">
            Pending Match Approval Requests ({pendingMatches.length})
          </h3>
        </div>

        <div className="space-y-4">
          {pendingMatches.map(match => {
            const court = courts.find(c => c.id === match.courtId);
            
            return (
              <div key={match.id} className="bg-white rounded-lg p-6 border-2 border-orange-200 shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-lg text-gray-800">Match Completion Request</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Match</p>
                        <p className="font-semibold text-gray-800">
                          {match.team1.name}
                        </p>
                        <p className="text-xs text-gray-500">vs</p>
                        <p className="font-semibold text-gray-800">
                          {match.team2.name}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Final Score (Sets)</p>
                        <p className="font-semibold text-3xl text-blue-600">
                          {match.score.team1} - {match.score.team2}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Winner</p>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <p className="font-semibold text-green-600">
                            {match.score.team1 > match.score.team2 ? match.team1.name : match.team2.name}
                          </p>
                        </div>
                      </div>

                      {court && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Court</p>
                          <p className="font-semibold text-gray-800">{court.name}</p>
                          <p className="text-xs text-gray-500">Referee: {court.refereeName}</p>
                        </div>
                      )}
                    </div>

                    {/* Set Details */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Set Scores:</p>
                      <div className="flex gap-4">
                        {match.sets.map((set) => (
                          <div key={`set-${match.id}-${set.setNumber}`} className="text-sm">
                            <span className="text-gray-600">Set {set.setNumber}:</span>
                            <span className="font-semibold ml-2 font-mono">
                              {set.score.team1} - {set.score.team2}
                            </span>
                            {set.winner && (
                              <span className="ml-2 text-green-600 text-xs">
                                ✓ {set.winner === 'team1' ? match.team1.name : match.team2.name}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {match.requestedBy && (
                      <p className="text-sm text-gray-600">
                        Requested by: <span className="font-medium">{match.requestedBy}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleApprove(match.id)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(match.id)}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
