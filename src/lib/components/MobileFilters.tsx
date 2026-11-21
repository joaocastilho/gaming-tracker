import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { filtersStore } from '#lib/stores/filters.js';
import FilterOptionsPopup from './mobile-filters/FilterOptionsPopup.js';
import FilterSection from './mobile-filters/FilterSection.js';
import MobileFiltersHeader from './mobile-filters/MobileFiltersHeader.js';
import SortSection from './mobile-filters/SortSection.js';
import './MobileFilters.css';

export interface MobileFiltersProps {
	filterOptions: {
		platforms: string[];
		genres: string[];
		tiers: string[];
	};
	showTiersFilter?: boolean;
	showCoOpFilter?: boolean;
	title?: string;
	isOpen?: boolean;
	onClose?: () => void;
}

export default function MobileFilters(props: MobileFiltersProps): JSX.Element {
	const [activeFilterPopup, setActiveFilterPopup] = createSignal<'platforms' | 'genres' | 'tiers' | 'coOp' | null>(
		null
	);
	const [pendingPlatforms, setPendingPlatforms] = createSignal<string[]>([]);
	const [pendingGenres, setPendingGenres] = createSignal<string[]>([]);
	const [pendingTiers, setPendingTiers] = createSignal<string[]>([]);
	const [pendingCoOp, setPendingCoOp] = createSignal<string[]>([]);

	const isOpen = createMemo(() => props.isOpen ?? false);

	createEffect(
		() => ({
			open: isOpen(),
			platforms: filtersStore.state?.platforms ?? [],
			genres: filtersStore.state?.genres ?? [],
			tiers: filtersStore.state?.tiers ?? [],
			coOp: filtersStore.state?.coOp ?? [],
		}),
		({ open, platforms, genres, tiers, coOp }) => {
			if (open) {
				setPendingPlatforms([...platforms]);
				setPendingGenres([...genres]);
				setPendingTiers([...tiers]);
				setPendingCoOp([...coOp]);
			}
		}
	);

	createEffect(
		() => isOpen() || activeFilterPopup() !== null,
		(locked) => {
			if (typeof document !== 'undefined' && locked) {
				document.body.style.overflow = 'hidden';
				return () => {
					document.body.style.overflow = '';
				};
			}
		}
	);

	function applyPendingFilters(
		next?: Partial<{ platforms: string[]; genres: string[]; tiers: string[]; coOp: string[] }>
	): void {
		filtersStore.setFilters({
			platforms: [...(next?.platforms ?? pendingPlatforms())],
			genres: [...(next?.genres ?? pendingGenres())],
			tiers: [...(next?.tiers ?? pendingTiers())],
			coOp: [...(next?.coOp ?? pendingCoOp())],
		});
	}

	function toggleAndApplyPlatform(platform: string): void {
		const curr = pendingPlatforms();
		const next = curr.includes(platform) ? curr.filter((p) => p !== platform) : [...curr, platform];
		setPendingPlatforms(next);
		applyPendingFilters({ platforms: next });
	}

	function toggleAndApplyGenre(genre: string): void {
		const curr = pendingGenres();
		const next = curr.includes(genre) ? curr.filter((g) => g !== genre) : [...curr, genre];
		setPendingGenres(next);
		applyPendingFilters({ genres: next });
	}

	function toggleAndApplyTier(tier: string): void {
		const curr = pendingTiers();
		const next = curr.includes(tier) ? curr.filter((t) => t !== tier) : [...curr, tier];
		setPendingTiers(next);
		applyPendingFilters({ tiers: next });
	}

	function toggleAndApplyCoOp(coOp: string): void {
		const curr = pendingCoOp();
		const next = curr.includes(coOp) ? curr.filter((c) => c !== coOp) : [...curr, coOp];
		setPendingCoOp(next);
		applyPendingFilters({ coOp: next });
	}

	function resetFilters(): void {
		setPendingPlatforms([]);
		setPendingGenres([]);
		setPendingTiers([]);
		setPendingCoOp([]);
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
		filtersStore.setSort(null);
	}

	function applyFilters(): void {
		applyPendingFilters();
		props.onClose?.();
	}

	return (
		<Show when={isOpen()}>
			<div
				class="mobile-filters-modal fixed inset-0 z-50 md:hidden"
				role="dialog"
				aria-modal="true"
				aria-label="Filters and sorting"
				tabindex="-1"
				onKeyDown={(e) => {
					if (e.key === 'Escape') applyFilters();
				}}
			>
				<button
					type="button"
					class="absolute inset-0 border-0 bg-black/50 p-0 backdrop-blur-sm"
					onClick={applyFilters}
					aria-label="Apply filters and close"
				/>
				<div
					class="mobile-filters-container absolute right-0 bottom-0 left-0 max-h-[85vh] overflow-hidden rounded-t-2xl shadow-2xl"
					style={{ 'background-color': 'var(--color-background)', color: 'var(--color-text-primary)' }}
				>
					<MobileFiltersHeader title={props.title} onReset={resetFilters} onClose={applyFilters} />

					<div class="mobile-filters-content">
						<FilterSection
							showTiersFilter={props.showTiersFilter}
							showCoOpFilter={props.showCoOpFilter}
							platformCount={pendingPlatforms().length}
							genreCount={pendingGenres().length}
							tierCount={pendingTiers().length}
							coOpSelected={pendingCoOp().includes('Yes')}
							onPlatformClick={() => setActiveFilterPopup('platforms')}
							onGenreClick={() => setActiveFilterPopup('genres')}
							onTierClick={() => setActiveFilterPopup('tiers')}
							onCoOpClick={() => toggleAndApplyCoOp('Yes')}
						/>

						<SortSection />
					</div>
				</div>

				<Show when={activeFilterPopup() === 'platforms'}>
					<FilterOptionsPopup
						type="platforms"
						options={props.filterOptions.platforms.map((p) => ({ value: p }))}
						selected={pendingPlatforms()}
						onToggle={toggleAndApplyPlatform}
						onReset={() => {
							setPendingPlatforms([]);
							applyPendingFilters({ platforms: [] });
							setActiveFilterPopup(null);
						}}
						onClose={() => setActiveFilterPopup(null)}
						onAccept={(closeAll) => {
							applyPendingFilters();
							setActiveFilterPopup(null);
							if (closeAll) applyFilters();
						}}
					/>
				</Show>

				<Show when={activeFilterPopup() === 'genres'}>
					<FilterOptionsPopup
						type="genres"
						options={props.filterOptions.genres.map((g) => ({ value: g }))}
						selected={pendingGenres()}
						onToggle={toggleAndApplyGenre}
						onReset={() => {
							setPendingGenres([]);
							applyPendingFilters({ genres: [] });
							setActiveFilterPopup(null);
						}}
						onClose={() => setActiveFilterPopup(null)}
						onAccept={(closeAll) => {
							applyPendingFilters();
							setActiveFilterPopup(null);
							if (closeAll) applyFilters();
						}}
					/>
				</Show>

				<Show when={activeFilterPopup() === 'tiers'}>
					<FilterOptionsPopup
						type="tiers"
						options={props.filterOptions.tiers.map((t) => ({ value: t }))}
						selected={pendingTiers()}
						onToggle={toggleAndApplyTier}
						onReset={() => {
							setPendingTiers([]);
							applyPendingFilters({ tiers: [] });
							setActiveFilterPopup(null);
						}}
						onClose={() => setActiveFilterPopup(null)}
						onAccept={(closeAll) => {
							applyPendingFilters();
							setActiveFilterPopup(null);
							if (closeAll) applyFilters();
						}}
					/>
				</Show>
			</div>
		</Show>
	);
}
