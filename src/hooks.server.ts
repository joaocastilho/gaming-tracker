import type { Handle } from '@sveltejs/kit';

const buildDate = new Date().toLocaleString(undefined, {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
	second: '2-digit',
	hour12: false,
	timeZoneName: 'short',
});

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%build-date%', buildDate),
	});
	return response;
};
