type SearchParamSource = { searchParams: { get(name: string): string | null } };

type PageSearchSource = {
	url: SearchParamSource;
	shallow: { url: SearchParamSource } | null;
};

// Shallow navigations (modal open/close, filter sync) update `page.shallow.url`
// without triggering a full route transition, so anything reading query params
// for head/OG tags must prefer `page.shallow.url` over `page.url`.
export function liveSearchParams(page: PageSearchSource): SearchParamSource['searchParams'] {
	return (page.shallow?.url ?? page.url).searchParams;
}
