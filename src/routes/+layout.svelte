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
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import type { Game } from '$lib/types/game.js';
	import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

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

	// Progressive loading state
	let isLoading = $state(true);
	let hasInitializedGames = $state(false);

	onMount(() => {
		if (data.games) {
			// Handle both promise and already resolved cases
			const gamesPromise = data.games instanceof Promise ? data.games : Promise.resolve(data.games);

			gamesPromise
				.then((resolvedGames) => {
					// Progressive batch loading with 50 games at a time
					const batchSize = 50;
					let index = 0;

					const loadBatch = () => {
						const batch = resolvedGames.slice(index, index + batchSize);
						// Add batch to games store incrementally
						if (!hasInitializedGames) {
							gamesStore.initializeGames(batch);
							hasInitializedGames = true;
						} else {
							// Append additional batches to store
							batch.forEach((game) => gamesStore.addGame(game));
						}

						index += batchSize;

						if (index < resolvedGames.length) {
							// Use requestIdleCallback for non-blocking batch processing
							if ('requestIdleCallback' in window) {
								requestIdleCallback(loadBatch);
							} else {
								setTimeout(loadBatch, 0);
							}
						} else {
							isLoading = false;
						}
					};

					loadBatch();
				})
				.catch((error) => {
					console.error('Failed to load games:', error);
					isLoading = false;
				});
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

	onMount(() => {
		// Core Web Vitals tracking with alerting system
		// LCP (Largest Contentful Paint): Alert if >2.5s
		onLCP((metric) => {
			if (metric.value > 2500) {
				console.warn('LCP performance issue detected:', {
					value: `${Math.round(metric.value)}ms`,
					rating: 'poor',
					threshold: '2.5s',
					delta: `${Math.round(metric.delta)}ms`
				});
			} else {
				console.info('LCP metric:', {
					value: `${Math.round(metric.value)}ms`,
					rating: metric.value <= 2500 ? 'good' : 'needs-improvement'
				});
			}
		});

		// INP (Interaction to Next Paint): Alert if >200ms (replaces FID)
		onINP((metric) => {
			if (metric.value > 200) {
				console.warn('INP performance issue detected:', {
					value: `${Math.round(metric.value)}ms`,
					rating: 'poor',
					threshold: '200ms',
					delta: `${Math.round(metric.delta)}ms`
				});
			} else {
				console.info('INP metric:', {
					value: `${Math.round(metric.value)}ms`,
					rating: metric.value <= 200 ? 'good' : 'needs-improvement'
				});
			}
		});

		// CLS (Cumulative Layout Shift): Alert if >0.1
		onCLS((metric) => {
			if (metric.value > 0.1) {
				console.warn('CLS performance issue detected:', {
					value: metric.value.toFixed(3),
					rating: 'poor',
					threshold: '0.1',
					delta: metric.delta.toFixed(3)
				});
			} else {
				console.info('CLS metric:', {
					value: metric.value.toFixed(3),
					rating: metric.value <= 0.1 ? 'good' : 'needs-improvement'
				});
			}
		});

		// FCP (First Contentful Paint): Monitor as supplementary metric
		onFCP((metric) => {
			console.info('FCP metric:', {
				value: `${Math.round(metric.value)}ms`,
				delta: `${Math.round(metric.delta)}ms`
			});
		});

		// TTFB (Time to First Byte): Monitor as supplementary metric
		onTTFB((metric) => {
			console.info('TTFB metric:', {
				value: `${Math.round(metric.value)}ms`,
				delta: `${Math.round(metric.delta)}ms`
			});
		});
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
				.catch(() => {
					// Silently handle DetailModal loading errors
				});
		}
	});

	$effect(() => {
		// Load FilterDropdown component if not already loaded and needed
		if (!FilterDropdownComponent && browser) {
			import('$lib/components/FilterDropdown.svelte')
				.then((module) => {
					FilterDropdownComponent = module.default;
				})
				.catch(() => {
					// Silently handle FilterDropdown loading errors
				});
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
				<!-- Skeleton loading state -->
				<div class="skeleton-grid">
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
					{#each Array(20) as _, index (index)}
						<div class="skeleton-card">
							<div class="skeleton-cover"></div>
							<div class="skeleton-title"></div>
							<div class="skeleton-meta"></div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Pass resolved data through global state or store -->
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

	/* Skeleton loading styles */
	.skeleton-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.skeleton-card {
		background-color: var(--color-surface);
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-cover {
		background: linear-gradient(
			90deg,
			var(--color-surface) 25%,
			var(--color-border) 50%,
			var(--color-surface) 75%
		);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
		height: 140px;
		border-radius: 0.25rem;
	}

	.skeleton-title {
		background: linear-gradient(
			90deg,
			var(--color-surface) 25%,
			var(--color-border) 50%,
			var(--color-surface) 75%
		);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
		height: 1.25rem;
		border-radius: 0.25rem;
		width: 80%;
	}

	.skeleton-meta {
		background: linear-gradient(
			90deg,
			var(--color-surface) 25%,
			var(--color-border) 50%,
			var(--color-surface) 75%
		);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
		height: 1rem;
		border-radius: 0.25rem;
		width: 60%;
	}

	@keyframes loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
