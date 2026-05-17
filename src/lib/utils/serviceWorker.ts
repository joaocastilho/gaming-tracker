export function registerServiceWorker(): (() => void) | undefined {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

	const swPath = '/service-worker.js';
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let isPaused = false;
	let visibilityHandler: (() => void) | null = null;

	navigator.serviceWorker
		.register(swPath, {
			updateViaCache: 'none',
		})
		.then((registration) => {
			const checkForUpdates = () => {
				if (isPaused || document.hidden) return;

				if (registration.installing === null && registration.waiting === null && registration.active !== null) {
					registration.update().catch(() => {});
				}
			};

			intervalId = setInterval(checkForUpdates, 60000);

			visibilityHandler = () => {
				if (document.hidden) {
					isPaused = true;
				} else {
					isPaused = false;
				}
			};

			document.addEventListener('visibilitychange', visibilityHandler);
		})
		.catch(() => {});

	return () => {
		if (intervalId) clearInterval(intervalId);
		if (visibilityHandler) {
			document.removeEventListener('visibilitychange', visibilityHandler);
		}
	};
}
