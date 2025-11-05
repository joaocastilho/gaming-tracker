<script lang="ts">
	import { appStore } from '../stores/app.js';
	import { filtersStore } from '../stores/filters.js';
	import ThemeToggle from './ThemeToggle.svelte';

	// Subscribe to theme changes (value used for reactive updates)
	$effect(() => {
		const unsubscribe = appStore.theme.subscribe(() => {
			// Theme changes trigger reactive updates
		});
		return unsubscribe;
	});

	// Handle logo click - reset all filters and go to homepage
	function handleLogoClick() {
		// Reset all filters
		filtersStore.resetAllFilters();

		// Set active tab to 'all' (homepage)
		appStore.setActiveTab('all');

		// Clear URL hash to go to homepage
		if (typeof window !== 'undefined' && window.location) {
			window.history.replaceState(null, '', window.location.pathname + window.location.search);
		}

		// Scroll to top of page
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
</script>

<header class="header">
	<div class="header-background"></div>
	<div class="header-content container mx-auto px-6">
		<!-- Left section: Logo -->
		<div class="header-left">
			<button
				class="logo"
				onclick={handleLogoClick}
				aria-label="Go to homepage and reset all filters"
			>
				<picture class="logo-image">
					<source srcset="logo.webp" type="image/webp" />
					<img src="logo.png" alt="Gaming Tracker Logo" />
				</picture>
			</button>
		</div>

		<!-- Right section: Theme Toggle -->
		<div class="header-right">
			<ThemeToggle />
		</div>
	</div>
</header>

<style>
	.header {
		/* Sticky positioning for the entire header */
		position: sticky;
		top: 0;
		z-index: 40;

		/* Layout */
		display: flex;
		flex-direction: column;
		width: 100%;

		/* Remove border */
		border: none;
	}

	.header-background {
		/* Full width background */
		width: 100vw;
		position: absolute;
		left: 50%;
		right: 50%;
		margin-left: -50vw;
		margin-right: -50vw;
		height: 100%;

		/* Dark mode colors */
		background-color: #0a0d11;
	}

	:global(.light) .header-background {
		background-color: #f2ebe1;
	}

	.header-content {
		/* Layout */
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60px;
		width: 100%;
		position: relative;
		z-index: 1;
	}

	/* Left section */
	.header-left {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-left: 40px; /* Align with search bar content start (24px container + 16px search bar) */
	}

	/* Logo section */
	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.logo:hover {
		opacity: 0.8;
	}

	.logo:focus {
		outline: none;
	}

	.logo:active,
	.logo:focus:active {
		outline: none;
		border: none;
		box-shadow: none;
	}

	.logo-image {
		height: 55px;
		width: auto;
		max-width: 130px;
		object-fit: contain;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.header-content {
			height: 56px;
		}

		.header-left {
			gap: 12px;
			margin-left: 36px; /* 24px container + 12px search bar */
		}
	}

	@media (max-width: 480px) {
		.header-left {
			gap: 8px;
			margin-left: 32px; /* 24px container + 8px search bar */
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		/* No transitions to remove since Add Game button is removed */
	}
</style>
