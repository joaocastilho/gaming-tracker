import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import GameCardInfo from '$lib/components/game-card/GameCardInfo.svelte';
import { createTestGame, createCompletedGame } from './helpers/factories';

describe('GameCardInfo status badge', () => {
	it('shows PLAYING badge for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		render(GameCardInfo, { props: { game } });

		expect(screen.getByText('PLAYING')).toBeTruthy();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});

	it('shows PLANNED badge for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		render(GameCardInfo, { props: { game } });

		expect(screen.getByText('PLANNED')).toBeTruthy();
		expect(screen.queryByText('PLAYING')).toBeNull();
	});

	it('shows score badge for Completed games', () => {
		const game = createCompletedGame();
		const { container } = render(GameCardInfo, { props: { game } });

		expect(container.querySelector('.score-badge')).toBeTruthy();
		expect(screen.queryByText('PLANNED')).toBeNull();
		expect(screen.queryByText('PLAYING')).toBeNull();
	});
});
