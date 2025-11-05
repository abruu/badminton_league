import React, { useState } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { Team, Player } from '../types';
import { Plus, Trash2, Edit2, Users } from 'lucide-react';

export const TeamManager: React.FC = () => {
  const { teams, addTeam, updateTeam, deleteTeam } = useTournamentStore();
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    zone: 'zone-a',
    player1Name: '',
    player2Name: ''
  });

  const zones = [
    { id: 'zone-a', name: 'Zone A' },
    { id: 'zone-b', name: 'Zone B' },
    { id: 'zone-c', name: 'Zone C' },
    { id: 'zone-d', name: 'Zone D' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const player1: Player = {
      id: `player-${Date.now()}-1`,
      name: formData.player1Name
    };
    
    const player2: Player = {
      id: `player-${Date.now()}-2`,
      name: formData.player2Name
    };

    if (editingTeamId) {
      const team = teams.find(t => t.id === editingTeamId);
      if (team) {
        if (window.confirm(`Are you sure you want to update team "${team.name}"?`)) {
          updateTeam(editingTeamId, {
            name: formData.name,
            zone: formData.zone,
            players: [player1, player2]
          });
          setEditingTeamId(null);
        } else {
          return;
        }
      }
    } else {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: formData.name,
        players: [player1, player2],
        zone: formData.zone,
        stats: {
          matchesWon: 0,
          matchesLost: 0,
          points: 0
        }
      };
      addTeam(newTeam);
    }

    setFormData({ name: '', zone: 'zone-a', player1Name: '', player2Name: '' });
    setIsAddingTeam(false);
  };

  const handleEdit = (team: Team) => {
    setFormData({
      name: team.name,
      zone: team.zone,
      player1Name: team.players[0]?.name || '',
      player2Name: team.players[1]?.name || ''
    });
    setEditingTeamId(team.id);
    setIsAddingTeam(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', zone: 'zone-a', player1Name: '', player2Name: '' });
    setIsAddingTeam(false);
    setEditingTeamId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Team Management
        </h2>
        {!isAddingTeam && (
          <button
            onClick={() => setIsAddingTeam(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Add Team
          </button>
        )}
      </div>

      {isAddingTeam && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingTeamId ? 'Edit Team' : 'Add New Team'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone
              </label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player 1 Name
              </label>
              <input
                type="text"
                required
                value={formData.player1Name}
                onChange={(e) => setFormData({ ...formData, player1Name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter player 1 name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player 2 Name
              </label>
              <input
                type="text"
                required
                value={formData.player2Name}
                onChange={(e) => setFormData({ ...formData, player2Name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter player 2 name"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              {editingTeamId ? 'Update Team' : 'Add Team'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{team.name}</h3>
                <span className="text-sm text-gray-500">{zones.find(z => z.id === team.zone)?.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(team)}
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete team "${team.name}"?`)) {
                      deleteTeam(team.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">👤 {team.players[0]?.name}</p>
              <p className="text-sm text-gray-600">👤 {team.players[1]?.name}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Wins: {team.stats.matchesWon}</span>
                <span>Losses: {team.stats.matchesLost}</span>
                <span>Points: {team.stats.points}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && !isAddingTeam && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No teams added yet</p>
          <p className="text-sm">Click "Add Team" to create your first team</p>
        </div>
      )}
    </div>
  );
};
