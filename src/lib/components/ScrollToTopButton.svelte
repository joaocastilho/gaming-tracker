<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte';

	interface Props {
		hideWhenFiltersOpen?: boolean;
	}

	let { hideWhenFiltersOpen = false }: Props = $props();

	let isVisible = $state(false);

	$effect(() => {
		const handleScroll = () => {
			isVisible = window.scrollY > 300;
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
			behavior: 'smooth'
		});
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			scrollToTop();
		}
	}
</script>

{#if isVisible && !$modalStore.isOpen && !hideWhenFiltersOpen}
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
	.scroll-to-top-button {
		position: fixed;
		bottom: 65px;
		right: 24px;
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.3rem;
		font-weight: bold;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		z-index: 50;
		outline: none;
		opacity: 0.7;
	}

	.scroll-to-top-button:hover {
		background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
		transform: translateY(-2px);
		opacity: 0.9;
	}

	.scroll-to-top-button:focus {
		outline: none;
	}

	.scroll-to-top-button:active {
		opacity: 1;
	}

	.scroll-icon {
		line-height: 1;
	}

	:global(.light) .scroll-to-top-button {
		background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		opacity: 0.7;
	}

	:global(.light) .scroll-to-top-button:hover {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
		opacity: 0.9;
	}

	:global(.light) .scroll-to-top-button:focus {
		outline: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-to-top-button {
			transition: none;
		}
	}

	@media (max-width: 768px) {
		.scroll-to-top-button {
			bottom: 120px;
			right: 16px;
			width: 48px;
			height: 48px;
			font-size: 1.2rem;
		}
	}

	@media (max-width: 480px) {
		.scroll-to-top-button {
			bottom: 125px;
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
