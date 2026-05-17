interface KeyboardShortcutDeps {
	isSearchOpen: boolean;
	onSearchToggle: () => void;
	onDesktopSearch: () => void;
}

export function createGlobalKeydownHandler(getDeps: () => KeyboardShortcutDeps) {
	return (event: KeyboardEvent) => {
		const { isSearchOpen, onSearchToggle, onDesktopSearch } = getDeps();

		const isMac = navigator.platform.toLowerCase().includes('mac');
		const modifierCheck = isMac ? event.metaKey || event.ctrlKey : event.ctrlKey || event.metaKey;

		if (event.key === '/' && modifierCheck) {
			event.preventDefault();

			if (innerWidth < 768) {
				if (!isSearchOpen) {
					onSearchToggle();
				}
				requestAnimationFrame(() => {
					const input = document.querySelector('.mobile-search-input') as HTMLInputElement;
					input?.focus();
					input?.select();
				});
			} else {
				onDesktopSearch();
			}
		}
	};
}
