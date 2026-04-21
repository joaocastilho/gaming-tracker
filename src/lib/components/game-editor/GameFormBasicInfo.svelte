<script lang="ts">
import type { Game } from '../../types/game.js';

interface Props {
	working: Game;
	allGames: Game[];
}

let { working, allGames }: Props = $props();

const uniquePlatforms = $derived([...new Set(allGames.map((g) => g.platform))].sort());
const uniqueGenres = $derived([...new Set(allGames.map((g) => g.genre))].sort());
</script>

<div class="form-col">
	<label for="title">Title *</label>
	<input id="title" type="text" bind:value={working.title} required />
</div>

<div class="form-row">
	<div class="form-field">
		<label for="platform">Platform *</label>
		<select id="platform" bind:value={working.platform} required>
			<option value="">Select...</option>
			{#each uniquePlatforms as platform (platform)}
				<option value={platform}>{platform}</option>
			{/each}
		</select>
	</div>

	<div class="form-field">
		<label for="genre">Genre *</label>
		<select id="genre" bind:value={working.genre} required>
			<option value="">Select...</option>
			{#each uniqueGenres as genre (genre)}
				<option value={genre}>{genre}</option>
			{/each}
		</select>
	</div>

	<div class="form-field narrow">
		<label for="year">Year *</label>
		<input id="year" type="number" bind:value={working.year} min="1970" max="2099" placeholder="YYYY" required />
	</div>
</div>

<style>
	.form-col {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.form-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1rem;
		align-items: flex-start;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex: 1;
		min-width: 120px;
	}

	.form-field.narrow {
		flex: 0 0 80px;
		max-width: 80px;
	}

	label {
		font-size: 0.8rem;
		color: #94a3b8;
		font-weight: 500;
	}

	input,
	select {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.4);
		background: #0f172a;
		color: #e5e7eb;
		font-size: 0.9rem;
		width: 100%;
		box-sizing: border-box;
		height: 38px;
		font-family: inherit;
		line-height: normal;
		transition:
			border-color 0.2s,
			background-color 0.2s;
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: #6366f1;
		background: #1e293b;
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
