import { vi } from 'vitest';
import type { Game } from '$lib/types/game';

/**
 * Flushes all pending promises by queuing a new macrotask.
 * Useful for waiting for Svelte stores or async operations to settle.
 */
export function flushPromises() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create a mock game object for testing
 */
export function createMockGame(overrides: Partial<Game> = {}): Game {
	return {
		id: crypto.randomUUID(),
		title: 'Test Game',
		mainTitle: 'Test Game',
		subtitle: null,
		platform: 'PC',
		year: 2024,
		genre: 'Action',
		coOp: 'No',
		status: 'Planned',
		coverImage: 'covers/test.webp',
		playtime: '10h 0m',
		finishedDate: null,
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: null,
		...overrides
	};
}

/**
 * Create multiple mock games
 */
export function createMockGames(count: number, overrides: Partial<Game> = {}): Game[] {
	return Array.from({ length: count }, (_, i) =>
		createMockGame({
			id: `test-game-id-${i}`,
			...overrides,
			title: `Test Game ${i + 1}`,
			mainTitle: `Test Game ${i + 1}`
		})
	);
}

/**
 * Suppress console methods during tests
 */
export function suppressConsole(): void {
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	vi.spyOn(console, 'error').mockImplementation(() => {});
}

/**
 * Restore console methods
 */
export function restoreConsole(): void {
	vi.restoreAllMocks();
}

/**
 * Waits for a store to reach a certain state.
 * @param store The store to subscribe to
 * @param predicate A function that returns true when the desired state is reached
 * @param timeout Max time to wait in ms
 */
export function waitForState<T>(
	store: { subscribe: (run: (value: T) => void) => () => void },
	predicate: (value: T) => boolean,
	timeout = 1000
): Promise<T> {
	return new Promise((resolve, reject) => {
		// Use a mutable object to handle the circular dependency between
		// the subscription callback and the unsubscribe function
		const sub = { unsubscribe: undefined as (() => void) | undefined };
		let isResolved = false;

		const timer = setTimeout(() => {
			if (sub.unsubscribe) sub.unsubscribe();
			reject(new Error('Timeout waiting for state'));
		}, timeout);

		const stopSubscription = store.subscribe((value) => {
			if (isResolved) return;
			if (predicate(value)) {
				isResolved = true;
				clearTimeout(timer);
				resolve(value);
				// If this calls asynchronously, sub.unsubscribe is set.
				if (sub.unsubscribe) sub.unsubscribe();
			}
		});

		sub.unsubscribe = stopSubscription;

		// If the predicate was true immediately (synchronous), unwire immediately.
		if (isResolved) {
			stopSubscription();
		}
	});
}
