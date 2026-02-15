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

	function adjustTitleSize(node: HTMLElement, hasSubtitle: boolean, width?: number) {
		if (typeof window !== 'undefined' && window.innerWidth <= 768) {
			node.style.whiteSpace = '';
			node.style.fontSize = '';
			return;
		}

		const isTierList = size === 'tierlist';
		const minSize = isTierList ? 0.65 : 0.85;
		const maxSize = isTierList ? 1.05 : 1.4;
		const singleLineMinSize = isTierList ? 0.9 : 1.1;

		const containerWidth = width ?? node.clientWidth;
		if (containerWidth === 0) return;

		const text = node.textContent || '';
		const font = getFont(node);
		const textWidthAt1Rem = getTextWidth(text, font);

		if (!hasSubtitle) {
			let newSize = containerWidth / textWidthAt1Rem;
			if (newSize > maxSize) newSize = maxSize;

			if (newSize >= singleLineMinSize) {
				node.style.whiteSpace = 'nowrap';
				node.style.fontSize = `${newSize}rem`;
				return;
			}
		}

		node.style.whiteSpace = 'normal';
		let newSize = (1.9 * containerWidth) / textWidthAt1Rem;

		if (newSize > maxSize) newSize = maxSize;
		if (newSize < minSize) newSize = minSize;

		node.style.fontSize = `${newSize}rem`;
	}

	function fitTitle(node: HTMLElement, params: { title: string; subtitle?: string }) {
		let currentParams = params;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				adjustTitleSize(node, !!currentParams.subtitle, entry.contentRect.width);
			}
		});
		resizeObserver.observe(node);

		return {
			update(newParams: { title: string; subtitle?: string }) {
				currentParams = newParams;
				adjustTitleSize(node, !!newParams.subtitle);
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
		min-height: 52px;
		max-height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: hidden;
	}

	.game-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		line-height: 1.2;
		word-wrap: break-word;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		width: 100%;
		overflow: hidden;
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

	/* Responsive Styles */
	@media (max-width: 768px) {
		.title-section {
			min-height: 40px;
			max-height: 40px;
		}

		.game-title {
			font-size: 0.95rem;
			line-height: 1.15;
		}

		.game-subtitle {
			font-size: 0.7rem;
		}
	}

	@media (max-width: 480px) {
		.title-section {
			min-height: 36px;
			max-height: 36px;
		}

		.game-title {
			font-size: 0.9rem;
			line-height: 1.15;
		}
	}
</style>
