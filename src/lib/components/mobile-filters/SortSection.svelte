<script lang="ts">
	import { ArrowUpDown } from 'lucide-svelte';
	import RatingsSort from '$lib/components/RatingsSort.svelte';
</script>

<div class="mobile-filter-section">
	<h3 class="mobile-filter-section-title">
		<ArrowUpDown size={16} class="section-icon" />
		Sort By
	</h3>
	<div class="mobile-sort-options">
		<RatingsSort />
	</div>
</div>

<style>
	.mobile-filter-section {
		margin-bottom: 16px;
	}

	.mobile-filter-section:last-child {
		margin-bottom: 0;
		padding-bottom: 80px;
	}

	.mobile-filter-section-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 12px;
	}

	.mobile-filter-section-title :global(.section-icon) {
		color: var(--color-text-secondary);
	}

	.mobile-sort-options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
	}
</style>
