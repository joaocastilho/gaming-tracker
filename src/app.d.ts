declare global {
	namespace App {
		interface PageState {
			showMobileSearch?: boolean;
			fromTierlist?: boolean;
			noscroll?: boolean;
		}
	}

	const __BUILD_DATE__: number;
}

declare module '*.svelte' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
}

export {};
