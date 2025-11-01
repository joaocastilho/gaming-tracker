# Gaming Tracker 🎮

A personal, client-side web application for tracking and rating video games, featuring a visual tier list generator. Perfect for dedicated gamers who want to organize and review their gaming library.

## ✨ Features

- **Game Tracking**: Mark games as "Planned" or "Completed" with detailed metadata
- **Rating System**: Score games on Presentation, Story, and Gameplay (0-10 scale)
- **Tier Lists**: Automatic tier assignment (S-Masterpiece to E-Bad) with visual export
- **Multiple Views**: Gallery cards and sortable table layouts
- **Smart Filtering**: Search by title, filter by platform, genre, and tier
- **Theme Support**: Light and dark mode toggle
- **Static Site**: No backend required - runs entirely in the browser
- **Data Export**: Download updated game data as JSON

## 🛠️ Tech Stack

- **Framework**: SvelteKit (latest) with Svelte 5 Runes + TypeScript 5.9.x
- **Styling**: Tailwind CSS v4.1 + Shadcn-Svelte components
- **Runtime**: Bun 1.3.x
- **Deployment**: Static site (GitHub Pages/Netlify)
- **Data**: Local JSON file (client-side only)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.3.x or later

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gaming-tracker
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Start development server**

   ```bash
   bun run dev
   ```

4. **Open your browser** to `http://localhost:5173`

### Building for Production

```bash
bun run build
```

This creates a static site in the `build/` directory, ready for deployment to any static hosting service.

## 📖 Usage

### Adding Games

1. Click the "+ Add Game" button
2. Fill in basic details (title, platform, year, genre, etc.)
3. Games start as "Planned" status

### Completing Games

1. Edit a planned game
2. Change status to "Completed"
3. Add ratings, hours played, and completion date
4. Select a tier (automatically suggested based on score)

### Viewing Games

- **Gallery View**: Visual card layout with game covers
- **Table View**: Detailed spreadsheet with sorting
- **Tier List**: Grouped by rating tiers with image export

### Data Management

- All data stored locally in `static/games.json`
- Export updated data via the download feature
- Import by replacing the JSON file

## 📁 Project Structure

```
gaming-tracker/
├── src/
│   ├── routes/          # SvelteKit pages
│   ├── lib/
│   │   ├── components/  # UI components
│   │   ├── stores/      # Svelte state management
│   │   └── utils/       # Helper functions
│   └── app.html         # HTML shell
├── static/
│   ├── games.json       # Game data
│   ├── covers/          # Optimized game cover images
│   └── covers_raw/      # Source cover images
└── docs/                # Project documentation
```

## 🔧 Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run check` - Type checking
- `bun run lint` - ESLint
- `bun run format` - Prettier formatting

### Image Optimization

Game covers are optimized automatically during build:

```bash
bun run optimize-covers
```

This converts PNG source images to WebP format for better performance.

## 📄 License

This project is licensed under the MIT License.
