export function generateId(title: string): string {
	// Remove accents and normalize
	const normalized = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	// Remove parentheses and their content
	const withoutParens = normalized.replace(/\([^)]*\)/g, '').trim();
	// Convert to lowercase, replace spaces with dashes, remove special chars
	const id = withoutParens
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '') // keep letters, numbers, spaces
		.replace(/\s+/g, '-') // spaces to dashes
		.replace(/--+/g, '-') // multiple dashes to single
		.replace(/^-|-$/g, ''); // remove leading/trailing dashes

	return id;
}
