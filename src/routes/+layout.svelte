<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import FilterDropdown from '$lib/components/FilterDropdown.svelte';
	import RatingsFilter from '$lib/components/RatingsFilter.svelte';
	import { extractFilterOptions } from '$lib/utils/filterOptions';
	import { filtersStore } from '$lib/stores/filters.js';
	import { gamesStore } from '$lib/stores/games.js';
	import { appStore } from '$lib/stores/app.js';
	import { modalStore } from '$lib/stores/modal.js';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let { children } = $props();

	let initialized = false;
	let urlUpdateTimeout: ReturnType<typeof setTimeout> | undefined;
	let DetailModalComponent = $state<
		typeof import('$lib/components/DetailModal.svelte').default | null
	>(null);

	// Register service worker
	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			const swPath = '/gaming-tracker/service-worker.js';

			navigator.serviceWorker
				.register(swPath, {
					updateViaCache: 'none'
				})
				.then((registration) => {
					console.log('Service Worker registered:', registration);

					// Only check for updates if service worker is active
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

					// Check for updates periodically
					setInterval(checkForUpdates, 60000);
				})
				.catch((error) => {
					console.warn('Service Worker registration failed:', error);
				});
		}
	});

	let filterOptions = $derived(extractFilterOptions($gamesStore));

	let currentActiveTab = $derived(get(appStore.activeTab));

	// Handle tab changes with effect
	$effect(() => {
		const tab = get(appStore.activeTab);
		// Clear filters when switching to tier list page
		if (tab === 'tierlist') {
			filtersStore.resetAllFilters();
			filtersStore.setSearchTerm('');
			// Update URL to reflect clean state
			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
			appStore.writeToURLWithFilters(filtersStore);
		}
	});

	// Initialize app - localStorage is already loaded, only handle game parameter for detail modal
	$effect(() => {
		if (!initialized) {
			// Handle game parameter for detail modal
			const gameSlug = page.url.searchParams.get('game');
			if (gameSlug) {
				// Find the game and open modal (will be handled by modal store)
				setTimeout(() => {
					const game = gamesStore.getGameBySlug(gameSlug);
					if (game) {
						modalStore.openViewModal(game);
					}
				}, 100); // Small delay to ensure games are loaded
			}
			initialized = true;
		}
	});

	// Dynamically load DetailModal when needed
	$effect(() => {
		if ($modalStore.isOpen && !DetailModalComponent) {
			import('$lib/components/DetailModal.svelte')
				.then((module) => {
					DetailModalComponent = module.default;
				})
				.catch((err) => {
					console.error('Failed to load DetailModal:', err);
				});
		}
	});

	// Handle URL updates for all filters (debounced)
	let currentFilterState: import('$lib/stores/filters').FilterState | null = null;

	filtersStore.subscribe(($filters) => {
		currentFilterState = $filters;
	});

	$effect(() => {
		if (initialized) {
			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
			urlUpdateTimeout = setTimeout(() => {
				appStore.writeToURLWithFilters(filtersStore);
			}, 300);
		}
	});

	$effect(() => {
		const currentURL = page.url;
		const searchParam = currentURL.searchParams.get('search') || '';
		const platformsParam = currentURL.searchParams.get('platforms') || '';
		const genresParam = currentURL.searchParams.get('genres') || '';
		const tiersParam = currentURL.searchParams.get('tiers') || '';
		const ratingPresentationParam = currentURL.searchParams.get('ratingPresentation') || '';
		const ratingStoryParam = currentURL.searchParams.get('ratingStory') || '';
		const ratingGameplayParam = currentURL.searchParams.get('ratingGameplay') || '';
		const ratingTotalParam = currentURL.searchParams.get('ratingTotal') || '';

		// Check if URL parameters differ from current filter state
		const urlState = {
			searchQuery: searchParam,
			selectedPlatforms: platformsParam ? platformsParam.split(',') : [],
			selectedGenres: genresParam ? genresParam.split(',') : [],
			selectedTiers: tiersParam ? tiersParam.split(',') : [],
			ratingRanges: {
				presentation: ratingPresentationParam
					? (ratingPresentationParam.split(',').map(Number) as [number, number])
					: [0, 10],
				story: ratingStoryParam
					? (ratingStoryParam.split(',').map(Number) as [number, number])
					: [0, 10],
				gameplay: ratingGameplayParam
					? (ratingGameplayParam.split(',').map(Number) as [number, number])
					: [0, 10],
				total: ratingTotalParam
					? (ratingTotalParam.split(',').map(Number) as [number, number])
					: [0, 20]
			}
		};

		// Simple comparison to detect changes (could be more sophisticated)
		const urlStateString = JSON.stringify(urlState);
		const currentStateString = JSON.stringify(currentFilterState);

		if (initialized && urlStateString !== currentStateString) {
			filtersStore.readFromURL(page.url.searchParams);
		}

		// URL parameters changed, trigger filter update
		filtersStore.readFromURL(page.url.searchParams);
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
		filtersStore.setSearchTerm(''); // Clear search
		appStore.activeTab.set('all'); // Switch to first tab
		// Immediately update URL to reflect reset state
		if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
		appStore.writeToURLWithFilters(filtersStore);
		// Scroll to top with multiple methods for reliability
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			// Double scroll ensures works on all browsers
			requestAnimationFrame(() => {
				window.scrollTo(0, 0);
				document.documentElement.scrollTop = 0;
			});
		}, 200);
	}
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Gaming Tracker</title>

	<!-- Performance optimizations for font loading -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />

	<!-- Preload common system fonts for better performance -->
	<link rel="dns-prefetch" href="//fonts.googleapis.com" />
	<link rel="dns-prefetch" href="//fonts.gstatic.com" />
</svelte:head>

<div
	style="background-color: var(--color-background);"
	class="bg-background text-foreground h-full min-h-screen"
>
	<Header />
	<section class="filter-section sticky top-[104px] z-30 md:top-[110px]">
		<div class="container mx-auto space-y-4 px-6 py-4">
			<SearchBar />

			{#if currentActiveTab !== 'tierlist'}
				<div class="flex flex-col items-center gap-4">
					<div class="flex flex-wrap items-center justify-center gap-3">
						<FilterDropdown
							type="platforms"
							label="Platforms"
							options={filterOptions.platforms}
							selectedOptions={selectedPlatforms}
						/>
						<FilterDropdown
							type="genres"
							label="Genres"
							options={filterOptions.genres}
							selectedOptions={selectedGenres}
						/>
						<FilterDropdown
							type="tiers"
							label="Tiers"
							options={filterOptions.tiers}
							selectedOptions={selectedTiers}
						/>
						<RatingsFilter />
						<button
							class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors"
							title="Reset all filters"
							onclick={resetFilters}
						>
							↻ Reset
						</button>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6">
		<div class="container mx-auto">
			{@render children?.()}
		</div>
	</main>

	{#if DetailModalComponent}
		<DetailModalComponent />
	{/if}
</div>

<style>
	/* Height calculations for fixed/sticky positioning */
	:global(.h-15) {
		height: 60px;
	}
	:global(.h-12\.5) {
		height: 50px;
	}

	/* Filter section with proper background */
	.filter-section {
		background-color: var(--color-background);
		border-color: var(--color-border);
	}

	/* Reset button text color */
	.reset-button {
		color: var(--color-text-primary);
	}

	/* Ensure proper spacing for content area */
	:global(.pt-\[calc\(60px\+50px\+100px\)\]) {
		padding-top: calc(60px + 50px + 100px);
	}
</style>
