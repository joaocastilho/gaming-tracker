type SearchParamSource = { searchParams: { get(name: string): string | null } };

type PageSearchSource = {
	url: SearchParamSource;
	shallow: { url: SearchParamSource } | null;
};

// SvelteKit only refreshes `page.url` on real navigations. Shallow `goto`
// calls (modal open/close, filter sync) update `page.shallow.url` instead, so
// anything that reads query params for the head/OG tags must read these or it
// keeps showing the previous game after the modal closes.
export function liveSearchParams(page: PageSearchSource): SearchParamSource['searchParams'] {
	return (page.shallow?.url ?? page.url).searchParams;
}
