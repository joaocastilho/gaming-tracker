import type { JSX } from '@solidjs/web';
import { createEffect, createSignal, Show, untrack } from 'solid-js';
import { filtersStore } from '#lib/stores/filters.js';
import { markSearchCleared } from '#lib/stores/searchClearCoordinator.js';
import { browser } from '#lib/utils/env.js';
import { getCurrentPageState, getCurrentPathname, goto } from '#lib/utils/routerBridge.js';
import './MobileSearch.css';

export interface MobileSearchProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function MobileSearch(props: MobileSearchProps): JSX.Element {
	const [searchInput, setSearchInput] = createSignal<HTMLInputElement | null>(null);
	const [localSearchTerm, setLocalSearchTerm] = createSignal(untrack(() => filtersStore.searchQuery));
	let previousSearchTerm = untrack(() => filtersStore.searchQuery);

	createEffect(
		() => ({ open: props.isOpen, el: searchInput() }),
		({ open, el }) => {
			if (open && el && document.activeElement !== el) {
				el.focus();
			}
		}
	);

	createEffect(
		() => ({
			storeTerm: filtersStore.searchQuery,
			isInternal: filtersStore.isInternalUpdate,
			el: searchInput(),
		}),
		({ storeTerm, isInternal, el }) => {
			if (storeTerm !== untrack(localSearchTerm) && !isInternal && document.activeElement !== el) {
				setLocalSearchTerm(storeTerm);
			}
		}
	);

	createEffect(
		() => ({ open: props.isOpen, searchTerm: filtersStore.searchQuery }),
		({ open, searchTerm }) => {
			if (browser && open && window.innerWidth < 768) {
				if (searchTerm && searchTerm !== previousSearchTerm) {
					previousSearchTerm = searchTerm;
					requestAnimationFrame(() => {
						window.scrollTo({ top: 0, behavior: 'smooth' });
					});
				} else if (!searchTerm) {
					previousSearchTerm = '';
				}
			}
		}
	);

	function handleMobileSearchInput(event: InputEvent & { currentTarget: HTMLInputElement }): void {
		const next = event.currentTarget.value;
		setLocalSearchTerm(next);
		filtersStore.searchQuery = next;
	}

	function clearMobileSearch(): void {
		markSearchCleared();
		filtersStore.searchQuery = '';
		setLocalSearchTerm('');
		searchInput()?.focus();

		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.delete('s');
			void goto(url.toString(), { shallow: true, replace: true, state: getCurrentPageState() });
		}
	}

	return (
		<Show when={props.isOpen}>
			<search class="mobile-search-container md:hidden">
				<div class="mobile-search-bar-container">
					<div class="mobile-search-bar">
						<span class="mobile-search-icon" aria-hidden="true">
							🔍
						</span>
						<input
							ref={setSearchInput}
							type="text"
							placeholder="Search games..."
							class="mobile-search-input"
							value={localSearchTerm()}
							onInput={handleMobileSearchInput}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && localSearchTerm().trim()) {
									const path = getCurrentPathname();
									if (path === '/' || path === '/stats') {
										void goto(`/library?s=${encodeURIComponent(localSearchTerm().trim())}`);
										return;
									}
								}
								if (e.key === 'Escape') {
									props.onClose();
								}
							}}
							aria-label="Search games"
							autocomplete="off"
							spellcheck={false}
						/>
						<Show when={localSearchTerm()}>
							<button type="button" class="mobile-clear-button" onClick={clearMobileSearch} aria-label="Clear search">
								✕
							</button>
						</Show>
						<button type="button" class="mobile-close-button" onClick={() => props.onClose()} aria-label="Close search">
							Close
						</button>
					</div>
				</div>
			</search>
		</Show>
	);
}
