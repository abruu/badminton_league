import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamManager } from '../components/TeamManager';
import { MatchScheduler } from '../components/MatchScheduler';
import { CourtAssignment } from '../components/CourtAssignment';
import { RefereeManager } from '../components/RefereeManager';
import { Statistics } from '../components/Statistics';
import { LayoutDashboard, Users, Calendar, MapPin, UserCheck, BarChart3, RotateCcw, LogOut } from 'lucide-react';
import { useTournamentStore } from '../store/tournamentStore';

type Tab = 'teams' | 'matches' | 'courts' | 'referees' | 'stats';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('teams');
  const { resetTournament } = useTournamentStore();
  const navigate = useNavigate();

  const tabs = [
    { id: 'teams' as Tab, label: 'Team Management', icon: Users },
    { id: 'matches' as Tab, label: 'Match Scheduler', icon: Calendar },
    { id: 'referees' as Tab, label: 'Referee Management', icon: UserCheck },
    { id: 'courts' as Tab, label: 'Court Assignment', icon: MapPin },
    { id: 'stats' as Tab, label: 'Statistics', icon: BarChart3 }
  ];

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the entire tournament? This will delete all data!')) {
      resetTournament();
      alert('Tournament has been reset successfully!');
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
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Tournament
              </button>
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
                  className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
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
        {activeTab === 'stats' && <Statistics />}
      </div>
    </div>
  );
};
