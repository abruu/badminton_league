import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamManager } from '../components/TeamManager';
import { MatchScheduler } from '../components/MatchScheduler';
import { CourtAssignment } from '../components/CourtAssignment';
import { RefereeManager } from '../components/RefereeManager';
import { Statistics } from '../components/Statistics';
import { MatchApprovalPanel } from '../components/MatchApprovalPanel';
import { LayoutDashboard, Users, Calendar, MapPin, UserCheck, BarChart3, RotateCcw, LogOut, Loader2, CheckSquare } from 'lucide-react';
import { useTournamentStore } from '../store/tournamentStore';

type Tab = 'teams' | 'matches' | 'courts' | 'referees' | 'stats' | 'approvals';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('teams');
  const [loading, setLoading] = useState(false);
  const { resetTournament, matches } = useTournamentStore();
  const navigate = useNavigate();

  // Count pending approvals
  const pendingApprovalsCount = matches.filter(m => m.pendingApproval).length;

  const tabs = [
    { id: 'teams' as Tab, label: 'Team Management', icon: Users },
    { id: 'matches' as Tab, label: 'Match Scheduler', icon: Calendar },
    { id: 'referees' as Tab, label: 'Referee Management', icon: UserCheck },
    { id: 'courts' as Tab, label: 'Court Assignment', icon: MapPin },
    { id: 'approvals' as Tab, label: 'Match Approvals', icon: CheckSquare, badge: pendingApprovalsCount },
    { id: 'stats' as Tab, label: 'Statistics', icon: BarChart3 }
  ];

  const handleReset = async () => {
    // Ask for password first
    const password = prompt('Enter reset password to proceed:');
    
    if (!password) {
      return; // User cancelled
    }

    // Validate password
    const resetPassword = import.meta.env.VITE_RESET_PASSWORD || 'admin123';
    if (password !== resetPassword) {
      alert('Incorrect password! Reset cancelled.');
      return;
    }

    // Confirm reset action
    if (confirm('Are you sure you want to reset the tournament? This will delete all matches, courts, referees, and zones, but teams will be preserved with reset statistics.')) {
      setLoading(true);
      try {
        await resetTournament();
        alert('Tournament has been reset successfully! Teams have been preserved.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your badminton tournament</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                {loading ? 'Resetting...' : 'Reset Tournament'}
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'teams' && <TeamManager />}
        {activeTab === 'matches' && <MatchScheduler />}
        {activeTab === 'courts' && <CourtAssignment />}
        {activeTab === 'referees' && <RefereeManager />}
        {activeTab === 'approvals' && <MatchApprovalPanel />}
        {activeTab === 'stats' && <Statistics />}
      </div>
    </div>
  );
};
