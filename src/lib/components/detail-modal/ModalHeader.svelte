<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { Pencil, Trash2, Link } from 'lucide-svelte';
	import { createGameSlug } from '$lib/utils/slugUtils';
	import { browser } from '$app/environment';
	import { modalStore } from '$lib/stores/modal.svelte';

	interface Props {
		game: Game;
		isEditor: boolean;
		onEdit?: (game: Game) => void;
		onDelete?: (game: Game) => void;
	}

	let { game, isEditor, onEdit, onDelete }: Props = $props();

	let linkToGame = $state('');
	let titleElement = $state<HTMLElement>();
	let containerWidth = $state(0);

	let canvasSingleton: HTMLCanvasElement;
	let contextSingleton: CanvasRenderingContext2D | null;
	let cachedFont: string = '';

	function getFont(node: HTMLElement): string {
		if (cachedFont) return cachedFont;
		if (typeof getComputedStyle === 'undefined') return '700 2.5rem sans-serif';
		const style = getComputedStyle(node);
		cachedFont = `700 2.5rem ${style.fontFamily}`;
		return cachedFont;
	}

	function getTextWidth(text: string, font: string): number {
		if (!browser) return 0;
		if (!canvasSingleton) {
			canvasSingleton = document.createElement('canvas');
			contextSingleton = canvasSingleton.getContext('2d');
		}
		if (contextSingleton) {
			contextSingleton.font = font;
			return contextSingleton.measureText(text).width;
		}
		return 0;
	}

	async function shareGame() {
		if (!browser || !game) return;

		try {
			const url = new URL(window.location.href);
			const slug = createGameSlug(game.title);
			url.searchParams.set('game', slug);

			await navigator.clipboard.writeText(url.toString());
			linkToGame = 'Copied';
			setTimeout(() => {
				linkToGame = '';
			}, 2000);
		} catch (error) {
			console.warn('Failed to copy to clipboard:', error);
			linkToGame = 'Failed';
			setTimeout(() => {
				linkToGame = '';
			}, 2000);
		}
	}

	// Auto-fit title font size using Svelte 5 effect and Canvas measurement
	$effect(() => {
		if (!browser || !titleElement || !game || containerWidth === 0) return;

		const maxSize = 2.25;
		const minSize = 0.8;

		const text = game.mainTitle || '';
		const font = getFont(titleElement);
		const textWidthAtBase = getTextWidth(text, font);

		if (textWidthAtBase === 0) return;

		// Calculate exact size needed to fit container. textWidthAtBase is measured at maxSize (2.5rem).
		let newSize = (containerWidth / textWidthAtBase) * maxSize;

		if (newSize > maxSize) newSize = maxSize;
		if (newSize < minSize) newSize = minSize;

		titleElement.style.fontSize = `${newSize}rem`;
		titleElement.style.whiteSpace = 'nowrap';
	});
</script>

<div class="mb-2 flex items-start justify-between pt-4 md:pt-6">
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

	<div class="flex items-center md:mr-10">
		{#if isEditor}
			<div class="mr-2 hidden items-center gap-1 md:flex">
				<button
					onclick={(e) => {
						e.stopPropagation();
						modalStore.closeModal();
						onEdit?.(game);
					}}
					class="flex h-8 w-8 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-black/10 dark:hover:bg-white/10"
					title="Edit game"
					aria-label="Edit {game.title}"
				>
					<Pencil size={18} style="color: var(--color-text-primary)" />
				</button>
				<button
					onclick={(e) => {
						e.stopPropagation();
						modalStore.closeModal();
						onDelete?.(game);
					}}
					class="flex h-8 w-8 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-red-500/10"
					title="Delete game"
					aria-label="Delete {game.title}"
				>
					<Trash2 size={18} class="text-red-500" />
				</button>
			</div>
		{/if}

		<button
			onclick={shareGame}
			class="hidden h-8 cursor-pointer items-center justify-center rounded-full bg-transparent transition-colors hover:bg-black/10 md:flex dark:bg-transparent dark:hover:bg-white/10 {linkToGame
				? 'w-auto px-3'
				: 'w-8'}"
			aria-label="Share game"
		>
			{#if linkToGame}
				<span
					style="color: var(--color-text-primary)"
					class="text-sm font-medium text-gray-700 dark:text-gray-200"
				>
					{linkToGame}
				</span>
			{:else}
				<Link
					size={18}
					style="color: var(--color-text-primary)"
					class="text-gray-700 dark:text-gray-200"
				/>
			{/if}
		</button>
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

		/* Target the dynamically sized span specifically if needed, or the container */
		#modal-title :global(.modal-title-text) {
			font-size: 2.25rem !important;
			white-space: normal !important; /* Allow wrap to save width if needed, or keep nowrap */
			line-height: 1.1 !important;
		}
	}
</style>
