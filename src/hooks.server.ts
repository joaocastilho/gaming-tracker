import type { Handle } from '@sveltejs/kit';

const buildDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
}).format(new Date());

export const handle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => html.replace('%build-date%', buildDate)
    });
    return response;
};
