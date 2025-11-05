import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { RefereeView } from './pages/RefereeView';
import { RefereeLogin } from './pages/RefereeLogin';
import { RefereePanel } from './pages/RefereePanel';
import { LiveView } from './pages/LiveView';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { RefereeProtectedRoute } from './components/RefereeProtectedRoute';
import { useTournamentStore } from './store/tournamentStore';
import { LayoutDashboard, UserCheck, Trophy, Zap, Shield, BarChart2, Clock } from 'lucide-react';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12">
        <div className="max-w-7xl w-full">
          {/* Header Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block mb-6">
              <div className="bg-white/20 backdrop-blur-lg rounded-full px-6 py-2 text-white font-semibold text-sm mb-6 border border-white/30">
                🏆 Professional Tournament Management
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              Badminton Tournament
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Scoring System
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light">
              Real-time match management, live scoring, and comprehensive analytics 
              for professional badminton tournaments
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Admin Dashboard Card */}
            <Link
              to="/dashboard"
              className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20"
            >
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto shadow-lg">
                    <LayoutDashboard className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  Admin Dashboard
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Complete control center for teams, matches, courts, and tournament analytics
                </p>
                <div className="mt-6 flex items-center justify-center text-blue-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>Manage Tournament</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Referee Panel Card */}
            <Link
              to="/referee/login"
              className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20"
            >
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto shadow-lg">
                    <UserCheck className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  Referee Panel
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Secure login for referees to manage and update match scores in real-time
                </p>
                <div className="mt-6 flex items-center justify-center text-green-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>Start Scoring</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Live Scoreboard Card */}
            <Link
              to="/live"
              className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20"
            >
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto shadow-lg">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  Live Scoreboard
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Watch live match updates from all courts with real-time score tracking
                </p>
                <div className="mt-6 flex items-center justify-center text-purple-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                  <span>View Scores</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              Powerful Features for Modern Tournaments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4 inline-block group-hover:bg-white/30 transition-colors">
                  <Zap className="w-8 h-8 text-yellow-300" />
                </div>
                <h4 className="text-white font-semibold text-lg mb-2">Real-time Updates</h4>
                <p className="text-white/80 text-sm">Instant score synchronization across all devices</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4 inline-block group-hover:bg-white/30 transition-colors">
                  <Shield className="w-8 h-8 text-green-300" />
                </div>
                <h4 className="text-white font-semibold text-lg mb-2">Secure Access</h4>
                <p className="text-white/80 text-sm">Role-based authentication for admins and referees</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4 inline-block group-hover:bg-white/30 transition-colors">
                  <BarChart2 className="w-8 h-8 text-blue-300" />
                </div>
                <h4 className="text-white font-semibold text-lg mb-2">Advanced Analytics</h4>
                <p className="text-white/80 text-sm">Comprehensive statistics and performance insights</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4 inline-block group-hover:bg-white/30 transition-colors">
                  <Clock className="w-8 h-8 text-purple-300" />
                </div>
                <h4 className="text-white font-semibold text-lg mb-2">Multi-Court Support</h4>
                <p className="text-white/80 text-sm">Manage multiple courts and zones simultaneously</p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">4</div>
                  <div className="text-white/80 text-sm">Tournament Zones</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">3</div>
                  <div className="text-white/80 text-sm">Simultaneous Courts</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">∞</div>
                  <div className="text-white/80 text-sm">Teams Supported</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-white/80 text-sm">Live Tracking</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-white/70 text-sm">
              Built with React, TypeScript, and Supabase • Real-time Data Synchronization
            </p>
          </div>
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
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/referee" element={<RefereeView />} />
        <Route path="/referee/login" element={<RefereeLogin />} />
        <Route 
          path="/referee/panel" 
          element={
            <RefereeProtectedRoute>
              <RefereePanel />
            </RefereeProtectedRoute>
          } 
        />
        <Route path="/live" element={<LiveView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
