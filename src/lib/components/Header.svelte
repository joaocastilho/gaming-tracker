<script lang="ts">
	import { appStore } from '../stores/app.js';
	import ThemeToggle from './ThemeToggle.svelte';

	// Subscribe to theme changes (value used for reactive updates)
	$effect(() => {
		const unsubscribe = appStore.theme.subscribe(() => {
			// Theme changes trigger reactive updates
		});
		return unsubscribe;
	});
</script>

<header class="header">
	<!-- Left section: Logo -->
	<div class="header-left">
		<div class="logo">
			<picture class="logo-image">
				<source srcset="logo.webp" type="image/webp" />
				<img src="logo.png" alt="Gaming Tracker Logo" />
			</picture>
		</div>
	</div>

	<!-- Right section: Theme Toggle -->
	<div class="header-right">
		<ThemeToggle />
	</div>
</header>

<style>
	.header {
		/* Layout */
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 24px;
		height: 60px;
		width: 100%;

		/* Dark mode colors */
		background-color: #0a0d11;
		color: #ffffff;

		/* Typography */
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;

		/* Positioning */
		position: sticky;
		top: 0;
		z-index: 40;

		/* Remove border */
		border: none;
	}

	/* Light mode overrides */
	:global(.light) .header {
		background-color: #f2ebe1;
		color: #1a1a1a;
	}

	/* Left section */
	.header-left {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	/* Logo section */
	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.logo-image {
		height: 56px;
		width: auto;
		max-width: 180px;
		object-fit: contain;
	}



	/* Responsive design */
	@media (max-width: 768px) {
		.header {
			padding: 0 16px;
			height: 56px;
		}

		.header-left {
			gap: 12px;
		}
	}

	@media (max-width: 480px) {
		.header {
			padding: 0 12px;
		}

		.header-left {
			gap: 8px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		/* No transitions to remove since Add Game button is removed */
	}
</style>
