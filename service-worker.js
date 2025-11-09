const CACHE_NAME = 'gaming-tracker-v1';
const STATIC_CACHE_NAME = 'gaming-tracker-static-v1';
const IMAGE_CACHE_NAME = 'gaming-tracker-images-v1';

// Assets to cache on install
// Note: CSS and JS are bundled by SvelteKit, so we only cache JSON data
const STATIC_ASSETS = [
	'/games.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(STATIC_CACHE_NAME).then((cache) => {
			// Cache each asset individually using fetch + put for better error handling
			return Promise.allSettled(
				STATIC_ASSETS.map((url) => {
					return fetch(url)
						.then((response) => {
							// Only cache successful responses
							if (response && response.status === 200) {
								return cache.put(url, response);
							} else {
								console.warn(`Failed to cache ${url}: HTTP ${response.status}`);
								return null;
							}
						})
						.catch((err) => {
							console.warn(`Failed to fetch ${url}:`, err);
							// Don't fail the entire install if one asset fails
							return null;
						});
				})
			).then((results) => {
				// Log results for debugging
				const successful = results.filter((r) => r.status === 'fulfilled').length;
				const failed = results.filter((r) => r.status === 'rejected').length;
				if (successful > 0) {
					console.log(`Service Worker: Cached ${successful} assets`);
				}
				if (failed > 0) {
					console.warn(`Service Worker: Failed to cache ${failed} assets`);
				}
			});
		})
	);
	self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => {
						return (
							name !== CACHE_NAME &&
							name !== STATIC_CACHE_NAME &&
							name !== IMAGE_CACHE_NAME
						);
					})
					.map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Skip cross-origin requests
	if (url.origin !== location.origin) return;

	// Explicitly ignore app.css - it's bundled by SvelteKit, not a static file
	// This prevents the service worker from trying to cache or fetch it
	if (url.pathname.endsWith('/app.css')) {
		// Let the browser handle it normally - don't intercept
		return;
	}

	// Handle images with cache-first strategy
	if (request.destination === 'image' || url.pathname.match(/\.(webp|png|jpg|jpeg|gif|svg)$/i)) {
		event.respondWith(
			caches.open(IMAGE_CACHE_NAME).then((cache) => {
				return cache.match(request).then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}

					return fetch(request).then((response) => {
						// Only cache successful responses
						if (response && response.status === 200) {
							cache.put(request, response.clone());
						}
						return response;
					});
				});
			})
		);
		return;
	}

	// Handle JSON files with network-first strategy
	if (url.pathname.endsWith('.json')) {
		event.respondWith(
			fetch(request)
				.then((response) => {
					// Cache successful responses
					if (response && response.status === 200) {
						const responseClone = response.clone();
						caches.open(STATIC_CACHE_NAME).then((cache) => {
							cache.put(request, responseClone);
						});
					}
					return response;
				})
				.catch(() => {
					// Fallback to cache if network fails
					return caches.match(request);
				})
		);
		return;
	}

	// Handle other requests with network-first strategy
	event.respondWith(
		fetch(request)
			.then((response) => {
				// Cache successful responses
				if (response && response.status === 200) {
					const responseClone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseClone);
					});
				}
				return response;
			})
			.catch(() => {
				// Fallback to cache if network fails
				return caches.match(request);
			})
	);
});