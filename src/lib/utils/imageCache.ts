import { browser } from '$app/environment';

interface ImageCacheEntry {
	image: HTMLImageElement;
	isLoaded: boolean;
	hasError: boolean;
	loadPromise?: Promise<void>;
}

class ImageCache {
	private cache = new Map<string, ImageCacheEntry>();
	private preloadQueue: string[] = [];
	private maxPreloadConcurrency = 3;
	private activePreloads = 0;

	/**
	 * Check if an image is already cached in the browser
	 */
	isImageCached(src: string): boolean {
		if (!browser) return false;

		// Check our cache first
		const entry = this.cache.get(src);
		if (entry?.isLoaded) return true;

		// Check browser cache synchronously
		const img = new Image();
		img.src = src;
		return img.complete && img.naturalWidth > 0;
	}

	/**
	 * Get or create an image entry in the cache
	 */
	getImage(src: string): ImageCacheEntry {
		let entry = this.cache.get(src);

		if (!entry) {
			const img = new Image();

			// Check if already cached in browser
			const isCached = this.isImageCached(src);

			entry = {
				image: img,
				isLoaded: isCached,
				hasError: false
			};

			if (!isCached) {
				// Create load promise
				entry.loadPromise = new Promise<void>((resolve, reject) => {
					img.onload = () => {
						entry!.isLoaded = true;
						entry!.hasError = false;
						resolve();
					};
					img.onerror = () => {
						entry!.isLoaded = false;
						entry!.hasError = true;
						reject(new Error(`Failed to load image: ${src}`));
					};
				});
			}

			this.cache.set(src, entry);

			// Start loading if not cached
			if (!isCached) {
				img.src = src;
			} else {
				// If cached, set src immediately so it's ready
				img.src = src;
			}
		}

		return entry;
	}

	/**
	 * Preload an image (adds to queue)
	 */
	preload(src: string): void {
		if (!browser) return;
		if (this.cache.has(src)) return; // Already cached
		if (this.preloadQueue.includes(src)) return; // Already queued

		this.preloadQueue.push(src);
		this.processPreloadQueue();
	}

	/**
	 * Process preload queue with concurrency limit
	 */
	private processPreloadQueue(): void {
		while (this.activePreloads < this.maxPreloadConcurrency && this.preloadQueue.length > 0) {
			const src = this.preloadQueue.shift();
			if (!src) break;

			this.activePreloads++;
			this.getImage(src).loadPromise?.finally(() => {
				this.activePreloads--;
				this.processPreloadQueue();
			});
		}
	}

	/**
	 * Clear cache (useful for memory management)
	 */
	clear(): void {
		this.cache.clear();
		this.preloadQueue = [];
		this.activePreloads = 0;
	}

	/**
	 * Get cache statistics
	 */
	getStats() {
		return {
			cached: this.cache.size,
			queued: this.preloadQueue.length,
			activePreloads: this.activePreloads
		};
	}
}

interface ComponentInstance {
	gameId: string;
	lastUsed: number;
}

class ComponentCache {
	private instances = new Map<string, ComponentInstance>();
	private maxAge = 5 * 60 * 1000; // 5 minutes

	register(gameId: string): void {
		this.instances.set(gameId, {
			gameId,
			lastUsed: Date.now()
		});
	}

	isRegistered(gameId: string): boolean {
		return this.instances.has(gameId);
	}

	cleanup(): void {
		const now = Date.now();
		for (const [gameId, instance] of this.instances.entries()) {
			if (now - instance.lastUsed > this.maxAge) {
				this.instances.delete(gameId);
			}
		}
	}
}

export const imageCache = new ImageCache();
export const componentCache = new ComponentCache();

if (typeof window !== 'undefined') {
	setInterval(() => {
		componentCache.cleanup();
	}, 60000); // Every minute
}
