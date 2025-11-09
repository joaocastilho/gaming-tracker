<script>
	import { appStore } from '../stores/app.js';

	let theme = $state(
		typeof document !== 'undefined' && document.documentElement.classList.contains('light')
			? 'light'
			: 'dark'
	);

	$effect(() => {
		const unsubscribe = appStore.theme.subscribe((value) => {
			theme = value;
		});
		return unsubscribe;
	});

	function toggleTheme() {
		appStore.toggleTheme();
	}
</script>

<button
	type="button"
	class="theme-toggle"
	onclick={toggleTheme}
	aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
	title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
	<div class="icon-container">
		<svg
			class="sun-icon"
			class:visible={theme === 'light'}
			class:hidden={theme === 'dark'}
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="5" />
			<path
				d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
			/>
		</svg>

		<svg
			class="moon-icon"
			class:visible={theme === 'dark'}
			class:hidden={theme === 'light'}
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	</div>
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: inherit;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
		outline: none;
		color: #8b92a8;
	}

	.theme-toggle:hover {
		background-color: rgba(42, 47, 58, 0.8);
		color: #ffffff;
	}

	:global(.light) .theme-toggle {
		color: #6b7280;
	}

	:global(.light) .theme-toggle:hover {
		background-color: #e9decd;
		color: #1a1a1a;
	}

	.theme-toggle:focus {
		outline: none;
	}

	.theme-toggle:active {
		transform: translateY(0);
	}

	.icon-container {
		position: relative;
		width: 20px;
		height: 20px;
	}

	.sun-icon,
	.moon-icon {
		position: absolute;
		top: 0;
		left: 0;
		width: 20px;
		height: 20px;
		transition: all 0.3s ease;
		transform-origin: center;
	}

	.sun-icon.visible,
	.moon-icon.visible {
		opacity: 1;
		transform: scale(1) rotate(0deg);
	}

	.sun-icon.hidden,
	.moon-icon.hidden {
		opacity: 0;
		transform: scale(0.8) rotate(-45deg);
	}

	:global(.light) .sun-icon {
		color: #f59e0b;
	}

	:global(.dark) .moon-icon {
		color: #60a5fa;
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
</style>
