/**
 * Generate srcset string for cover images.
 *
 * Contract:
 * - {id}.webp         -> 300w (card/grid)
 * - {id}-detail.webp  -> 400w (detail/modal)
 */
export function generateSrcset(basePath: string): string {
	// Remove .webp extension if present
	const base = basePath.replace(/\.webp$/, '');

	return [`${base}.webp 300w`, `${base}-detail.webp 400w`].join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(context: 'gallery' | 'modal' | 'card'): string {
	switch (context) {
		case 'gallery':
			// Card/grid uses the 300w cover; ensure we never exceed 300px CSS width in the grid.
			return '(max-width: 640px) 200px, (max-width: 1024px) 250px, 300px';
		case 'modal':
			// Detail view uses the 400w image.
			return '(max-width: 768px) 300px, 400px';
		case 'card':
			// Explicit card context: 300px, mapped to 300w cover.
			return '300px';
		default:
			return '300px';
	}
}
