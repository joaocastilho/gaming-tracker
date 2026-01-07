const CACHE_VERSION = 'v2';
const CACHE_NAME = `gaming-tracker-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `gaming-tracker-static-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `gaming-tracker-images-${CACHE_VERSION}`;
const APP_SHELL_CACHE_NAME = `gaming-tracker-app-${CACHE_VERSION}`;

const STATIC_ASSETS = [
	'/',
	'/games.json',
	'/site.webmanifest',
	'/favicon.ico',
	'/logo.png',
	'/covers/placeholder_cover.webp',
	'/covers/placeholder_cover-200w.webp',
	'/covers/placeholder_cover-detail.webp'
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
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((name) => {
							// Delete any cache that doesn't match current version
							return (
								name.startsWith('gaming-tracker-') &&
								name !== CACHE_NAME &&
								name !== STATIC_CACHE_NAME &&
								name !== IMAGE_CACHE_NAME &&
								name !== APP_SHELL_CACHE_NAME
							);
						})
						.map((name) => {
							console.log(`Service Worker: Deleting old cache ${name}`);
							return caches.delete(name);
						})
				);
			})
			.then(() => {
				// Claim all clients immediately
				return self.clients.claim();
			})
	);
});

// Helper: Check if request is a navigation request
function isNavigationRequest(request) {
	return request.mode === 'navigate' || request.destination === 'document';
}

// Helper: Check if request is for SvelteKit app assets
function isSvelteKitAsset(url) {
	return url.pathname.startsWith('/_app/');
}

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

	// Skip API routes - always go to network
	if (url.pathname.startsWith('/api/')) {
		return;
	}

	// STRATEGY 1: Cache-first for navigation requests (HTML pages)
	// This ensures the PWA loads immediately from cache when offline
	if (isNavigationRequest(request)) {
		event.respondWith(
			caches.open(APP_SHELL_CACHE_NAME).then((cache) => {
				return cache.match(request).then((cachedResponse) => {
					// Always try to update cache in background
					const fetchPromise = fetch(request)
						.then((networkResponse) => {
							if (networkResponse && networkResponse.status === 200) {
								cache.put(request, networkResponse.clone());
							}
							return networkResponse;
						})
						.catch(() => null);

					// Return cached response immediately if available
					if (cachedResponse) {
						return cachedResponse;
					}

					// Otherwise wait for network
					return fetchPromise.then((networkResponse) => {
						if (networkResponse) {
							return networkResponse;
						}
						// Fallback to root if we have it cached
						return cache.match('/').then(
							(rootResponse) =>
								rootResponse ||
								new Response('Offline - Please check your connection', {
									status: 503,
									statusText: 'Service Unavailable',
									headers: { 'Content-Type': 'text/html' }
								})
						);
					});
				});
			})
		);
		return;
	}

	// STRATEGY 2: Cache-first for SvelteKit generated assets (JS/CSS bundles)
	// These have hashed filenames so they're safe to cache indefinitely
	if (isSvelteKitAsset(url)) {
		event.respondWith(
			caches.open(APP_SHELL_CACHE_NAME).then((cache) => {
				return cache.match(request).then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}

					return fetch(request).then((response) => {
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

	// Skip app.css - bundled by SvelteKit, handled by browser
	if (url.pathname.endsWith('/app.css')) {
		return;
	}

	// STRATEGY 3: Cache-first for game cover images
	if (
		url.pathname.startsWith('/covers/') ||
		(request.destination === 'image' && url.pathname.match(/\.(webp|png|jpg|jpeg|gif|svg)$/i))
	) {
		event.respondWith(
			caches.open(IMAGE_CACHE_NAME).then((cache) => {
				return cache.match(request).then((cachedResponse) => {
					if (cachedResponse) {
						// Update cache in background for better performance
						fetch(request)
							.then((response) => {
								if (response && response.status === 200) {
									cache.put(request, response.clone());
								}
							})
							.catch(() => {
								// Silent fail for background updates
							});
						return cachedResponse;
					}

					// Fallback to network if not in cache
					return fetch(request)
						.then((response) => {
							if (response && response.status === 200) {
								cache.put(request, response.clone());
							}
							return response;
						})
						.catch(() => {
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

	// STRATEGY 4: Cache-first for static assets (games.json, manifest, etc.)
	if (STATIC_ASSETS.includes(url.pathname) || url.pathname.endsWith('.json')) {
		event.respondWith(
			caches.open(STATIC_CACHE_NAME).then((cache) => {
				return cache.match(request).then((cachedResponse) => {
					if (cachedResponse) {
						// Update cache in background for fresh data
						fetch(request)
							.then((response) => {
								if (response && response.status === 200) {
									cache.put(request, response.clone());
								}
							})
							.catch(() => {
								// Silent fail for background updates
							});
						return cachedResponse;
					}

					// Fallback to network if not in cache
					return fetch(request)
						.then((response) => {
							if (response && response.status === 200) {
								cache.put(request, response.clone());
							}
							return response;
						})
						.catch(() => {
							return caches.match(request);
						});
				});
			})
		);
		return;
	}

	// STRATEGY 5: Network-first for other resources (with cache fallback)
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
					return (
						cachedResponse ||
						new Response('Offline - Resource not available', {
							status: 503,
							statusText: 'Service Unavailable'
						})
					);
				});
			})
	);
});
