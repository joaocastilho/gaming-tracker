declare global {
	namespace App {
		interface PageState {
			showMobileSearch?: boolean;
			fromTierlist?: boolean;
			noscroll?: boolean;
		}
	}

	// Vite define constant for app version from package.json
	const __APP_VERSION__: string;
	const __BUILD_DATE__: string;
}

declare module '*.svelte' {
	import type { ComponentType, SvelteComponent } from 'svelte';
	const component: ComponentType<SvelteComponent>;
	export default component;
}

export { };
