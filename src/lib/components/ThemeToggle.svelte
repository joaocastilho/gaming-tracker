<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';

	// Directly read theme from the reactive store property
	let theme = $derived(appStore.theme);

	function toggleTheme() {
		appStore.toggleTheme();
	}
</script>

<button
	type="button"
	class="theme-toggle"
	class:dark={theme === 'dark'}
	onclick={toggleTheme}
	aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
	title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
	<div class="icon-container">
		<svg
			class="sun-icon"
			class:visible={theme === 'dark'}
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="4" />
			<path
				d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
			/>
		</svg>

		<svg
			class="moon-icon"
			class:visible={theme === 'light'}
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		</svg>
	</div>
	<div class="glow-effect"></div>
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		position: relative;
		overflow: hidden;
		outline: none;
	}

	.theme-toggle:hover {
		border-color: var(--color-accent);
		background-color: var(--color-hover);
		color: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.theme-toggle.dark:hover {
		color: #fbbf24;
		border-color: #fbbf24;
		background-color: rgba(251, 191, 36, 0.1);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.theme-toggle:active {
		transform: translateY(0);
	}

	.icon-container {
		position: relative;
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sun-icon,
	.moon-icon {
		position: absolute;
		inset: 0;
		width: 18px;
		height: 18px;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		transform-origin: center;
		opacity: 0;
		transform: scale(0.5) rotate(-90deg);
	}

	.sun-icon.visible,
	.moon-icon.visible {
		opacity: 1;
		transform: scale(1) rotate(0deg);
	}

	.sun-icon {
		color: #d4a030;
	}

	.moon-icon {
		color: #6366f1;
	}

	.glow-effect {
		position: absolute;
		inset: -2px;
		border-radius: 14px;
		background: linear-gradient(135deg, var(--color-accent), transparent);
		opacity: 0;
		transition: opacity var(--transition-fast);
		z-index: -1;
		filter: blur(8px);
	}

	.theme-toggle:hover .glow-effect {
		opacity: 0.3;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-toggle,
		.sun-icon,
		.moon-icon {
			transition: none;
		}

		.theme-toggle:hover {
			transform: none;
		}
	}

	@media (max-width: 765px) {
		.theme-toggle {
			width: 36px;
			height: 36px;
			border-radius: 10px;
		}
	}
</style>
