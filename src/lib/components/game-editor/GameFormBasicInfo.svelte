<script lang="ts">
	import type { Game } from '../../types/game.js';

	interface Props {
		working: Game;
		allGames: Game[];
	}

	let { working, allGames }: Props = $props();

	const uniquePlatforms = $derived([...new Set(allGames.map((g) => g.platform))].sort());
	const uniqueGenres = $derived([...new Set(allGames.map((g) => g.genre))].sort());
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
</script>

<div class="form-row">
	<div class="form-group">
		<label for="title">Title *</label>
		<input id="title" type="text" bind:value={working.title} required />
	</div>
</div>

<div class="form-row three-col">
	<div class="form-group">
		<label for="platform">Platform *</label>
		<select id="platform" bind:value={working.platform} required>
			<option value="">Select...</option>
			{#each uniquePlatforms as platform (platform)}
				<option value={platform}>{platform}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="genre">Genre *</label>
		<select id="genre" bind:value={working.genre} required>
			<option value="">Select...</option>
			{#each uniqueGenres as genre (genre)}
				<option value={genre}>{genre}</option>
			{/each}
		</select>
	</div>

	<div class="form-group">
		<label for="year">Year *</label>
		<select id="year" bind:value={working.year} required>
			{#each years as year (year)}
				<option value={year}>{year}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.form-row {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.form-row.three-col {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
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
</style>
