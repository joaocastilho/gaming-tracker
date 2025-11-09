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

	isImageCached(src: string): boolean {
		if (!browser) return false;

		const entry = this.cache.get(src);
		if (entry?.isLoaded) return true;

		const img = new Image();
		img.src = src;
		return img.complete && img.naturalWidth > 0;
	}

	getImage(src: string): ImageCacheEntry {
		let entry = this.cache.get(src);

		if (!entry) {
			const img = new Image();

			const isCached = this.isImageCached(src);

			entry = {
				image: img,
				isLoaded: isCached,
				hasError: false
			};

			if (!isCached) {
				entry.loadPromise = new Promise<void>((resolve, reject) => {
					img.onload = () => {
						entry!.isLoaded = true;
						entry!.hasError = false;
						this.cache.set(src, entry!);
						resolve();
					};
					img.onerror = () => {
						entry!.isLoaded = false;
						entry!.hasError = true;
						this.cache.set(src, entry!);
						reject(new Error(`Failed to load image: ${src}`));
					};
				});
			}

			this.cache.set(src, entry);

			if (!isCached) {
				img.src = src;
			} else {
				img.src = src;
			}
		}

		return entry;
	}

	/**
	 * Manually marks an image as loaded in the cache.
	 * This is used by components when the 'onload' event fires.
	 */
	setLoaded(src: string): void {
		let entry = this.cache.get(src);
		if (entry) {
			if (entry.isLoaded) return;
			entry.isLoaded = true;
			entry.hasError = false;
		} else {
			const img = new Image();
			img.src = src;
			entry = {
				image: img,
				isLoaded: true,
				hasError: false
			};
		}

		const newCache = new Map(this.cache);
		newCache.set(src, entry);
		this.cache = newCache;
	}

	/**
	 * Manually marks an image as having an error in the cache.
	 * This is used by components when the 'onerror' event fires.
	 */
	setError(src: string): void {
		let entry = this.cache.get(src);
		if (entry) {
			if (entry.hasError) return;
			entry.isLoaded = false;
			entry.hasError = true;
		} else {
			entry = {
				image: new Image(),
				isLoaded: false,
				hasError: true
			};
		}

		const newCache = new Map(this.cache);
		newCache.set(src, entry);
		this.cache = newCache;
	}

	preload(src: string): void {
		if (!browser) return;
		if (this.cache.has(src)) return;
		if (this.preloadQueue.includes(src)) return;

		this.preloadQueue.push(src);
		this.processPreloadQueue();
	}

	private processPreloadQueue(): void {
		while (this.activePreloads < this.maxPreloadConcurrency && this.preloadQueue.length > 0) {
			const src = this.preloadQueue.shift();
			if (!src) break;

			this.activePreloads++;

			const entry = this.getImage(src);
			if (entry.loadPromise) {
				entry.loadPromise.finally(() => {
					this.activePreloads--;
					this.processPreloadQueue();
				});
			} else {
				this.activePreloads--;
				this.processPreloadQueue();
			}
		}
	}

	clear(): void {
		this.cache.clear();
		this.preloadQueue = [];
		this.activePreloads = 0;
	}

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
	private maxAge = 5 * 60 * 1000;

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
	}, 60000);
}
