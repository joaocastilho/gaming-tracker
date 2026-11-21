import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import GameCard from '#lib/components/GameCard.js';
import { CARD_WIDTHS } from '#lib/constants/fonts.js';
import { gamesStore } from '#lib/stores/games.js';
import { windowSize } from '#lib/stores/window.js';
import type { Game } from '#lib/types/game.js';
import { getTierClass, getTierDisplayName } from '#lib/utils/tierUtils.js';
import './TierRow.css';

export interface TierRowProps {
	tierName: string;
	games: Game[];
	allGames: Game[];
	onOpenModal?: (game: Game, displayedGames: Game[]) => void;
}

const TIER_COLUMN_MIN = 300;
const TIER_GAP = 16;

export default function TierRow(props: TierRowProps): JSX.Element {
	const [displayedCount, setDisplayedCount] = createSignal(20);
	const [sentinelEl, setSentinelEl] = createSignal<HTMLDivElement | null>(null);

	const displayedGames = createMemo(() => props.games.slice(0, displayedCount()));

	const estimatedRowHeight = createMemo(() => {
		const list = props.games;
		if (list.length === 0) return 300;
		const containerWidth = windowSize.width - 32;
		const columns = Math.max(1, Math.floor((containerWidth - TIER_GAP) / (TIER_COLUMN_MIN + TIER_GAP)));
		const rows = Math.ceil(list.length / columns);

		let maxHeight = 0;
		for (let i = 0; i < Math.min(list.length, columns); i++) {
			const game = list[i];
			const heights = gamesStore.cardHeights.get(game.id)?.[CARD_WIDTHS.small];
			if (heights) {
				maxHeight = Math.max(maxHeight, heights.totalHeight);
			}
		}

		const headerHeight = 60;
		const rowHeight = maxHeight || 350;
		return headerHeight + rows * rowHeight + (rows - 1) * TIER_GAP;
	});

	createEffect(
		() => sentinelEl(),
		(node) => {
			if (!node || typeof IntersectionObserver === 'undefined') return;
			const observer = new IntersectionObserver((entries) => {
				if (entries[0]?.isIntersecting) {
					setDisplayedCount((c) => c + 20);
				}
			});
			observer.observe(node);
			return () => observer.disconnect();
		}
	);

	return (
		<div class="tier-section" style={{ 'contain-intrinsic-size': `1px ${estimatedRowHeight()}px` }}>
			<h3 class={['tier-header', getTierClass(props.tierName)]}>
				{getTierDisplayName(props.tierName)}
				<span class="tier-count">
					{props.games.length} {props.games.length === 1 ? 'game' : 'games'}
				</span>
			</h3>
			<div class="tier-games-grid">
				<For each={displayedGames()}>
					{(game) => (
						<div class="tier-card-wrapper">
							<GameCard
								game={game}
								size="tierlist"
								showTierBadge={false}
								onOpenModal={props.onOpenModal}
								displayedGames={props.allGames}
							/>
						</div>
					)}
				</For>

				<Show when={displayedCount() < props.games.length}>
					<div class="sentinel" ref={setSentinelEl} />
				</Show>
			</div>
		</div>
	);
}
