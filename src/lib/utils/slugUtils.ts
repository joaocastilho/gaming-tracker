/**
 * Utility for converting between UI labels and URL-friendly slugs.
 */

/**
 * Converts a string to a URL-friendly slug.
 * Example: "PlayStation 5" -> "playstation-5"
 */
export function toSlug(text: string): string {
	if (!text) return '';
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove accents
		.replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with one
		.replace(/^-|-$/g, ''); // Trim hyphens
}

/**
 * Finds the original option that matches a given slug.
 * Uses a list of valid options to ensure we restore the exact Case and characters.
 */
export function fromSlug(slug: string, options: string[]): string | undefined {
	if (!slug) return undefined;
	const normalizedSlug = slug.toLowerCase();
	return options.find((opt) => toSlug(opt) === normalizedSlug);
}

/**
 * Alias for createGameSlug for backwards compatibility if needed,
 * but using the new unified toSlug logic.
 */
export function createGameSlug(title: string): string {
	return toSlug(title);
}

export function isValidSlug(slug: string): boolean {
	if (!slug || typeof slug !== 'string') return false;
	const validSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	return validSlugPattern.test(slug);
}
