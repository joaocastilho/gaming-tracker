import type { JSX } from '@solidjs/web';
import { createMemo, Show } from 'solid-js';
import type { Game } from '#lib/types/game.js';
import './GameCardHeader.css';

export interface GameCardHeaderProps {
	game: Game;
}

export default function GameCardHeader(props: GameCardHeaderProps): JSX.Element {
	const derivedSubtitle = createMemo(() => props.game.subtitle ?? props.game.title.match(/\((.+?)\)/)?.[1] ?? null);
	const derivedMainTitle = createMemo(
		() =>
			props.game.mainTitle ?? (derivedSubtitle() ? props.game.title.replace(/\(.+?\)/, '').trim() : props.game.title)
	);

	const titleFontSize = createMemo(() => {
		const len = derivedMainTitle().length;
		if (len > 30) return 'clamp(0.75rem, 5cqi, 0.95rem)';
		if (len > 15) return 'clamp(0.9rem, 6.5cqi, 1.15rem)';
		return 'clamp(1.15rem, 8cqi, 1.4rem)';
	});

	const subtitleFontSize = createMemo(() => ((derivedSubtitle()?.length || 0) > 25 ? '0.7em' : '0.75em'));

	return (
		<div class={['title-section', { 'has-subtitle': Boolean(derivedSubtitle()) }]}>
			<h3 class="game-title" style={{ '--title-font-size': titleFontSize() }}>
				{derivedMainTitle()}
			</h3>
			<Show when={derivedSubtitle()}>
				<span class="game-subtitle" style={{ '--subtitle-font-size': subtitleFontSize() }}>
					{derivedSubtitle()}
				</span>
			</Show>
		</div>
	);
}
