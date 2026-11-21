import type { JSX } from '@solidjs/web';
import { createMemo, For } from 'solid-js';
import type { Game } from '#lib/types/game.js';
import './GameFormBasicInfo.css';

export interface GameFormBasicInfoProps {
	working: Game;
	allGames: Game[];
	onUpdate: (patch: Partial<Game>) => void;
}

export default function GameFormBasicInfo(props: GameFormBasicInfoProps): JSX.Element {
	const uniquePlatforms = createMemo(() => [...new Set(props.allGames.map((g) => g.platform))].sort());
	const uniqueGenres = createMemo(() => [...new Set(props.allGames.map((g) => g.genre))].sort());

	return (
		<div class="game-form-basic">
			<div class="form-col">
				<label for="title">Title *</label>
				<input
					id="title"
					type="text"
					value={props.working.title}
					onInput={(e) => props.onUpdate({ title: e.currentTarget.value })}
					required
				/>
			</div>

			<div class="form-row">
				<div class="form-field">
					<label for="platform">Platform *</label>
					<select
						id="platform"
						value={props.working.platform}
						onChange={(e) => props.onUpdate({ platform: e.currentTarget.value })}
						required
					>
						<option value="">Select...</option>
						<For each={uniquePlatforms()}>{(platform) => <option value={platform}>{platform}</option>}</For>
					</select>
				</div>

				<div class="form-field">
					<label for="genre">Genre *</label>
					<select
						id="genre"
						value={props.working.genre}
						onChange={(e) => props.onUpdate({ genre: e.currentTarget.value })}
						required
					>
						<option value="">Select...</option>
						<For each={uniqueGenres()}>{(genre) => <option value={genre}>{genre}</option>}</For>
					</select>
				</div>

				<div class="form-field narrow">
					<label for="year">Year *</label>
					<input
						id="year"
						type="number"
						value={props.working.year ?? ''}
						onInput={(e) => {
							const parsed = parseInt(e.currentTarget.value, 10);
							if (!Number.isNaN(parsed)) {
								props.onUpdate({ year: parsed });
							}
						}}
						min={1970}
						max={2099}
						placeholder="YYYY"
						required
					/>
				</div>
			</div>
		</div>
	);
}
