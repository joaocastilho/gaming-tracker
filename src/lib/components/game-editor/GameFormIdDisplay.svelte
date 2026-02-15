<script lang="ts">
	interface Props {
		gameId: string;
		onCopy: () => void;
		copied: boolean;
	}

	let { gameId, onCopy, copied }: Props = $props();
</script>

<div class="full cover-path">
	<span class="label-text">Game ID</span>
	<div
		class="read-only-field copyable large-id"
		role="button"
		tabindex="0"
		onclick={onCopy}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onCopy();
			}
		}}
		title="Click to copy ID"
	>
		{#if copied}
			<span style="color: #4ade80; font-weight: 600;">Copied!</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="#4ade80"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
		{:else}
			<span>{gameId || '(Auto-generated)'}</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="icon-copy"
			>
				<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
				<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
			</svg>
		{/if}
	</div>
</div>

<style>
	.full {
		grid-column: 1 / -1;
	}

	.cover-path {
		margin-top: 1.5rem;
	}

	.label-text {
		display: block;
		font-size: 0.8rem;
		color: #94a3b8;
		font-weight: 500;
		margin-bottom: 0.35rem;
	}

	.read-only-field {
		padding: 0.5rem 0.75rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 0.5rem;
		color: #64748b;
		font-family: monospace;
		font-size: 0.8rem;
	}

	.read-only-field.copyable {
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.read-only-field.copyable:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #e2e8f0;
	}

	.read-only-field.copyable:active {
		background: rgba(255, 255, 255, 0.15);
	}

	.large-id {
		font-size: 1rem;
		padding: 0.75rem 1rem;
		background: rgba(0, 0, 0, 0.3);
		border-color: rgba(148, 163, 253, 0.2);
	}
</style>
