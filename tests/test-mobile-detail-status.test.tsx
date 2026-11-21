import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import ModalMetadata from '#lib/components/detail-modal/ModalMetadata.js';
import ModalRatings from '#lib/components/detail-modal/ModalRatings.js';
import { createCompletedGame, createTestGame } from './helpers/factories';

describe('Detail modal metadata row leaves tier to the ratings panel', () => {
	it('shows no tier badge for Playing or Planned games', () => {
		for (const game of [
			createTestGame({ status: 'Playing', tier: null }),
			createTestGame({ status: 'Planned', tier: null }),
		]) {
			const { container, unmount } = render(() => <ModalMetadata game={game} />);

			expect(container.querySelector('.tier-badge')).toBeNull();
			expect(screen.queryByText('PLAYING')).toBeNull();
			expect(screen.queryByText('PLANNED')).toBeNull();
			unmount();
		}
	});

	it('does not duplicate the tier badge for a completed game', () => {
		const game = createCompletedGame({ tier: 'A - Amazing' });
		const { container } = render(() => <ModalMetadata game={game} />);

		expect(container.querySelector('.tier-badge')).toBeNull();
	});

	it('never renders a status word in the badge row', () => {
		const game = createCompletedGame();
		render(() => <ModalMetadata game={game} />);

		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});
});

describe('Metadata badge row always packs left', () => {
	function badgeRowClass(container: HTMLElement): string {
		return container.querySelector('.metadata-badge-row')?.className ?? '';
	}

	it('packs left when no tier is applied', () => {
		const game = createTestGame({ status: 'Planned', tier: null });
		const { container } = render(() => <ModalMetadata game={game} />);

		expect(badgeRowClass(container)).toContain('justify-start');
		expect(badgeRowClass(container)).not.toContain('justify-between');
	});

	it('packs left even when the game has a tier', () => {
		const game = createCompletedGame({ tier: 'A - Amazing' });
		const { container } = render(() => <ModalMetadata game={game} />);

		expect(badgeRowClass(container)).toContain('justify-start');
		expect(badgeRowClass(container)).not.toContain('justify-between');
	});
});

describe('Detail modal score section shows the status, not a dash', () => {
	it('shows PLAYING instead of the score dash for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(() => <ModalRatings game={game} />);

		expect(screen.getAllByText('PLAYING').length).toBeGreaterThanOrEqual(1);

		expect(container.querySelector('.playing-badge')).toBeTruthy();
		expect(container.querySelector('.status-indicator')).toBeNull();

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
		expect(scoreResult?.textContent).toContain('PLAYING');

		const landscapeScore = container.querySelector('.landscape-score');
		expect(landscapeScore?.textContent).not.toContain('-');
	});

	it('shows PLANNED instead of the score dash for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(() => <ModalRatings game={game} />);

		expect(screen.getAllByText('PLANNED').length).toBeGreaterThanOrEqual(1);

		expect(container.querySelector('.planned-badge')).toBeTruthy();
		expect(container.querySelector('.status-indicator')).toBeNull();

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
		expect(scoreResult?.textContent).toContain('PLANNED');
	});

	it('shows actual score for Completed games', () => {
		const game = createCompletedGame({ score: 8 });
		const { container } = render(() => <ModalRatings game={game} />);

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).toContain('8');
		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});
});
