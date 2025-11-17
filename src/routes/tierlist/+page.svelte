<script lang="ts">
	import { gamesStore } from '$lib/stores/games';
	import { modalStore } from '$lib/stores/modal';
	import TierListView from '$lib/views/TierListView.svelte';
	import type { Game } from '$lib/types/game';

	let filteredGames = $derived(
		$gamesStore.filter((game: Game) => game.status === 'Completed' && game.tier)
	);

	function handleOpenModal(game: Game, displayedGames: Game[]) {
		modalStore.openViewModal(game, displayedGames);
	}
</script>

<div class="page-container">
	<TierListView {filteredGames} onOpenModal={handleOpenModal} />
</div>

<style>
	.page-container {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}
</style>
