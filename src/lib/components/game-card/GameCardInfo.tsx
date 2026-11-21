import { Award, CalendarDays, Gamepad2, NotebookPen, Presentation, Timer } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createMemo, Match, Switch } from 'solid-js';
import type { Game } from '#lib/types/game.js';
import { formatMobileDate, formatShortDate } from '#lib/utils/dateUtils.js';
import './GameCardInfo.css';

export interface GameCardInfoProps {
	game: Game;
}

function formatSmartTime(timeStr: string | null): string {
	if (!timeStr) return 'N/A';
	return timeStr.endsWith(' 0m') ? timeStr.replace(' 0m', '') : timeStr;
}

export default function GameCardInfo(props: GameCardInfoProps): JSX.Element {
	const hasPresentation = createMemo(() => props.game.status === 'Completed' && props.game.ratingPresentation !== null);
	const hasStory = createMemo(() => props.game.status === 'Completed' && props.game.ratingStory !== null);
	const hasGameplay = createMemo(() => props.game.status === 'Completed' && props.game.ratingGameplay !== null);

	return (
		<>
			<div class="time-date-row">
				<div class="time-item" title={props.game.status === 'Completed' ? 'Hours Played' : 'Time to Beat'}>
					<Timer />
					<span>{formatSmartTime(props.game.playtime)}</span>
				</div>
				<div class="date-item" title={props.game.status === 'Completed' ? 'Completed On' : 'Expected Completion'}>
					<CalendarDays />
					<span class="desktop-text">
						{props.game.status === 'Completed' && props.game.finishedDate
							? formatShortDate(props.game.finishedDate)
							: 'Soon'}
					</span>
					<span class="mobile-text">
						{props.game.status === 'Completed' && props.game.finishedDate
							? formatMobileDate(props.game.finishedDate)
							: 'Soon'}
					</span>
				</div>
			</div>

			<div class="ratings-and-score-wrapper">
				<div class="ratings-compact">
					<div
						class={['rating-item', { placeholder: !hasPresentation() }]}
						title={hasPresentation() ? `Presentation: ${props.game.ratingPresentation}/10` : 'Presentation'}
					>
						<Presentation size={32} class={hasPresentation() ? 'text-rose-500' : 'text-muted'} />
						<span class="rating-value">{hasPresentation() ? props.game.ratingPresentation : '-'}</span>
					</div>

					<div
						class={['rating-item', { placeholder: !hasStory() }]}
						title={hasStory() ? `Story: ${props.game.ratingStory}/10` : 'Story'}
					>
						<NotebookPen size={32} class={hasStory() ? 'text-sky-500' : 'text-muted'} />
						<span class="rating-value">{hasStory() ? props.game.ratingStory : '-'}</span>
					</div>

					<div
						class={['rating-item', { placeholder: !hasGameplay() }]}
						title={hasGameplay() ? `Gameplay: ${props.game.ratingGameplay}/10` : 'Gameplay'}
					>
						<Gamepad2 size={32} class={hasGameplay() ? 'text-emerald-500' : 'text-muted'} />
						<span class="rating-value">{hasGameplay() ? props.game.ratingGameplay : '-'}</span>
					</div>
				</div>

				<Switch
					fallback={
						<div class="status-indicator planned-badge">
							<span>PLANNED</span>
						</div>
					}
				>
					<Match when={props.game.status === 'Completed' && props.game.score !== null}>
						<div class="status-indicator score-badge">
							<Award />
							<div class="score-text-wrapper">
								<span class="desktop-text">
									<span class="score-value">{props.game.score}</span>
								</span>
								<span class="mobile-text">
									<span class="score-value">{props.game.score}</span>
								</span>
							</div>
						</div>
					</Match>
					<Match when={props.game.status === 'Playing'}>
						<div class="status-indicator playing-badge">
							<span>PLAYING</span>
						</div>
					</Match>
				</Switch>
			</div>
		</>
	);
}
