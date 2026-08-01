# PA Play Caller 🏈

A responsive, high-performance web application designed for middle-school and high-school American football Public Address (PA) announcers.

Built strictly according to [football-pa-announcer-app-spec.md](./football-pa-announcer-app-spec.md).

## Key Features

- **Single-Screen Live Dashboard**: Tablet landscape hero view with persistent game state header, press-box view interactive football field, quick play type selectors, and live announcement preview.
- **Jersey-Number Centric**: Ascending numeric grids for fast touch selection of ball carriers, receivers, passers, and defensive tacklers (with primary vs assist tackler tap toggles).
- **Automated Football State Engine**: Calculates gain/loss, down, distance, line-to-gain, first downs, turnovers on downs, and interception possession flips.
- **Natural Language Announcements**: Real-time natural sounding text generation with Text-to-Speech (TTS) audio playback, inline editing, and one-tap copying.
- **Team & Roster Management**: Team colors, default QB setting, manual player editor, and CSV roster importer with duplicate jersey number detection.
- **Instant Undo & State Recovery**: Full backward-state restoration and browser `localStorage` autosave.

## Local Development & Testing

### 1. Development Server
```bash
npm run dev
```

### 2. Run Unit Tests (Vitest)
```bash
npm test
```

### 3. Production Build for GitHub Pages
```bash
npm run build
```

### 4. Test via PowerShell Local Server
```powershell
.\Serve.ps1
```
Open `http://localhost:8000/` in your browser.