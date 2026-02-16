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

		// Lower minSize to virtually nothing to guarantee fit
		const minSize = 0.1;

		// Unify max size
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

			// Initial guess
			let newSize = (containerWidth * 0.9) / textWidthAt1Rem;
			if (newSize > maxSize) newSize = maxSize;
			if (newSize < minSize) newSize = minSize;

			node.style.fontSize = `${newSize}rem`;

			// Iterative check for single line overflow
			// For single line with ellipsis, scrollWidth == clientWidth usually,
			// so we can't rely on that easily without temporarily removing overflow: hidden
			// However, our initial guess for single line is extremely accurate because it's simple math.
			// We will rely on the guess + the safety buffer (0.9) for this case.
		} else {
			// Case 2: No Subtitle -> Allow Wrapping (up to 2 lines)
			node.style.whiteSpace = 'normal';
			// Ensure word breaking to avoid overflowing horizontal space with long words
			node.style.wordBreak = 'break-word';
			node.style.display = '-webkit-box';
			node.style.webkitLineClamp = '2';
			node.style.webkitBoxOrient = 'vertical';
			node.style.overflow = 'hidden';
			node.style.textOverflow = 'ellipsis';

			// Initial Conservative Estimate
			const availableWidth = containerWidth * 1.8;
			let newSize = availableWidth / textWidthAt1Rem;

			if (newSize > maxSize) newSize = maxSize;
			if (newSize < minSize) newSize = minSize;

			node.style.fontSize = `${newSize}rem`;

			// Iterative Check: If scrollHeight > clientHeight, it means we have truncation (more than 2 lines content)
			// We loop a few times to shrink it down until it fits.
			// Limit iterations to prevent any potential performance freeze.
			let iterations = 0;
			while (node.scrollHeight > node.clientHeight && newSize > minSize && iterations < 10) {
				// Reduce size by ~10% each step
				newSize *= 0.9;
				if (newSize < minSize) newSize = minSize;
				node.style.fontSize = `${newSize}rem`;
				iterations++;
			}
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
