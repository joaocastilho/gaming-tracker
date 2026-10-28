import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ModalMetadata from '#lib/components/detail-modal/ModalMetadata.svelte';
import ModalRatings from '#lib/components/detail-modal/ModalRatings.svelte';
import { createTestGame, createCompletedGame } from './helpers/factories';

/**
 * Tier is a summary of the ratings, so it now lives in the ratings panel
 * beside the score. The metadata row must not duplicate it.
 */
describe('Detail modal metadata row leaves tier to the ratings panel', () => {
	it('shows no tier badge for Playing or Planned games', () => {
		for (const game of [
			createTestGame({ status: 'Playing', tier: null }),
			createTestGame({ status: 'Planned', tier: null }),
		]) {
			const { container, unmount } = render(ModalMetadata, { props: { game } });

			expect(container.querySelector('.tier-badge')).toBeNull();
			expect(screen.queryByText('PLAYING')).toBeNull();
			expect(screen.queryByText('PLANNED')).toBeNull();
			unmount();
		}
	});

	it('does not duplicate the tier badge for a completed game', () => {
		const game = createCompletedGame({ tier: 'A - Amazing' });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(container.querySelector('.tier-badge')).toBeNull();
	});

	it('never renders a status word in the badge row', () => {
		const game = createCompletedGame();
		render(ModalMetadata, { props: { game } });

		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});
});

/**
 * With the tier gone there is no trailing element to pin, so the metadata
 * badges always pack left instead of leaving an empty right-hand gap.
 */
describe('Metadata badge row always packs left', () => {
	function badgeRowClass(container: HTMLElement): string {
		return container.querySelector('.metadata-badge-row')?.className ?? '';
	}

	it('packs left when no tier is applied', () => {
		const game = createTestGame({ status: 'Planned', tier: null });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(badgeRowClass(container)).toContain('justify-start');
		expect(badgeRowClass(container)).not.toContain('justify-between');
	});

	it('packs left even when the game has a tier', () => {
		const game = createCompletedGame({ tier: 'A - Amazing' });
		const { container } = render(ModalMetadata, { props: { game } });

		expect(badgeRowClass(container)).toContain('justify-start');
		expect(badgeRowClass(container)).not.toContain('justify-between');
	});
});

describe('Detail modal score section shows the status, not a dash', () => {
	it('shows PLAYING instead of the score dash for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(screen.getAllByText('PLAYING').length).toBeGreaterThanOrEqual(1);

		// Uses the same badge colours as the grid game card
		expect(container.querySelector('.playing-badge')).toBeTruthy();
		expect(container.querySelector('.status-indicator')).toBeNull();

		// Score area must not render the placeholder dash
		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
		expect(scoreResult?.textContent).toContain('PLAYING');

		// Landscape score slot must not render the dash either
		const landscapeScore = container.querySelector('.landscape-score');
		expect(landscapeScore?.textContent).not.toContain('-');
	});

	it('shows PLANNED instead of the score dash for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(screen.getAllByText('PLANNED').length).toBeGreaterThanOrEqual(1);

		expect(container.querySelector('.planned-badge')).toBeTruthy();
		expect(container.querySelector('.status-indicator')).toBeNull();

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
		expect(scoreResult?.textContent).toContain('PLANNED');
	});

	it('shows actual score for Completed games', () => {
		const game = createCompletedGame({ score: 8 });
		const { container } = render(ModalRatings, { props: { game } });

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).toContain('8');
		expect(screen.queryByText('PLAYING')).toBeNull();
		expect(screen.queryByText('PLANNED')).toBeNull();
	});
});
