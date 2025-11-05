import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, LogOut, Trophy, Clock, MapPin } from 'lucide-react';
import { useTournamentStore } from '../store/tournamentStore';
import type { Match, Court } from '../types';

export const RefereePanel: React.FC = () => {
  const navigate = useNavigate();
  const { courts, matches, updateMatchScore, startMatch, finishMatch, undoLastScore } = useTournamentStore();
  const [refereeName, setRefereeName] = useState('');
  const [courtId, setCourtId] = useState('');
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [assignedCourt, setAssignedCourt] = useState<Court | null>(null);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('refereeAuthenticated');
    const storedName = sessionStorage.getItem('refereeName');
    const storedCourtId = sessionStorage.getItem('refereeCourtId');

    if (!isAuthenticated || isAuthenticated !== 'true') {
      navigate('/referee/login');
      return;
    }

    if (storedName) setRefereeName(storedName);
    if (storedCourtId) setCourtId(storedCourtId);
  }, [navigate]);

  useEffect(() => {
    if (courtId) {
      // Find assigned court
      const court = courts.find(c => c.id === courtId);
      setAssignedCourt(court || null);

      // Find current match on this court
      if (court?.match) {
        const match = matches.find(m => m.id === court.match?.id);
        setCurrentMatch(match || null);
      } else {
        setCurrentMatch(null);
      }
    }
  }, [courtId, courts, matches]);

  const handleLogout = () => {
    sessionStorage.removeItem('refereeAuthenticated');
    sessionStorage.removeItem('refereeId');
    sessionStorage.removeItem('refereeName');
    sessionStorage.removeItem('refereeCourtId');
    navigate('/referee/login');
  };

  const handleScoreUpdate = async (team: 'team1' | 'team2') => {
    if (currentMatch && currentMatch.status === 'live') {
      await updateMatchScore(currentMatch.id, team, 1);
    }
  };

  const handleUndoScore = async () => {
    if (currentMatch && currentMatch.status === 'live') {
      if (window.confirm('Undo the last score update?')) {
        await undoLastScore(currentMatch.id);
      }
    }
  };

  const handleStartMatch = async () => {
    if (currentMatch && currentMatch.status === 'upcoming') {
      if (confirm('Start this match? You will be able to update scores after starting.')) {
        await startMatch(currentMatch.id);
      }
    }
  };

  const handleFinishMatch = async () => {
    if (currentMatch && currentMatch.status === 'live') {
      if (confirm('Finish this match? This will mark the match as completed.')) {
        await finishMatch(currentMatch.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <UserCheck className="w-7 h-7 text-green-600" />
                Referee Panel
              </h1>
              <p className="text-gray-600 mt-1">Welcome, {refereeName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Court Assignment Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Your Assignment
          </h2>
          {assignedCourt ? (
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-lg">
                {assignedCourt.name}
              </div>
              <div className="text-gray-600">
                {currentMatch ? 'Match in progress' : 'No active match'}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">
              You are not assigned to any court yet. Please contact the admin.
            </div>
          )}
        </div>

        {/* Current Match */}
        {currentMatch ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-600" />
                Current Match
              </h2>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  currentMatch.status === 'live' 
                    ? 'bg-green-100 text-green-800' 
                    : currentMatch.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentMatch.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Score Board */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Team 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {currentMatch.team1.name}
                </h3>
                <div className="text-5xl font-bold text-blue-600 mb-4">
                  {currentMatch.score.team1}
                </div>
                <div className="space-y-2">
                  {currentMatch.team1.players.map(player => (
                    <div key={player.id} className="text-sm text-gray-600">
                      • {player.name}
                    </div>
                  ))}
                </div>
                {currentMatch.status === 'live' && (
                  <button
                    onClick={() => handleScoreUpdate('team1')}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    +1 Point
                  </button>
                )}
              </div>

              {/* Team 2 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {currentMatch.team2.name}
                </h3>
                <div className="text-5xl font-bold text-purple-600 mb-4">
                  {currentMatch.score.team2}
                </div>
                <div className="space-y-2">
                  {currentMatch.team2.players.map(player => (
                    <div key={player.id} className="text-sm text-gray-600">
                      • {player.name}
                    </div>
                  ))}
                </div>
                {currentMatch.status === 'live' && (
                  <button
                    onClick={() => handleScoreUpdate('team2')}
                    className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    +1 Point
                  </button>
                )}
              </div>
            </div>

            {/* Match Controls */}
            {currentMatch.status === 'live' && (
              <div className="flex gap-3">
                <button
                  onClick={handleUndoScore}
                  className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition font-semibold"
                >
                  Undo Last Point
                </button>
                <button
                  onClick={handleFinishMatch}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Finish Match
                </button>
              </div>
            )}

            {currentMatch.status === 'upcoming' && (
              <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">🏸</div>
                <p className="text-blue-900 font-semibold text-lg mb-2">
                  Match Ready to Start
                </p>
                <p className="text-blue-800 mb-4">
                  Click the button below to begin this match. You'll be able to update scores after starting.
                </p>
                <button
                  onClick={handleStartMatch}
                  className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold text-lg"
                >
                  🎾 Start Match
                </button>
              </div>
            )}

            {currentMatch.status === 'completed' && currentMatch.winner && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-semibold text-lg">
                  🏆 Winner: {currentMatch.winner.name}
                </p>
              </div>
            )}
          </div>
        ) : (
          assignedCourt && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Active Match
              </h3>
              <p className="text-gray-500">
                You don't have any match assigned to your court at the moment.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
