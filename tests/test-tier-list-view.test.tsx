import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TierListView from '#lib/views/TierListView.js';
import { createCompletedGame, createTestGame } from './helpers/factories.js';

describe('TierListView', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders empty state when no games have tiers', () => {
		const untiered = [createTestGame({ id: 'u1', title: 'Untiered Game', tier: null })];
		render(() => <TierListView filteredGames={untiered} />);
		flush();

		expect(screen.getByText('No tiered games found')).toBeTruthy();
	});

	it('groups games into S-E tiers, hides empty tiers, and displays accurate game counts', () => {
		const games = [
			createCompletedGame({ id: 's1', title: 'Masterpiece One', tier: 'S - Masterpiece' }),
			createCompletedGame({ id: 's2', title: 'Masterpiece Two', tier: 'S - Masterpiece' }),
			createCompletedGame({ id: 'b1', title: 'Great Game', tier: 'B - Great' }),
			createTestGame({ id: 'p1', title: 'Untiered Planned', tier: null }),
		];

		render(() => <TierListView filteredGames={games} />);
		flush();

		const headers = Array.from(document.querySelectorAll('.tier-header')).map((el) =>
			el.textContent?.replace(/\s+/g, ' ').trim()
		);
		expect(headers).toEqual(['S - Masterpiece 2 games', 'B - Great 1 game']);

		expect(screen.getByText('Masterpiece One')).toBeTruthy();
		expect(screen.getByText('Masterpiece Two')).toBeTruthy();
		expect(screen.getByText('Great Game')).toBeTruthy();
		expect(screen.queryByText('Untiered Planned')).toBeNull();
	});

	it('invokes onOpenModal with the clicked game and ordered tier games list', () => {
		const onOpenModal = vi.fn();
		const sGame = createCompletedGame({ id: 's1', title: 'S Tier Hit', tier: 'S - Masterpiece' });
		const aGame = createCompletedGame({ id: 'a1', title: 'A Tier Hit', tier: 'A - Amazing' });

		render(() => <TierListView filteredGames={[aGame, sGame]} onOpenModal={onOpenModal} />);
		flush();

		const card = screen.getByText('S Tier Hit').closest('.game-card');
		expect(card).toBeTruthy();
		if (card) {
			fireEvent.click(card);
		}

		expect(onOpenModal).toHaveBeenCalledTimes(1);
		expect(onOpenModal).toHaveBeenCalledWith(sGame, [sGame, aGame]);
	});
});
