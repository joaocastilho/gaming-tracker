import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gamesStore } from '$lib/stores/games.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import { createTestGame } from './helpers/factories';

const mockGame = createTestGame({
	id: '1',
	title: 'The Legend of Zelda: Breath of the Wild',
	platform: 'Nintendo Switch',
	genre: 'Adventure',
	year: 2017,
	status: 'Completed',
	playtime: '100h 0m',
	finishedDate: '2023-01-01T00:00:00.000Z',
	ratingPresentation: 10,
	ratingStory: 9,
	ratingGameplay: 10,
	score: 10,
	tier: 'S - Masterpiece',
});

const mockGames = [mockGame];

describe('Modal URL state invariants', () => {
	beforeEach(async () => {
		vi.useFakeTimers();
		gamesStore.initializeGames(mockGames);
		modalStore.closeModal();
		await vi.advanceTimersByTimeAsync(100);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('opens the modal directly from URL params through the full read cycle', async () => {
		const searchParams = new URLSearchParams('game=the-legend-of-zelda-breath-of-the-wild');
		modalStore.readFromURL(searchParams, mockGames);

		await vi.advanceTimersByTimeAsync(150);

		expect(modalStore.getState().isOpen).toBe(true);
		expect(modalStore.getState().activeGame?.id).toBe(mockGame.id);
	});

	it('matches games purely by title slug without special-case titles', () => {
		const searchParams = new URLSearchParams('game=the-legend-of-zelda-breath-of-the-wild');
		modalStore.readFromURL(searchParams, mockGames);

		const state = modalStore.getState();
		expect(state.isOpen).toBe(true);
		expect(state.activeGame?.id).toBe(mockGame.id);
	});

	it('does not match unrelated slugs via special-case hacks', () => {
		const searchParams = new URLSearchParams('game=witcher-3');
		modalStore.readFromURL(searchParams, mockGames);

		expect(modalStore.getState().isOpen).toBe(false);
	});
});
