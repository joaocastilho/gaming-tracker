<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import RatingsSort from '$lib/components/RatingsSort.svelte';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
	import BottomNavigation from '$lib/components/BottomNavigation.svelte';
	import { extractFilterOptions } from '$lib/utils/filterOptions';
	import { filtersStore } from '$lib/stores/filters.js';
	import { gamesStore } from '$lib/stores/games.js';
	import { appStore } from '$lib/stores/app.js';
	import { modalStore } from '$lib/stores/modal.js';
	import { browser, dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import type { Game } from '$lib/types/game.js';

	let {
		children,
		data
	}: {
		children: import('svelte').Snippet;
		data: { games: Promise<Game[]> | Game[] };
	} = $props();

	let initialized = false;
	let urlUpdateTimeout: ReturnType<typeof setTimeout> | undefined;
	let DetailModalComponent = $state<
		typeof import('$lib/components/DetailModal.svelte').default | null
	>(null);
	let FilterDropdownComponent = $state<
		typeof import('$lib/components/FilterDropdown.svelte').default | null
	>(null);

	// Simplified loading state - no progressive loading
	let isLoading = $state(true);

	// Initialize games immediately if available (SSR support)
	if (data.games && Array.isArray(data.games)) {
		gamesStore.initializeGames(data.games);
		isLoading = false;
	}

	onMount(() => {
		if (data.games) {
			// Handle promise case (client-side only)
			if (data.games instanceof Promise) {
				data.games
					.then((resolvedGames) => {
						gamesStore.initializeGames(resolvedGames);
						isLoading = false;
					})
					.catch((error) => {
						console.error('Failed to load games:', error);
						isLoading = false;
					});
			} else if (!Array.isArray(data.games)) {
				// Handle edge case where it might be something else or already handled
				isLoading = false;
			}
		} else {
			isLoading = false;
		}
	});

	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			const swPath = '/service-worker.js';

			navigator.serviceWorker
				.register(swPath, {
					updateViaCache: 'none'
				})
				.then((registration) => {
					const checkForUpdates = () => {
						if (
							registration.installing === null &&
							registration.waiting === null &&
							registration.active !== null
						) {
							registration.update().catch(() => {
								// Silently ignore update errors
							});
						}
					};

					setInterval(checkForUpdates, 60000);
				})
				.catch(() => {});
		}
	});

	// Use a more efficient derived that doesn't block on empty games
	let filterOptions = $derived(() => {
		const games = $gamesStore;
		if (!games || games.length === 0) {
			return { platforms: [], genres: [], tiers: [] };
		}
		return extractFilterOptions(games);
	});
	let isTierlistPage = $derived(page.url.pathname === '/tierlist');

	$effect(() => {
		const tab = get(appStore.activeTab);

		if (tab === 'tierlist') {
			filtersStore.resetAllFilters();
			filtersStore.setSearchTerm('');

			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
			appStore.writeToURLWithFilters(filtersStore);
		} else {
			// Ensure filters are available for non-tierlist views
			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
			appStore.writeToURLWithFilters(filtersStore);
		}
	});

	// Modal URL handling is done in individual pages

	$effect(() => {
		if ($modalStore.isOpen && !DetailModalComponent) {
			import('$lib/components/DetailModal.svelte')
				.then((module) => {
					DetailModalComponent = module.default;
				})
				.catch(() => {
					// Silently handle DetailModal loading errors
				});
		}
	});

	$effect(() => {
		// Load FilterDropdown component after initial render to reduce critical path
		if (!FilterDropdownComponent && browser) {
			// Defer loading until after initial paint
			const loadFilterDropdown = () => {
				import('$lib/components/FilterDropdown.svelte')
					.then((module) => {
						FilterDropdownComponent = module.default;
					})
					.catch(() => {
						// Silently handle FilterDropdown loading errors
					});
			};

			// Use requestIdleCallback if available, fallback to setTimeout
			if ('requestIdleCallback' in window) {
				requestIdleCallback(loadFilterDropdown, { timeout: 2000 });
			} else {
				setTimeout(loadFilterDropdown, 100);
			}
		}
	});

	$effect(() => {
		if (initialized) {
			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
			urlUpdateTimeout = setTimeout(() => {
				appStore.writeToURLWithFilters(filtersStore);
			}, 150);
		}
	});

	$effect(() => {
		// Sync activeTab with URL pathname changes
		const pathname = page.url.pathname;
		let targetTab: 'all' | 'completed' | 'planned' | 'tierlist' = 'all';

		if (pathname === '/completed') {
			targetTab = 'completed';
		} else if (pathname === '/planned') {
			targetTab = 'planned';
		} else if (pathname === '/tierlist') {
			targetTab = 'tierlist';
		}

		appStore.setActiveTab(targetTab);
	});

	let selectedPlatforms: string[] = $state([]);
	let selectedGenres: string[] = $state([]);
	let selectedTiers: string[] = $state([]);

	$effect(() => {
		const unsubPlatforms = filtersStore.selectedPlatforms.subscribe((platforms) => {
			selectedPlatforms = platforms;
		});
		const unsubGenres = filtersStore.selectedGenres.subscribe((genres) => {
			selectedGenres = genres;
		});
		const unsubTiers = filtersStore.selectedTiers.subscribe((tiers) => {
			selectedTiers = tiers;
		});

		return () => {
			unsubPlatforms();
			unsubGenres();
			unsubTiers();
		};
	});

	function resetFilters() {
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');

		if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
		appStore.writeToURLWithFilters(filtersStore);
	}
