<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { browser } from '$app/environment';
	import { Link, X } from 'lucide-svelte';

	interface Props {
		game: Game;
		onClose?: () => void;
		onShare?: () => void;
		linkCopied?: string;
	}

	let { game, onClose, onShare, linkCopied = '' }: Props = $props();

	let titleElement = $state<HTMLElement>();
	let containerWidth = $state(0);

	// Auto-fit title font size using DOM scrollWidth check
	$effect(() => {
		if (!browser || !titleElement || !game || containerWidth === 0) return;

		const maxSize = 2.25;
		const minSize = 0.8;
		const step = 0.05;

		// Reset to max size first
		titleElement.style.whiteSpace = 'nowrap';
		titleElement.style.fontSize = `${maxSize}rem`;

		// Shrink until text fits container (scrollWidth forces reflow for accurate measurement)
		let size = maxSize;
		while (size > minSize && titleElement.scrollWidth > containerWidth + 1) {
			size -= step;
			titleElement.style.fontSize = `${size}rem`;
		}
	});
</script>

<div class="mb-2 flex items-start gap-2 pt-4 md:pt-6">
	<h1
		id="modal-title"
		bind:clientWidth={containerWidth}
		class="flex min-w-0 flex-1 flex-col items-center justify-start overflow-hidden text-center md:items-start md:text-left"
		style="color: var(--color-text-primary);"
	>
		<span bind:this={titleElement} class="modal-title-text w-full font-bold">
			{game.mainTitle}
		</span>
		{#if game.subtitle}
			<span
				class="w-full truncate text-base font-semibold md:text-lg"
				style="line-height: 1.2; color: var(--color-text-secondary);"
			>
				{game.subtitle}
			</span>
		{/if}
	</h1>

	<div class="hidden shrink-0 items-center gap-1.5 md:flex">
		<button
			onclick={(e) => {
				e.stopPropagation();
				onShare?.();
			}}
			class="flex h-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/10 text-white/80 transition-colors outline-none hover:bg-black/25 {linkCopied
				? 'gap-1.5 px-3'
				: 'w-8'}"
			title="Copy link"
			aria-label="Copy link to {game.title}"
		>
			<Link size={18} />
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

	@media (orientation: landscape) and (max-height: 1000px) {
		#modal-title {
			min-height: auto !important;
			margin-bottom: 1rem !important;
		}

		#modal-title :global(.modal-title-text) {
			font-size: 2.25rem !important;
			white-space: normal !important;
			line-height: 1.1 !important;
		}
	}
</style>
