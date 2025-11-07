<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';

	interface Props {
		filteredGames: Game[];
		activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
	}

	let { filteredGames, activeTab }: Props = $props();

	// Filter games based on active tab
	let displayedGames = $derived(() => {
		switch (activeTab) {
			case 'completed':
				return filteredGames
					.filter((game) => game.status === 'Completed')
					.toSorted((a, b) => {
						if (!a.finishedDate && !b.finishedDate) return 0;
						if (!a.finishedDate) return 1;
						if (!b.finishedDate) return -1;
						return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
					});
			case 'planned':
				return filteredGames
					.filter((game) => game.status === 'Planned')
					.toSorted((a, b) => a.title.localeCompare(b.title));
			case 'all':
			default:
				return filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
		}
	});

	const [send, receive] = crossfade({
		duration: 200,
		easing: quintOut,
		fallback() {
			return {
				duration: 0
			};
		}
	});

	const ABOVE_FOLD_COUNT = 12;
</script>

<div
	class="game-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
>
	{#each displayedGames() as game, index (game.id)}
		<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
			<GameCard {game} isAboveFold={index < ABOVE_FOLD_COUNT} />
		</div>
	{/each}
</div>
