// Copy for the per-tab empty states shown when a games tab has no results
// and no filters are active (as opposed to NoResults, which covers the
// "filters too narrow" case and offers a reset).

export interface EmptyStateCopy {
	message: string;
	description: string;
}

const LIBRARY_COPY: EmptyStateCopy = {
	message: 'Your library is empty',
	description: 'Add your first game to see it here.',
};

export function tabEmptyState(tab: string): EmptyStateCopy {
	switch (tab) {
		case 'completed':
			return {
				message: 'No completed games yet',
				description: 'Mark a planned game as completed to fill this shelf.',
			};
		case 'planned':
			return {
				message: 'No planned games yet',
				description: 'Add a game to your backlog to see it here.',
			};
		default:
			return LIBRARY_COPY;
	}
}
