import type { JSX } from '@solidjs/web';
import { onSettled, Show } from 'solid-js';
import SearchBar from '#lib/components/SearchBar.js';
import { filtersStore } from '#lib/stores/filters.js';
import { browser } from '#lib/utils/env.js';
import { createGlobalKeydownHandler } from '#lib/utils/keyboardShortcuts.js';

export default function KeyboardSearchHarness(): JSX.Element {
	onSettled(() => {
		if (!browser) return;

		const handler = createGlobalKeydownHandler(() => ({
			onSearchToggle: () => {},
			onDesktopSearch: () => {
				filtersStore.toggleDesktopSearch();
				requestAnimationFrame(() => {
					const input = document.getElementById('search-input') as HTMLInputElement | null;
					input?.focus();
					input?.select();
				});
			},
		}));

		window.addEventListener('keydown', handler);
		return () => {
			window.removeEventListener('keydown', handler);
		};
	});

	return (
		<div>
			<Show when={filtersStore.isDesktopSearchOpen}>
				<SearchBar />
			</Show>
		</div>
	);
}
