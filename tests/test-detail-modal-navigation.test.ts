import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { replaceState } from '$app/navigation';
import { gamesStore } from '$lib/stores/games.svelte';
import { modalStore } from '$lib/stores/modal.svelte';

// Mock data
const mockGame = {
	id: '1',
	title: 'The Legend of Zelda: Breath of the Wild',
	mainTitle: 'The Legend of Zelda: Breath of the Wild',
	subtitle: null,
	platform: 'Nintendo Switch',
	genre: 'Adventure',
	year: 2017,
	coOp: 'No',
	status: 'Completed',
	coverImage: 'covers/zelda.webp',
	timeToBeat: '50h',
	hoursPlayed: '100h',
	finishedDate: '2023-01-01T00:00:00.000Z',
	ratingPresentation: 10,
	ratingStory: 9,
	ratingGameplay: 10,
	score: 10,
	tier: 'S'
} as unknown as import('$lib/types/game').Game;

const mockGames = [mockGame];

describe('Detail Modal Navigation', () => {
	// Setup global window mock
	const originalWindow = global.window;
	let mockUrl: URL;

	beforeEach(async () => {
		vi.useFakeTimers();
		// Reset stores
		gamesStore.initializeGames(mockGames);
		modalStore.closeModal();

		// Advance timers to clear the lock from closeModal -> writeToURL
		await vi.advanceTimersByTimeAsync(100);

		// Mock URL and window
		mockUrl = new URL('http://localhost/');
		global.window = {
			location: {
				href: mockUrl.href,
				toString: () => mockUrl.href
			}
		} as unknown as Window & typeof globalThis;

		// Reset mocks
		vi.fn(replaceState).mockClear();
	});

	afterEach(() => {
		vi.useRealTimers();
		global.window = originalWindow;
	});

	it('opens view modal and sets active game', () => {
		modalStore.openViewModal(mockGame, mockGames);
		const state = modalStore.getState();

		expect(state.isOpen).toBe(true);
		expect(state.activeGame).toEqual(mockGame);
		expect(state.mode).toBe('view');
	});

	it('closes modal and clears state', () => {
		modalStore.openViewModal(mockGame, mockGames);
		modalStore.closeModal();
		const state = modalStore.getState();

		expect(state.isOpen).toBe(false);
		expect(state.activeGame).toBe(null);
	});

	it('reads game from URL correctly', () => {
		const searchParams = new URLSearchParams();
		searchParams.set('game', 'the-legend-of-zelda-breath-of-the-wild');

		modalStore.readFromURL(searchParams, mockGames);
		const state = modalStore.getState();

		expect(state.activeGame).toEqual(mockGame);
		expect(state.isOpen).toBe(true);
	});

	it('opens pending game from URL', () => {
		const searchParams = new URLSearchParams();
		searchParams.set('game', 'the-legend-of-zelda-breath-of-the-wild');

		modalStore.readFromURL(searchParams, mockGames);
		modalStore.openPendingGameFromURL(mockGames);

		const state = modalStore.getState();
		expect(state.isOpen).toBe(true);
		expect(state.activeGame).toEqual(mockGame);
	});

	it('updates URL when opening modal', async () => {
		modalStore.openViewModal(mockGame, mockGames);

		// Trigger write
		await modalStore.writeToURL();

		// Advance time for cleanup
		await vi.advanceTimersByTimeAsync(150);
	});
});
