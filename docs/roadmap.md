# Gaming Tracker - Development Roadmap

> **Sequential Implementation Guide**: This document provides a step-by-step roadmap for building the Gaming Tracker project from start to finish.

## 🚀 Project Overview

**Goal**: Build a single-user, client-side web application for tracking and rating video games with visual tier list generation using SvelteKit, TypeScript, and Tailwind CSS.

**Technology Stack**:

- Framework: SvelteKit 1.30+ with Svelte 5 Runes + TypeScript 5.9.x
- Styling: Tailwind CSS v4.1 + Shadcn-Svelte components
- Runtime: Bun 1.3.x (Windows)
- Deployment: Static site generation (@sveltejs/adapter-static)
- Data: Local JSON file (no backend)

**Critical Constraints**:

- ✅ NO BACKEND: Purely client-side, static site generation only
- ✅ NO BROWSER STORAGE in artifacts: Cannot use localStorage/sessionStorage in Claude artifacts
- ✅ STATIC DATA: All data from `static/games.json`, mutations via file download
- ✅ BUILD-TIME IMAGES: Image optimization runs pre-build via sharp script
- ✅ SINGLE USER: No authentication, no multi-user support

**Last Updated**: November 2, 2025 - Development Roadmap

---

## 📋 Roadmap Organization

### Phase Dependencies

```
Phase 1 (Foundation) → Phase 2 (Core UI) → Phase 3 (Data Management) → Phase 4 (Advanced Views) → Phase 5 (Polish)
```

### Key Dependencies

- **Phase 1** must complete before all others (foundation)
- **Games Store** before any UI that displays games
- **Filters Store** before search/filter UI
- **Modal Store** before add/edit forms
- **Theme System** before any styled components
- **Gallery View** before detail modal (needs clickable cards)
- **Table View** before full sorting implementation

---

## Phase 1: Foundation

**Goal**: Set up project structure and core data layer

### 1.1 Project Initialization

