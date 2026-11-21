declare const __BUILD_DATE__: number;

interface Window {
	__INITIAL_GAMES_PROMISE__?: Promise<{ games?: unknown[] } | null>;
}
