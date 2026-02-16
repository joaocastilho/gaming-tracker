<script lang="ts">
	import type { Game } from '../../types/game.js';

	interface Props {
		game: Game;
		size?: 'small' | 'large' | 'tiny' | 'tierlist';
	}

	let { game, size = 'small' }: Props = $props();

	let canvasSingleton: HTMLCanvasElement;
	let contextSingleton: CanvasRenderingContext2D | null;
	let cachedFont: string = '';

	function getFont(node: HTMLElement): string {
		if (cachedFont) return cachedFont;
		if (typeof getComputedStyle === 'undefined') return '600 1rem sans-serif';
		const style = getComputedStyle(node);
		cachedFont = `600 1rem ${style.fontFamily}`;
		return cachedFont;
	}

	function getTextWidth(text: string, font: string): number {
		if (typeof document === 'undefined') return 0;
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

	function adjustTitleSize(
		node: HTMLElement,
		hasSubtitle: boolean,
		titleText: string,
		width?: number
	) {
		const containerWidth = width ?? node.clientWidth;
		const isTierList = size === 'tierlist';

		// Mobile/Desktop split matters less now as we just want single-line consistent look
		// Lower minSize significantly to allow long titles (e.g. "A Plague Tale: Innocence") to fit on one line
		const minSize = isTierList ? 0.5 : 0.6;

		// Unify max size: Always allow big titles (2.5), unless it's a specific tiny list
		const maxSize = isTierList ? 1.05 : 1.5;

		if (containerWidth === 0) return;

		// Use the passed titleText for measurement
		const font = getFont(node);
		const textWidthAt1Rem = getTextWidth(titleText, font);

		if (hasSubtitle) {
			// Case 1: Has Subtitle -> Force Single Line
			node.style.whiteSpace = 'nowrap';
			node.style.overflow = 'hidden';
			node.style.textOverflow = 'ellipsis';
			node.style.display = 'block';
			node.style.webkitLineClamp = 'none';

			// Calculate size to fit width exactly
			// Add a safety buffer (0.95) to prevent ellipsis flicker
			let newSize = (containerWidth * 0.95) / textWidthAt1Rem;

			// Clamp
			if (newSize > maxSize) newSize = maxSize;
			// Allow shrinking quite a bit but keep a sensible floor
			if (newSize < minSize) newSize = minSize;

			node.style.fontSize = `${newSize}rem`;
		} else {
			// Case 2: No Subtitle -> Allow Wrapping (up to 2 lines)
			node.style.whiteSpace = 'normal';
			node.style.display = '-webkit-box';
			node.style.webkitLineClamp = '2';
			node.style.webkitBoxOrient = 'vertical';
			node.style.overflow = 'hidden';
			node.style.textOverflow = 'ellipsis';

			// For wrapping titles, we prefer to keep them larger (consistent) and let them wrap
			// But if it's REALLY long (more than 2 lines at max size), we should shrink it.
			// Approximate check: 2 lines width = 2 * containerWidth
			let newSize = (2.0 * containerWidth * 0.95) / textWidthAt1Rem;

			if (newSize > maxSize) newSize = maxSize;
			if (newSize < minSize) newSize = minSize;

			node.style.fontSize = `${newSize}rem`;
		}
	}

	function fitTitle(node: HTMLElement, params: { title: string; subtitle?: string }) {
		let currentParams = params;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				adjustTitleSize(
					node,
					!!currentParams.subtitle,
					currentParams.title,
					entry.contentRect.width
				);
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
			}
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
		/* overflow: hidden;  <-- We might need to allow overflow if we shrink too much, but let's keep it for safety */
		overflow: hidden;
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
