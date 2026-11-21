import { Users } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { Show } from 'solid-js';
import { filtersStore } from '#lib/stores/filters.js';
import { windowSize } from '#lib/stores/window.js';
import type { Game } from '#lib/types/game.js';
import { getGenreClasses, getPlatformClasses } from '#lib/utils/colorConstants.js';
import './GameCardBadges.css';

export interface GameCardBadgesProps {
	game: Game;
}

function isValidKeyboardAction(event: KeyboardEvent): boolean {
	return event.key === 'Enter' || event.key === ' ';
}

export default function GameCardBadges(props: GameCardBadgesProps): JSX.Element {
	function handlePlatformClick(event: MouseEvent | KeyboardEvent): void {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) return;
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) return;
		filtersStore.togglePlatform(props.game.platform);
	}

	function handleGenreClick(event: MouseEvent | KeyboardEvent): void {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) return;
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) return;
		filtersStore.toggleGenre(props.game.genre);
	}

	function handleCoOpClick(event: MouseEvent | KeyboardEvent): void {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) return;
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) return;
		filtersStore.toggleCoOp('Yes');
	}

	return (
		<div class="metadata-row">
			<div class="badges-left">
				<button
					type="button"
					class={['badge platform-badge', getPlatformClasses(props.game.platform)]}
					onClick={handlePlatformClick}
					onKeyDown={handlePlatformClick}
					aria-label={`Filter by ${props.game.platform}`}
					title={`Platform: ${props.game.platform}`}
					disabled={windowSize.isMobile}
				>
					{props.game.platform}
				</button>
				<button
					type="button"
					class={['badge genre-badge', getGenreClasses(props.game.genre)]}
					onClick={handleGenreClick}
					onKeyDown={handleGenreClick}
					aria-label={`Filter by ${props.game.genre}`}
					title={`Genre: ${props.game.genre}`}
					disabled={windowSize.isMobile}
				>
					{props.game.genre}
				</button>
			</div>
			<div class="year-right">
				<span class="game-year">{props.game.year}</span>
				<Show when={props.game.coOp === 'Yes'}>
					<button
						type="button"
						class="coop-badge"
						onClick={handleCoOpClick}
						onKeyDown={handleCoOpClick}
						aria-label="Filter by Co-op"
						title="Co-op Available"
						disabled={windowSize.isMobile}
					>
						<Users size={16} class="text-blue-500" />
					</button>
				</Show>
			</div>
		</div>
	);
}
