import React, { useState, useEffect } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { Trophy, Plus, RotateCcw, CheckCircle } from 'lucide-react';

export const RefereePanel: React.FC = () => {
  const { courts, updateMatchScore, finishMatch, undoLastScore, refreshData } = useTournamentStore();
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');

  const selectedCourt = courts.find(c => c.id === selectedCourtId);
  const match = selectedCourt?.match;

  // Check if there are any events to undo in the match's history for the current set
  const canUndo = match && match.history 
    && match.history.some(event => event.setNumber === match.currentSetNumber);

  useEffect(() => {
    if (courts.length > 0 && !selectedCourtId) {
      setSelectedCourtId(courts[0].id);
    }
  }, [courts, selectedCourtId]);

  // Real-time subscriptions in useRealtimeSubscriptions hook handle updates
  // Only listen for storage events from other tabs for immediate sync
  useEffect(() => {
    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-update', handleStorageChange);
    };
  }, [refreshData]);

  const handleAddPoint = (team: 'team1' | 'team2') => {
    if (!match) return;
    const currentScore = match.score[team];
    updateMatchScore(match.id, team, currentScore + 1);
  };

  const handleUndoScore = () => {
    if (!match) return;
    if (!canUndo) {
      alert('No actions to undo!');
      return;
    }
    if (window.confirm('Undo the last score update?')) {
      undoLastScore(match.id);
    }
  };

  const handleFinishMatch = () => {
    if (!match) return;
    if (confirm('Are you sure you want to finish this match?')) {
      finishMatch(match.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Referee Control Panel
          </h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Court
            </label>
            <select
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {courts.map(court => (
                <option key={court.id} value={court.id}>
                  {court.name} - {court.refereeName}
                  {court.match ? ' (Live Match)' : ' (No Match)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {match ? (
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                🔴 LIVE MATCH
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center mb-8">
              {/* Team 1 */}
              <div className="text-center">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">
                    {match.team1.name}
                  </h2>
                  <div className="text-sm text-gray-600 mb-4">
                    {match.team1.players.map(p => p.name).join(' & ')}
                  </div>
                  <div className="text-6xl font-bold text-blue-600 mb-4">
                    {match.score.team1}
                  </div>
                  <button
                    onClick={() => handleAddPoint('team1')}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 flex items-center justify-center gap-2 text-lg font-semibold"
                  >
                    <Plus className="w-6 h-6" />
                    Add Point
                  </button>
                </div>
              </div>

              {/* VS Divider */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400">VS</div>
              </div>

              {/* Team 2 */}
              <div className="text-center">
                <div className="bg-red-50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-red-900 mb-2">
                    {match.team2.name}
                  </h2>
                  <div className="text-sm text-gray-600 mb-4">
                    {match.team2.players.map(p => p.name).join(' & ')}
                  </div>
                  <div className="text-6xl font-bold text-red-600 mb-4">
                    {match.score.team2}
                  </div>
                  <button
                    onClick={() => handleAddPoint('team2')}
                    className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition transform hover:scale-105 flex items-center justify-center gap-2 text-lg font-semibold"
                  >
                    <Plus className="w-6 h-6" />
                    Add Point
                  </button>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleUndoScore}
                disabled={!canUndo}
                className={`py-3 rounded-lg transition flex items-center justify-center gap-2 text-lg font-semibold ${
                  canUndo 
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600 transform hover:scale-105' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={canUndo ? 'Undo last point' : 'No actions to undo'}
              >
                <RotateCcw className="w-5 h-5" />
                Undo Last Point
              </button>
              <button
                onClick={handleFinishMatch}
                className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <CheckCircle className="w-5 h-5" />
                Finish Match
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
            <Trophy className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              No Active Match
            </h2>
            <p className="text-gray-500">
              Waiting for a match to be assigned to this court
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
