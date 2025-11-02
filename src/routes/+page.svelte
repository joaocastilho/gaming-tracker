<script lang="ts">
	let isDark = $state(true);

	function toggleTheme() {
		isDark = !isDark;
		document.documentElement.className = isDark ? 'dark' : 'light';
	}
</script>

<svelte:head>
	<title>Gaming Tracker - Tailwind CSS v4.1 Setup</title>
</svelte:head>

<div
	class="min-h-screen transition-colors duration-300 {isDark
		? 'dark:bg-dark-bg light:bg-light-surface'
		: 'light:bg-light-bg dark:bg-dark-surface'}"
>
	<div class="px-2xl py-4xl container mx-auto">
		<!-- Header -->
		<div class="mb-3xl flex items-center justify-between">
			<div>
				<h1
					class="text-4xl font-bold {isDark
						? 'dark:text-dark-text-primary light:text-light-text-primary'
						: 'light:text-light-text-primary dark:text-dark-text-primary'}"
				>
					Tailwind CSS v4.1 Setup Complete
				</h1>
				<p
					class="mt-md text-lg {isDark
						? 'dark:text-dark-text-secondary light:text-light-text-secondary'
						: 'light:text-light-text-secondary dark:text-dark-text-secondary'}"
				>
					Gaming Tracker - Custom Color Palette & Dark/Light Mode
				</p>
			</div>
			<button
				onclick={toggleTheme}
				class="px-lg py-md rounded-button {isDark
					? 'dark:bg-dark-surface light:bg-light-surface border-dark-border'
					: 'light:bg-light-surface dark:bg-dark-surface border-light-border'} border transition-colors duration-200 hover:opacity-80"
			>
				<span
					class={isDark
						? 'dark:text-dark-text-primary light:text-light-text-primary'
						: 'light:text-light-text-primary dark:text-dark-text-primary'}
				>
					{isDark ? '🌙' : '☀️'} Theme Toggle
				</span>
			</button>
		</div>

		<!-- Custom Color Palette Demo -->
		<div class="gap-xl mb-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			<!-- Dark Mode Colors -->
			<div
				class="p-xl rounded-card shadow-card {isDark
					? 'dark:bg-dark-surface bg-dark-border'
					: 'light:bg-light-surface border-light-border'} border"
			>
				<h3
					class="mb-lg text-xl font-semibold {isDark
						? 'dark:text-dark-text-primary'
						: 'light:text-light-text-primary'}"
				>
					Dark Mode
				</h3>
				<div class="space-y-sm">
					<div class="flex items-center">
						<div class="h-4xl rounded-badge bg-dark-bg mr-md border-dark-border w-4xl border"></div>
						<span
							class={isDark ? 'dark:text-dark-text-secondary' : 'light:text-light-text-secondary'}
							>Background: #0f1419</span
						>
					</div>
					<div class="flex items-center">
						<div
							class="h-4xl rounded-badge bg-dark-surface mr-md border-dark-border w-4xl border"
						></div>
						<span
							class={isDark ? 'dark:text-dark-text-secondary' : 'light:text-light-text-secondary'}
							>Surface: #1a1f27</span
						>
					</div>
					<div class="flex items-center">
						<div
							class="h-4xl rounded-badge bg-dark-border mr-md border-dark-border w-4xl border"
						></div>
						<span
							class={isDark ? 'dark:text-dark-text-secondary' : 'light:text-light-text-secondary'}
							>Border: #2a2f3a</span
						>
					</div>
				</div>
			</div>

			<!-- Light Mode Colors -->
			<div
				class="p-xl rounded-card shadow-card {isDark
					? 'dark:bg-dark-surface bg-light-surface'
					: 'light:bg-light-surface bg-dark-surface'} border {isDark
					? 'border-dark-border'
					: 'border-light-border'}"
			>
				<h3
					class="mb-lg text-xl font-semibold {isDark
						? 'dark:text-dark-text-primary'
						: 'light:text-light-text-primary'}"
				>
					Light Mode
				</h3>
				<div class="space-y-sm">
					<div class="flex items-center">
						<div
							class="h-4xl rounded-badge bg-light-bg mr-md border-light-border w-4xl border"
						></div>
						<span
							class={isDark ? 'dark:text-dark-text-secondary' : 'light:text-light-text-secondary'}
							>Background: #f8f9fa</span
						>
					</div>
					<div class="flex items-center">
						<div
							class="h-4xl rounded-badge bg-light-surface mr-md border-light-border w-4xl border"
						></div>
						<span
							class={isDark ? 'dark:text-dark-text-secondary' : 'light:text-light-text-secondary'}
							>Surface: #ffffff</span
						>
					</div>
					<div class="flex items-center">
						<div
							class="h-4xl rounded-badge bg-light-border mr-md border-light-border w-4xl border"
						></div>
						<span
							class={isDark ? 'dark:text-dark-text-secondary' : 'light:text-light-text-secondary'}
							>Border: #e5e7eb</span
						>
					</div>
				</div>
			</div>

			<!-- Tier Colors -->
			<div
				class="p-xl rounded-card shadow-card {isDark
					? 'dark:bg-dark-surface bg-dark-border'
					: 'light:bg-light-surface border-light-border'} border"
			>
				<h3
					class="mb-lg text-xl font-semibold {isDark
						? 'dark:text-dark-text-primary'
						: 'light:text-light-text-primary'}"
				>
					Game Tier Colors
				</h3>
				<div class="space-y-sm">
					<div class="flex items-center">
						<div class="h-4xl rounded-badge bg-tier-s mr-md w-4xl"></div>
						<span
							class={isDark ? 'dark:text-dark-text-secondary' : 'light:text-light-text-secondary'}
							>S - Masterpiece</span
						>
					</div>
					<div class="flex items-center">
						<div class="h-4xl rounded-badge bg-tier-a mr-md w-4xl"></div>
						<span
							class={isDark ? 'dark:text-dark-text-secondary' : 'light:text-light-text-secondary'}
							>A - Amazing</span
						>
					</div>
					<div class="flex items-center">
						<div class="h-4xl rounded-badge bg-tier-b mr-md w-4xl"></div>
						<span
							class={isDark ? 'dark:text-dark-text-secondary' : 'light:text-light-text-secondary'}
							>B - Great</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Platform & Genre Badge Examples -->
		<div class="gap-xl grid grid-cols-1 md:grid-cols-2">
			<!-- Platform Badges -->
			<div
				class="p-xl rounded-card shadow-card {isDark
					? 'dark:bg-dark-surface bg-dark-border'
					: 'light:bg-light-surface border-light-border'} border"
			>
				<h3
					class="mb-lg text-xl font-semibold {isDark
						? 'dark:text-dark-text-primary'
						: 'light:text-light-text-primary'}"
				>
					Platform Badges
				</h3>
				<div class="gap-sm flex flex-wrap">
					<span
						class="px-sm py-2xs rounded-badge bg-platform-pc bg-platform-pc text-platform-pc text-xs font-medium"
						>PC</span
					>
					<span
						class="px-sm py-2xs rounded-badge bg-platform-ps5 text-platform-ps5 text-xs font-medium"
						>PS5</span
					>
					<span
						class="px-sm py-2xs rounded-badge bg-platform-xbox text-platform-xbox text-xs font-medium"
						>Xbox</span
					>
					<span
						class="px-sm py-2xs rounded-badge bg-platform-switch text-platform-switch text-xs font-medium"
						>Switch</span
					>
				</div>
			</div>

			<!-- Genre Badges -->
			<div
				class="p-xl rounded-card shadow-card {isDark
					? 'dark:bg-dark-surface bg-dark-border'
					: 'light:bg-light-surface border-light-border'} border"
			>
				<h3
					class="mb-lg text-xl font-semibold {isDark
						? 'dark:text-dark-text-primary'
						: 'light:text-light-text-primary'}"
				>
					Genre Badges
				</h3>
				<div class="gap-sm flex flex-wrap">
					<span
						class="px-sm py-2xs rounded-badge bg-genre-action_rpg text-genre-action_rpg text-xs font-medium"
						>Action RPG</span
					>
					<span
						class="px-sm py-2xs rounded-badge bg-genre-story_adventure text-genre-story_adventure text-xs font-medium"
						>Adventure</span
					>
					<span
						class="px-sm py-2xs rounded-badge bg-genre-puzzle text-genre-puzzle text-xs font-medium"
						>Puzzle</span
					>
				</div>
			</div>
		</div>

		<!-- Configuration Summary -->
		<div
			class="mt-3xl p-xl rounded-card shadow-modal {isDark
				? 'dark:bg-dark-surface bg-dark-border'
				: 'light:bg-light-surface border-light-border'} border"
		>
			<h3
				class="mb-lg text-xl font-semibold {isDark
					? 'dark:text-dark-text-primary'
					: 'light:text-light-text-primary'}"
			>
				Configuration Summary
			</h3>
			<div
				class="gap-lg grid grid-cols-1 text-sm md:grid-cols-2 {isDark
					? 'dark:text-dark-text-secondary'
					: 'light:text-light-text-secondary'}"
			>
				<div>
					<h4
						class="mb-sm font-medium {isDark
							? 'dark:text-dark-text-primary'
							: 'light:text-light-text-primary'}"
					>
						✅ Installed Dependencies:
					</h4>
					<ul class="space-y-2xs">
						<li>• Tailwind CSS v4.1.16</li>
						<li>• PostCSS v8.5.6</li>
						<li>• @tailwindcss/postcss v4.1.16</li>
						<li>• Autoprefixer v10.4.21</li>
					</ul>
				</div>
				<div>
					<h4
						class="mb-sm font-medium {isDark
							? 'dark:text-dark-text-primary'
							: 'light:text-light-text-primary'}"
					>
						✅ Custom Features:
					</h4>
					<ul class="space-y-2xs">
						<li>• Dark/Light mode support (class-based)</li>
						<li>• Custom color palette for gaming theme</li>
						<li>• Tier rating colors (S-E)</li>
						<li>• Platform & genre badge colors</li>
						<li>• Custom spacing, shadows & border radius</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
