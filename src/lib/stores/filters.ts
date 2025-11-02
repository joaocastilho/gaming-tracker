import { writable } from 'svelte/store';

type RatingRanges = {
	presentation: [number, number];
	story: [number, number];
	gameplay: [number, number];
	total: [number, number];
};

function createFiltersStore() {
	const searchQuery = writable<string>('');
	const selectedPlatforms = writable<string[]>([]);
	const selectedGenres = writable<string[]>([]);
	const selectedTiers = writable<string[]>([]);
	const ratingRanges = writable<RatingRanges>({
		presentation: [0, 10],
		story: [0, 10],
		gameplay: [0, 10],
		total: [0, 20]
	});

	return {
		searchQuery,
		selectedPlatforms,
		selectedGenres,
		selectedTiers,
		ratingRanges,

		reset() {
			searchQuery.set('');
			selectedPlatforms.set([]);
			selectedGenres.set([]);
			selectedTiers.set([]);
			ratingRanges.set({
				presentation: [0, 10],
				story: [0, 10],
				gameplay: [0, 10],
				total: [0, 20]
			});
		},

		addPlatform(platform: string) {
			selectedPlatforms.update((platforms) => [...platforms, platform]);
		},

		removePlatform(platform: string) {
			selectedPlatforms.update((platforms) => platforms.filter((p) => p !== platform));
		},

		addGenre(genre: string) {
			selectedGenres.update((genres) => [...genres, genre]);
		},

		removeGenre(genre: string) {
			selectedGenres.update((genres) => genres.filter((g) => g !== genre));
		},

		addTier(tier: string) {
			selectedTiers.update((tiers) => [...tiers, tier]);
		},

		removeTier(tier: string) {
			selectedTiers.update((tiers) => tiers.filter((t) => t !== tier));
		},

		setRatingRange(type: keyof RatingRanges, range: [number, number]) {
			ratingRanges.update((ranges) => ({ ...ranges, [type]: range }));
		}
	};
}

export const filtersStore = createFiltersStore();

export type FiltersStore = ReturnType<typeof createFiltersStore>;
