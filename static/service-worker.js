const CACHE_NAME = 'gaming-tracker-v1';
const STATIC_CACHE_NAME = 'gaming-tracker-static-v1';
const IMAGE_CACHE_NAME = 'gaming-tracker-images-v1';

// Assets to cache on install
const STATIC_ASSETS = [
	'/',
	'/games.json'
];

// Install event - cache static assets with optimized strategy
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(STATIC_CACHE_NAME).then((cache) => {
			// Cache essential assets for immediate availability
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
				const failed = results.filter((r) => r.status === 'rejected').length;

				if (failed > 0) {
					console.warn(`Service Worker: Failed to cache ${failed} assets`);
				}
			});
		})
	);
	// Skip waiting for immediate activation on new deployments
	self.skipWaiting();
});

// Activate event - clean up old caches and claim clients
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
					.map((name) => {
						console.log(`Service Worker: Deleting old cache ${name}`);
						return caches.delete(name);
					})
			);
		}).then(() => {
			// Claim all clients immediately
			return self.clients.claim();
		})
	);
});

// Fetch event - optimized caching strategies for different resource types
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Skip cross-origin requests
	if (url.origin !== location.origin) return;

	// Skip dev module paths - let Vite/SvelteKit handle
	if (url.pathname.startsWith('/.svelte-kit/') || url.pathname.startsWith('/@vite/')) {
		return;
	}

	// Skip app.css - bundled by SvelteKit, handled by browser
	if (url.pathname.endsWith('/app.css')) {
		return;
	}

	// Cache-first strategy for game cover images
	if (url.pathname.startsWith('/covers/') ||
		(request.destination === 'image' && url.pathname.match(/\.(webp|png|jpg|jpeg|gif|svg)$/i))) {
		event.respondWith(
			caches.open(IMAGE_CACHE_NAME).then((cache) => {
				return cache.match(request).then((cachedResponse) => {
					if (cachedResponse) {
						// Update cache in background for better performance
						fetch(request).then((response) => {
							if (response && response.status === 200) {
								cache.put(request, response.clone());
							}
						}).catch(() => {
							// Silent fail for background updates
						});
						return cachedResponse;
					}

					// Fallback to network if not in cache
					return fetch(request).then((response) => {
						if (response && response.status === 200) {
							cache.put(request, response.clone());
						}
						return response;
					}).catch(() => {
						// Return a fallback response for missing images
						return new Response('Image not available', {
							status: 404,
							statusText: 'Not Found'
						});
					});
				});
			})
		);
		return;
	}

	// Cache-first strategy for static assets (games.json, root, etc.)
	if (STATIC_ASSETS.includes(url.pathname) || url.pathname.endsWith('.json')) {
		event.respondWith(
			caches.open(STATIC_CACHE_NAME).then((cache) => {
				return cache.match(request).then((cachedResponse) => {
					if (cachedResponse) {
						// Update cache in background for fresh data
						fetch(request).then((response) => {
							if (response && response.status === 200) {
								cache.put(request, response.clone());
							}
						}).catch(() => {
							// Silent fail for background updates
						});
						return cachedResponse;
					}

					// Fallback to network if not in cache
					return fetch(request).then((response) => {
						if (response && response.status === 200) {
							cache.put(request, response.clone());
						}
						return response;
					}).catch(() => {
						return caches.match(request);
					});
				});
			})
		);
		return;
	}

	// Network-first strategy for other resources (HTML pages, API calls, etc.)
	event.respondWith(
		fetch(request)
			.then((response) => {
				// Cache successful responses for non-static resources
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
				return caches.match(request).then((cachedResponse) => {
					return cachedResponse || new Response('Offline - Resource not available', {
						status: 503,
						statusText: 'Service Unavailable'
					});
				});
			})
	);
});