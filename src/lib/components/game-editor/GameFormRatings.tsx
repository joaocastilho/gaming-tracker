import type { JSX } from '@solidjs/web';
import { For } from 'solid-js';
import type { Game, TierValue } from '#lib/types/game.js';
import { formatRating, TIER_VALUES } from '#lib/validation/game.js';
import './GameFormRatings.css';

export interface GameFormRatingsProps {
	working: Game;
	onUpdate: (patch: Partial<Game>) => void;
}

function isTierValue(value: string): value is TierValue {
	return (TIER_VALUES as readonly string[]).includes(value);
}

export default function GameFormRatings(props: GameFormRatingsProps): JSX.Element {
	return (
		<div class="ratings-section">
			<div class="divider" />
			<div class="section-header">Ratings *</div>

			<div class="sliders-stack">
				<div class="rating-slider">
					<div class="label-row">
						<span>Presentation</span>
						<span class="val">{formatRating(props.working.ratingPresentation)}</span>
					</div>
					<input
						type="range"
						min={0}
						max={10}
						step={1}
						value={props.working.ratingPresentation ?? 0}
						onInput={(e) => props.onUpdate({ ratingPresentation: Number(e.currentTarget.value) })}
					/>
				</div>

				<div class="rating-slider">
					<div class="label-row">
						<span>Story</span>
						<span class="val">{formatRating(props.working.ratingStory)}</span>
					</div>
					<input
						type="range"
						min={0}
						max={10}
						step={1}
						value={props.working.ratingStory ?? 0}
						onInput={(e) => props.onUpdate({ ratingStory: Number(e.currentTarget.value) })}
					/>
				</div>

				<div class="rating-slider">
					<div class="label-row">
						<span>Gameplay</span>
						<span class="val">{formatRating(props.working.ratingGameplay)}</span>
					</div>
					<input
						type="range"
						min={0}
						max={10}
						step={1}
						value={props.working.ratingGameplay ?? 0}
						onInput={(e) => props.onUpdate({ ratingGameplay: Number(e.currentTarget.value) })}
					/>
				</div>
			</div>

			<div class="score-display">
				<span>Calculated Score:</span>
				<strong>{props.working.score ?? '-'}</strong>
			</div>

			<label class="tier-label">
				<span>Tier *</span>
				<select
					value={props.working.tier ?? ''}
					onChange={(e) => {
						const val = e.currentTarget.value;
						props.onUpdate({ tier: isTierValue(val) ? val : null });
					}}
					required
				>
					<option value="">Select Tier...</option>
					<For each={TIER_VALUES}>
						{(t) => (
							<option value={t} selected={t === props.working.tier}>
								{t}
							</option>
						)}
					</For>
				</select>
			</label>
		</div>
	);
}
