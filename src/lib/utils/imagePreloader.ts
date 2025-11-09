import { browser } from '$app/environment';
import { imageCache } from './imageCache.js';

interface PreloadOptions {
	rootMargin?: string;
	threshold?: number;
	preloadCount?: number;
}

/**
 * Preload images for elements that are about to enter the viewport
 * Uses Intersection Observer for efficient lazy loading
 */
export function setupProgressiveImagePreloading(
	container: HTMLElement,
	imageSelector: string,
	options: PreloadOptions = {}
): () => void {
	if (!browser) return () => {};

	const { rootMargin = '200px', threshold = 0.1, preloadCount = 3 } = options;

	const images = container.querySelectorAll<HTMLImageElement>(imageSelector);
	const preloadedImages = new Set<string>();

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const img = entry.target as HTMLImageElement;
					const src = img.getAttribute('src') || img.getAttribute('data-src');

					if (src && !preloadedImages.has(src)) {
						preloadedImages.add(src);
						imageCache.preload(src);
					}

					const currentIndex = Array.from(images).indexOf(img);
					for (let i = 1; i <= preloadCount && currentIndex + i < images.length; i++) {
						const nextImg = images[currentIndex + i] as HTMLImageElement;
						const nextSrc = nextImg.getAttribute('src') || nextImg.getAttribute('data-src');

						if (nextSrc && !preloadedImages.has(nextSrc)) {
							preloadedImages.add(nextSrc);
							imageCache.preload(nextSrc);
						}
					}
				}
			});
		},
		{
			rootMargin,
			threshold
		}
	);

	images.forEach((img) => observer.observe(img));

	return () => {
		observer.disconnect();
		preloadedImages.clear();
	};
}
