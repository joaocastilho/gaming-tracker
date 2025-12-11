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
}

export { };
