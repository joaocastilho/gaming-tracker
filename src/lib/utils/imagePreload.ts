// Cover preloading with per-source dedupe.
//
// Hovering/focusing a game card (or navigating the detail modal) fires
// preloads repeatedly for the same cover. Without dedupe every event created
// a new Image() and re-issued the request; the Set keeps each distinct URL to
// a single load.

const preloaded = new Set<string>();

export function preloadImage(src: string): void {
	if (!src || preloaded.has(src)) return;
	preloaded.add(src);
	const image = new Image();
	image.src = src;
}

export function resetPreloadedImages(): void {
	preloaded.clear();
}
