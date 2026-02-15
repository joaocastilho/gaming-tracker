export function createGameSlug(title: string): string {
	return title
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim()
		.replace(/^-|-$/g, '');
}

export function isValidSlug(slug: string): boolean {
	if (!slug || typeof slug !== 'string') return false;
	const validSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	return validSlugPattern.test(slug);
}
