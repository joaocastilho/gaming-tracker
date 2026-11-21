import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, For, Match, Switch } from 'solid-js';
import GameCard from '#lib/components/GameCard.js';
import SkeletonGrid from '#lib/components/SkeletonGrid.js';
import VirtualList from '#lib/components/VirtualList.js';
import { editorStore } from '#lib/stores/editor.js';
import type { Game } from '#lib/types/game.js';
import './GamesView.css';

export interface GamesViewProps {
	filteredGames: Game[];
	displayedGames?: Game[];
	onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
	loading?: boolean;
}

interface GameRow {
	id: string;
	games: Game[];
	startIndex: number;
}

export default function GamesView(props: GamesViewProps): JSX.Element {
	const [container, setContainer] = createSignal<HTMLDivElement | null>(null);
	const [columns, setColumns] = createSignal(1);
	const [containerWidth, setContainerWidth] = createSignal(0);

	createEffect(
		() => container(),
		(el) => {
			if (!el || typeof ResizeObserver === 'undefined') return;
			const observer = new ResizeObserver((entries) => {
				const width = entries[0]?.contentRect.width ?? 0;
				if (Math.abs(containerWidth() - width) > 10) {
					setContainerWidth(width);
				}
				if (width < 768) {
					setColumns(2);
				} else {
					const calc = Math.floor((width + 12) / (300 + 12));
					setColumns(Math.min(5, Math.max(1, calc)));
				}
			});
			observer.observe(el);
			return () => observer.disconnect();
		}
	);

	const rows = createMemo<GameRow[]>(() => {
		const list = props.filteredGames;
		if (!list) return [];

		const uniqueGames = new Map<string, Game>();
		for (const game of list) {
			if (game && typeof game.id === 'string' && game.id.length > 0 && !uniqueGames.has(game.id)) {
				uniqueGames.set(game.id, game);
			}
		}

		const validGames = Array.from(uniqueGames.values());
		const cols = columns();
		const result: GameRow[] = [];
		for (let i = 0; i < validGames.length; i += cols) {
			const chunk = validGames.slice(i, i + cols);
			const firstGameId = chunk[0]?.id || 'empty';
			result.push({
				id: `row-${i}-${firstGameId}`,
				games: chunk,
				startIndex: i,
			});
		}
		return result;
	});

	const itemHeight = createMemo(() => {
		const width = containerWidth();
		if (!width) return 600;
		const cardWidth = width < 768 ? (width - 12) / 2 : 300;
		const coverHeight = cardWidth * 1.5;
		const infoHeight = width < 768 ? 220 : 250;
		const paddingBottom = 20;
		return Math.floor(coverHeight + infoHeight + paddingBottom);
	});

	return (
		<div ref={setContainer} class="game-gallery-container">
			<Switch>
				<Match when={(props.filteredGames ?? []).length > 0}>
					<VirtualList
						items={rows()}
						itemHeight={itemHeight()}
						useWindowScroll={true}
						overscan={4}
						keyExtractor={(row) => row?.id ?? 'row'}
						className="game-gallery-virtual"
						renderItem={(row, isPriority) => (
							<div class="game-row pb-5" style={{ height: `${itemHeight()}px` }}>
								<For each={row.games}>
									{(game, i) => (
										<GameCard
											game={game}
											size="small"
											showTierBadge={true}
											isAboveFold={isPriority && i() < 4}
											onOpenModal={props.onOpenModal}
											onEditGame={props.onEditGame}
											onDeleteGame={props.onDeleteGame}
											displayedGames={props.filteredGames}
										/>
									)}
								</For>
							</div>
						)}
					/>
				</Match>
				<Match when={props.loading}>
					<SkeletonGrid />
				</Match>
				<Match when={editorStore.editorMode}>
					<div class="empty-editor-hint">
						<p>No games found for this view.</p>
						<p class="sub">Use the editor tools to add entries.</p>
					</div>
				</Match>
			</Switch>
		</div>
	);
}
