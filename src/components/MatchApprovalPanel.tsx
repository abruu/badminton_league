import React from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export const MatchApprovalPanel: React.FC = () => {
  const { matches, approveMatchEnd, rejectMatchEnd } = useTournamentStore();

  const pendingMatches = matches.filter(m => m.pendingApproval);

  const handleApprove = async (matchId: string) => {
    if (confirm('Approve this match completion? The match will be marked as finished.')) {
      await approveMatchEnd(matchId);
    }
  };

  const handleReject = async (matchId: string) => {
    if (confirm('Reject this completion request? The referee can continue the match.')) {
      await rejectMatchEnd(matchId);
    }
  };

  if (pendingMatches.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-6 h-6 text-orange-600" />
        <h3 className="text-xl font-bold text-orange-900">
          Pending Match Approval Requests ({pendingMatches.length})
        </h3>
      </div>

      <div className="space-y-4">
        {pendingMatches.map(match => (
          <div key={match.id} className="bg-white rounded-lg p-4 border-2 border-orange-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-800">Match Completion Request</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Match</p>
                    <p className="font-semibold text-gray-800">
                      {match.team1.name} vs {match.team2.name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Final Score</p>
                    <p className="font-semibold text-lg text-blue-600">
                      {match.score.team1} - {match.score.team2}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Winner</p>
                    <p className="font-semibold text-green-600">
                      {match.score.team1 > match.score.team2 ? match.team1.name : match.team2.name}
                    </p>
                  </div>
                </div>

                {match.requestedBy && (
                  <p className="text-sm text-gray-600">
                    Requested by: <span className="font-medium">{match.requestedBy}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleApprove(match.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(match.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-semibold"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