</script>

<svelte:head>
	<title>Gaming Tracker</title>
	<!-- Preload critical resources to reduce critical path latency -->
	<link rel="modulepreload" href="/@vite/client" />
	{#if !dev}
		<link rel="modulepreload" href="/client/entry.js" />
		<link rel="preload" href="/client/client.js" as="script" />
	{/if}
</svelte:head>

<div
	style="background-color: var(--color-background);"
	class="bg-background text-foreground h-full min-h-screen"
>
	<Header />
	<section class="filter-section top-[104px] z-30 md:top-[110px]">
		<div class="container mx-auto space-y-4 px-6 py-4">
			{#if !isTierlistPage}
				<SearchBar />
				<div class="flex flex-col items-center gap-4">
					<div class="flex flex-wrap items-center justify-center gap-3">
						{#if FilterDropdownComponent}
							<FilterDropdownComponent
								type="platforms"
								label="Platforms"
								options={filterOptions().platforms}
								selectedOptions={selectedPlatforms}
							/>
							<FilterDropdownComponent
								type="genres"
								label="Genres"
								options={filterOptions().genres}
								selectedOptions={selectedGenres}
							/>
							<FilterDropdownComponent
								type="tiers"
								label="Tiers"
								options={filterOptions().tiers}
								selectedOptions={selectedTiers}
							/>
						{:else}
							<!-- Loading placeholder for FilterDropdown -->
							<div class="bg-surface flex h-11 w-24 animate-pulse rounded-md"></div>
							<div class="bg-surface flex h-11 w-20 animate-pulse rounded-md"></div>
							<div class="bg-surface flex h-11 w-16 animate-pulse rounded-md"></div>
						{/if}
						<span class="pipe-separator">|</span>
						<RatingsSort />
						<button
							class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors"
							title="Reset all filters"
							onclick={resetFilters}
						>
							↻ Reset filters
						</button>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6">
		<div class="container mx-auto">
			{#if isLoading}
				<!-- Simplified skeleton loading state -->
				<div class="skeleton-grid">
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
					{#each Array(12) as _, index (index)}
						<div class="skeleton-card"></div>
					{/each}
				</div>
			{:else}
				{@render children?.()}
			{/if}
		</div>
	</main>

	{#if DetailModalComponent}
		<DetailModalComponent />
	{/if}

	<BottomNavigation />
	<ScrollToTopButton />
</div>

<style>
	:global(.h-15) {
		height: 60px;
	}
	:global(.h-12\.5) {
		height: 50px;
	}

	.filter-section {
		background-color: var(--color-background);
		border-color: var(--color-border);
	}

	.reset-button {
		color: var(--color-text-primary);
		font-size: 0.85rem;
		cursor: pointer;
	}

	:global(.pt-\[calc\(60px\+50px\+100px\)\]) {
		padding-top: calc(60px + 50px + 100px);
	}

	.pipe-separator {
		font-weight: 500;
		color: var(--color-text-primary);
	}

	/* Simplified skeleton loading styles */
	.skeleton-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		padding-top: 2rem;
	}

	.skeleton-card {
		background: linear-gradient(
			90deg,
			var(--color-surface) 0%,
			var(--color-border) 50%,
			var(--color-surface) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
		height: 400px;
		border-radius: 0.5rem;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}
</style>
