import type { JSX } from '@solidjs/web';
import { createMemo, Show } from 'solid-js';
import { modalStore } from '#lib/stores/modal.js';
import type { Game } from '#lib/types/game.js';
import GameCardArtwork from './game-card/GameCardArtwork.js';
import GameCardBadges from './game-card/GameCardBadges.js';
import GameCardHeader from './game-card/GameCardHeader.js';
import GameCardInfo from './game-card/GameCardInfo.js';
import './GameCard.css';

export interface GameCardProps {
	game: Game;
	size?: 'small' | 'large' | 'tiny' | 'tierlist';
	showTierBadge?: boolean;
	isAboveFold?: boolean;
	displayedGames?: Game[];
	onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
}

export default function GameCard(props: GameCardProps): JSX.Element {
	let cardElement: HTMLDivElement | undefined;
	const size = createMemo(() => props.size ?? 'small');
	const showTierBadge = createMemo(() => props.showTierBadge !== false);
	const displayedGames = createMemo(() => props.displayedGames ?? []);

	const bgColor = createMemo(() => {
		if (props.game.status === 'Completed') return 'var(--color-surface-completed)';
		if (props.game.status === 'Playing') return 'var(--color-surface-playing, var(--color-surface))';
		return 'var(--color-surface)';
	});

	function handleCardClick(): void {
		const rect = cardElement?.getBoundingClientRect();
		const cardRect = rect
			? {
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height,
				}
			: undefined;

		if (props.onOpenModal) {
			props.onOpenModal(props.game, displayedGames());
		} else {
			modalStore.openViewModal(props.game, displayedGames(), undefined, cardRect);
		}
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick();
		}
	}

	return (
		// biome-ignore lint/a11y/useFocusableInteractive: Solid 2.0 uses lowercase tabindex="0"
		// biome-ignore lint/a11y/useSemanticElements: card contains nested interactive badge buttons
		<div
			ref={(el) => {
				cardElement = el;
			}}
			class={['game-card', { 'tierlist-size': size() === 'tierlist' }]}
			data-status={props.game.status.toLowerCase()}
			style={{ 'background-color': bgColor(), color: 'var(--color-text-primary)' }}
			role="button"
			tabindex="0"
			onClick={handleCardClick}
			onKeyDown={handleKeyDown}
			aria-label={`View details for ${props.game.title}`}
		>
			<GameCardArtwork
				game={props.game}
				size={size()}
				showTierBadge={showTierBadge()}
				isAboveFold={props.isAboveFold ?? false}
				onEditGame={props.onEditGame}
				onDeleteGame={props.onDeleteGame}
			/>

			<div class="game-info">
				<GameCardHeader game={props.game} />

				<Show when={size() === 'small'}>
					<div class="card-content-bottom">
						<GameCardBadges game={props.game} />
						<GameCardInfo game={props.game} />
					</div>
				</Show>
			</div>
		</div>
	);
}
