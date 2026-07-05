<script lang="ts">
import type { Game } from '$lib/types/game';
import { browser } from '$app/environment';
import { Share2, X } from '@lucide/svelte';

import { FONT_CONFIG } from '$lib/constants/fonts';

interface Props {
	game: Game;
	onClose?: () => void;
	onShare?: () => void;
	linkCopied?: string;
}

let { game, onClose, onShare, linkCopied = '' }: Props = $props();

let containerWidth = $state(0);
let titleFontSize = $state('');

function measureTextWidthNative(text: string, font: string): number {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return 0;
	ctx.font = font;
	return ctx.measureText(text).width;
}

$effect(() => {
	if (!browser || !game) return;

	if (window.innerWidth < 768) {
		titleFontSize = '1.5rem';
		return;
	}

	if (containerWidth === 0) return;

	const maxSize = 1.75;
	const minSize = 0.7;

	const fontBase = FONT_CONFIG.modalTitle.replace('1.125rem', '1rem');
	const textWidthAt1Rem = measureTextWidthNative(game.mainTitle, fontBase);

	if (textWidthAt1Rem > 0) {
		let targetSize = (containerWidth - 32) / textWidthAt1Rem;
		const finalSize = Math.max(minSize, Math.min(maxSize, targetSize));
		titleFontSize = `${finalSize}rem`;
	} else {
		titleFontSize = `${minSize}rem`;
	}
});
</script>

<div class="mb-2 flex items-start gap-2 pt-4 md:pt-4">
	<h1
		id="modal-title"
		bind:clientWidth={containerWidth}
		class="flex min-w-0 flex-1 flex-col items-center justify-start text-center md:overflow-hidden md:items-start md:text-left"
		style="color: var(--color-text-primary);"
	>
		<span
			class="modal-title-text w-full font-semibold md:whitespace-nowrap"
			style="font-size: {titleFontSize || (browser && window.innerWidth >= 768 ? '1.75rem' : '1.5rem')};"
		>
			{game.mainTitle}
		</span>
		{#if game.subtitle}
			<span
				class="w-full truncate text-sm font-semibold md:text-base"
				style="line-height: 1.2; color: var(--color-text-secondary);"
			>
				{game.subtitle}
			</span>
		{/if}
	</h1>

	<div class="flex shrink-0 items-center gap-1.5">
		<button
			onclick={(e) => {
				e.stopPropagation();
				onShare?.();
			}}
			class="flex h-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/10 text-white/80 transition-colors outline-none hover:bg-black/25 {linkCopied
				? 'gap-1.5 px-3'
				: 'w-8'}"
			title="Share"
			aria-label="Share {game.title}"
		>
			<Share2 size={18} />
			{#if linkCopied}
				<span class="text-xs font-medium">{linkCopied}</span>
			{/if}
		</button>
		{#if onClose}
			<button
				onclick={onClose}
				class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/10 text-white/80 transition-colors outline-none hover:bg-black/25"
				aria-label="Close modal"
			>
				<X size={20} />
			</button>
		{/if}
	</div>
</div>

<style>
	#modal-title {
		min-height: 80px;
	}

	@media (min-width: 768px) {
		#modal-title {
			min-height: 72px;
		}
	}

	@media (orientation: landscape) and (max-height: 1000px) and (max-width: 1200px) {
		#modal-title {
			min-height: auto !important;
			margin-bottom: 1rem !important;
		}

		#modal-title :global(.modal-title-text) {
			line-height: 1.1 !important;
		}
	}
</style>
