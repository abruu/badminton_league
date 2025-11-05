import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, LogOut, Trophy, Clock, MapPin, Loader2 } from 'lucide-react';
import { useTournamentStore } from '../store/tournamentStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Match, Court } from '../types';

export const RefereePanel: React.FC = () => {
  const navigate = useNavigate();
  const { courts, matches, updateMatchScore, startMatch, finishMatch, undoLastScore, endSet, isLoading, isInitialized } = useTournamentStore();
  const [refereeName, setRefereeName] = useState('');
  const [courtId, setCourtId] = useState('');
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [assignedCourt, setAssignedCourt] = useState<Court | null>(null);
  const [assignedMatches, setAssignedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEndSetModal, setShowEndSetModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<'team1' | 'team2' | null>(null);

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

      // Find ALL matches assigned to this court (upcoming or live)
      const courtMatches = matches.filter(
        m => m.courtId === courtId && (m.status === 'upcoming' || m.status === 'live')
      );
      setAssignedMatches(courtMatches);

      // Find current LIVE match on this court
      const liveMatch = matches.find(m => m.courtId === courtId && m.status === 'live');
      setCurrentMatch(liveMatch || null);
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
      setLoading(true);
      try {
        await updateMatchScore(currentMatch.id, team, 1);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUndoScore = async () => {
    if (currentMatch && currentMatch.status === 'live') {
      if (window.confirm('Undo the last score update?')) {
        setLoading(true);
        try {
          await undoLastScore(currentMatch.id);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleStartMatch = async (matchId?: string) => {
    const targetMatchId = matchId || currentMatch?.id;
    if (!targetMatchId) return;

    const matchToStart = matches.find(m => m.id === targetMatchId);
    if (matchToStart && matchToStart.status === 'upcoming') {
      if (confirm(`Start match: ${matchToStart.team1.name} vs ${matchToStart.team2.name}?`)) {
        setLoading(true);
        try {
          await startMatch(targetMatchId);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleFinishMatch = async () => {
    if (currentMatch && currentMatch.status === 'live') {
      if (confirm('Finish this match? This will mark the match as completed.')) {
        setLoading(true);
        try {
          await finishMatch(currentMatch.id);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleEndSet = () => {
    if (!currentMatch) return;
    
    // Check if current set is already locked
    const currentSet = currentMatch.sets?.find(s => s.setNumber === currentMatch.currentSetNumber);
    if (currentSet?.locked) {
      alert('This set has already been ended.');
      return;
    }
    
    // Show modal to select winner
    setShowEndSetModal(true);
    setSelectedWinner(null);
  };

  const confirmEndSet = async () => {
    if (!currentMatch || !selectedWinner) {
      alert('Please select a winner');
      return;
    }

    setLoading(true);
    try {
      await endSet(currentMatch.id, selectedWinner);
      setShowEndSetModal(false);
      setSelectedWinner(null);
    } catch (error) {
      console.error('Error ending set:', error);
      alert('Failed to end set');
    } finally {
      setLoading(false);
    }
  };

  // Show loader during initial data fetch
  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading Referee Panel..." />
      </div>
    );
  }

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

        {/* Show LIVE match if one exists, otherwise show list of assigned matches */}
        {currentMatch ? (
          // LIVE MATCH VIEW
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

            {/* Set Score Header (Best of 3) */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-6">
              <div className="text-center mb-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Best of 3 Sets</h3>
                <div className="text-xs text-gray-500">First to 2 sets wins • Set to 15 points (17 max)</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">{currentMatch.team1.name}</div>
                  <div className="text-3xl font-bold text-blue-600">{currentMatch.score?.team1 || 0}</div>
                  <div className="text-xs text-gray-500">Sets Won</div>
                </div>
                <div className="flex items-center justify-center text-2xl font-bold text-gray-400">VS</div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">{currentMatch.team2.name}</div>
                  <div className="text-3xl font-bold text-green-600">{currentMatch.score?.team2 || 0}</div>
                  <div className="text-xs text-gray-500">Sets Won</div>
                </div>
              </div>
              {/* Set History */}
              {currentMatch.sets && currentMatch.sets.filter(s => s.winner).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Completed Sets:</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {currentMatch.sets.filter(s => s.winner).map((set) => (
                      <span key={set.setNumber} className={`px-2 py-1 rounded text-xs font-mono ${
                        set.winner === 'team1' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        Set {set.setNumber}: {set.score.team1}-{set.score.team2} {set.winner === 'team1' ? '(Team 1)' : '(Team 2)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Set Score with Court Positions */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
              <h3 className="text-center text-sm font-semibold text-gray-600 uppercase mb-4">
                Current Set {currentMatch.currentSetNumber || 1}
              </h3>
              
              {/* Court Layout */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-8">
                  {/* Determine which team is on left/right */}
                  {['left', 'right'].map((position) => {
                    const isTeam1 = (currentMatch.team1Position || 'left') === position;
                    const team = isTeam1 ? currentMatch.team1 : currentMatch.team2;
                    const teamKey: 'team1' | 'team2' = isTeam1 ? 'team1' : 'team2';
                    
                    // Get current set score
                    const currentSet = currentMatch.sets?.find(s => s.setNumber === currentMatch.currentSetNumber);
                    const score = currentSet?.score[teamKey] || 0;
                    
                    const isServing = (currentMatch.servingTeam || 'team1') === teamKey;
                    const bgColor = isTeam1 ? 'from-blue-50 to-blue-100' : 'from-green-50 to-green-100';
                    const textColor = isTeam1 ? 'text-blue-600' : 'text-green-600';
                    const buttonColor = isTeam1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';

                    return (
                      <div key={position} className={`bg-gradient-to-br ${bgColor} rounded-lg p-6 relative`}>
                        {/* Position Label */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-3 py-1 rounded-full uppercase font-semibold">
                          {position}
                        </div>
                        
                        {/* Serving Indicator */}
                        {isServing && (
                          <div className="absolute -top-2 right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                            🏸 SERVING
                          </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-2">
                          {team.name}
                        </h3>
                        <div className={`text-6xl font-bold ${textColor} mb-4`}>
                          {score}
                        </div>
                        <div className="space-y-2 mb-4">
                          {team.players.map(player => (
                            <div key={player.id} className="text-sm text-gray-600 flex items-center">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                              {player.name}
                            </div>
                          ))}
                        </div>
                        {currentMatch.status === 'live' && (
                          <button
                            onClick={() => handleScoreUpdate(teamKey)}
                            disabled={loading || currentMatch.sets?.find(s => s.setNumber === currentMatch.currentSetNumber)?.locked}
                            className={`w-full ${buttonColor} text-white py-3 rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                          >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            +1 Point
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Net Divider */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300"></div>
              </div>
            </div>

            {/* Match Controls */}
            {currentMatch.status === 'live' && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleUndoScore}
                    disabled={loading}
                    className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Undo Last Point
                  </button>
                  <button
                    onClick={handleEndSet}
                    disabled={loading || currentMatch.sets?.find(s => s.setNumber === currentMatch.currentSetNumber)?.locked}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    🟠 End Set
                  </button>
                  <button
                    onClick={handleFinishMatch}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Finish Match
                  </button>
                </div>
                
                {/* Set Locked Message */}
                {currentMatch.sets?.find(s => s.setNumber === currentMatch.currentSetNumber)?.locked && (
                  <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 text-center">
                    <p className="text-orange-800 font-semibold">
                      ✅ Set {currentMatch.currentSetNumber} has been ended
                    </p>
                    <p className="text-orange-700 text-sm">
                      Winner: {currentMatch.sets?.find(s => s.setNumber === currentMatch.currentSetNumber)?.winner === 'team1' 
                        ? currentMatch.team1.name 
                        : currentMatch.team2.name}
                    </p>
                  </div>
                )}
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
                  onClick={() => handleStartMatch()}
                  disabled={loading}
                  className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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
          // MATCH SELECTION VIEW - Show all assigned matches
          assignedCourt && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Trophy className="w-7 h-7 text-yellow-600" />
                  Assigned Matches
                </h2>
                <div className="text-sm text-gray-500">
                  {assignedMatches.length} match{assignedMatches.length !== 1 ? 'es' : ''} in queue
                </div>
              </div>

              {assignedMatches.length > 0 ? (
                <div className="space-y-4">
                  {assignedMatches.map((match, index) => (
                    <div
                      key={match.id}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Match {index + 1}</div>
                            <div className="text-sm text-gray-600">
                              {match.status === 'upcoming' ? 'Ready to Start' : 'In Progress'}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          match.status === 'live' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {match.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center mb-4">
                        {/* Team 1 */}
                        <div className="text-center">
                          <div className="font-semibold text-lg text-gray-800 mb-1">
                            {match.team1.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {match.team1.players.map(p => p.name).join(', ')}
                          </div>
                        </div>

                        {/* VS */}
                        <div className="text-center text-2xl font-bold text-gray-400">
                          VS
                        </div>

                        {/* Team 2 */}
                        <div className="text-center">
                          <div className="font-semibold text-lg text-gray-800 mb-1">
                            {match.team2.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {match.team2.players.map(p => p.name).join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Start Match Button */}
                      {match.status === 'upcoming' && (
                        <button
                          onClick={() => handleStartMatch(match.id)}
                          disabled={loading}
                          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                          Start Match
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Matches Assigned
                  </h3>
                  <p className="text-gray-500">
                    You don't have any matches assigned to your court at the moment.
                  </p>
                </div>
              )}
            </div>
          )
        )}

        {/* Completed Matches Section */}
        {assignedCourt && !currentMatch && (() => {
          const completedMatches = matches.filter(
            m => m.courtId === courtId && m.status === 'completed'
          );
          
          if (completedMatches.length === 0) return null;

          return (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-7 h-7 text-green-600" />
                Completed Matches ({completedMatches.length})
              </h2>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {completedMatches.slice().reverse().map((match) => (
                  <div key={match.id} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    {/* Match Header */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {/* Team 1 */}
                      <div className="text-left">
                        <div className={`font-bold text-lg ${match.winner?.id === match.team1.id ? 'text-green-600' : 'text-gray-700'}`}>
                          {match.team1.name}
                          {match.winner?.id === match.team1.id && ' 🏆'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {match.team1.players.map(p => p.name).join(' & ')}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-800">
                          {match.score.team1} - {match.score.team2}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Sets Won</div>
                      </div>

                      {/* Team 2 */}
                      <div className="text-right">
                        <div className={`font-bold text-lg ${match.winner?.id === match.team2.id ? 'text-green-600' : 'text-gray-700'}`}>
                          {match.team2.name}
                          {match.winner?.id === match.team2.id && ' 🏆'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {match.team2.players.map(p => p.name).join(' & ')}
                        </div>
                      </div>
                    </div>

                    {/* Set-by-Set Breakdown */}
                    <div className="border-t pt-4">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Set Scores:</div>
                      <div className="grid grid-cols-3 gap-3">
                        {match.sets.map((set) => (
                          <div key={set.setNumber} className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-500 font-semibold mb-1">Set {set.setNumber}</div>
                            <div className="text-2xl font-bold text-gray-800">
                              <span className={set.score.team1 > set.score.team2 ? 'text-blue-600' : 'text-gray-600'}>
                                {set.score.team1}
                              </span>
                              <span className="text-gray-400 mx-1">-</span>
                              <span className={set.score.team2 > set.score.team1 ? 'text-green-600' : 'text-gray-600'}>
                                {set.score.team2}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team Stats with Points */}
                    <div className="border-t mt-4 pt-4">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Points & Statistics:</div>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Team 1 Stats */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="font-bold text-blue-900 mb-3 text-center">{match.team1.name}</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Points Earned:</span>
                              <span className="font-bold text-lg text-blue-600">
                                {match.winner?.id === match.team1.id ? '+3' : '+1'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total Points:</span>
                              <span className="font-bold text-gray-800">{match.team1.stats.points}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Matches Won:</span>
                              <span className="font-bold text-green-600">{match.team1.stats.matchesWon}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Matches Lost:</span>
                              <span className="font-bold text-red-600">{match.team1.stats.matchesLost}</span>
                            </div>
                          </div>
                        </div>

                        {/* Team 2 Stats */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="font-bold text-green-900 mb-3 text-center">{match.team2.name}</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Points Earned:</span>
                              <span className="font-bold text-lg text-green-600">
                                {match.winner?.id === match.team2.id ? '+3' : '+1'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total Points:</span>
                              <span className="font-bold text-gray-800">{match.team2.stats.points}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Matches Won:</span>
                              <span className="font-bold text-green-600">{match.team2.stats.matchesWon}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Matches Lost:</span>
                              <span className="font-bold text-red-600">{match.team2.stats.matchesLost}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* End Set Modal */}
      {showEndSetModal && currentMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-orange-500" />
              End Set {currentMatch.currentSetNumber}
            </h2>
            
            <p className="text-gray-600 mb-6">
              Select the winner of this set. The set will be locked and the next set will begin.
            </p>

            {/* Current Score Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2 text-center">Current Score</p>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{currentMatch.team1.name}</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {currentMatch.sets?.find(s => s.setNumber === currentMatch.currentSetNumber)?.score.team1 || 0}
                  </p>
                </div>
                <div className="flex items-center text-2xl font-bold text-gray-400">-</div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{currentMatch.team2.name}</p>
                  <p className="text-3xl font-bold text-green-600">
                    {currentMatch.sets?.find(s => s.setNumber === currentMatch.currentSetNumber)?.score.team2 || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Winner Selection */}
            <div className="space-y-3 mb-6">
              <p className="font-semibold text-gray-700 mb-3">Select Winner:</p>
              
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                style={{ borderColor: selectedWinner === 'team1' ? '#2563eb' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="winner"
                  value="team1"
                  checked={selectedWinner === 'team1'}
                  onChange={() => setSelectedWinner('team1')}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{currentMatch.team1.name}</p>
                  <p className="text-sm text-gray-500">{currentMatch.team1.players.map(p => p.name).join(', ')}</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition"
                style={{ borderColor: selectedWinner === 'team2' ? '#16a34a' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="winner"
                  value="team2"
                  checked={selectedWinner === 'team2'}
                  onChange={() => setSelectedWinner('team2')}
                  className="w-5 h-5 text-green-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{currentMatch.team2.name}</p>
                  <p className="text-sm text-gray-500">{currentMatch.team2.players.map(p => p.name).join(', ')}</p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEndSetModal(false);
                  setSelectedWinner(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSet}
                disabled={!selectedWinner || loading}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Confirm End Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
