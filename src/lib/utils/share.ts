export interface ShareData {
	title: string;
	url: string;
}

export function createShareData(currentUrl: string, pageTitle: string): ShareData {
	return {
		title: pageTitle.trim() || 'Gaming Tracker',
		url: new URL(currentUrl).toString(),
	};
}
