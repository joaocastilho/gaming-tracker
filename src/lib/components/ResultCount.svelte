<script lang="ts">
interface Props {
	count: number;
	filtered?: boolean;
}

let { count, filtered = false }: Props = $props();

// Live region: screen readers announce the new count whenever filtering
// changes the visible set.
let label = $derived.by(() => {
	const noun = count === 1 ? 'game' : 'games';
	return filtered ? `${count} ${noun} match your filters` : `${count} ${noun}`;
});
</script>

<p class="result-count" role="status" aria-live="polite">{label}</p>

<style>
	.result-count {
		margin: 0 0 0.75rem 0.25rem;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-tertiary);
	}
</style>
