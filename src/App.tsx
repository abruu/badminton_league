import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { RefereeView } from './pages/RefereeView';
import { LiveView } from './pages/LiveView';
import { useTournamentStore } from './store/tournamentStore';
import { LayoutDashboard, UserCheck, Trophy } from 'lucide-react';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🏸 Badminton Tournament Scoring App
          </h1>
          <p className="text-xl text-blue-100">
            Professional tournament management system for badminton competitions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Dashboard Card */}
          <Link
            to="/dashboard"
            className="bg-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105"
          >
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
              <p className="text-gray-600">
                Manage teams, matches, courts, and view statistics
              </p>
            </div>
          </Link>

          {/* Referee Panel Card */}
          <Link
            to="/referee"
            className="bg-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105"
          >
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Referee Panel</h2>
              <p className="text-gray-600">
                Control scoring for your assigned court in real-time
              </p>
            </div>
          </Link>

          {/* Live Scoreboard Card */}
          <Link
            to="/live"
            className="bg-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:scale-105"
          >
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Live Scoreboard</h2>
              <p className="text-gray-600">
                Watch live scores from all courts in real-time
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3">Features:</h3>
          <ul className="space-y-2 text-blue-100">
            <li>✅ Manage teams and players across 4 zones</li>
            <li>✅ Real-time scoring on 3 simultaneous courts</li>
            <li>✅ Automatic match scheduling and statistics</li>
            <li>✅ Live scoreboard with zone filtering</li>
            <li>✅ Complete tournament analytics and leaderboards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function App() {
  const initializeData = useTournamentStore(state => state.initializeData);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/referee" element={<RefereeView />} />
        <Route path="/live" element={<LiveView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
