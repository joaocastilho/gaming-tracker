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

	// Auto-fit title font size
	$effect(() => {
		if (!browser || !titleElement || !game) return;

		const maxSize = 2.5;
		const minSize = 0.85;
		const step = 0.05;

		titleElement.style.fontSize = `${maxSize}rem`;

		requestAnimationFrame(() => {
			if (!titleElement) return;
			let currentSize = maxSize;

			while (currentSize > minSize && titleElement.scrollWidth > titleElement.clientWidth) {
				currentSize -= step;
				titleElement.style.fontSize = `${currentSize}rem`;
			}
		});
	});
</script>

<div class="mb-2 flex items-start justify-between gap-4 md:mb-4">
	<h1
		id="modal-title"
		class="flex min-w-0 flex-1 flex-col justify-start md:h-auto"
		style="color: var(--color-text-primary);"
	>
		<span bind:this={titleElement} class="modal-title-text w-full font-bold">
			{game.mainTitle}
		</span>
		{#if game.subtitle}
			<span
				class="w-full truncate text-sm font-semibold md:text-lg"
				style="line-height: 1.2; color: var(--color-text-secondary);">{game.subtitle}</span
			>
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
