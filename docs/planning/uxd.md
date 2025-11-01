# Gaming Tracker - User Interface Description Document (UXD)

## Document Overview

This document provides a comprehensive description of the Gaming Tracker user interface design. It serves as a reference for implementation, detailing layout structures, components, interactions, visual design elements, and responsive considerations.

---

## Layout Structure

### Primary Layout

The application uses a **fixed header layout** with content areas below:

1. **Header (Fixed)**
   - Always visible at the top
   - Contains: Logo, Add Game button, game count, theme toggle
   - Height: ~60px
   - Spans full viewport width

2. **Navigation Tabs (Fixed)**
   - Directly below header
   - Contains: Games, Finished, Planned, Tier List tabs
   - Each tab shows count in parentheses
   - Active tab indicated by bottom border and color change
   - Height: ~50px

3. **Search & Filter Section (Sticky)**
   - Sticks below navigation when scrolling
   - Contains: Search bar, filter dropdowns, view toggle
   - Two-row layout: Search bar (full width), then filters row
   - Height: ~100px total

4. **Content Area (Scrollable)**
   - Main content area that scrolls
   - Displays either Gallery View or Table View
   - Padding: 24px horizontal

---

## Core Components

### 1. Header Component

**Structure:**

```
[Logo + Add Button] -------- [Game Count + Theme Toggle]
```

**Elements:**

- **Logo**: Gaming Tracker with 🎮 emoji, left-aligned
- **Add Game Button**: Small, subtle button next to logo with "+ Add Game" text
- **Game Count**: "548 games tracked" (dynamic number)
- **Theme Toggle**: Sun ☀️ (light mode) or Moon 🌙 (dark mode) icon

**Styling:**

- Dark mode: Background #0a0d11, text white
- Light mode: Background white, text #1a1a1a
- Border bottom: 1-2px separator line

### 2. Navigation Tabs

**Tab Structure:**

- Games (548)
- Finished (174)
- Planned (374)
- Tier List

**Active State:**

