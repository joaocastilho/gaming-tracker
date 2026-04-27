export function toSlug(text: string): string {
	if (!text) return '';
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-') // Replace multiple hyphens with one
		.replace(/^-|-$/g, ''); // Trim hyphens
}

export function fromSlug(slug: string, options: string[]): string | undefined {
	if (!slug) return undefined;
	const normalizedSlug = slug.toLowerCase();
	return options.find((opt) => toSlug(opt) === normalizedSlug);
}

export function createGameSlug(title: string): string {
	return toSlug(title);
}

export function isValidSlug(slug: string): boolean {
	if (!slug || typeof slug !== 'string') return false;
	const validSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	return validSlugPattern.test(slug);
}
