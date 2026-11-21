<script lang="ts">
import { cubicOut } from 'svelte/easing';

import { imageErrorStore } from '#lib/stores/imageErrors.svelte.js';
import { offlineStore } from '#lib/stores/offline.svelte.js';
import type { Game } from '#lib/types/game.js';
import { generateSrcset } from '#lib/utils/imageSrcset.js';
import { getTierClass } from '#lib/utils/tierUtils.js';

interface Props {
	game: Game;
	direction: 'previous' | 'next';
	depth: 0 | 1;
	/** 0–1, grows as the card is dragged toward this preview. */
	emphasis?: number;
	/** Fades the preview out while its full card takes over the drag. */
	suppressed?: boolean;
	onSelect: (game: Game) => void;
	enterFromX?: number;
	enterDuration?: number;
}

let {
	game,
	direction,
	depth,
	emphasis = 0,
	suppressed = false,
	onSelect,
	enterFromX = 40,
	enterDuration = 200,
}: Props = $props();

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';
const PLACEHOLDER_SRCSET = `${PLACEHOLDER_SRC} 300w`;

// The active card renders 1056px wide at the current zoom. The nav arrows
// occupy a 56px lane 16px outside its edge, so the previews start 88px from
// the card, and the ultrawide pair starts 16px further out.
const POSITION_CLASSES: Record<'previous' | 'next', [string, string]> = {
	previous: ['left-[calc(50%-824px)]', 'left-[calc(50%-1048px)]'],
	next: ['left-[calc(50%+616px)]', 'left-[calc(50%+840px)]'],
};

const isPrevious = $derived(direction === 'previous');
const positionClass = $derived(POSITION_CLASSES[direction][depth]);

const coverSrc = $derived.by(() => {
	if (!offlineStore.isOnline || !game.coverImage || game.coverImage.includes('placeholder_cover')) {
		return PLACEHOLDER_SRC;
	}
	const absolute = game.coverImage.startsWith('/') ? game.coverImage : `/${game.coverImage}`;
	return imageErrorStore.hasFailed(absolute) ? PLACEHOLDER_SRC : absolute;
});

const coverSrcset = $derived.by(() => {
	if (!offlineStore.isOnline || coverSrc === PLACEHOLDER_SRC) return PLACEHOLDER_SRCSET;

	const valid = generateSrcset(coverSrc)
		.split(',')
		.map((part) => part.trim())
		.filter((part) => !imageErrorStore.hasFailed(part.split(' ')[0]));

	return valid.length > 0 ? valid.join(', ') : PLACEHOLDER_SRCSET;
});

const tierLetter = $derived(game.tier?.charAt(0) ?? '');

const scoreLabel = $derived.by(() => {
	if (game.status === 'Completed') return game.score === null ? 'COMPLETED' : `${game.score}/20`;
	if (game.status === 'Playing') return 'PLAYING';
	return 'PLANNED';
});

function previewIn(_node: HTMLElement, { x, duration }: { x: number; duration: number }) {
	if (duration === 0) return { duration: 0 };

	// Fade to the resting opacity of an unemphasised preview so the handoff
	// from the transition to the CSS rule is invisible.
	return {
		duration,
		easing: cubicOut,
		css: (t: number) => `transform: translateX(${(1 - t) * x}px); opacity: ${t * 0.78};`,
	};
}

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
</script>

<div
	class="continuum-preview-slot pointer-events-none absolute top-1/2 {positionClass} {isPrevious
		? 'origin-right'
		: 'origin-left'}"
	style="--preview-emphasis: {emphasis}; --preview-visibility: {suppressed ? 0 : 1};"
>
	<button
		type="button"
		class="continuum-preview pointer-events-auto relative block h-[312px] w-[208px] cursor-pointer overflow-hidden rounded-xl bg-neutral-900 text-left shadow-2xl outline-none transition-transform duration-200 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white/80 {isPrevious
			? 'origin-right'
			: 'origin-left'}"
		class:suppressed
		aria-label="View {game.title}, {direction} game"
		aria-hidden={suppressed ? 'true' : undefined}
		tabindex={suppressed ? -1 : undefined}
		onclick={() => onSelect(game)}
		in:previewIn={{ x: enterFromX, duration: enterDuration }}
	>
		<img
			src={coverSrc}
			srcset={coverSrcset}
			sizes="208px"
			alt=""
			class="absolute inset-0 h-full w-full object-cover"
			loading="eager"
			draggable="false"
			onerror={handleImageError}
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent"></div>

		{#if tierLetter}
			<span
				class="tier-badge {getTierClass(game.tier ?? '')} absolute top-2 flex h-7 w-7 items-center justify-center rounded-md text-xs {isPrevious
					? 'right-2'
					: 'left-2'}"
			>
				{tierLetter}
			</span>
		{/if}

		<div
			class="absolute inset-x-0 bottom-0 p-3 text-white {isPrevious
				? 'pr-4 text-right'
				: 'pl-4 text-left'}"
		>
			<p
				class="line-clamp-2 text-sm leading-snug font-semibold drop-shadow {isPrevious
					? 'text-right'
					: 'text-left'}"
			>
				{game.title}
			</p>
			<div
				class="mt-1.5 flex items-center gap-2 text-[11px] font-semibold {isPrevious
					? 'justify-end'
					: 'justify-start'}"
			>
				<span class="text-white/65">{game.year}</span>
				<span class="preview-score" data-status={game.status}>{scoreLabel}</span>
			</div>
		</div>
	</button>
</div>

<style>
	.continuum-preview-slot {
		transform: translate3d(0, -50%, 0);
	}

	.continuum-preview {
		opacity: calc(0.76 + var(--preview-emphasis, 0) * 0.24);
		will-change: opacity, transform;
		transition:
			opacity 140ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.continuum-preview.suppressed {
		opacity: 0;
		pointer-events: none;
	}

	.continuum-preview:hover,
	.continuum-preview:focus-visible {
		opacity: 1;
	}

	.preview-score {
		color: var(--color-status-score-text);
	}

	.preview-score[data-status='Playing'] {
		color: var(--color-status-playing-text);
	}

	.preview-score[data-status='Planned'] {
		color: var(--color-status-planned-text);
	}

	@media (prefers-reduced-motion: reduce) {
		.continuum-preview-slot,
		.continuum-preview {
			transition: none;
		}

		.continuum-preview:hover,
		.continuum-preview:focus-visible {
			transform: none;
		}
	}
</style>