- 2px blue (#3b82f6) bottom border
- Text color changes to white (dark) or black (light)

**Inactive State:**

- Text color #6b7280 (gray)
- No bottom border

### 3. Search Bar

**Full-width input field:**

- Placeholder: "🔍 Search games..."
- Border radius: 8px
- Padding: 12px 16px
- Dark mode: Background #1a1f27, border #2a2f3a
- Light mode: Background white, border #e5e7eb

### 4. Filter Controls

**Horizontal row of filter dropdowns:**

- All Platforms ▼
- All Genres ▼
- All Tiers ▼
- 📊 Ratings (opens rating sliders)
- ↻ Reset

**Right-aligned:**

- View toggle buttons: ⊞ (gallery) and ☰ (table)

**Styling:**

- Pills/buttons with rounded corners (6px)
- Padding: 8px 14px
- Font size: 0.85rem
- Dark mode: Background #1a1f27, border #2a2f3a
- Light mode: Background #f3f4f6, border #d1d5db

### 5. Game Card (Gallery View)

**Dimensions:**

- Cover: 260px wide × 390px tall (displays 600x900 source)
- Card spacing: 20px gap between cards
- Grid: Auto-fill, minimum 200px per column

**Cover Section:**

- Border radius: 12px
- Shadow: 0 4px 20px rgba(0,0,0,0.3)
- Hover: Translates up 4px, deeper shadow

**Badges on Cover:**

- **Tier Badge** (top-right): Tier name with color
  - S - Masterpiece: #dc2626 (red)
  - A - Amazing: #f97316 (orange)
  - B - Great: #eab308 (yellow)
  - C - Good: #22c55e (green)
  - D - Decent: #06b6d4 (cyan)
  - E - Bad: #6b7280 (gray)
- **Co-op Badge** (top-left, if applicable): "👥 Co-op" with blue background

**Info Section Below Cover:**

- **Title**: Font size 0.95rem, font weight 600
- **Year**: Font size 0.8rem, gray color
- **Platform & Genre Badges**: Row of colored pills
- **Metrics Row**: Icons with values
  - 👁️ Presentation score
  - ✍️ Story score
  - 🎮 Gameplay score
  - 🏆 Total score
- **Time/Date Row**:
  - Left: ⏱️ Hours played
  - Right: ✓ Finished date

### 6. Platform Badges

**Color Coding:**

- PC: Background #1e3a5f, Text #60a5fa (blue)
- PS5: Background #1e293b, Text #38bdf8 (cyan)
- Xbox: Background #14532d, Text #4ade80 (green)
- Switch: Background #7c2d12, Text #fb923c (orange)
- Add more as needed with distinct colors

**Styling:**

- Padding: 4px 8px
- Border radius: 4px
- Font size: 0.7rem
- Font weight: 500

### 7. Genre Badges

**Color Coding:**

- Action RPG: Background #2d1f3f, Text #c084fc (purple)
- Story Adventure: Background #422006, Text #fbbf24 (amber)
- Action Adventure: Background #164e63, Text #22d3ee (cyan)
- Puzzle: Background #3f1f4d, Text #e879f9 (fuchsia)
- Metroidvania: Background #4c1d95, Text #a78bfa (violet)
- Add more with distinct color pairings

**Styling:**

- Same as platform badges
- Padding: 4px 8px
- Border radius: 4px

### 8. Table View

**Table Structure:**

- Full-width table with horizontal scroll on mobile
- Columns: Cover | Title | Year | Platform | Genre | Tier | Ratings | Score | Hours | Finished

**Column Specifications:**

- **Cover**: 40px × 60px thumbnail
- **Title**: Left-aligned, bold (600 weight)
- **Year**: 4-digit year
- **Platform**: Badge (same styling as gallery)
- **Genre**: Badge (same styling as gallery)
- **Tier**: Badge with tier color
- **Ratings**: Three icons with scores in a row
- **Score**: Bold total score (e.g., "17/20")
- **Hours**: Time format (e.g., "58h 38m")
- **Finished**: Date format (e.g., "May 28, 2025")

**Sortable Headers:**

- Clickable column headers with ↕ indicator
- Sorted column highlights slightly
- Font size: 0.8rem
- Text transform: uppercase
- Letter spacing: 0.5px

**Row Styling:**

- Padding: 14px 16px
- Hover: Background color change
- Dark mode: Hover background #1a1f27
- Light mode: Hover background #f9fafb

### 9. Detail Modal

**Trigger:**

- Click on any game card in gallery view
- Click on any table row in table view

**Layout:**

- Full-screen overlay with semi-transparent black background (rgba(0,0,0,0.8))
- Centered modal with max-width 1000px
- Two-column grid: Cover (400px) | Info (remaining space)

**Cover Section (Left):**

- Full-size cover: 400px × 600px (displays 600x900 source)
- Border radius: 12px
- Tier badge in top-right corner

**Info Section (Right):**

- **Title**: Font size 2rem, font weight 700
- **Meta badges**: Platform, Genre, Co-op status
- **Detail Grid** (2 columns):
  - Year Released
  - Time to Beat
  - Hours Played
  - Finished Date
- **Ratings Section**:
  - Each rating (Presentation, Story, Gameplay) with:
    - Icon + Label
    - Score value (e.g., "9/10")
    - Progress bar visualization
  - Total Score highlighted in larger box

**Progress Bars:**

- Background: #2a2f3a (dark) or #e5e7eb (light)
- Fill: Gradient from #3b82f6 to #8b5cf6
- Height: 8px
- Border radius: 4px

**Close Button:**

- Top-right corner (✕)
- Font size: 1.5rem
- Color: #8b92a8 (dark) or #6b7280 (light)

---

## Interaction Patterns

### Navigation

1. **Tab Switching**: Click tab to change view, updates URL, maintains filters
2. **View Toggle**: Click grid/table icon to switch between gallery and table views
3. **Search**: Real-time filtering as user types (debounced)
4. **Filters**: Dropdown menus with checkboxes for multi-select
5. **Sorting**: Click table headers to sort (toggle asc/desc)

### Adding Games

1. Click "+ Add Game" button in header
2. Opens modal/sidebar form with Phase 1 fields (for Planned games)
3. After saving, game appears in Planned tab

### Editing Games

1. Click "Edit" button on game card (visible on hover or always visible on mobile)
2. Opens same modal/form with all fields populated
3. Can change status from Planned → Completed (unlocks Phase 2 fields)

### Completing Games

1. From Planned list, click Edit on a game
2. Change status to "Completed"
3. Phase 2 fields appear: Finished Date, Hours Played, Ratings, Tier
4. After saving, game moves to Finished tab

### Detail View

1. Click on any game card/row
2. Modal opens with full information
3. Click overlay or ✕ button to close
4. Arrow keys to navigate between games (optional enhancement)

### Tier List Export

1. Navigate to Tier List tab
2. Click "Export Image" button
3. Generates and downloads image of tier list

---

## Visual Design Elements & Color Scheme

### Color Palette

**Dark Mode:**

- Background: #0f1419
- Surface: #1a1f27
- Border: #2a2f3a
- Text Primary: #ffffff
- Text Secondary: #8b92a8
- Text Tertiary: #6b7280
- Accent: #3b82f6

**Light Mode:**

- Background: #f8f9fa
- Surface: #ffffff
- Border: #e5e7eb
- Text Primary: #1a1a1a
- Text Secondary: #4b5563
- Text Tertiary: #6b7280
- Accent: #3b82f6

**Tier Colors:**

- S - Masterpiece: #dc2626
- A - Amazing: #f97316
- B - Great: #eab308
- C - Good: #22c55e
- D - Decent: #06b6d4
- E - Bad: #6b7280

### Shadows & Elevation

- Card shadow: 0 4px 20px rgba(0,0,0,0.3)
- Card hover: 0 8px 30px rgba(0,0,0,0.5)
- Modal shadow: 0 20px 60px rgba(0,0,0,0.5)
- Badge shadow: 0 2px 8px rgba(0,0,0,0.3)

### Border Radius

- Cards: 12px
- Badges: 4px
- Buttons: 6px
- Inputs: 8px
- Modal: 16px

### Spacing Scale

- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- 2xl: 24px
- 3xl: 32px
- 4xl: 40px

---

## Mobile, Web App, Desktop Considerations

### Desktop (1200px+)

- Gallery: 5-6 cards per row
- Table: All columns visible
- Modal: Two-column layout
- Filters: Single row
- Sidebar navigation: Optional left sidebar for future enhancement

### Tablet (768px - 1199px)

- Gallery: 3-4 cards per row
- Table: Horizontal scroll for overflow columns
- Modal: Two-column layout (narrower)
- Filters: May wrap to two rows

### Mobile (< 768px)

- Gallery: 2 cards per row
- Cover size: Scales down proportionally (height: 240px)
- Table: Horizontal scroll
- Modal: Single column layout, cover on top (height: 400px)
- Filters: Horizontal scroll, no wrap
- Search: Full width, prominent
- Navigation tabs: May scroll horizontally
- Sticky header and filters for easy access

### Touch Considerations

- All interactive elements minimum 44×44px touch target
- Increased padding on buttons and links
- Swipe gestures: Optional swipe to navigate between detail views
- Pull to refresh: Optional enhancement for updating data

### Performance

- Lazy load game covers as user scrolls
- Virtualize table rows for large datasets
- Debounce search input (300ms)
- Cache filter states in URL/localStorage

---

## Typography

### Font Family

- Primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif
- System fonts for optimal performance and native feel

### Font Sizes

- Hero Title (Modal): 2rem (32px)
- Page Title: 1.3rem (20.8px)
- Card Title: 0.95rem (15.2px)
- Body: 0.9rem (14.4px)
- Small Text: 0.8rem (12.8px)
- Tiny Text: 0.75rem (12px)
- Badge/Label: 0.7rem (11.2px)

### Font Weights

- Bold: 700 (headings, important data)
- Semibold: 600 (titles, labels)
- Medium: 500 (badges, buttons)
- Normal: 400 (body text)

### Line Heights

- Tight: 1.2 (headings)
- Normal: 1.3 (card titles)
- Relaxed: 1.5 (body text)
- Loose: 1.75 (long-form content)

### Letter Spacing

- Tight: -0.02em (large headings)
- Normal: 0 (default)
- Wide: 0.5px (uppercase labels)

---

## Accessibility

### Color Contrast

- Text on background: Minimum 4.5:1 ratio
- Badge text on badge background: Minimum 4.5:1 ratio
- All interactive elements meet WCAG AA standards

### Keyboard Navigation

- Tab order: Logical top-to-bottom, left-to-right
- Focus indicators: 2px blue outline on all interactive elements
- Escape key: Closes modals and dropdowns
- Enter/Space: Activates buttons and toggles
- Arrow keys: Navigate through table cells (optional)

### Screen Readers

- Semantic HTML: Proper heading hierarchy (h1, h2, h3)
- ARIA labels: Descriptive labels for icons and interactive elements
- Alt text: All images have descriptive alt text
- Live regions: Announce filter results and status changes
- Skip links: "Skip to main content" link at top

### Focus Management

- Modal open: Focus moves to modal, traps within modal
- Modal close: Focus returns to triggering element
- Filter changes: Announce number of results

### Other Considerations

- Animations: Respect prefers-reduced-motion
- Text: Minimum 16px for body text (0.9rem with 16px base = 14.4px - may need adjustment)
- Interactive elements: Clear hover and focus states
- Error messages: Clear, descriptive, associated with form fields

---

## Additional Notes

### Icons Reference

- Presentation: 👁️ (eye)
- Story: ✍️ (writing hand)
- Gameplay: 🎮 (game controller)
- Score: 🏆 (trophy)
- Time: ⏱️ (stopwatch)
- Completed: ✓ (checkmark)
- Co-op: 👥 (people)
- Search: 🔍 (magnifying glass)
- Ratings: 📊 (bar chart)
- Reset: ↻ (circular arrow)
- Gallery: ⊞ (grid)
- Table: ☰ (list)

### State Management

- Active tab
- Selected filters
- Current view (gallery/table)
- Theme preference (dark/light)
- Sort order and column
- Search query
- Modal open/closed state

### Data Display Formats

- Hours: "XXh XXm" (e.g., "58h 38m")
- Dates: "Month DD, YYYY" (e.g., "May 28, 2025")
- Scores: "X/10" for individual, "XX/20" for total
- Year: "YYYY" (e.g., "2019")

### Cover Image Specifications

- Source resolution: 600 × 900 pixels (2:3 aspect ratio)
- Display size (gallery): 260 × 390 pixels
- Display size (modal): 400 × 600 pixels
- Format: PNG
- Fallback: Gradient placeholder if image fails to load
- Storage: Local directory `/public/covers/`

---

## Implementation Priority

### Phase 1 - Core Experience

1. Header and navigation
2. Gallery view with game cards
3. Search functionality
4. Theme toggle
5. Basic responsive layout

### Phase 2 - Enhanced Features

6. Table view
7. Filter system
8. Detail modal
9. Add/Edit game forms
10. Sorting

### Phase 3 - Advanced Features

11. Tier List view and export
12. Advanced filtering (rating sliders)
13. Keyboard shortcuts
14. Animation and transitions
15. Performance optimizations

---

## End of Document

This UXD provides comprehensive guidance for implementing the Gaming Tracker interface. All measurements, colors, and interactions are specified to ensure consistent implementation across the application.
