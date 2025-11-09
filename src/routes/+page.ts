import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();

	return {
		games: parentData.games,
		meta: parentData.meta,
		source: parentData.source
	};
};
