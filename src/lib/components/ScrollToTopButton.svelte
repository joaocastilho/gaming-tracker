<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte';

	let isVisible = $state(false);
	let buttonElement = $state<HTMLButtonElement | undefined>();

	$effect(() => {
		const handleScroll = () => {
			isVisible = window.scrollY > 300;
		};

		window.addEventListener('scroll', handleScroll);
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

{#if isVisible && !$modalStore.isOpen}
	<button
		bind:this={buttonElement}
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
		bottom: 24px;
		right: 24px;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: none;
		background-color: #3b82f6;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		font-weight: bold;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.3s ease;
		z-index: 50;
		outline: none;
	}

	.scroll-to-top-button:hover {
		background-color: #2563eb;
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	.scroll-to-top-button:focus {
		outline: 2px solid #60a5fa;
		outline-offset: 2px;
	}

	.scroll-to-top-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.scroll-icon {
		line-height: 1;
	}

	:global(.light) .scroll-to-top-button {
		background-color: #3b82f6;
		color: white;
	}

	:global(.light) .scroll-to-top-button:hover {
		background-color: #2563eb;
	}

	:global(.light) .scroll-to-top-button:focus {
		outline: 2px solid #60a5fa;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-to-top-button {
			transition: none;
		}
	}

	@media (max-width: 768px) {
		.scroll-to-top-button {
			bottom: 100px;
			right: 20px;
			width: 44px;
			height: 44px;
			font-size: 1.1rem;
		}
	}

	@media (max-width: 480px) {
		.scroll-to-top-button {
			bottom: 100px;
			right: 16px;
			width: 40px;
			height: 40px;
			font-size: 1rem;
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
