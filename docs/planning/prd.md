# Gaming Tracker Product Requirements Document (PRD)

## 1. Elevator Pitch 🎮

**Gaming Tracker** is a fast, personal, Single Page Application (SPA) designed for dedicated gamers to meticulously record and rank the games they play. By focusing on a clean **User Experience (UX)** and intuitive navigation, it allows a user to track games they have **Planned** and rate **Completed** games on **Presentation, Story, and Gameplay** to generate a visually appealing, cover-focused tier list that prioritizes speed and personal review insights.

---

## 2. Who is this app for 👤

- **Dedicated Gamers/Reviewers:** Individuals who want a structured, personal system for recording and reviewing their gaming history with specific metrics.
- **Curators:** Users who wish to organize their **Completed** games into a visually appealing, shareable Tier List based on personal scores.
- **Single User/Personal Projects:** The initial target is a single user (the owner) managing their personal data.

---

## 3. Functional Requirements - What does it do ⚙️

### Core Tracking & Status

- Allow the user to mark a game's status as **"Planned"** or **"Completed."**
- Display a count of total tracked games and separate counts for **"Completed"** and **"Planned"** categories in the navigation bar.

### Game Data Management (Two-Phase Input)

- Provide a dedicated **Game Input page** for adding and editing game data.

#### Phase 1: Adding a New Game (Status: Planned)

- **Purpose:** To quickly add a game to the user's backlog.
- **Required Fields for Input:**
  - **Title**
  - **Platform**
  - **Year**
  - **Genre**
  - **Co-op**
  - **Time to Beat** (Estimated completion time)
  - **Cover Image:** Accepts a **URL link** to a game cover. The application must fetch this image, save it to a local project directory (e.g., `/public/covers/`), and store the new local path (e.g., `covers/game-title.jpg`) in the JSON.
- **Status:** The game is automatically marked as **"Planned."**

#### Phase 2: Completing an Existing Game (Status: Completed)

- **Purpose:** To update a **"Planned"** game with final review metrics upon finishing.
- **Actions:** The user triggers this phase by selecting an 'Edit' button on a game card or row from the 'Planned' list.
- **Fields to be Added/Edited:**
  - Update Status to **"Completed."**
  - **Finished Date**
  - **Hours Played:** (Actual time taken, replacing "Time to Beat").
  - **Ratings:** Presentation (0-10), Story (0-10), Gameplay (0-10).
  - **Tier:** Assign a Tier.

### Review & Scoring System

- Track and store three specific user ratings on a **0-10 scale**: **Presentation, Story, and Gameplay**.
- **Total Score Logic:** Automatically calculate the final **Score** using the formula: $$\text{Score} = \frac{\text{Presentation} + \text{Story} + \text{Gameplay}}{3} \times 2$$
  - This results in a final score on a scale from **0 to 20**.
- **Tier Structure:** The allowed Tiers are explicitly: **S - Masterpiece, A - Amazing, B - Great, C - Good, D - Decent, E - Bad**.

### Data Persistence

- The application must read data from and intelligently update a local **JSON file**.
- The SPA must feature a mechanism to allow the user to **update and save the underlying JSON data** (e.g., via a discreet local file download/upload process).

### Filtering and Sorting

- Provide filtering options for **Platforms, Genres, and Tiers**.
- Enable sorting/filtering by score ranges (Presentation, Story, Gameplay, Total Score).
- Include a prominent **Search bar** to quickly find games by Title.
- **Sorting:** The **Gallery View** must provide a clear way to initiate sorting based on key metrics (e.g., Score, Hours Played).

---

## 4. User Stories - How will the user interact 🙋

- **Phase 1 Input (Planned):** _As a user, I want a simple input form to quickly add a game to my **Planned** list, only requiring basic fields like **Cover, Title, Platform, Genre, Coop and Time to Beat**, so I can manage my backlog efficiently._
- **Phase 2 Input (Completed):** _As a user, I want to easily open a **Planned** game via an 'Edit' button, mark it as **Completed**, and then input my **Finished Date**, actual **Hours Played**, tier level and detailed **0-10 ratings** to finalize the review._
- **Visual Verification:** _As a user, I want to see a cover-focused **Gallery View** of my tracked games by default, with clear **icons and metrics** visible, to prioritize visual appeal._
- **Tier List Generation:** _As a user, I want to view a dedicated **Tier List** screen that groups all my **Completed** games visually by their assigned Tier, and allow the user to **export this list as an image**._

---

## 5. User Interface - How will the app look 🎨

- **Priorities:** **Speed, UX, and Navigation** are paramount. **Game Covers** must be the key visual element.
- **Theme:** Must feature a visible **Light Mode and Dark Mode** toggle.
- **Navigation:** A clean top navigation bar with clear links for **Completed, Planned, Tier List**, and **Game Input**.
- **Display Modes:**
  - **Gallery View:** Game covers are the primary focus. Game cards must display: Title, Platform, Genre tags, and clear, icon-based metrics for the three scores and the final 0-20 score.
- **Iconography:** Metrics should use **clear, obvious icons and graphs** (instead of long labels) to represent scores, hours played, and dates, provided their meaning is immediately intuitive.
- **Responsiveness:** **Mobile and tablet support must be ensured.** The design must be optimized for all views, particularly ensuring the gallery of game covers is smooth and easily navigable on small screens.

---

## 6. Data Schema 💾

The application will read from and write to a single `games.json` file, which contains an array of game objects. Each game object must follow this structure:

```json
{
	"id": "uuid-string-12345",
	"title": "Game Title",
	"platform": "PC",
	"year": 2024,
	"genre": "RPG",
	"coOp": "No",
	"status": "Planned",
	"coverImage": "covers/game-title.png",
	"timeToBeat": "25h 30m",
	"hoursPlayed": null,
	"finishedDate": null,
	"ratingPresentation": null,
	"ratingStory": null,
	"ratingGameplay": null,
	"score": null,
	"tier": null
}
```
