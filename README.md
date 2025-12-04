![Gaming Tracker](static/logo.webp)

A fast personal library for tracking and rating my video game collection. Designed to be a clean, offline-friendly way to organize my played and planned games, complete with visual tier lists and detailed stats.

## ✨ Key Features

- **Track My Collection**: Keep track of games I've completed and ones I plan to play.
- **Detailed Ratings**: Rate games on Presentation, Story, and Gameplay to generate an overall score.
- **Visual Tier Lists**: Automatically generate tier lists based on my opinion of the game.
- **Multiple Views**:
  - **Gallery**: Browse my collection with high-quality cover art.
  - **Tier List**: Visualize my favorites in a classic tier list format.
- **Smart Filtering**: Instantly find games by platform, genre, status, or rating.
- **Performance First**: Optimized for speed with instant loading and smooth animations.
- **Privacy Focused**: 100% client-side. All data stays in the clients browser.
- **Dark & Light Mode**

## 🛠️ Tech Stack

Built with modern web technologies for performance and developer experience:

| Category       | Technology                                                                                                                       | Version    |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| **Framework**  | [![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev/)               | `v2.48.5`  |
| **UI Library** | [![Svelte](https://img.shields.io/badge/Svelte-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)                         | `v5.43.12` |
| **Language**   | [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) | `v5.9.3`   |
| **Styling**    | [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)  | `v4.1.17`  |
| **Icons**      | [![Lucide](https://img.shields.io/badge/Lucide-F05033?logo=lucide&logoColor=white)](https://lucide.dev/)                         | `v0.552.0` |
| **Runtime**    | [![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh/)                                      | `v1.3.2`   |
| **Build Tool** | [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)                                 | `v7.2.4`   |
| **Testing**    | [![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)                         | `v3.2.4`   |

## 📂 Project Structure

A quick look at how the project is organized:

- `src/`: The heart of the application.
  - `routes/`: Contains the pages and layout definitions (SvelteKit routing).
  - `lib/`: Shared components, utility functions, and stores.
  - `app.html`: The main HTML template.
- `static/`: Static assets like game covers, icons, and the initial `games.json` data.
- `scripts/`: Helper scripts for tasks like optimizing images and converting data.
- `tests/`: Unit and integration tests to ensure everything works perfectly.

## ⚡ Performance

| Platform    | Report                                                                                                                                                                                                           |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Desktop** | [![PageSpeed Insights](https://img.shields.io/badge/Analyze-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://pagespeed.web.dev/analysis?url=gaming-tracker.pages.dev&form_factor=desktop) |
| **Mobile**  | [![PageSpeed Insights](https://img.shields.io/badge/Analyze-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://pagespeed.web.dev/analysis?url=gaming-tracker.pages.dev&form_factor=mobile)  |
