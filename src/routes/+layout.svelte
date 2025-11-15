<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import FilterDropdown from '$lib/components/FilterDropdown.svelte';
	import RatingsSort from '$lib/components/RatingsSort.svelte';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
	import BottomNavigation from '$lib/components/BottomNavigation.svelte';
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
	let currentActiveTab = $derived(get(appStore.activeTab));

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
				.catch((err) => {
					console.error('Failed to load DetailModal:', err);
				});
		}
	});

	let currentFilterState: import('$lib/stores/filters').FilterState | null = null;

	filtersStore.subscribe(($filters) => {
		currentFilterState = $filters;
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
		const currentURL = page.url;
		const tab = get(appStore.activeTab);

		// Only read filters from URL for non-tierlist tabs
		if (tab !== 'tierlist') {
			const searchParam = currentURL.searchParams.get('search') || '';
			const platformsParam = currentURL.searchParams.get('platforms') || '';
			const genresParam = currentURL.searchParams.get('genres') || '';
			const tiersParam = currentURL.searchParams.get('tiers') || '';

			const urlState = {
				searchQuery: searchParam,
				selectedPlatforms: platformsParam ? platformsParam.split(',') : [],
				selectedGenres: genresParam ? genresParam.split(',') : [],
				selectedTiers: tiersParam ? tiersParam.split(',') : []
			};

			const urlStateString = JSON.stringify(urlState);
			const currentStateString = JSON.stringify(currentFilterState);

			if (initialized && urlStateString !== currentStateString) {
				filtersStore.readFromURL(page.url.searchParams);
			}
		}
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
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Gaming Tracker</title>

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />

	<link rel="dns-prefetch" href="//fonts.googleapis.com" />
	<link rel="dns-prefetch" href="//fonts.gstatic.com" />
</svelte:head>

<div
	style="background-color: var(--color-background);"
	class="bg-background text-foreground h-full min-h-screen"
>
	<Header />
	<section class="filter-section top-[104px] z-30 md:top-[110px]">
		<div class="container mx-auto space-y-4 px-6 py-4">
			<SearchBar />

			{#if currentActiveTab !== 'tierlist'}
				<div class="flex flex-col items-center gap-4">
					<div class="flex flex-wrap items-center justify-center gap-3">
						<FilterDropdown
							type="platforms"
							label="Platforms"
							options={filterOptions().platforms}
							selectedOptions={selectedPlatforms}
						/>
						<FilterDropdown
							type="genres"
							label="Genres"
							options={filterOptions().genres}
							selectedOptions={selectedGenres}
						/>
						<FilterDropdown
							type="tiers"
							label="Tiers"
							options={filterOptions().tiers}
							selectedOptions={selectedTiers}
						/>
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
			{@render children?.()}
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
</style>
