import type { JSX } from '@solidjs/web';
import { createMemo, onSettled, Show } from 'solid-js';
import { imageErrorStore } from '#lib/stores/imageErrors.js';
import { offlineStore } from '#lib/stores/offline.js';
import type { Game } from '#lib/types/game.js';
import { generateSrcset } from '#lib/utils/imageSrcset.js';
import { getTierClass } from '#lib/utils/tierUtils.js';
import './ContinuumPreview.css';

export interface ContinuumPreviewProps {
	game: Game;
	direction: 'previous' | 'next';
	depth: 0 | 1;
	emphasis?: number;
	suppressed?: boolean;
	onSelect: (game: Game) => void;
	enterFromX?: number;
	enterDuration?: number;
}

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';
const PLACEHOLDER_SRCSET = `${PLACEHOLDER_SRC} 300w`;

const POSITION_CLASSES: Record<'previous' | 'next', [string, string]> = {
	previous: ['left-[calc(50%-824px)]', 'left-[calc(50%-1048px)]'],
	next: ['left-[calc(50%+616px)]', 'left-[calc(50%+840px)]'],
};

export default function ContinuumPreview(props: ContinuumPreviewProps): JSX.Element {
	let buttonEl: HTMLButtonElement | undefined;

	const isPrevious = createMemo(() => props.direction === 'previous');
	const positionClass = createMemo(() => POSITION_CLASSES[props.direction][props.depth]);
	const emphasis = createMemo(() => props.emphasis ?? 0);
	const suppressed = createMemo(() => props.suppressed ?? false);

	const coverSrc = createMemo(() => {
		if (!offlineStore.isOnline || !props.game.coverImage || props.game.coverImage.includes('placeholder_cover')) {
			return PLACEHOLDER_SRC;
		}
		const absolute = props.game.coverImage.startsWith('/') ? props.game.coverImage : `/${props.game.coverImage}`;
		return imageErrorStore.hasFailed(absolute) ? PLACEHOLDER_SRC : absolute;
	});

	const coverSrcset = createMemo(() => {
		if (!offlineStore.isOnline || coverSrc() === PLACEHOLDER_SRC) return PLACEHOLDER_SRCSET;
		const valid = generateSrcset(coverSrc())
			.split(',')
			.map((part) => part.trim())
			.filter((part) => !imageErrorStore.hasFailed(part.split(' ')[0]));
		return valid.length > 0 ? valid.join(', ') : PLACEHOLDER_SRCSET;
	});

	const tierLetter = createMemo(() => props.game.tier?.charAt(0) ?? '');

	const scoreLabel = createMemo(() => {
		if (props.game.status === 'Completed') return props.game.score === null ? 'COMPLETED' : `${props.game.score}/20`;
		if (props.game.status === 'Playing') return 'PLAYING';
		return 'PLANNED';
	});

	onSettled(() => {
		const duration = props.enterDuration ?? 200;
		const x = props.enterFromX ?? 40;
		if (buttonEl && duration > 0 && typeof buttonEl.animate === 'function') {
			buttonEl.animate(
				[
					{ transform: `translateX(${x}px)`, opacity: 0 },
					{ transform: 'translateX(0px)', opacity: 0.78 },
				],
				{ duration, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' }
			);
		}
	});

	function handleImageError(event: Event): void {
		const target = event.currentTarget;
		if (!(target instanceof HTMLImageElement)) return;

		const failedSrc = target.currentSrc || target.src;
		if (failedSrc && !failedSrc.includes('placeholder_cover')) {
			imageErrorStore.markFailed(failedSrc);
		}

		target.src = PLACEHOLDER_SRC;
		target.srcset = PLACEHOLDER_SRCSET;
	}

	return (
		<div
			class={[
				'continuum-preview-slot pointer-events-none absolute top-1/2',
				positionClass(),
				isPrevious() ? 'origin-right' : 'origin-left',
			]}
			style={{
				'--preview-emphasis': String(emphasis()),
				'--preview-visibility': suppressed() ? '0' : '1',
			}}
		>
			<button
				ref={(el) => {
					buttonEl = el;
				}}
				type="button"
				class={[
					'continuum-preview pointer-events-auto relative block h-[312px] w-[208px] cursor-pointer overflow-hidden rounded-xl bg-neutral-900 text-left shadow-2xl outline-none transition-transform duration-200 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white/80',
					isPrevious() ? 'origin-right' : 'origin-left',
					{ suppressed: suppressed() },
				]}
				aria-label={`View ${props.game.title}, ${props.direction} game`}
				aria-hidden={suppressed() ? 'true' : undefined}
				tabindex={suppressed() ? -1 : undefined}
				onClick={() => props.onSelect(props.game)}
			>
				<img
					src={coverSrc()}
					srcset={coverSrcset()}
					sizes="208px"
					alt=""
					class="absolute inset-0 h-full w-full object-cover"
					loading="eager"
					draggable={false}
					onError={handleImageError}
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

				<Show when={tierLetter()}>
					<span
						class={[
							'tier-badge absolute top-2 flex h-7 w-7 items-center justify-center rounded-md text-xs',
							getTierClass(props.game.tier ?? ''),
							isPrevious() ? 'right-2' : 'left-2',
						]}
					>
						{tierLetter()}
					</span>
				</Show>

				<div
					class={['absolute inset-x-0 bottom-0 p-3 text-white', isPrevious() ? 'pr-4 text-right' : 'pl-4 text-left']}
				>
					<p
						class={[
							'line-clamp-2 text-sm leading-snug font-semibold drop-shadow',
							isPrevious() ? 'text-right' : 'text-left',
						]}
					>
						{props.game.title}
					</p>
					<div
						class={[
							'mt-1.5 flex items-center gap-2 text-[11px] font-semibold',
							isPrevious() ? 'justify-end' : 'justify-start',
						]}
					>
						<span class="text-white/65">{props.game.year}</span>
						<span class="preview-score" data-status={props.game.status}>
							{scoreLabel()}
						</span>
					</div>
				</div>
			</button>
		</div>
	);
}
