export function registerServiceWorker(): (() => void) | undefined {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

	const swPath = '/service-worker.js';
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let isPaused = false;
	let visibilityHandler: (() => void) | null = null;
	let controllerChangeHandler: (() => void) | null = null;

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
				isPaused = document.hidden;
			};
			document.addEventListener('visibilitychange', visibilityHandler);
		})
		.catch(() => {});

	controllerChangeHandler = () => {
		window.location.reload();
	};
	navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

	return () => {
		if (intervalId) clearInterval(intervalId);
		if (visibilityHandler) {
			document.removeEventListener('visibilitychange', visibilityHandler);
		}
		if (controllerChangeHandler) {
			navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
		}
	};
}
