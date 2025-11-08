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
	// Prefer the dedicated 200w thumbnail if available.
	return [`${base}-200w.webp 200w`, `${base}.webp 300w`].join(', ');
}

/**
 * Generate sizes attribute for responsive images.
 */
export function generateSizes(context: 'gallery' | 'modal' | 'card' | 'tiny'): string {
	switch (context) {
		case 'gallery':
			// Grid cards: never exceed 300px CSS width.
			return '(max-width: 640px) 200px, (max-width: 1024px) 250px, 300px';
		case 'modal':
			// Detail view uses the 400w image.
			return '(max-width: 768px) 300px, 400px';
		case 'card':
			// Explicit card context: 300px, mapped to 300w cover.
			return '300px';
		case 'tiny':
			// Very small thumbnails / tier list: target 200px max.
			return '(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 200px';
		default:
			return '300px';
	}
}
