import type { JSX } from '@solidjs/web';
import { Show } from 'solid-js';
import { editorStore } from '#lib/stores/editor.js';
import { gamesStore } from '#lib/stores/games.js';
import type { Game } from '#lib/types/game.js';
import { dev } from '#lib/utils/env.js';
import './DeleteConfirmModal.css';

export interface DeleteConfirmModalProps {
	game: Game | null;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onConfirm?: () => void;
	onCancel?: () => void;
}

export default function DeleteConfirmModal(props: DeleteConfirmModalProps): JSX.Element {
	async function handleConfirm(): Promise<void> {
		if (props.game) {
			editorStore.deletePendingGame(props.game.id);
			if (dev) {
				await editorStore.saveLocally(gamesStore.games);
			}
		}
		props.onOpenChange?.(false);
		props.onConfirm?.();
	}

	function handleCancel(): void {
		props.onOpenChange?.(false);
		props.onCancel?.();
	}

	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleCancel();
		}
	}

	return (
		<Show when={props.open && props.game}>
			{(game) => (
				// biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop dismisses on outside click
				<div
					class="delete-backdrop"
					role="presentation"
					onClick={handleBackdropClick}
					onKeyDown={handleKeydown}
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
							Are you sure you want to delete <strong>{game().title}</strong>? This action will be applied when you save
							your changes.
						</p>

						<div class="actions">
							<button type="button" class="secondary" onClick={handleCancel}>
								Cancel
							</button>
							<button type="button" class="danger" onClick={() => void handleConfirm()}>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}
