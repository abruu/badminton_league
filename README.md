# 🏸 Badminton Tournament Scoring App

A comprehensive web application for managing badminton tournaments with real-time scoring, multiple courts, and advanced statistics tracking.

## 🚀 Features

### Admin Dashboard
- **Team Management**: Create and manage teams with doubles pairs across 4 zones
- **Match Scheduler**: Auto-generate round-robin fixtures
- **Court Assignment**: Assign matches and referees to 3 simultaneous courts
- **Statistics**: View comprehensive tournament analytics and leaderboards

### Referee Panel
- **Live Scoring**: Real-time score updates for assigned court
- **Score Control**: Add points, undo last action, finish match
- **Simple Interface**: Easy-to-use controls designed for quick scoring

### Live Scoreboard
- **Real-time Updates**: Auto-refreshing scores from all courts
- **Zone Filtering**: Filter matches by zone
- **Share Functionality**: Share live scores via link or PWA share API
- **Match Status**: View upcoming, live, and completed matches

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage

## 📦 Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

## 🎯 Usage Guide

### Getting Started

1. **Access the Home Page**: Choose your role (Admin, Referee, or Viewer)

2. **Admin Setup**:
   - Navigate to "Team Management"
   - Add teams with player names and assign to zones (A, B, C, D)
   - Go to "Match Scheduler" and generate round-robin matches
   - Assign referees and matches to courts in "Court Assignment"

3. **Referee Operation**:
   - Select your assigned court
   - Use +1 buttons to add points to teams
   - Use "Undo" to correct mistakes
   - Click "Finish Match" when complete

4. **Live Viewing**:
   - View all courts simultaneously
   - Filter by zone
   - Share the live scoreboard URL

### Data Model

```typescript
Team {
  id: string
  name: string
  players: Player[]
  zone: 'zone-a' | 'zone-b' | 'zone-c' | 'zone-d'
  stats: { matchesWon, matchesLost, points }
}

Match {
  id: string
  team1: Team
  team2: Team
  score: { team1: number, team2: number }
  status: 'upcoming' | 'live' | 'completed'
  winner?: Team
}

Court {
  id: string
  name: string
  refereeId: string
  refereeName: string
  match?: Match
}
```

## 📊 Scoring System

- **Win**: 3 points
- **Participation**: 1 point
- Ranking based on total points, then wins

## 🔄 Data Persistence

All data is stored in browser LocalStorage:
- Survives page refreshes
- Persists across sessions
- Can be reset via Admin Dashboard

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📱 PWA Features

The app supports:
- Offline functionality
- Share API for mobile devices
- Responsive design for all screen sizes

## 🔧 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 📝 Project Structure

```
src/
├── components/          # React components
│   ├── TeamManager.tsx
│   ├── MatchScheduler.tsx
│   ├── CourtAssignment.tsx
│   ├── RefereePanel.tsx
│   ├── LiveScoreboard.tsx
│   └── Statistics.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── RefereeView.tsx
│   └── LiveView.tsx
├── store/              # Zustand state management
│   └── tournamentStore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── storage.ts
│   └── calculations.ts
├── App.tsx             # Main app component with routing
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## 🎨 Customization

### Zones
Edit the zones in `tournamentStore.ts` to add/remove zones

### Courts
Modify the default courts in `initializeData()` method

### Scoring Rules
Update point calculations in `utils/calculations.ts`

## 🐛 Troubleshooting

### Data not persisting
- Check browser LocalStorage is enabled
- Try clearing cache and reload

### Scores not updating
- The page auto-refreshes every 2 seconds
- Manually refresh if needed

### Reset everything
- Use "Reset Tournament" button in Admin Dashboard
- Or clear browser LocalStorage manually

## 📄 License

MIT License - feel free to use for your tournaments!

## 👨‍💻 Development

To contribute or modify:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🙏 Acknowledgments

Built with modern web technologies for seamless tournament management.

---

**Enjoy your tournament! 🏸🏆**
