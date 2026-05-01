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
	import type { ComponentType, SvelteComponent } from 'svelte';
	const component: ComponentType<SvelteComponent>;
	export default component;
}

export {};
