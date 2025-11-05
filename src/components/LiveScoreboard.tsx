import React, { useState, useEffect } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { Trophy, Share2, Filter } from 'lucide-react';

export const LiveScoreboard: React.FC = () => {
  const { courts, matches, refreshData } = useTournamentStore();
  const [selectedZone, setSelectedZone] = useState('all');

  const zones = [
    { id: 'all', name: 'All Zones' },
    { id: 'zone-a', name: 'Zone A' },
    { id: 'zone-b', name: 'Zone B' },
    { id: 'zone-c', name: 'Zone C' },
    { id: 'zone-d', name: 'Zone D' }
  ];

  useEffect(() => {
    // Auto-refresh from LocalStorage every 1 second
    const interval = setInterval(() => {
      refreshData();
    }, 1000);

    // Listen for storage events from other tabs/windows
    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-update', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-update', handleStorageChange);
    };
  }, [refreshData]);

  const filteredCourts = selectedZone === 'all'
    ? courts
    : courts.filter(c => c.match && (
        c.match.team1.zone === selectedZone || c.match.team2.zone === selectedZone
      ));

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Badminton Tournament Live Scores',
          text: 'Check out the live scores from the tournament!',
          url: url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const getMatchStatus = (match: any) => {
    if (match.status === 'completed') return 'Completed';
    if (match.status === 'live') return '🔴 Live';
    return 'Upcoming';
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-blue-100 text-blue-800';
    if (status === 'live') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                🏸 Live Tournament Scoreboard
              </h1>
              <p className="text-gray-600 mt-1">Real-time updates from all courts</p>
            </div>
            <button
              onClick={handleShare}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Scores
            </button>
          </div>

          {/* Zone Filter */}
          <div className="mt-4 flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map(court => (
            <div
              key={court.id}
              className={`bg-white rounded-xl shadow-lg p-6 ${
                court.match?.status === 'live' ? 'ring-4 ring-green-400' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{court.name}</h2>
                {court.match && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(court.match.status)}`}>
                    {getMatchStatus(court.match)}
                  </span>
                )}
              </div>

              {court.match ? (
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">
                      {zones.find(z => z.id === court.match!.team1.zone)?.name}
                    </div>
                    
                    {/* Team 1 */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg text-blue-900">
                            {court.match.team1.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {court.match.team1.players.map(p => p.name).join(' & ')}
                          </p>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {court.match.score.team1}
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-gray-400 font-bold mb-3">VS</div>

                    {/* Team 2 */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg text-red-900">
                            {court.match.team2.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {court.match.team2.players.map(p => p.name).join(' & ')}
                          </p>
                        </div>
                        <div className="text-3xl font-bold text-red-600">
                          {court.match.score.team2}
                        </div>
                      </div>
                    </div>
                  </div>

                  {court.match.winner && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg text-center">
                      <span className="text-sm font-semibold text-yellow-800">
                        🏆 Winner: {court.match.winner.name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No match assigned</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Referee: <span className="font-medium">{court.refereeName}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tournament Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                {matches.length}
              </div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {matches.filter(m => m.status === 'live').length}
              </div>
              <div className="text-sm text-gray-600">Live Now</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {matches.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {matches.filter(m => m.status === 'upcoming').length}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
