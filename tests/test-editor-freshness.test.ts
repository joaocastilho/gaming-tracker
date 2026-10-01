import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestGame } from './helpers/factories';
import { editorStore } from '$lib/stores/editor.svelte';

function gameList(games: Array<ReturnType<typeof createTestGame>>) {
	return { games };
}

describe('editor freshness guard (stale games.json overwrite)', () => {
	beforeEach(() => {
		editorStore.logout();
		vi.clearAllMocks();
		// default online
		Object.defineProperty(globalThis.navigator, 'onLine', {
			value: true,
			configurable: true,
			writable: true,
		});
	});

	it('fetchLatestGames returns server games', async () => {
		const fresh = [createTestGame({ id: 'a', genre: 'FPS' })];
		vi.mocked(globalThis.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(gameList(fresh)),
		} as Response);

		const result = await editorStore.fetchLatestGames();

		expect(globalThis.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/games.json'),
			expect.objectContaining({ cache: 'no-store' })
		);
		expect(result).toHaveLength(1);
		expect(result?.[0].genre).toBe('FPS');
	});

	it('fetchLatestGames returns null when server request fails', async () => {
		vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'));

		const result = await editorStore.fetchLatestGames();

		expect(result).toBeNull();
	});

	it('applyAllChanges rebases pending edits onto fresh server data instead of stale cache', async () => {
		const staleUntouched = createTestGame({ id: 'untouched', title: 'Untouched', genre: 'Shooter' });
		const staleEdited = createTestGame({ id: 'edited', title: 'Edited', status: 'Planned' });
		const staleGames = [staleUntouched, staleEdited];

		const freshUntouched = createTestGame({ id: 'untouched', title: 'Untouched', genre: 'FPS' });
		const freshEdited = createTestGame({ id: 'edited', title: 'Edited', status: 'Planned' });
		const freshGames = [freshUntouched, freshEdited];

		const editedVersion = createTestGame({ id: 'edited', title: 'Edited', status: 'Playing' });
		editorStore.editPendingGame('edited', editedVersion);

		// First fetch: GET /games.json (freshness check). Second fetch: POST /api/games (save).
		vi.mocked(globalThis.fetch)
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(gameList(freshGames)),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ ok: true }),
			} as Response);

		const success = await editorStore.applyAllChanges(staleGames);

		expect(success).toBe(true);
		expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/games.json'), expect.anything());

		// Capture saved payload from the POST call
		const postCall = vi.mocked(globalThis.fetch).mock.calls.find((call) => String(call[0]).includes('/api/games'));
		expect(postCall).toBeDefined();
		const formData = postCall?.[1]?.body as FormData;
		const blob = formData.get('games') as Blob;
		const saved = JSON.parse(await blob.text()) as { games: Array<{ id: string; genre: string; status: string }> };

		const savedUntouched = saved.games.find((g) => g.id === 'untouched');
		const savedEdited = saved.games.find((g) => g.id === 'edited');

		// Untouched game must keep FRESH server value, not stale cache value
		expect(savedUntouched?.genre).toBe('FPS');
		// Edited game must carry the pending edit
		expect(savedEdited?.status).toBe('Playing');
	});

	it('applyAllChanges falls back to passed games when freshness fetch fails', async () => {
		const staleUntouched = createTestGame({ id: 'untouched', title: 'Untouched', genre: 'Shooter' });
		const staleEdited = createTestGame({ id: 'edited', title: 'Edited', status: 'Planned' });
		const staleGames = [staleUntouched, staleEdited];

		editorStore.editPendingGame('edited', createTestGame({ id: 'edited', title: 'Edited', status: 'Playing' }));

		vi.mocked(globalThis.fetch)
			.mockRejectedValueOnce(new Error('Network error'))
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ ok: true }),
			} as Response);

		const success = await editorStore.applyAllChanges(staleGames);

		expect(success).toBe(true);
		const postCall = vi.mocked(globalThis.fetch).mock.calls.find((call) => String(call[0]).includes('/api/games'));
		expect(postCall).toBeDefined();
	});
});
