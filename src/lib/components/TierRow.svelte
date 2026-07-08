<script lang="ts">
import type { Game } from '$lib/types/game';
import { getTierClass, getTierDisplayName } from '$lib/utils/tierUtils';
import { gamesStore } from '$lib/stores/games.svelte';
import GameCard from '$lib/components/GameCard.svelte';
import { CARD_WIDTHS } from '$lib/constants/fonts';

interface Props {
	tierName: string;
	games: Game[];
	allGames: Game[];
	onOpenModal?: (game: Game, displayedGames: Game[]) => void;
}

let { tierName, games, allGames, onOpenModal }: Props = $props();

let displayedCount = $state(20);
let displayedGames = $derived(games.slice(0, displayedCount));

const tierColumnMin = 300;
const tierGap = 16;

const estimatedRowHeight = $derived(() => {
	if (games.length === 0) return 300;
	const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 32 : 1200;
	const columns = Math.max(1, Math.floor((containerWidth - tierGap) / (tierColumnMin + tierGap)));
	const rows = Math.ceil(games.length / columns);

	let maxHeight = 0;
	for (let i = 0; i < Math.min(games.length, columns); i++) {
		const game = games[i];
		const heights = gamesStore.cardHeights.get(game.id)?.[CARD_WIDTHS.small];
		if (heights) {
			maxHeight = Math.max(maxHeight, heights.totalHeight);
		}
	}

	const headerHeight = 60;
	const rowHeight = maxHeight || 350;
	return headerHeight + rows * rowHeight + (rows - 1) * tierGap;
});

function intersectionObserver(node: HTMLElement) {
	const observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			displayedCount += 20;
		}
	});

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		},
	};
}
</script>

<div class="tier-section" style="contain-intrinsic-size: 1px {estimatedRowHeight()}px;">
	<h3 class="tier-header {getTierClass(tierName)}">
		{getTierDisplayName(tierName)}
		<span class="tier-count">{games.length} {games.length === 1 ? 'game' : 'games'}</span>
	</h3>
	<div class="tier-games-grid">
		{#each displayedGames as game (game.id)}
			<div class="tier-card-wrapper">
				<GameCard
					{game}
					size="tierlist"
					showTierBadge={false}
					{onOpenModal}
					displayedGames={allGames}
				/>
			</div>
		{/each}

		{#if displayedCount < games.length}
			<div class="sentinel" use:intersectionObserver></div>
		{/if}
	</div>
</div>

<style>
	.tier-section {
		margin-bottom: 2rem;
		content-visibility: auto;
		overflow: hidden;
	}

	.tier-header {
		font-size: 1.5rem;
		font-weight: 600;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: white;
	}

	.tier-count {
		font-size: 1.2rem;
		font-weight: 500;
		opacity: 0.8;
	}

	.tier-games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		justify-content: center;
		gap: 1rem;
		width: 100%;
	}

	.tier-card-wrapper {
		width: 100%;
		min-width: 0;
		overflow: hidden;
	}

	@media (max-width: 767px) {
		.tier-games-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.tier-games-grid {
			gap: 0.5rem;
		}
	}
</style>