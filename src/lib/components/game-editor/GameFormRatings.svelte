<script lang="ts">
	import { formatRating, TIER_VALUES } from '../../validation/game.js';
	import type { Game } from '../../types/game.js';

	interface Props {
		working: Game;
	}

	let { working }: Props = $props();
</script>

<div class="ratings-section">
	<div class="full divider"></div>
	<div class="full section-header">Ratings</div>

	<div class="rating-slider">
		<div class="label-row">
			<span>Presentation</span>
			<span class="val">{formatRating(working.ratingPresentation)}</span>
		</div>
		<input type="range" min="0" max="10" step="1" bind:value={working.ratingPresentation} />
	</div>

	<div class="rating-slider">
		<div class="label-row">
			<span>Story</span>
			<span class="val">{formatRating(working.ratingStory)}</span>
		</div>
		<input type="range" min="0" max="10" step="1" bind:value={working.ratingStory} />
	</div>

	<div class="rating-slider">
		<div class="label-row">
			<span>Gameplay</span>
			<span class="val">{formatRating(working.ratingGameplay)}</span>
		</div>
		<input type="range" min="0" max="10" step="1" bind:value={working.ratingGameplay} />
	</div>

	<div class="score-display">
		<span>Calculated Score:</span>
		<strong>{working.score ?? '-'}</strong>
	</div>

	<label class="full">
		<span>Tier</span>
		<select bind:value={working.tier}>
			<option value={null}>Select Tier...</option>
			{#each TIER_VALUES as t (t)}
				<option value={t}>{t}</option>
			{/each}
		</select>
	</label>
</div>

<style>
	.ratings-section {
		display: contents;
	}

	.full {
		grid-column: 1 / -1;
	}

	.divider {
		height: 1px;
		background: rgba(255, 255, 255, 0.1);
		margin: 0.5rem 0;
	}

	.section-header {
		font-size: 0.9rem;
		font-weight: 600;
		color: #e2e8f0;
		margin-bottom: 0.5rem;
	}

	.rating-slider {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.label-row span:first-child {
		color: #94a3b8;
		font-size: 0.85rem;
	}

	.val {
		color: #fff;
		font-weight: 600;
	}

	input[type='range'] {
		width: 100%;
		accent-color: #6366f1;
		cursor: pointer;
	}

	.score-display {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: flex-end;
		font-size: 1rem;
		color: #cbd5e1;
	}

	.score-display strong {
		color: #818cf8;
		font-size: 1.2rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	label span {
		font-size: 0.8rem;
		color: #94a3b8;
		font-weight: 500;
	}

	select {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.4);
		background: #0f172a;
		color: #e5e7eb;
		font-size: 0.9rem;
	}

	select:focus {
		outline: none;
		border-color: #6366f1;
		background: #1e293b;
	}
</style>
