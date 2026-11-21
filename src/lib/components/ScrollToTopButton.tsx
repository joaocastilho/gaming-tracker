import type { JSX } from '@solidjs/web';
import { createSignal, onSettled, Show } from 'solid-js';
import { modalStore } from '#lib/stores/modal.js';
import './ScrollToTopButton.css';

export interface ScrollToTopButtonProps {
	hideWhenFiltersOpen?: boolean;
}

export default function ScrollToTopButton(props: ScrollToTopButtonProps): JSX.Element {
	const [isVisible, setIsVisible] = createSignal(false);

	onSettled(() => {
		let ticking = false;
		const handleScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				setIsVisible(window.scrollY > 300);
				ticking = false;
			});
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	function scrollToTop(): void {
		const startY = window.scrollY;
		const duration = 600;
		const startTime = performance.now();

		function easeOutCubic(t: number): number {
			return 1 - Math.pow(1 - t, 3);
		}

		function animateScroll(currentTime: number): void {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			window.scrollTo(0, startY * (1 - easeOutCubic(progress)));

			if (progress < 1) {
				requestAnimationFrame(animateScroll);
			}
		}

		requestAnimationFrame(animateScroll);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			scrollToTop();
		}
	}

	return (
		<Show when={isVisible() && !modalStore.isOpen && !props.hideWhenFiltersOpen}>
			<button
				type="button"
				class="scroll-to-top-button"
				aria-label="Scroll to top"
				onClick={scrollToTop}
				onKeyDown={handleKeydown}
				tabindex="0"
			>
				<span class="scroll-icon" aria-hidden="true">
					↑
				</span>
				<span class="sr-only">Scroll to top</span>
			</button>
		</Show>
	);
}
