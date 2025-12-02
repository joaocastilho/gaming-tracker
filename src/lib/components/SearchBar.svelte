<script lang="ts">
	import { filtersStore } from '$lib/stores/filters';
	import { RotateCcw } from 'lucide-svelte';

	let inputElement: HTMLInputElement | undefined;
	let debounceTimeout: ReturnType<typeof setTimeout> | undefined;

	let searchTerm = $state('');

	$effect(() => {
		const unsubscribe = filtersStore.searchQuery.subscribe((value) => {
			searchTerm = value;
		});
		return unsubscribe;
	});

	$effect(() => {
		if (inputElement) {
			inputElement.focus();
		}
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;

		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		debounceTimeout = setTimeout(() => {
			filtersStore.writeSearchToURL();
			filtersStore.setSearchTerm(newValue);
		}, 300);
	}

	function clearSearch() {
		if (inputElement) {
			inputElement.value = '';
			// Defer focus to next animation frame to avoid forced reflow
			requestAnimationFrame(() => {
				inputElement?.focus();
			});
		}
		filtersStore.setSearchTerm('');
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (inputElement) {
				inputElement.select();
			}
		}
	}

	function handleGlobalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && inputElement) {
			event.preventDefault();
			event.stopPropagation();

			// Batch DOM operations to avoid forced reflows
			inputElement.focus();
			inputElement.select();

			// Defer scroll to next frame to avoid layout thrashing
			requestAnimationFrame(() => {
				const headerHeight = 110;
				window.scrollTo({
					top: -headerHeight,
					behavior: 'smooth'
				});
			});
		}
	}

	$effect(() => {
		document.addEventListener('keydown', handleGlobalKeydown, { capture: true });
		return () => {
			document.removeEventListener('keydown', handleGlobalKeydown, { capture: true });
		};
	});
</script>

<div class="search-bar-container">
	<div class="search-bar">
		<span class="search-icon" aria-hidden="true">🔍</span>
		<input
			id="search-input"
			bind:this={inputElement}
			bind:value={searchTerm}
			type="text"
			placeholder="Search games..."
			oninput={handleInput}
			onkeydown={handleKeydown}
			class="search-input"
			aria-label="Search games"
			autocomplete="off"
			spellcheck="false"
		/>
		{#if searchTerm}
			<button type="button" class="clear-button" onclick={clearSearch} aria-label="Clear search">
				<RotateCcw size={18} />
			</button>
		{/if}
	</div>
</div>

<style>
	.search-bar-container {
		width: 100%;
		max-width: 1000px;
		padding: 0 16px;
		margin: 0 auto 16px auto;
	}

	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		border-radius: 8px;
		padding: 12px 16px;
		background-color: #1a1f27;
		border: 1px solid #2a2f3a;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	:global(.light) .search-bar {
		background-color: #ffffff;
		border-color: #e5e7eb;
	}

	.search-bar:focus-within {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	:global(.light) .search-bar:focus-within {
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}

	.search-icon {
		font-size: 1.1rem;
		margin-right: 8px;
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #ffffff;
		font-size: 1rem;
		line-height: 1.5;
		min-width: 0;
	}

	:global(.light) .search-input {
		color: #1a1a1a;
	}

	.search-input::placeholder {
		color: #8b92a8;
	}

	:global(.light) .search-input::placeholder {
		color: #6b7280;
	}

	.clear-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border: none;
		background: transparent;
		color: #8b92a8;
		cursor: pointer;
		border-radius: 4px;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		margin-left: 8px;
		flex-shrink: 0;
	}

	:global(.light) .clear-button {
		color: #6b7280;
	}

	.clear-button:hover {
		background-color: rgba(139, 146, 168, 0.1);
		color: #ffffff;
	}

	:global(.light) .clear-button:hover {
		background-color: rgba(107, 114, 128, 0.1);
		color: #1a1a1a;
	}

	.clear-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	@media (max-width: 768px) {
		.search-bar-container {
			padding: 0 12px;
			margin-bottom: 12px;
		}

		.search-bar {
			padding: 10px 12px;
		}

		.search-input {
			font-size: 0.95rem;
		}

		.search-icon {
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.search-bar-container {
			padding: 0 8px;
		}

		.search-bar {
			padding: 8px 10px;
		}

		.search-input {
			font-size: 0.9rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.search-bar,
		.clear-button {
			transition: none;
		}
	}
</style>
