import type { JSX } from '@solidjs/web';
import { createMemo, For, Show } from 'solid-js';
import TierRow from '#lib/components/TierRow.js';
import type { Game, TierValue } from '#lib/types/game.js';
import './TierListView.css';

export interface TierListViewProps {
	filteredGames: Game[];
	onOpenModal?: (game: Game, displayedGames: Game[]) => void;
}

function buildTierList(games: Game[]): Record<string, Game[]> {
	const gamesByTier: Record<string, Game[]> = {
		'S - Masterpiece': [],
		'A - Amazing': [],
		'B - Great': [],
		'C - Good': [],
		'D - Decent': [],
		'E - Bad': [],
	};

	games
		.filter((game): game is Game & { tier: TierValue } => game.tier !== null)
		.forEach((game) => {
			if (gamesByTier[game.tier]) {
				gamesByTier[game.tier].push(game);
			}
		});

	return gamesByTier;
}

export default function TierListView(props: TierListViewProps): JSX.Element {
	const tierList = createMemo(() => buildTierList(props.filteredGames ?? []));
	const allGames = createMemo(() => Object.values(tierList()).flat());
	const rows = createMemo(() =>
		Object.entries(tierList())
			.filter(([, games]) => games.length > 0)
			.map(([tierName, games]) => ({
				tierName,
				games,
				allGames: allGames(),
			}))
	);

	return (
		<Show
			when={rows().length > 0}
			fallback={
				<div class="empty-state tier-list-empty-state">
					<h2>No tiered games found</h2>
				</div>
			}
		>
			<div class="tier-list-container max-w-none">
				<For each={rows()} keyed={(row) => row.tierName}>
					{(row) => (
						<TierRow
							tierName={row().tierName}
							games={row().games}
							allGames={row().allGames}
							onOpenModal={props.onOpenModal}
						/>
					)}
				</For>
			</div>
		</Show>
	);
}
