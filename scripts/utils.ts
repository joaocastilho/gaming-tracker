export function generateId(title: string): string {
	const normalized = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const withoutParens = normalized.replace(/\([^)]*\)/g, '').trim();
	const id = withoutParens
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, '-')
		.replace(/--+/g, '-')
		.replace(/^-|-$/g, '');

	return id;
}
