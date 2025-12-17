<script lang="ts">
	import { dev } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { editorStore } from '$lib/stores/editor.svelte';
	import { gamesStore } from '$lib/stores/games.svelte';
	import type { Game } from '$lib/types/game';

	interface Props {
		game: Game | null;
		open?: boolean;
		onConfirm?: () => void;
		onCancel?: () => void;
	}

	let { game, open = $bindable(false), onConfirm, onCancel }: Props = $props();
	let saving = $state(false);

	async function handleConfirm() {
		if (game) {
			editorStore.deletePendingGame(game.id);

			// In dev mode: save immediately to local JSON file
			if (dev) {
				saving = true;
				const currentGames = gamesStore.games;
				const finalGames = editorStore.buildFinalGames(currentGames);
				const success = await editorStore.saveLocally(currentGames);
				if (success) {
					gamesStore.setAllGames(finalGames);
					await invalidateAll();
				}
				saving = false;
			}
		}
		open = false;
		onConfirm?.();
	}

	function handleCancel() {
		open = false;
		onCancel?.();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleCancel();
		}
	}
</script>

{#if open && game}
	<div
		class="delete-backdrop"
		role="presentation"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		tabindex="-1"
	>
		<div
			class="delete-modal"
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="delete-title"
			aria-describedby="delete-description"
			tabindex="-1"
		>
			<h2 id="delete-title">Delete Game?</h2>
			<p id="delete-description">
				Are you sure you want to delete <strong>{game.title}</strong>? This action will be applied
				when you save your changes.
			</p>

			<div class="actions">
				<button type="button" class="secondary" onclick={handleCancel}> Cancel </button>
				<button type="button" class="danger" onclick={handleConfirm}> Delete </button>
			</div>
		</div>
	</div>
{/if}

<style>
	.delete-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 70;
	}

	.delete-modal {
		background: #020817;
		color: #e5e7eb;
		border-radius: 16px;
		padding: 1.5rem;
		max-width: 400px;
		width: 90%;
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: #fca5a5;
	}

	p {
		margin: 0 0 1.25rem;
		font-size: 0.9rem;
		line-height: 1.5;
		color: #9ca3af;
	}

	strong {
		color: #e5e7eb;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	button {
		border-radius: 999px;
		padding: 0.4rem 1rem;
		border: none;
		font-size: 0.85rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.secondary {
		background: transparent;
		color: #9ca3af;
	}

	.secondary:hover {
		color: #e5e7eb;
		background: rgba(148, 163, 253, 0.08);
	}

	.danger {
		background: #dc2626;
		color: #fff;
	}

	.danger:hover {
		background: #b91c1c;
	}
</style>
