<script lang="ts">
import { modalStore } from '$lib/stores/modal.svelte';

interface Props {
	hideWhenFiltersOpen?: boolean;
}

let { hideWhenFiltersOpen = false }: Props = $props();

let isVisible = $state(false);
let ticking = false;

$effect(() => {
	const handleScroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			isVisible = window.scrollY > 300;
			ticking = false;
		});
	};

	window.addEventListener('scroll', handleScroll, { passive: true });
	return () => {
		window.removeEventListener('scroll', handleScroll);
	};
});

function scrollToTop() {
	const headerHeight = 110;
	window.scrollTo({
		top: -headerHeight,
		behavior: 'smooth',
	});
}

function handleKeydown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		scrollToTop();
	}
}
</script>

{#if isVisible && !modalStore.getState().isOpen && !hideWhenFiltersOpen}
	<button
		type="button"
		class="scroll-to-top-button"
		aria-label="Scroll to top"
		onclick={scrollToTop}
		onkeydown={handleKeydown}
		tabindex="0"
	>
		<span class="scroll-icon" aria-hidden="true">↑</span>
		<span class="sr-only">Scroll to top</span>
	</button>
{/if}



<style>


	/* Existing Scroll Button Styles */
	.scroll-to-top-button {
		position: fixed;
		bottom: calc(65px + env(safe-area-inset-bottom, 0px));
		right: 24px;
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: 1px solid var(--color-border);
		background-color: rgba(75, 85, 99, 0.4);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.3rem;
		font-weight: bold;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.3s ease;
		z-index: 50;
		outline: none;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	@media (hover: hover) {
		.scroll-to-top-button:hover {
			background-color: rgba(75, 85, 99, 0.6);
			box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
			transform: translateY(-2px);
		}
	}

	.scroll-to-top-button:focus {
		outline: none;
	}

	.scroll-icon {
		line-height: 1;
	}

	:global(.light) .scroll-to-top-button {
		background-color: rgba(156, 163, 175, 0.4);
		color: #1c1917;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	@media (hover: hover) {
		:global(.light) .scroll-to-top-button:hover {
			background-color: rgba(156, 163, 175, 0.6);
			color: #1c1917;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-to-top-button {
			transition: none;
		}
	}

	@media (max-width: 768px) {
		.scroll-to-top-button {
			bottom: calc(136px + env(safe-area-inset-bottom, 0px));
			right: 16px;
			width: 48px;
			height: 48px;
			font-size: 1.2rem;
		}
	}

	@media (max-width: 480px) {
		.scroll-to-top-button {
			bottom: calc(141px + env(safe-area-inset-bottom, 0px));
			right: 16px;
			width: 44px;
			height: 44px;
			font-size: 1.1rem;
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
