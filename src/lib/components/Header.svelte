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

<div class="header-background">
	<header class="header container mx-auto px-6">
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
</div>

<style>
	.header-background {
		/* Full width background using pseudo-element */
		position: relative;

		/* Sticky positioning for the entire header */
		position: sticky;
		top: 0;
		z-index: 40;

		/* Create full-width background with pseudo-element */
	}

	.header-background::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		right: 50%;
		width: 100vw;
		height: 100%;
		margin-left: -50vw;
		margin-right: -50vw;
		z-index: -1;

		/* Dark mode colors */
		background-color: #0a0d11;
	}

	:global(.light) .header-background::before {
		background-color: #f2ebe1;
	}



	.header {
		/* Layout */
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60px;
		width: 100%;

		/* Make background transparent since it's handled by parent */
		background-color: transparent;

		/* Remove border */
		border: none;
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
	}

	.logo-image {
		height: 55px;
		width: auto;
		max-width: 130px;
		object-fit: contain;
	}



	/* Responsive design */
	@media (max-width: 768px) {
		.header {
			padding: 0 16px 0 0;
			height: 56px;
		}

		.header-left {
			gap: 12px;
			margin-left: 36px; /* 24px container + 12px search bar */
		}
	}

	@media (max-width: 480px) {
		.header {
			padding: 0 12px 0 0;
		}

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
