export function registerServiceWorker(): (() => void) | undefined {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
	// The worker is built from src/ by the emitServiceWorker Vite plugin, so it
	// only exists in the built output. Registering it in dev would also cache
	// stale hashed chunks across rebuilds.
	if (!import.meta.env.PROD) return;

	const swPath = '/service-worker.js';
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let visibilityHandler: (() => void) | null = null;

	navigator.serviceWorker
		.register(swPath, {
			updateViaCache: 'none',
		})
		.then((registration) => {
			const checkForUpdates = () => {
				if (document.hidden) return;
				if (registration.installing === null && registration.waiting === null && registration.active !== null) {
					registration.update().catch(() => {});
				}
			};
			intervalId = setInterval(checkForUpdates, 60000);
			document.addEventListener('visibilitychange', checkForUpdates);
			visibilityHandler = checkForUpdates;
		})
		.catch(() => {});

	// Deliberately no reload on 'controllerchange': an updated service worker
	// activates on its next natural page load. Reloading here interrupts
	// hydration mid-flight and breaks the UI until the user refreshes again.
	return () => {
		if (intervalId) clearInterval(intervalId);
		if (visibilityHandler) {
			document.removeEventListener('visibilitychange', visibilityHandler);
		}
	};
}
