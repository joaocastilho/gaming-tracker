<script lang="ts">
import type { Game } from '../../types/game.js';

interface Props {
	game: Game;
	size?: 'small' | 'large' | 'tiny' | 'tierlist';
}

let { game, size = 'small' }: Props = $props();

function adjustTitleSize(node: HTMLElement, hasSubtitle: boolean, _titleText: string, _width?: number) {
	const containerWidth = _width ?? node.clientWidth;
	const isTierList = size === 'tierlist';

	const minSize = 0.1;
	const maxSize = isTierList ? 1.05 : 1.5;
	const step = 0.05;

	if (containerWidth === 0) return;

	if (hasSubtitle) {
		// Single line — shrink until it fits
		node.style.whiteSpace = 'nowrap';
		node.style.overflow = 'visible';
		node.style.textOverflow = 'clip';
		node.style.display = 'block';
		node.style.fontSize = `${maxSize}rem`;

		let size = maxSize;
		while (size > minSize && node.scrollWidth > containerWidth + 1) {
			size -= step;
			node.style.fontSize = `${size}rem`;
		}
	} else {
		// Multi-line (up to 2 lines) — shrink until height fits
		node.style.whiteSpace = 'normal';
		node.style.wordBreak = 'break-word';
		node.style.display = 'block';
		node.style.overflow = 'visible';
		node.style.textOverflow = 'clip';
		node.style.fontSize = `${maxSize}rem`;

		// Max height = 2 lines at current font size
		let size = maxSize;
		const lineHeight = 1.3;
		while (size > minSize) {
			const maxHeight = size * 16 * lineHeight * 2 + 2; // 2 lines + tolerance
			if (node.scrollHeight <= maxHeight) break;
			size -= step;
			node.style.fontSize = `${size}rem`;
		}
	}
}

function fitTitle(node: HTMLElement, params: { title: string; subtitle?: string }) {
	let currentParams = params;

	const resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			adjustTitleSize(node, !!currentParams.subtitle, currentParams.title, entry.contentRect.width);
		}
	});
	resizeObserver.observe(node);

	return {
		update(newParams: { title: string; subtitle?: string }) {
			currentParams = newParams;
			adjustTitleSize(node, !!newParams.subtitle, newParams.title);
		},
		destroy() {
			resizeObserver.disconnect();
		},
	};
}

function calculateSubtitleFontSize(title: string | null | undefined): number {
	const baseSize = 0.85;
	const minSize = 0.55;
	const maxLength = 25;

	if (!title || title.length <= maxLength) {
		return baseSize;
	}

	const reduction = Math.min((title.length - maxLength) * 0.015, baseSize - minSize);
	return Math.max(baseSize - reduction, minSize);
}

const subtitleFontSize = $derived(calculateSubtitleFontSize(game.subtitle));
</script>

<div class="title-section">
	<h3
		class="game-title"
		use:fitTitle={{ title: game.mainTitle || game.title, subtitle: game.subtitle ?? undefined }}
	>
		{game.mainTitle || game.title}
		{#if game.subtitle}
			<br />
			<span class="game-subtitle" style="font-size: {subtitleFontSize}rem;">{game.subtitle}</span>
		{/if}
	</h3>
</div>

<style>
	.title-section {
		margin-bottom: 0;
		height: 64px; /* Reduced from 72px to pull content even closer */
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: visible;
		padding: 0 4px;
	}

	.game-title {
		font-size: 1.3rem;
		font-weight: 700;
		margin: 0; /* Removing margins to tighten spacing */
		line-height: 1.15;
		/* Base styles, overridden by JS for wrapping/nowrap logic */
		overflow: hidden;
		width: 100%;
		color: var(--color-text-primary);
	}

	.game-subtitle {
		font-weight: 500;
		color: var(--color-text-secondary);
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		width: 100%;
		font-size: 0.75rem;
	}

	/* Responsive Styles using Container Queries */
	@container game-card (max-width: 420px) {
		.title-section {
			min-height: 32px;
			max-height: none;
			margin-bottom: 4px;
		}

		.game-title {
			line-height: 1.2;
		}

		.game-subtitle {
			font-size: 0.75rem;
			margin-top: 1px;
		}
	}
</style>
