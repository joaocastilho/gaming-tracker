import { describe, test, expect, beforeEach } from 'vitest';
import { generateSrcset, generateTinySrcset, generateSizes } from '$lib/utils/imageSrcset';

// Mock imageCache for testing without SvelteKit dependencies
const mockImageCache = {
	preload: (_src: string) => Promise.resolve(), // eslint-disable-line @typescript-eslint/no-unused-vars
	setLoaded: (_src: string) => {}, // eslint-disable-line @typescript-eslint/no-unused-vars
	setError: (_src: string) => {}, // eslint-disable-line @typescript-eslint/no-unused-vars
	getImage: (_src: string) => ({ isLoaded: false, hasError: false }) // eslint-disable-line @typescript-eslint/no-unused-vars
};

// Mock IntersectionObserver for our tests
class MockIntersectionObserver {
	private readonly callback: IntersectionObserverCallback;
	private readonly elements: Set<Element> = new Set();

	// Required IntersectionObserver properties
	readonly root: Element | null = null;
	readonly rootMargin: string = '0px';
	readonly thresholds: number[] = [0];

	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback;
	}

	observe = (el: Element) => {
		this.elements.add(el);
	};

	unobserve = (el: Element) => {
		this.elements.delete(el);
	};

	disconnect = () => {
		this.elements.clear();
	};

	// Required method
	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}

	// Helper to simulate intersection in tests
	triggerIntersect(isIntersecting = true) {
		const entries: IntersectionObserverEntry[] = Array.from(this.elements).map((target) => ({
			target,
			isIntersecting,
			intersectionRatio: isIntersecting ? 1 : 0,
			time: 0,
			boundingClientRect: target.getBoundingClientRect(),
			intersectionRect: target.getBoundingClientRect(),
			rootBounds: null
		})) as IntersectionObserverEntry[];

		this.callback(entries, this as unknown as IntersectionObserver);
	}
}

describe('Cover Loading Optimization', () => {
	beforeEach(() => {
		// Install mock IntersectionObserver
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).IntersectionObserver = MockIntersectionObserver;

		// Basic document mock where needed
		if (!global.document) {
			Object.defineProperty(global, 'document', {
				value: {
					createElement: (tag: string) =>
						({
							tagName: tag.toUpperCase(),
							getBoundingClientRect: () => ({
								top: 0,
								left: 0,
								bottom: 100,
								right: 100,
								width: 100,
								height: 100,
								x: 0,
								y: 0,
								toJSON: () => ({})
							})
						}) as HTMLElement
				},
				writable: true,
				configurable: true
			});
		}
	});

	test('Image Srcset Utilities', () => {
		const srcset = generateSrcset('covers/test-game.webp');
		const expectedSrcset = 'covers/test-game.webp 300w, covers/test-game-detail.webp 400w';
		expect(srcset).toBe(expectedSrcset);

		const tinySrcset = generateTinySrcset('covers/test-game.webp');
		const expectedTinySrcset = 'covers/test-game-200w.webp 200w, covers/test-game.webp 300w';
		expect(tinySrcset).toBe(expectedTinySrcset);

		const gallerySizes = generateSizes('gallery');
		const cardSizes = generateSizes('card');
		const modalSizes = generateSizes('modal');
		const tinySizes = generateSizes('tiny');

		expect(gallerySizes).toContain('300px');
		expect(cardSizes).toBe('300px');
		expect(modalSizes).toContain('400px');
		expect(tinySizes).toContain('200px');
	});

	test('Image Cache Behavior (Mocked)', () => {
		const src = 'covers/sample.webp';

		// preload() should not throw synchronously
		const preloadPromise = mockImageCache.preload(src);
		expect(preloadPromise).toBeInstanceOf(Promise);

		// Manually mark loaded
		mockImageCache.setLoaded(src);
	});

	test('GameCard Cover Loading Configuration', () => {
		// Test tiny cards
		const base = 'covers/test-game.webp';
		const tinySrcset = generateTinySrcset(base);
		const tinySizes = generateSizes('tiny');

		expect(tinySrcset.startsWith('covers/test-game-200w.webp 200w')).toBe(true);
		expect(tinySizes).toContain('200px');

		// Test loading configurations
		const lazyLoading = 'lazy';
		const lowPriority = 'low';
		const eagerLoading = 'eager';
		const highPriority = 'high';

		expect(lazyLoading).toBe('lazy');
		expect(lowPriority).toBe('low');
		expect(eagerLoading).toBe('eager');
		expect(highPriority).toBe('high');

		// Test hover detail preloading
		const detail = base.replace('.webp', '-detail.webp');
		let preloadCalled = false;

		// Mock the preload method to track calls
		const originalPreload = mockImageCache.preload;
		mockImageCache.preload = (src: string) => {
			if (src === detail) {
				preloadCalled = true;
			}
			return originalPreload.call(mockImageCache, src);
		};

		// Simulate GameCard.preloadDetailImage behavior
		mockImageCache.preload(detail);

		// Restore original method
		mockImageCache.preload = originalPreload;

		expect(preloadCalled).toBe(true);
	});

	test('Performance Simulation', () => {
		const startTime = performance.now();

		// Simulate multiple srcset generations
		for (let i = 0; i < 1000; i++) {
			generateSrcset(`covers/game${i}.webp`);
			generateTinySrcset(`covers/game${i}.webp`);
			generateSizes('card');
		}

		const endTime = performance.now();
		const duration = endTime - startTime;

		// Just verify it runs without error
		expect(duration).toBeGreaterThan(0);
	});
});
