/**
 * Generate srcset string for responsive images
 */
export function generateSrcset(basePath: string): string {
	// Remove .webp extension if present
	const base = basePath.replace(/\.webp$/, '');

	// Generate srcset with different sizes
	return [
		`${base}-thumb.webp 200w`,
		`${base}.webp 300w`,
		`${base}-detail.webp 400w`,
		`${base}-large.webp 600w`
	].join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(context: 'gallery' | 'modal' | 'card'): string {
	switch (context) {
		case 'gallery':
			return '(max-width: 640px) 200px, (max-width: 1024px) 300px, 300px';
		case 'modal':
			return '(max-width: 768px) 300px, 400px';
		case 'card':
			return '300px';
		default:
			return '300px';
	}
}
