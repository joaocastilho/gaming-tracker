import type { JSX } from '@solidjs/web';
import { appStore } from '#lib/stores/app.js';
import './ThemeToggle.css';

export default function ThemeToggle(): JSX.Element {
	function toggleTheme(): void {
		appStore.toggleTheme();
	}

	return (
		<button
			type="button"
			class={['theme-toggle', { dark: appStore.theme === 'dark' }]}
			onClick={toggleTheme}
			aria-label={appStore.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			title={appStore.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			<div class="icon-container">
				<svg
					class={['sun-icon', { visible: appStore.theme === 'dark' }]}
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
					<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
				</svg>

				<svg
					class={['moon-icon', { visible: appStore.theme === 'light' }]}
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
			<div class="glow-effect" />
		</button>
	);
}
