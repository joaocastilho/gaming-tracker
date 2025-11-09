/**
 * Generate srcset string for cover images.
 *
 * Contracts:
 * - {id}.webp          -> primary cover (300w)
 * - {id}-detail.webp   -> higher-res detail (400w)
 * - {id}-200w.webp     -> lightweight thumb (200w) for tiny contexts
 */

/**
 * Default srcset for standard card/gallery usage.
 * Includes the primary cover and the higher-res detail variant.
 */
export function generateSrcset(basePath: string): string {
	const base = basePath.replace(/\.webp$/, '');
	return [`${base}.webp 300w`, `${base}-detail.webp 400w`].join(', ');
}

/**
 * Variant: srcset optimized for tiny thumbnails.
 * Only exposes the 200w asset (and falls back to 300w if 200w is missing).
 */
export function generateTinySrcset(basePath: string): string {
	const base = basePath.replace(/\.webp$/, '');

	return [`${base}-200w.webp 200w`, `${base}.webp 300w`].join(', ');
}

/**
 * Generate sizes attribute for responsive images.
 */
export function generateSizes(context: 'gallery' | 'modal' | 'card' | 'tiny'): string {
	switch (context) {
		case 'gallery':
			return '(max-width: 640px) 200px, (max-width: 1024px) 250px, 300px';
		case 'modal':
			return '(max-width: 768px) 300px, 400px';
		case 'card':
			return '300px';
		case 'tiny':
			return '(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 200px';
		default:
			return '300px';
	}
}
