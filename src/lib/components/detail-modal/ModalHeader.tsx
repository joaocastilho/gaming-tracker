import { Share2, X } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createEffect, createSignal, createUniqueId, Show } from 'solid-js';
import { FONT_CONFIG } from '#lib/constants/fonts.js';
import type { Game } from '#lib/types/game.js';
import { browser } from '#lib/utils/env.js';
import './ModalHeader.css';

export interface ModalHeaderProps {
	game: Game;
	onClose?: () => void;
	onShare?: () => void;
	linkCopied?: string;
}

function measureTextWidthNative(text: string, font: string): number {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return 0;
	ctx.font = font;
	return ctx.measureText(text).width;
}

export default function ModalHeader(props: ModalHeaderProps): JSX.Element {
	const titleId = createUniqueId();
	const [headingEl, setHeadingEl] = createSignal<HTMLHeadingElement | null>(null);
	const [containerWidth, setContainerWidth] = createSignal(0);
	const [titleFontSize, setTitleFontSize] = createSignal('');

	createEffect(
		() => headingEl(),
		(el) => {
			if (!el || typeof ResizeObserver === 'undefined') return;
			if (el.clientWidth > 0) setContainerWidth(el.clientWidth);
			const observer = new ResizeObserver((entries) => {
				const w = entries[0]?.contentRect.width;
				if (typeof w === 'number') setContainerWidth(w);
			});
			observer.observe(el);
			return () => observer.disconnect();
		}
	);

	createEffect(
		() => ({ mainTitle: props.game.mainTitle, width: containerWidth() }),
		({ mainTitle, width }) => {
			if (!browser) return;

			if (window.innerWidth < 768) {
				setTitleFontSize('1.5rem');
				return;
			}

			if (width === 0) return;

			const maxSize = 1.75;
			const minSize = 0.7;
			const fontBase = FONT_CONFIG.modalTitle.replace('1.125rem', '1rem');
			const textWidthAt1Rem = measureTextWidthNative(mainTitle, fontBase);

			if (textWidthAt1Rem > 0) {
				const targetSize = (width - 32) / textWidthAt1Rem;
				const finalSize = Math.max(minSize, Math.min(maxSize, targetSize));
				setTitleFontSize(`${finalSize}rem`);
			} else {
				setTitleFontSize(`${minSize}rem`);
			}
		}
	);

	return (
		<div class="mb-2 flex items-start gap-2 pt-4 md:pt-4">
			<h1
				id={titleId}
				ref={setHeadingEl}
				class="modal-title flex min-w-0 flex-1 flex-col items-center justify-start text-center md:overflow-hidden md:items-start md:text-left"
				style={{ color: 'var(--color-text-primary)' }}
			>
				<span
					class="modal-title-text w-full font-semibold md:whitespace-nowrap"
					style={{ 'font-size': titleFontSize() || (browser && window.innerWidth >= 768 ? '1.75rem' : '1.5rem') }}
				>
					{props.game.mainTitle}
				</span>
				<Show when={props.game.subtitle}>
					<span
						class="w-full truncate text-sm font-semibold md:text-base"
						style={{ 'line-height': '1.2', color: 'var(--color-text-secondary)' }}
					>
						{props.game.subtitle}
					</span>
				</Show>
			</h1>

			<div class="hidden md:flex md:shrink-0 md:items-center md:gap-1.5">
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						props.onShare?.();
					}}
					class={[
						'flex h-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/10 text-white/80 transition-colors outline-none hover:bg-black/25',
						props.linkCopied ? 'gap-1.5 px-3' : 'w-8',
					]}
					title="Share"
					aria-label={`Share ${props.game.title}`}
				>
					<Share2 size={18} />
					<Show when={props.linkCopied}>
						<span class="text-xs font-medium">{props.linkCopied}</span>
					</Show>
				</button>
				<Show when={props.onClose}>
					{(closeFn) => (
						<button
							type="button"
							onClick={() => closeFn()()}
							class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/10 text-white/80 transition-colors outline-none hover:bg-black/25"
							aria-label="Close modal"
						>
							<X size={20} />
						</button>
					)}
				</Show>
			</div>
		</div>
	);
}
