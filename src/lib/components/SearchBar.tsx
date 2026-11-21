import { X } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createEffect, createSignal, Show, untrack } from 'solid-js';
import { filtersStore } from '#lib/stores/filters.js';
import { markSearchCleared } from '#lib/stores/searchClearCoordinator.js';
import { browser } from '#lib/utils/env.js';
import { getCurrentPageState, getCurrentPathname, goto } from '#lib/utils/routerBridge.js';
import './SearchBar.css';

export default function SearchBar(): JSX.Element {
	const [inputEl, setInputEl] = createSignal<HTMLInputElement | null>(null);
	const [localSearchTerm, setLocalSearchTerm] = createSignal(untrack(() => filtersStore.searchQuery));

	createEffect(
		() => ({
			storeTerm: filtersStore.searchQuery,
			isInternal: filtersStore.isInternalUpdate,
			el: inputEl(),
		}),
		({ storeTerm, isInternal, el }) => {
			if (storeTerm !== untrack(localSearchTerm) && !isInternal && document.activeElement !== el) {
				setLocalSearchTerm(storeTerm);
			}
		}
	);

	createEffect(
		() => inputEl(),
		(el) => {
			if (el) el.focus();
		}
	);

	function handleInput(event: InputEvent & { currentTarget: HTMLInputElement }): void {
		const next = event.currentTarget.value;
		setLocalSearchTerm(next);
		filtersStore.searchQuery = next;
	}

	function clearSearch(): void {
		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.delete('s');
			void goto(url.toString(), { shallow: true, replace: true, state: getCurrentPageState() });
		}

		markSearchCleared();
		filtersStore.searchQuery = '';
		setLocalSearchTerm('');

		const el = inputEl();
		if (el) {
			requestAnimationFrame(() => {
				el.focus();
			});
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && localSearchTerm().trim()) {
			const path = getCurrentPathname();
			if (path === '/stats') {
				void goto(`/library?s=${encodeURIComponent(localSearchTerm().trim())}`);
				return;
			}
		}
		if (event.key === 'Escape') {
			inputEl()?.select();
		}
	}

	return (
		<div class="search-bar-container">
			<div class="search-bar">
				<span class="search-icon" aria-hidden="true">
					🔍
				</span>
				<input
					id="search-input"
					ref={setInputEl}
					type="text"
					placeholder="Search games..."
					value={localSearchTerm()}
					onInput={handleInput}
					onKeyDown={handleKeydown}
					class="search-input"
					aria-label="Search games"
					autocomplete="off"
					spellcheck="false"
				/>
				<Show when={localSearchTerm()}>
					<button type="button" class="clear-button" onClick={clearSearch} aria-label="Clear search">
						<X size={18} />
					</button>
				</Show>
			</div>
		</div>
	);
}
