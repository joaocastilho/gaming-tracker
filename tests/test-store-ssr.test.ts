/**
 * Store Tests - Verify subscribe methods work correctly
 * Tests SSR compatibility (immediate callback) and store contract
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock window for SSR testing
const originalWindow = globalThis.window;

describe('Store Subscribe Methods', () => {
	describe('gamesStore', () => {
		beforeEach(() => {
			vi.resetModules();
		});

		it('should call subscriber immediately with current value (SSR compatibility)', async () => {
			// Ensure we're in SSR mode (mock as empty window)
			globalThis.window = {} as any;

			const { gamesStore } = await import('$lib/stores/games.svelte');
			const callback = vi.fn();

			gamesStore.subscribe(callback);

			// Should be called immediately with current value (empty array)
			expect(callback).toHaveBeenCalledWith([]);

			// Restore window
			globalThis.window = originalWindow;
		});

		it('should return unsubscribe function', async () => {
			const { gamesStore } = await import('$lib/stores/games.svelte');
			const callback = vi.fn();

			const unsubscribe = gamesStore.subscribe(callback);

			expect(typeof unsubscribe).toBe('function');
		});

		it('should have games property as array', async () => {
			const { gamesStore } = await import('$lib/stores/games.svelte');

			expect(Array.isArray(gamesStore.games)).toBe(true);
		});
	});

	describe('filtersStore', () => {
		beforeEach(() => {
			vi.resetModules();
		});

		it('should call subscriber immediately with current value (SSR compatibility)', async () => {
			// Ensure we're in SSR mode (mock as empty window)
			globalThis.window = {} as any;

			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback = vi.fn();

			filtersStore.subscribe(callback);

			// Should be called immediately (value may be null in SSR)
			expect(callback).toHaveBeenCalled();

			// Restore window
			globalThis.window = originalWindow;
		});

		it('should return unsubscribe function', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			const callback = vi.fn();

			const unsubscribe = filtersStore.subscribe(callback);

			expect(typeof unsubscribe).toBe('function');
		});
	});

	describe('filteredGames', () => {
		beforeEach(() => {
			vi.resetModules();
		});

		it('should call subscriber immediately with current value (SSR compatibility)', async () => {
			// Ensure we're in SSR mode (mock as empty window)
			globalThis.window = {} as any;

			const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');
			const callback = vi.fn();

			filteredGames.subscribe(callback);

			// Should be called immediately with empty array
			expect(callback).toHaveBeenCalledWith([]);

			// Restore window
			globalThis.window = originalWindow;
		});

		it('should return unsubscribe function', async () => {
			const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');
			const callback = vi.fn();

			const unsubscribe = filteredGames.subscribe(callback);

			expect(typeof unsubscribe).toBe('function');
		});

		it('should have value property as array', async () => {
			const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');

			expect(Array.isArray(filteredGames.value)).toBe(true);
		});
	});
});

describe('Store Default Values', () => {
	it('gamesStore.games should always be an array', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		expect(Array.isArray(gamesStore.games)).toBe(true);
	});

	it('filteredGames.value should always be an array', async () => {
		const { filteredGames } = await import('$lib/stores/filteredGamesStore.svelte');
		expect(Array.isArray(filteredGames.value)).toBe(true);
	});
});
