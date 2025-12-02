![Gaming Tracker](static/logo.webp)

A fast personal library for tracking and rating my video game collection. Designed to be a clean, offline-friendly way to organize my played and planned games, complete with visual tier lists and detailed stats.

## ✨ Key Features

*   **Track My Collection**: Keep track of games I've completed and ones I plan to play.
*   **Detailed Ratings**: Rate games on Presentation, Story, and Gameplay to generate an overall score.
*   **Visual Tier Lists**: Automatically generate tier lists based on my opinion of the game.
*   **Multiple Views**:
    *   **Gallery**: Browse my collection with high-quality cover art.
    *   **Tier List**: Visualize my favorites in a classic tier list format.
*   **Smart Filtering**: Instantly find games by platform, genre, status, or rating.
*   **Performance First**: Optimized for speed with instant loading and smooth animations.
*   **Privacy Focused**: 100% client-side. All data stays in the clients browser.
*   **Dark & Light Mode**

## 🛠️ Tech Stack

Built with modern web technologies for performance and developer experience:

*   **Framework**: [SvelteKit](https://kit.svelte.dev/) (v2.48.5)
*   **UI Library**: [Svelte 5](https://svelte.dev/) (v5.43.12)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (v5.9.3)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4.1.17)
*   **Icons**: [Lucide Svelte](https://lucide.dev/) (v0.552.0)
*   **Runtime**: [Bun](https://bun.sh/)
*   **Testing**: [Vitest](https://vitest.dev/)

## 📂 Project Structure

A quick look at how the project is organized:

*   `src/`: The heart of the application.
    *   `routes/`: Contains the pages and layout definitions (SvelteKit routing).
    *   `lib/`: Shared components, utility functions, and stores.
    *   `app.html`: The main HTML template.
*   `static/`: Static assets like game covers, icons, and the initial `games.json` data.
*   `scripts/`: Helper scripts for tasks like optimizing images and converting data.
*   `tests/`: Unit and integration tests to ensure everything works perfectly.