- **Task 1.1.1**: Initialize SvelteKit project with TypeScript
  - **Command**: `bun create svelte@latest gaming-tracker`
  - **Select**: Skeleton project, TypeScript, ESLint, Prettier
  - **Reference**: [Project Initialization](#project-initialization) in docs/project.md

- **Task 1.1.2**: Install core dependencies
  - **Packages**: `@sveltejs/adapter-static`, `tailwindcss`, `@tailwindcss/forms`, `shadcn-svelte`, `lucide-svelte`, `zod`, `date-fns`
  - **Command**: `bun add @sveltejs/adapter-static tailwindcss @tailwindcss/forms shadcn-svelte lucide-svelte zod date-fns`
  - **Dev Dependencies**: `@types/node`

- **Task 1.1.3**: Configure svelte.config.js for static adapter
  - **File**: `svelte.config.js`
  - **Content**: Static adapter configuration with fallback
  - **Reference**: [Deployment Configuration](#deployment-configuration) in docs/project.md

- **Task 1.1.4**: Set up Tailwind CSS v4.1
  - **Files**: `tailwind.config.js`, `postcss.config.js`
  - **Configure**: Custom color palette, dark/light mode support
  - **Reference**: [Visual Design Elements](#visual-design-elements--color-scheme) in docs/project.md

- **Task 1.1.5**: Configure ESLint and Prettier
  - **ESLint**: Add `eslint-plugin-svelte` and TypeScript plugins
  - **Prettier**: Add `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`

### 1.2 Data Layer Setup

- **Task 1.2.1**: Create sample games.json data
  - **File**: `static/games.json`
  - **Structure**: Games array with meta object
  - **Content**: Add 5-10 sample games (mix of Planned and Completed)
  - **Reference**: [Storage Format](#storage-format) in docs/project.md

- **Task 1.2.2**: Define TypeScript interfaces
  - **File**: `src/lib/types/game.ts`
  - **Types**: `Game`, `GameStatus`, `TierValue`, `CoOpStatus`
  - **Reference**: [Type Definitions](#type-definitions-typescript) in docs/project.md

- **Task 1.2.3**: Implement Zod schema validation
  - **File**: `src/lib/validation/game.ts`
  - **Schema**: Complete Game validation with all field constraints
  - **Reference**: [Schema Validation](#schema-validation-zod) in docs/project.md

- **Task 1.2.4**: Create games store
  - **File**: `src/lib/stores/games.ts`
  - **Features**: Games array, loading state, error handling
  - **Reference**: [Games Store](#games-store) in docs/project.md

- **Task 1.2.5**: Implement JSON loader in layout
  - **File**: `src/routes/+layout.ts`
  - **Features**: Load games.json, populate games store, error handling

### 1.3 Basic Layout & Theme

- **Task 1.3.1**: Create root layout
  - **File**: `src/routes/+layout.svelte`
  - **Structure**: HTML shell with theme class application
  - **Reference**: [Layout Structure](#layout-structure) in docs/project.md

- **Task 1.3.2**: Implement app store
  - **File**: `src/lib/stores/app.ts`
  - **Features**: Theme, viewMode, activeTab state
  - **Reference**: [App Store](#app-store) in docs/project.md

- **Task 1.3.3**: Create theme toggle component
  - **File**: `src/lib/components/ThemeToggle.svelte`
  - **Features**: Sun/moon icons, localStorage persistence
  - **Reference**: [Theme Toggle](#theme-toggle) in docs/project.md

- **Task 1.3.4**: Set up CSS variables for theming
  - **Files**: `src/app.css`, theme definitions
  - **Colors**: Dark/light mode color schemes
  - **Reference**: [Color Palette](#color-palette) in docs/project.md

- **Task 1.3.5**: Create basic header component
  - **File**: `src/lib/components/Header.svelte`
  - **Features**: Logo, Add Game button, game count, theme toggle
  - **Reference**: [Header Component](#1-header-component) in docs/project.md

---

## Phase 2: Core UI

**Goal**: Implement gallery view and navigation

### 2.1 Navigation System

- **Task 2.1.1**: Create navigation tabs component
  - **File**: `src/lib/components/NavigationTabs.svelte`
  - **Features**: Games, Completed, Planned, Tier List tabs
  - **Reference**: [Navigation Tabs](#2-navigation-tabs) in docs/project.md

- **Task 2.1.2**: Implement routing for main pages
  - **Files**: `src/routes/+page.svelte`, `src/routes/completed/+page.svelte`, etc.
  - **Features**: Basic route structure for each tab
  - **Reference**: [SvelteKit Routes Structure](#sveltekit-routes-structure) in docs/project.md

- **Task 2.1.3**: Add game count badges to tabs
  - **Features**: Dynamic counts for Completed/Planned games
  - **Reference**: [Core Tracking & Status](#core-tracking--status) in docs/project.md

- **Task 2.1.4**: Wire up active tab state
  - **Features**: URL updates, active state highlighting

### 2.2 Gallery View

- **Task 2.2.1**: Create game card component
  - **File**: `src/lib/components/GameCard.svelte`
  - **Features**: Cover image, title, year, platform/genre badges
  - **Reference**: [Game Card](#5-game-card-gallery-view) in docs/project.md

- **Task 2.2.2**: Implement CSS Grid layout
  - **Features**: Auto-fill grid, responsive breakpoints
  - **Reference**: [Dimensions](#dimensions) in docs/project.md

- **Task 2.2.3**: Add platform and genre badges
  - **Features**: Color-coded badges, consistent styling
  - **Reference**: [Platform Badges](#6-platform-badges) and [Genre Badges](#7-genre-badges) in docs/project.md

- **Task 2.2.4**: Display tier badges
  - **Features**: Tier colors (S-A-B-C-D-E), conditional display
  - **Reference**: [Tier Structure](#tier-structure) in docs/project.md

- **Task 2.2.5**: Show rating icons and scores
  - **Features**: Icons (👁️ ✏️ 🎮 🏆) with score values
  - **Reference**: [Metrics Row](#metrics-row) in docs/project.md

- **Task 2.2.6**: Add lazy loading for images
  - **Features**: Loading placeholders, onload handlers
  - **Reference**: [Image Loading Flow](#image-loading-flow) in docs/project.md

### 2.3 Search Functionality

- **Task 2.3.1**: Create search bar component
  - **File**: `src/lib/components/SearchBar.svelte`
  - **Features**: Full-width input, search icon, placeholder
  - **Reference**: [Search Bar](#3-search-bar) in docs/project.md

- **Task 2.3.2**: Implement filters store
  - **File**: `src/lib/stores/filters.ts`
  - **Features**: Search query, platform/genre/tier filters
  - **Reference**: [Filters Store](#filters-store) in docs/project.md

- **Task 2.3.3**: Add debounced search
  - **Features**: 300ms delay before filtering
  - **Reference**: [Performance Optimizations](#performance-optimizations) in docs/project.md

- **Task 2.3.4**: Wire search to URL query parameters
  - **Features**: Update URL, support deep linking
  - **Reference**: [URL Structure](#url-structure--query-parameters) in docs/project.md

- **Task 2.3.5**: Update game count based on search results
  - **Features**: Dynamic count display in header and tabs

---

## Phase 3: Data Management

**Goal**: Enable adding, editing, and completing games

### 3.1 Filter System

- **Task 3.1.1**: Create filter dropdown components
  - **Files**: `src/lib/components/FilterDropdown.svelte`
  - **Features**: Multi-select checkboxes, platform/genre/tier options
  - **Reference**: [Filter Controls](#4-filter-controls) in docs/project.md

- **Task 3.1.2**: Implement multi-select filtering
  - **Features**: Platform, genre, and tier filtering logic

- **Task 3.1.3**: Add rating range sliders
  - **Features**: Presentation/Story/Gameplay score ranges

- **Task 3.1.4**: Wire filters to URL query parameters
  - **Features**: All filter states persist in URL
  - **Reference**: [URL Query Parameters](#url-structure--query-parameters) in docs/project.md

- **Task 3.1.5**: Add reset filters button
  - **Features**: Clear all filters, return to default state

### 3.2 Add Game Form (Phase 1)

- **Task 3.2.1**: Create modal store
  - **File**: `src/lib/stores/modal.ts`
  - **Features**: isOpen, activeGame, mode (view/edit/add)
  - **Reference**: [Modal Store](#modal-store) in docs/project.md

- **Task 3.2.2**: Build add game modal
  - **File**: `src/lib/components/AddGameModal.svelte`
  - **Features**: Form layout, field validation
  - **Reference**: [Phase 1 Input](#phase-1-adding-a-new-game-status-planned) in docs/project.md

- **Task 3.2.3**: Implement form validation
  - **Features**: Required fields, format validation, error messages

- **Task 3.2.4**: Add Phase 1 form fields
  - **Fields**: title, platform, year, genre, co-op, timeToBeat, cover
  - **Reference**: [Required Fields](#required-fields-for-input) in docs/project.md

- **Task 3.2.5**: Handle cover image URL input
  - **Features**: URL input, validation, preview (basic)
  - **Reference**: [Cover Image](#cover-image) in docs/project.md

- **Task 3.2.6**: Generate UUID for new games
  - **Features**: Unique ID generation for each game

- **Task 3.2.7**: Update games store on submit
  - **Features**: Add new game to store, validation with Zod

### 3.3 Edit Game Form (Phase 2)

- **Task 3.3.1**: Add edit button to game cards
  - **Features**: Visible on hover, consistent styling

- **Task 3.3.2**: Populate form with existing game data
  - **Features**: Pre-fill all fields with current values

- **Task 3.3.3**: Add status toggle (Planned → Completed)
  - **Features**: Status dropdown, conditional field visibility
  - **Reference**: [Phase 2 Input](#phase-2-completing-an-existing-game-status-completed) in docs/project.md

- **Task 3.3.4**: Show Phase 2 fields when status is Completed
  - **Fields**: finishedDate, hoursPlayed, ratings (0-10), tier

- **Task 3.3.5**: Implement score calculation
  - **Formula**: `(Presentation + Story + Gameplay) / 3 × 2`
  - **Reference**: [Score Calculation](#score-calculation) in docs/project.md

- **Task 3.3.6**: Update games store on submit
  - **Features**: Update existing game, validation, re-render

### 3.4 JSON Export

- **Task 3.4.1**: Create export function
  - **File**: `src/lib/utils/export.ts`
  - **Features**: Generate updated JSON, blob creation
  - **Reference**: [Export JSON](#export-json) in docs/project.md

- **Task 3.4.2**: Generate downloadable JSON file
  - **Features**: File download trigger, proper naming

- **Task 3.4.3**: Add export button to UI
  - **Location**: Header component
  - **Features**: Subtle placement, clear indication

- **Task 3.4.4**: Show success notification
  - **Features**: Temporary success message

---

## Phase 4: Advanced Views

**Goal**: Add table view, detail modal, and tier list

### 4.1 Detail Modal

- **Task 4.1.1**: Create detail modal component
  - **File**: `src/lib/components/DetailModal.svelte`
  - **Features**: Full-screen overlay, close handlers
  - **Reference**: [Detail Modal](#9-detail-modal) in docs/project.md

- **Task 4.1.2**: Implement two-column layout
  - **Features**: Cover (400px) + Info section
  - **Reference**: [Layout](#layout) in docs/project.md

- **Task 4.1.3**: Show all game details
  - **Features**: Complete game information display

- **Task 4.1.4**: Display rating progress bars
  - **Features**: Visual progress bars for each rating
  - **Reference**: [Progress Bars](#progress-bars) in docs/project.md

- **Task 4.1.5**: Add close button and overlay click
  - **Features**: Close button (✕), overlay click to close

- **Task 4.1.6**: Support URL parameter for deep linking
  - **Features**: `?game={id}` parameter support
  - **Reference**: [URL Parameter](#url-parameter) in docs/project.md

### 4.2 Table View

- **Task 4.2.1**: Create table component
  - **File**: `src/lib/components/GameTable.svelte`
  - **Features**: Full-width table, column structure
  - **Reference**: [Table View](#8-table-view) in docs/project.md

- **Task 4.2.2**: Implement all columns
  - **Columns**: Cover, Title, Year, Platform, Genre, Tier, Ratings, Score, Hours, Finished
  - **Reference**: [Column Specifications](#column-specifications) in docs/project.md

- **Task 4.2.3**: Add sortable column headers
  - **Features**: Clickable headers, sort indicators

- **Task 4.2.4**: Create sort store
  - **File**: `src/lib/stores/sort.ts`
  - **Features**: sortBy, sortDirection state
  - **Reference**: [Sort Store](#sort-store) in docs/project.md

- **Task 4.2.5**: Wire sorting to URL query parameters
  - **Features**: Sort state persistence in URL

- **Task 4.2.6**: Add horizontal scroll for mobile
  - **Features**: Mobile-responsive table scrolling
  - **Reference**: [Mobile Considerations](#mobile-web-app-desktop-considerations) in docs/project.md

- **Task 4.2.7**: Implement row virtualization for large datasets
  - **Features**: Performance optimization for 1000+ games

### 4.3 View Toggle

- **Task 4.3.1**: Add gallery/table toggle buttons
  - **Location**: Filter section
  - **Features**: Grid icon (⊞) and list icon (☰)
  - **Reference**: [View Toggle](#view-toggle) in docs/project.md

- **Task 4.3.2**: Store preference in localStorage
  - **Features**: Persist view mode choice

- **Task 4.3.3**: Maintain filters/sort when switching views
  - **Features**: State preservation across view changes

### 4.4 Tier List View

- **Task 4.4.1**: Create tier list page
  - **File**: `src/routes/tierlist/+page.svelte`
  - **Features**: Group games by tier (S, A, B, C, D, E)
  - **Reference**: [Tier List Generation](#tier-list-generation) in docs/project.md

- **Task 4.4.2**: Display games in horizontal rows per tier
  - **Features**: Tier headers with colored backgrounds
  - **Reference**: [Tier Colors](#tier-colors) in docs/project.md

- **Task 4.4.3**: Implement tier list export as image
  - **Library**: html2canvas or similar
  - **Features**: Generate image of tier list, download

- **Task 4.4.4**: Add export button to tier list page
  - **Features**: Clear export button, success feedback

---

## Phase 5: Polish

**Goal**: Optimize performance, responsiveness, and accessibility

### 5.1 Responsive Design

- **Task 5.1.1**: Test and fix mobile layout
  - **Breakpoint**: < 768px
  - **Features**: Card sizing, navigation, modal layout
  - **Reference**: [Mobile Considerations](#mobile-web-app-desktop-considerations) in docs/project.md

- **Task 5.1.2**: Test and fix tablet layout
  - **Breakpoint**: 768px - 1199px
  - **Features**: Grid columns, table display, modal sizing

- **Task 5.1.3**: Adjust grid columns for different breakpoints
  - **Features**: Desktop 5-6, Tablet 3-4, Mobile 2 columns
  - **Reference**: [Grid Layout](#dimensions) in docs/project.md

- **Task 5.1.4**: Make filters scrollable on mobile
  - **Features**: Horizontal scroll for filter buttons

- **Task 5.1.5**: Optimize touch targets
  - **Features**: Minimum 44×44px for all interactive elements
  - **Reference**: [Touch Considerations](#touch-considerations) in docs/project.md

### 5.2 Performance Optimization

- **Task 5.2.1**: Implement image lazy loading
  - **Features**: Load images as they enter viewport
  - **Reference**: [Lazy Loading](#lazy-loading) in docs/project.md

- **Task 5.2.2**: Add table row virtualization
  - **Features**: Render only visible rows for performance

- **Task 5.2.3**: Memoize filtered/sorted game computations
  - **Features**: Cache expensive calculations
  - **Reference**: [Memoized Computations](#memoized-computations) in docs/project.md

- **Task 5.2.4**: Optimize re-renders with Svelte reactivity
  - **Features**: Efficient store updates, minimal re-renders

- **Task 5.2.5**: Test with large datasets
  - **Features**: Generate 1000+ games for testing

### 5.3 Accessibility

- **Task 5.3.1**: Add ARIA labels to all icons
  - **Features**: Descriptive labels for screen readers
  - **Reference**: [Screen Readers](#screen-readers) in docs/project.md

- **Task 5.3.2**: Implement keyboard navigation
  - **Features**: Tab order, focus management, keyboard shortcuts
  - **Reference**: [Keyboard Navigation](#keyboard-navigation) in docs/project.md

- **Task 5.3.3**: Add focus indicators
  - **Features**: 2px blue outline on all interactive elements
  - **Reference**: [Focus Indicators](#focus-indicators) in docs/project.md

- **Task 5.3.4**: Test with screen reader
  - **Features**: Verify navigation, content reading, form interaction

- **Task 5.3.5**: Ensure color contrast ratios
  - **Features**: Minimum 4.5:1 ratio for all text
  - **Reference**: [Color Contrast](#color-contrast) in docs/project.md

- **Task 5.3.6**: Add skip links
  - **Features**: "Skip to main content" link at top

### 5.4 Image Optimization Pipeline

- **Task 5.4.1**: Create image optimization script
  - **File**: `scripts/optimize-covers-full.ts`
  - **Features**: Sharp-based PNG → WebP conversion
  - **Reference**: [Image Optimization Script](#image-optimization-script) in docs/project.md

- **Task 5.4.2**: Add pre-build script to package.json
  - **Script**: `bun run optimize-covers`

- **Task 5.4.3**: Test with sample cover images
  - **Features**: Validate dimensions (600×900), quality settings

- **Task 5.4.4**: Generate image manifest
  - **Features**: Track optimized images, metadata

### 5.5 Final Testing

- **Task 5.5.1**: Test all user flows end-to-end
  - **Flows**: Add game, complete game, filter, search, export

- **Task 5.5.2**: Verify data persistence
  - **Features**: JSON export/import, theme persistence

- **Task 5.5.3**: Test theme switching
  - **Features**: Toggle works, persists, affects all components

- **Task 5.5.4**: Test browser back/forward navigation
  - **Features**: URL state preservation, route changes

- **Task 5.5.5**: Test on different browsers
  - **Browsers**: Chrome, Firefox, Safari, Edge

- **Task 5.5.6**: Verify build output
  - **Features**: Static files generation, deployability


---

**Generated**: 2025-11-02
**Last Updated**: Task breakdown created for Gaming Tracker project implementation
