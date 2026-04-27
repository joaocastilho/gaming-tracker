export function generateSrcset(basePath: string | null | undefined): string {
	const normalized = (basePath || 'covers/placeholder_cover.webp').replace(/\.webp$/, '');
	const base = normalized.startsWith('/') ? normalized : `/${normalized}`;
	return [`${base}.webp 300w`, `${base}-detail.webp 400w`].join(', ');
}

export function generateTinySrcset(basePath: string | null | undefined): string {
	const normalized = (basePath || 'covers/placeholder_cover.webp').replace(/\.webp$/, '');
	const base = normalized.startsWith('/') ? normalized : `/${normalized}`;

	return [`${base}-200w.webp 200w`, `${base}.webp 300w`].join(', ');
}

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
