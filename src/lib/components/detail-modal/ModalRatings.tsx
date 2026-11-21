import { Award, Gamepad2, NotebookPen, Presentation } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { Dynamic } from '@solidjs/web';
import { createMemo, For, Match, Show, Switch } from 'solid-js';
import type { Game } from '#lib/types/game.js';
import { getTierClass, getTierDisplayName } from '#lib/utils/tierUtils.js';
import './ModalRatings.css';

export interface ModalRatingsProps {
	game: Game;
}

function fillPercent(value: number | null): number {
	if (value === null) return 0;
	return Math.max(0, Math.min(100, value * 10));
}

export default function ModalRatings(props: ModalRatingsProps): JSX.Element {
	const ratings = createMemo(() => [
		{
			label: 'Presentation',
			value: props.game.ratingPresentation,
			icon: Presentation,
			tone: 'presentation',
		},
		{ label: 'Story', value: props.game.ratingStory, icon: NotebookPen, tone: 'story' },
		{ label: 'Gameplay', value: props.game.ratingGameplay, icon: Gamepad2, tone: 'gameplay' },
	]);

	const tierLetter = createMemo(() => props.game.tier?.charAt(0) ?? '');
	const tierName = createMemo(() =>
		props.game.tier ? getTierDisplayName(props.game.tier).replace(/^[A-Z]\s*-\s*/, '') : ''
	);

	function renderScoreBadge(compact: boolean): JSX.Element {
		return (
			<Switch fallback={<span class={['status-badge planned-badge', { compact }]}>PLANNED</span>}>
				<Match when={props.game.status === 'Completed'}>
					<span class={['status-badge score-badge', { compact, 'is-empty': props.game.score === null }]}>
						<Award size={compact ? 18 : 26} aria-hidden="true" />
						<span class="score-num">{props.game.score ?? '-'}</span>
						<Show when={props.game.score !== null}>
							<span class="score-max">/20</span>
						</Show>
					</span>
				</Match>
				<Match when={props.game.status === 'Playing'}>
					<span class={['status-badge playing-badge', { compact }]}>PLAYING</span>
				</Match>
			</Switch>
		);
	}

	function renderTierBadge(compact: boolean): JSX.Element {
		return (
			<Show when={props.game.status === 'Completed' && props.game.tier}>
				<span class={['verdict-tier tier-badge', getTierClass(props.game.tier ?? ''), { compact }]}>
					<span class="verdict-letter">{tierLetter()}</span>{' '}
					<span class="verdict-separator" aria-hidden="true">
						–
					</span>{' '}
					<span class="verdict-name">{tierName()}</span>
				</span>
			</Show>
		);
	}

	return (
		<div class="ratings-wrapper mt-6 md:mt-0 md:flex md:flex-1 md:flex-col">
			<div class="landscape-hidden-title mb-4 flex items-center gap-3 md:mt-auto md:mb-4">
				<h3
					class="text-base font-bold tracking-[0.2em] uppercase md:text-lg"
					style={{ color: 'var(--color-text-tertiary)' }}
				>
					Ratings
				</h3>
				<div class="h-[1px] flex-1 opacity-50" style={{ 'background-color': 'var(--color-border)' }} />
			</div>

			<div class="ratings-row">
				<dl class="ratings-container">
					<For each={ratings()} keyed={(rating) => rating.label}>
						{(rating) => (
							<div
								class={['rating-card', { 'is-empty': rating().value === null }]}
								data-tone={rating().tone}
								style={{ '--rating-fill': `${fillPercent(rating().value)}%` }}
								title={
									rating().value === null ? `${rating().label}: not rated` : `${rating().label}: ${rating().value}/10`
								}
							>
								<dt class="rating-label">{rating().label}</dt>
								<dd class="rating-value">
									<Dynamic component={rating().icon} size={20} class="rating-icon" aria-hidden="true" />
									<span class="rating-number" aria-hidden="true">
										{rating().value ?? '-'}
									</span>
									<span class="rating-scale" aria-hidden="true">
										/10
									</span>
									<span class="sr-only">{rating().value === null ? 'not rated' : `${rating().value} out of 10`}</span>
								</dd>
								<div class="rating-meter" aria-hidden="true">
									<span class="rating-meter-fill" />
								</div>
							</div>
						)}
					</For>
				</dl>

				<div class="landscape-score">
					{renderTierBadge(true)}
					{renderScoreBadge(true)}
				</div>
			</div>

			<div class="score-result verdict-strip mt-4">
				{renderTierBadge(false)}
				{renderScoreBadge(false)}
			</div>
		</div>
	);
}
