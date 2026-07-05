interface Env {
	ASSETS: {
		fetch: (request: URL | Request) => Promise<Response>;
	};
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function toSlug(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

export const onRequest = async (context: { request: Request; env: Env; next: () => Promise<Response> }) => {
	const { request, env } = context;
	const url = new URL(request.url);

	if (request.method !== 'GET') {
		return context.next();
	}

	const response = await context.next();

	const contentType = response.headers.get('content-type') || '';
	if (!contentType.includes('text/html')) {
		return response;
	}

	try {
		const html = await response.text();
		const origin = url.origin;

		// Fix prerender placeholder URLs to use the real origin
		let modifiedHtml = html.replace(/http:\/\/sveltekit-prerender/g, origin);

		const gameSlug = url.searchParams.get('game');
		if (gameSlug) {
			const gamesRes = await env.ASSETS.fetch(new URL('/games.json', url));
			if (gamesRes.ok) {
				const { games } = (await gamesRes.json()) as { games: Array<Record<string, unknown>> };
				const decodedSlug = decodeURIComponent(gameSlug).toLowerCase();

				const game = games.find((g) => toSlug(g.title as string) === decodedSlug);
				if (game) {
					const ogTitle = game.title as string;
					const parts: string[] = [game.platform as string, game.genre as string];
					if (game.tier) parts.push(game.tier as string);
					if (game.score != null) parts.push(`Score: ${game.score}/20`);
					const ogDescription = parts.join(' · ');

					const coverUrl = game.coverImage
						? `${origin}/${game.coverImage as string}`
						: `${origin}/covers/placeholder_cover.webp`;

					const ogTags = [
						`<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
						`<meta property="og:description" content="${escapeHtml(ogDescription)}" />`,
						`<meta property="og:image" content="${escapeHtml(coverUrl)}" />`,
						`<meta property="og:url" content="${escapeHtml(request.url)}" />`,
						`<meta property="og:type" content="website" />`,
						`<meta name="twitter:card" content="summary_large_image" />`,
						`<meta name="twitter:title" content="${escapeHtml(ogTitle)}" />`,
						`<meta name="twitter:description" content="${escapeHtml(ogDescription)}" />`,
						`<meta name="twitter:image" content="${escapeHtml(coverUrl)}" />`,
					].join('\n    ');

					// Strip existing OG/twitter meta tags
					modifiedHtml = modifiedHtml.replace(
						/<meta[\s\S]*?(?:property="og:(?:title|type|description|url|site_name|image(?::width|:height)?)"|name="twitter:(?:card|title|description|image)")[\s\S]*?\/?>/g,
						''
					);

					// Inject game-specific OG tags
					modifiedHtml = modifiedHtml.replace('</head>', `    ${ogTags}\n  </head>`);
				}
			}
		}

		return new Response(modifiedHtml, {
			headers: {
				...Object.fromEntries(response.headers),
				'content-length': String(new TextEncoder().encode(modifiedHtml).length),
			},
			status: response.status,
			statusText: response.statusText,
		});
	} catch {
		return response;
	}
};
